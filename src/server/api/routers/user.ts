import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { env } from "@/env";
import { ethers } from "ethers";
import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import {
  calculateImprovementTrend,
  getStartDateForLast7Days,
} from "@/lib/challenge";
import {
  getAverageCalories,
  getAverageRecovery,
  getAverageSleepHours,
  getAverageStrain,
} from "@/data/user";

type WhoopSleep = {
  end: Date;
  scoreState: string;
  nap: boolean;
  sleepPerformancePercentage: number | null;
  sleepConsistencyPercentage: number | null;
  sleepEfficiencyPercentage: number | null;
};

type WhoopRecovery = {
  updatedAtByWhoop: Date;
  scoreState: string;
  userCalibrating: boolean;
  recoveryScore: number;
};

type WhoopCycle = {
  end: Date | null;
  scoreState: string;
  strain: number;
  kilojoule: number;
};

export const userRouter = createTRPCRouter({
  checkRegistration: protectedProcedure
    .input(
      z.object({
        privyUserId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { privyId: input.privyUserId },
      });

      return { isRegistered: !!user };
    }),

  register: protectedProcedure
    .input(
      z.object({
        method: z.enum(["email", "google"]),
        privyId: z.string(),
        email: z.string().email(),
        embeddedAddress: z.string(),
        smartAccountAddress: z.string(),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.user.findUnique({
        where: { privyId: input.privyId },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already registered",
        });
      }

      const newUser = await ctx.db.user.create({
        data: {
          privyId: input.privyId,
          email: input.email,
          name: input.name,
          embeddedAddress: input.embeddedAddress,
          smartAccountAddress: input.smartAccountAddress,
        },
      });

      return { success: true, user: newUser };
    }),

  // trial: protectedProcedure.query(async ({ ctx }) => {
  //   const user = await ctx.db.user.findUnique({
  //     where: { privyId: ctx.privyUserId },
  //   });

  //   if (!user) {
  //     throw new TRPCError({
  //       code: "NOT_FOUND",
  //       message: "User not found",
  //     });
  //   }

  //   // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  //   const token = await getWhoopAccessToken(user?.whoopUserId!);

  //   console.log("Token", token);
  // }),

  getUsersWithMetrics: protectedProcedure
    .input(
      z.object({
        page: z.number().optional(),
        pageSize: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const page = input.page ?? 1;
      const pageSize = input.pageSize ?? 10;
      const skip = (page - 1) * pageSize;

      const [totalUsers, users] = await Promise.all([
        ctx.db.user.count({
          where: {
            whoopUserId: {
              not: null,
            },
            smartAccountAddress: {
              not: null,
            },
          },
        }),
        ctx.db.user.findMany({
          skip,
          take: pageSize,
          where: {
            privyId: {
              not: ctx?.privyUserId,
            },
            whoopUserId: {
              not: null,
            },
            smartAccountAddress: {
              not: null,
            },
          },
          select: {
            privyId: true,
            smartAccountAddress: true,
            whoopProfile: {
              orderBy: {
                createdAt: "asc",
              },
              take: 1,
              select: {
                firstName: true,
                userId: true,
              },
            },
            whoopCycles: {
              orderBy: {
                createdAt: "asc",
              },
              take: 1,
              select: {
                strain: true,
              },
            },
            whoopRecoveries: {
              orderBy: {
                createdAt: "asc",
              },
              take: 1,
              select: {
                recoveryScore: true,
              },
            },
            whoopSleeps: {
              orderBy: {
                createdAt: "asc",
              },
              take: 1,
              select: {
                sleepEfficiencyPercentage: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        }),
      ]);

      const totalPages = Math.ceil(totalUsers / pageSize);

      return { users, totalPages };
    }),

  updateTargetStatus: protectedProcedure
    .input(
      z.object({
        challengeId: z.bigint(),
        challenger: z.string(),
        challenged: z.string(),
        tokenAddress: z.string(),
        challengerAmount: z.bigint(),
        startTime: z.bigint(),
        endTime: z.bigint(),
        status: z.number(),
        challengeType: z.number(),
        challengeTarget: z.bigint(),
        targetReached: z.boolean(),
        isTwoSided: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        challengeId,
        startTime,
        endTime,
        challengeType,
        challengeTarget,
      } = input;

      const whoopData = await ctx.db.user.findUnique({
        where: { privyId: ctx?.privyUserId },
        select: {
          whoopCycles: true,
          whoopRecoveries: true,
          whoopSleeps: true,
        },
      });

      if (!whoopData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const challengeStartTime = new Date(Number(startTime) * 1000);
      const challengeEndTime = new Date(Number(endTime) * 1000);

      const isWithinChallengePeriod = (date: Date) => {
        return date >= challengeStartTime && date <= challengeEndTime;
      };

      const challengeDurationDays =
        (challengeEndTime.getTime() - challengeStartTime.getTime()) /
        (1000 * 60 * 60 * 24);

      let targetReached = false;

      switch (challengeType) {
        case 0: // Calories
          const totalCalories = whoopData.whoopCycles
            .filter(
              (cycle) =>
                (cycle.end === null ||
                  isWithinChallengePeriod(new Date(cycle.end))) &&
                cycle.scoreState === "SCORED",
            )
            .reduce((sum, cycle) => sum + cycle.kilojoule * 0.239006, 0); // Convert kJ to kcal

          const averageCaloriesPerDay = totalCalories / challengeDurationDays;
          targetReached = averageCaloriesPerDay >= Number(challengeTarget);
          break;

        case 1: // Strain
          const totalStrain = whoopData.whoopCycles
            .filter(
              (cycle) =>
                (cycle.end === null ||
                  isWithinChallengePeriod(new Date(cycle.end))) &&
                cycle.scoreState === "SCORED",
            )
            .reduce((sum, cycle) => sum + cycle.strain, 0);

          const averageStrainPerDay = totalStrain / challengeDurationDays;

          targetReached = averageStrainPerDay >= Number(challengeTarget);

          break;

        case 2: // Hours of Sleep
          const totalSleepHours = whoopData.whoopSleeps
            .filter(
              (sleep) =>
                isWithinChallengePeriod(new Date(sleep.end)) &&
                sleep.scoreState === "SCORED" &&
                !sleep.nap,
            )
            .reduce(
              (sum, sleep) => sum + sleep.totalInBedTimeMilli / 3600000,
              0,
            ); // Convert ms to hours

          const averageSleepHoursPerDay =
            totalSleepHours / challengeDurationDays;
          targetReached = averageSleepHoursPerDay >= Number(challengeTarget);
          break;

        case 3: // Recovery
          const totalRecovery = whoopData.whoopRecoveries
            .filter(
              (recovery) =>
                isWithinChallengePeriod(new Date(recovery.updatedAtByWhoop)) &&
                recovery.scoreState === "SCORED" &&
                !recovery.userCalibrating,
            )
            .reduce((sum, recovery) => sum + recovery.recoveryScore, 0);

          const averageRecoveryPerDay = totalRecovery / challengeDurationDays;
          targetReached = averageRecoveryPerDay >= Number(challengeTarget);
          break;

        case 4: // All-Around Avenger
          const sleepPerformanceImprovement = calculateImprovementTrend(
            whoopData.whoopSleeps.filter(
              (sleep: WhoopSleep) =>
                isWithinChallengePeriod(sleep.end) &&
                sleep.scoreState === "SCORED" &&
                !sleep.nap,
            ),
            (sleep: WhoopSleep) => sleep.sleepPerformancePercentage ?? 0,
            (sleep: WhoopSleep) => sleep.end,
          );

          const recoveryImprovement = calculateImprovementTrend(
            whoopData.whoopRecoveries.filter(
              (recovery: WhoopRecovery) =>
                isWithinChallengePeriod(recovery.updatedAtByWhoop) &&
                recovery.scoreState === "SCORED" &&
                !recovery.userCalibrating,
            ),
            (recovery: WhoopRecovery) => recovery.recoveryScore,
            (recovery: WhoopRecovery) => recovery.updatedAtByWhoop,
          );

          const strainImprovement = calculateImprovementTrend(
            whoopData.whoopCycles.filter(
              (cycle: WhoopCycle) =>
                cycle.end !== null &&
                isWithinChallengePeriod(cycle.end) &&
                cycle.scoreState === "SCORED",
            ),
            (cycle: WhoopCycle) => cycle.strain,
            (cycle: WhoopCycle) => cycle.end!,
          );

          const caloriesImprovement = calculateImprovementTrend(
            whoopData.whoopCycles.filter(
              (cycle: WhoopCycle) =>
                cycle.end !== null &&
                isWithinChallengePeriod(cycle.end) &&
                cycle.scoreState === "SCORED",
            ),
            (cycle: WhoopCycle) => cycle.kilojoule * 0.239006,
            (cycle: WhoopCycle) => cycle.end!,
          );

          const averageAllAroundImprovement =
            (sleepPerformanceImprovement +
              recoveryImprovement +
              strainImprovement +
              caloriesImprovement) /
            4;

          targetReached =
            averageAllAroundImprovement >= Number(challengeTarget);
          break;

        case 5: // Sleep Sage
          const sleepPerformanceData = whoopData.whoopSleeps.filter(
            (sleep: WhoopSleep) =>
              isWithinChallengePeriod(sleep.end) &&
              sleep.scoreState === "SCORED" &&
              !sleep.nap,
          );

          const sleepPerformanceImprovementSage = calculateImprovementTrend(
            sleepPerformanceData,
            (sleep: WhoopSleep) => sleep.sleepPerformancePercentage ?? 0,
            (sleep: WhoopSleep) => sleep.end,
          );

          const sleepConsistencyImprovement = calculateImprovementTrend(
            sleepPerformanceData,
            (sleep: WhoopSleep) => sleep.sleepConsistencyPercentage ?? 0,
            (sleep: WhoopSleep) => sleep.end,
          );

          const sleepEfficiencyImprovement = calculateImprovementTrend(
            sleepPerformanceData,
            (sleep: WhoopSleep) => sleep.sleepEfficiencyPercentage ?? 0,
            (sleep: WhoopSleep) => sleep.end,
          );

          const averageSleepSage =
            (sleepPerformanceImprovementSage +
              sleepConsistencyImprovement +
              sleepEfficiencyImprovement) /
            3;

          targetReached = averageSleepSage >= Number(challengeTarget);
          break;

        case 6: // Workout Wizard
          const workoutData = whoopData.whoopCycles.filter(
            (cycle: WhoopCycle) =>
              cycle.end !== null &&
              isWithinChallengePeriod(cycle.end) &&
              cycle.scoreState === "SCORED",
          );

          const strainImprovementWizard = calculateImprovementTrend(
            workoutData,
            (cycle: WhoopCycle) => cycle.strain,
            (cycle: WhoopCycle) => cycle.end!,
          );

          const caloriesImprovementWizard = calculateImprovementTrend(
            workoutData,
            (cycle: WhoopCycle) => cycle.kilojoule * 0.239006,
            (cycle: WhoopCycle) => cycle.end!,
          );

          const averageWorkoutWizard =
            (strainImprovementWizard + caloriesImprovementWizard) / 2;

          targetReached = averageWorkoutWizard >= Number(challengeTarget);

          break;

        default:
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid challenge type",
          });
      }

      try {
        const privateKey = env.PRIVATE_KEY;
        const provider = new ethers.JsonRpcProvider(env.RPC_URL);
        const wallet = new ethers.Wallet(privateKey, provider);

        const contract = new ethers.Contract(
          WhoopTokenAddress,
          WhoopTokenAbi,
          wallet,
        );

        if (contract) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const tx = await contract.updateTargetStatus(
            challengeId,
            targetReached,
          );
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          await tx.wait();
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Update Target Status function not available",
          });
        }

        return { success: true, id: challengeId };
      } catch (error) {
        console.error("Blockchain transaction failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update target status",
        });
      }
    }),

  update1v1ChallengeStatus: protectedProcedure
    .input(
      z.object({
        challengeId: z.bigint(),
        challenger: z.string(),
        challenged: z.string(),
        tokenAddress: z.string(),
        challengerAmount: z.bigint(),
        startTime: z.bigint(),
        endTime: z.bigint(),
        status: z.number(),
        challengeType: z.number(),
        challengeTarget: z.bigint(),
        isTwoSided: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        challengeId,
        challenger,
        challenged,
        startTime,
        endTime,
        challengeType,
        challengeTarget,
      } = input;

      const challengerData = await ctx.db.user.findUnique({
        where: { smartAccountAddress: challenger },
        select: {
          whoopCycles: true,
          whoopRecoveries: true,
          whoopSleeps: true,
        },
      });

      const challengedData = await ctx.db.user.findUnique({
        where: { smartAccountAddress: challenged },
        select: {
          whoopCycles: true,
          whoopRecoveries: true,
          whoopSleeps: true,
        },
      });

      if (!challengerData || !challengedData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or both users not found",
        });
      }

      const challengeStartTime = new Date(Number(startTime) * 1000);
      const challengeEndTime = new Date(Number(endTime) * 1000);

      const isWithinChallengePeriod = (date: Date) => {
        return date >= challengeStartTime && date <= challengeEndTime;
      };

      const challengeDurationDays =
        (challengeEndTime.getTime() - challengeStartTime.getTime()) /
        (1000 * 60 * 60 * 24);

      let challengerAverage = 0;
      let challengedAverage = 0;

      const calculateAverage = (userData: typeof challengerData) => {
        switch (challengeType) {
          case 0: // Calories
            const totalCalories = userData.whoopCycles
              .filter(
                (cycle) =>
                  (cycle.end === null ||
                    isWithinChallengePeriod(new Date(cycle.end))) &&
                  cycle.scoreState === "SCORED",
              )
              .reduce((sum, cycle) => sum + cycle.kilojoule * 0.239006, 0); // Convert kJ to kcal

            return totalCalories / challengeDurationDays;

          case 1: // Strain
            const totalStrain = userData.whoopCycles
              .filter(
                (cycle) =>
                  (cycle.end === null ||
                    isWithinChallengePeriod(new Date(cycle.end))) &&
                  cycle.scoreState === "SCORED",
              )
              .reduce((sum, cycle) => sum + cycle.strain, 0);

            return totalStrain / challengeDurationDays;

          case 2: // Hours of Sleep
            const totalSleepHours = userData.whoopSleeps
              .filter(
                (sleep) =>
                  isWithinChallengePeriod(new Date(sleep.end)) &&
                  sleep.scoreState === "SCORED" &&
                  !sleep.nap,
              )
              .reduce(
                (sum, sleep) => sum + sleep.totalInBedTimeMilli / 3600000,
                0,
              ); // Convert ms to hours

            return totalSleepHours / challengeDurationDays;

          case 3: // Recovery
            const totalRecovery = userData.whoopRecoveries
              .filter(
                (recovery) =>
                  isWithinChallengePeriod(
                    new Date(recovery.updatedAtByWhoop),
                  ) &&
                  recovery.scoreState === "SCORED" &&
                  !recovery.userCalibrating,
              )
              .reduce((sum, recovery) => sum + recovery.recoveryScore, 0);

            return totalRecovery / challengeDurationDays;

          case 4: // All-Around Avenger
            const sleepPerformanceImprovement = calculateImprovementTrend(
              userData.whoopSleeps.filter(
                (sleep: WhoopSleep) =>
                  isWithinChallengePeriod(sleep.end) &&
                  sleep.scoreState === "SCORED" &&
                  !sleep.nap,
              ),
              (sleep: WhoopSleep) => sleep.sleepPerformancePercentage ?? 0,
              (sleep: WhoopSleep) => sleep.end,
            );

            const recoveryImprovement = calculateImprovementTrend(
              userData.whoopRecoveries.filter(
                (recovery: WhoopRecovery) =>
                  isWithinChallengePeriod(recovery.updatedAtByWhoop) &&
                  recovery.scoreState === "SCORED" &&
                  !recovery.userCalibrating,
              ),
              (recovery: WhoopRecovery) => recovery.recoveryScore,
              (recovery: WhoopRecovery) => recovery.updatedAtByWhoop,
            );

            const strainImprovement = calculateImprovementTrend(
              userData.whoopCycles.filter(
                (cycle: WhoopCycle) =>
                  cycle.end !== null &&
                  isWithinChallengePeriod(cycle.end) &&
                  cycle.scoreState === "SCORED",
              ),
              (cycle: WhoopCycle) => cycle.strain,
              (cycle: WhoopCycle) => cycle.end!,
            );

            const caloriesImprovement = calculateImprovementTrend(
              userData.whoopCycles.filter(
                (cycle: WhoopCycle) =>
                  cycle.end !== null &&
                  isWithinChallengePeriod(cycle.end) &&
                  cycle.scoreState === "SCORED",
              ),
              (cycle: WhoopCycle) => cycle.kilojoule * 0.239006,
              (cycle: WhoopCycle) => cycle.end!,
            );

            return (
              (sleepPerformanceImprovement +
                recoveryImprovement +
                strainImprovement +
                caloriesImprovement) /
              4
            );

          case 5: // Sleep Sage
            const sleepPerformanceData = userData.whoopSleeps.filter(
              (sleep: WhoopSleep) =>
                isWithinChallengePeriod(sleep.end) &&
                sleep.scoreState === "SCORED" &&
                !sleep.nap,
            );

            const sleepPerformanceImprovementSage = calculateImprovementTrend(
              sleepPerformanceData,
              (sleep: WhoopSleep) => sleep.sleepPerformancePercentage ?? 0,
              (sleep: WhoopSleep) => sleep.end,
            );

            const sleepConsistencyImprovement = calculateImprovementTrend(
              sleepPerformanceData,
              (sleep: WhoopSleep) => sleep.sleepConsistencyPercentage ?? 0,
              (sleep: WhoopSleep) => sleep.end,
            );

            const sleepEfficiencyImprovement = calculateImprovementTrend(
              sleepPerformanceData,
              (sleep: WhoopSleep) => sleep.sleepEfficiencyPercentage ?? 0,
              (sleep: WhoopSleep) => sleep.end,
            );

            return (
              (sleepPerformanceImprovementSage +
                sleepConsistencyImprovement +
                sleepEfficiencyImprovement) /
              3
            );

          case 6: // Workout Wizard
            const workoutData = userData.whoopCycles.filter(
              (cycle: WhoopCycle) =>
                cycle.end !== null &&
                isWithinChallengePeriod(cycle.end) &&
                cycle.scoreState === "SCORED",
            );

            const strainImprovementWizard = calculateImprovementTrend(
              workoutData,
              (cycle: WhoopCycle) => cycle.strain,
              (cycle: WhoopCycle) => cycle.end!,
            );

            const caloriesImprovementWizard = calculateImprovementTrend(
              workoutData,
              (cycle: WhoopCycle) => cycle.kilojoule * 0.239006,
              (cycle: WhoopCycle) => cycle.end!,
            );

            return (strainImprovementWizard + caloriesImprovementWizard) / 2;

          default:
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid challenge type",
            });
        }
      };

      challengerAverage = calculateAverage(challengerData);
      challengedAverage = calculateAverage(challengedData);

      const challengerDifference = Math.abs(
        Number(challengeTarget) - challengerAverage,
      );
      const challengedDifference = Math.abs(
        Number(challengeTarget) - challengedAverage,
      );

      // const targetReached = challengerDifference <= challengedDifference;
      const targetReached = challengedDifference < challengerDifference;

      try {
        const privateKey = env.PRIVATE_KEY;
        const provider = new ethers.JsonRpcProvider(env.RPC_URL);
        const wallet = new ethers.Wallet(privateKey, provider);

        const contract = new ethers.Contract(
          WhoopTokenAddress,
          WhoopTokenAbi,
          wallet,
        );

        if (contract) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const tx = await contract.updateTargetStatus(
            challengeId,
            targetReached,
          );
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          await tx.wait();
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Update Target Status function not available",
          });
        }

        return { success: true, id: challengeId, targetReached };
      } catch (error) {
        console.error("Blockchain transaction failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update challenge status",
        });
      }
    }),

  getAverageMetric: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        metric: z.enum(["Calories", "Strain", "Sleep Hours", "Recovery"]),
      }),
    )
    .query(async ({ input }) => {
      const { userId, metric } = input;
      const startDate = getStartDateForLast7Days();

      let averageValue = 0;

      switch (metric) {
        case "Calories":
          averageValue = await getAverageCalories(userId, startDate);
          break;
        case "Strain":
          averageValue = await getAverageStrain(userId, startDate);
          break;
        case "Sleep Hours":
          averageValue = await getAverageSleepHours(userId, startDate);
          break;
        case "Recovery":
          averageValue = await getAverageRecovery(userId, startDate);
          break;
      }

      return { average: averageValue };
    }),
});
