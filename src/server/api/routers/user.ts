import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { env } from "@/env";
import { ethers } from "ethers";
import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";
import { getStartDateForLast7Days } from "@/lib/challenge";
import {
  getAverageCalories,
  getAverageRecovery,
  getAverageSleepHours,
  getAverageStrain,
} from "@/data/user";

const baseLoginSchema = z.object({
  privyId: z.string().min(1, { message: "PrivyId is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email("Not a valid email"),
  embeddedAddress: z
    .string()
    .min(1, { message: "Embedded Address is required" }),
  smartAccountAddress: z.string().optional(),
});

const emailLoginSchema = baseLoginSchema.extend({
  method: z.literal("email"),
});

const googleLoginSchema = baseLoginSchema.extend({
  method: z.literal("google"),
  name: z.string().min(1, { message: "Name is required" }),
});

const registerSchema = z.discriminatedUnion("method", [
  emailLoginSchema,
  googleLoginSchema,
]);

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const baseUserData = {
        email: input.email,
        privyId: input.privyId,
        embeddedAddress: input.embeddedAddress,
        smartAccountAddress: input.smartAccountAddress,
      };

      const userData =
        input.method === "google"
          ? { ...baseUserData, name: input.name }
          : baseUserData;

      const existingUser = await ctx.db.user.findFirst({
        where: {
          OR: [{ email: userData.email }, { privyId: userData.privyId }],
        },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      try {
        await ctx.db.user.create({
          data: userData,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create account! Try again",
        });
      }

      return { success: "Registration successful!" };
    }),

  updateSmartAccount: publicProcedure
    .input(
      z.object({
        privyId: z.string(),
        smartAccountAddress: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { privyId, smartAccountAddress } = input;

      try {
        const updatedUser = await ctx.db.user.update({
          where: { privyId: privyId },
          data: { smartAccountAddress: smartAccountAddress },
        });

        if (!updatedUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return { success: "Smart account address updated successfully!" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add smart account account! Try again",
        });
      }
    }),

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
            whoopWorkouts: {
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
          whoopWorkouts: true,
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
          const totalCalories = whoopData.whoopWorkouts
            .filter(
              (workout) =>
                isWithinChallengePeriod(new Date(workout.end)) &&
                workout.scoreState === "SCORED",
            )
            .reduce((sum, workout) => sum + workout.kilojoule * 0.239006, 0); // Convert kJ to kcal

          const averageCaloriesPerDay = totalCalories / challengeDurationDays;
          targetReached = averageCaloriesPerDay >= Number(challengeTarget);
          break;

        case 1: // Strain
          const totalStrain = whoopData.whoopWorkouts
            .filter(
              (workout) =>
                isWithinChallengePeriod(new Date(workout.end)) &&
                workout.scoreState === "SCORED",
            )
            .reduce((sum, workout) => sum + workout.strain, 0);

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
          whoopWorkouts: true,
          whoopRecoveries: true,
          whoopSleeps: true,
        },
      });

      const challengedData = await ctx.db.user.findUnique({
        where: { smartAccountAddress: challenged },
        select: {
          whoopWorkouts: true,
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
            return (
              userData.whoopWorkouts
                .filter(
                  (workout) =>
                    isWithinChallengePeriod(new Date(workout.end)) &&
                    workout.scoreState === "SCORED",
                )
                .reduce(
                  (sum, workout) => sum + workout.kilojoule * 0.239006,
                  0,
                ) / challengeDurationDays
            );
          case 1: // Strain
            return (
              userData.whoopWorkouts
                .filter(
                  (workout) =>
                    isWithinChallengePeriod(new Date(workout.end)) &&
                    workout.scoreState === "SCORED",
                )
                .reduce((sum, workout) => sum + workout.strain, 0) /
              challengeDurationDays
            );
          case 2: // Hours of Sleep
            return (
              userData.whoopSleeps
                .filter(
                  (sleep) =>
                    isWithinChallengePeriod(new Date(sleep.end)) &&
                    sleep.scoreState === "SCORED" &&
                    !sleep.nap,
                )
                .reduce(
                  (sum, sleep) => sum + sleep.totalInBedTimeMilli / 3600000,
                  0,
                ) / challengeDurationDays
            );
          case 3: // Recovery
            return (
              userData.whoopRecoveries
                .filter(
                  (recovery) =>
                    isWithinChallengePeriod(
                      new Date(recovery.updatedAtByWhoop),
                    ) &&
                    recovery.scoreState === "SCORED" &&
                    !recovery.userCalibrating,
                )
                .reduce((sum, recovery) => sum + recovery.recoveryScore, 0) /
              challengeDurationDays
            );
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
