/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck

import { compare, hash } from "bcryptjs";
import {
  createTRPCRouter,
  publicProcedure,
  protectedWhoopProcedure,
} from "@/server/api/trpc";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { db } from "@/server/db";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { loginFormSchema, registerFormSchema } from "@/schemas/authFormSchema";
import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { getVerificationTokenByToken } from "@/data/verificationToken";
import { env } from "@/env";
import { ethers } from "ethers";
import { WhoopTokenAbi, WhoopTokenAddress } from "WhoopContract";

const mailerSend = new MailerSend({
  apiKey: env.MAILERSEND_API_KEY,
});

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerFormSchema)
    .mutation(async ({ input }) => {
      const { name, email, password } = input;

      const hashedPassword = await hash(password, 10);

      const existingUser = await getUserByEmail(email);

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email Already Taken",
        });
      }

      try {
        await db.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create account! Try again",
        });
      }

      const verificationToken = await generateVerificationToken(email);

      if (verificationToken) {
        const confirmLink = `${env.DOMAIN_URL}/newVerification?token=${verificationToken.token}`;
        const sentFrom = new Sender(
          "WhoopFit@trial-0r83ql3vrovgzw1j.mlsender.net",
          "Kuldeep",
        );
        const recipients = [new Recipient(verificationToken.email)];
        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setSubject("Confirm your email!")
          .setHtml(
            `<p> Click <a href="${confirmLink}"> here </a> to confirm email. </p>`,
          )
          .setText(
            `<p> Click <a href="${confirmLink}"> here </a> to confirm email. </p>`,
          );

        try {
          await mailerSend.email.send(emailParams);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send verification email",
          });
        }
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch token! Try again",
        });
      }
      return { success: "Confirmation Email Sent!" };
    }),

  login: publicProcedure.input(loginFormSchema).mutation(async ({ input }) => {
    const { email, password } = input;

    const existingUser = await getUserByEmail(email);
    if (!existingUser ?? !existingUser?.email ?? !existingUser?.password) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Email does not exist!",
      });
    }

    if (!existingUser.emailVerified) {
      const verificationToken = await generateVerificationToken(
        existingUser.email,
      );
      if (verificationToken) {
        const confirmLink = `${env.DOMAIN_URL}/newVerification?token=${verificationToken.token}`;
        const sentFrom = new Sender(
          "WhoopFit@trial-0r83ql3vrovgzw1j.mlsender.net",
          "Kuldeep",
        );
        const recipients = [new Recipient(verificationToken.email)];
        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setSubject("Confirm your email!")
          .setHtml(
            `<p> Click <a href="${confirmLink}"> here </a> to confirm email. </p>`,
          )
          .setText(
            `<p> Click <a href="${confirmLink}"> here </a> to confirm email. </p>`,
          );

        try {
          await mailerSend.email.send(emailParams);
          return { success: "Confirmation email sent!" };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send verification email",
          });
        }
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create token! Try again",
        });
      }
    }

    const isPasswordValid = await compare(password, existingUser.password);

    if (!isPasswordValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid password provided!",
      });
    }

    return {
      success: "Logged in successfully!",
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
      },
    };
  }),

  newVerification: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const { token } = input;

      const existingToken = await getVerificationTokenByToken(token);
      if (!existingToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Token does not exist!",
        });
      }

      const hasExpired = new Date(existingToken.expires) < new Date();
      if (hasExpired) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Token has expired!",
        });
      }

      const existingUser = await getUserByEmail(existingToken.email);
      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Email does not exist!",
        });
      }

      try {
        await db.user.update({
          where: { id: existingUser.id },
          data: {
            emailVerified: new Date(),
            email: existingToken.email,
          },
        });

        await db.verificationToken.delete({
          where: { id: existingToken.id },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify! Try again",
        });
      }

      return { success: "Email Verified!" };
    }),

  setDefaultAddress: protectedWhoopProcedure
    .input(z.object({ address: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { address } = input;
      const userId = ctx?.session?.user.id;

      try {
        await ctx.db.user.update({
          where: { id: userId },
          data: { defaultAddress: address },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to set default address",
        });
      }
    }),

  getUsersWithMetrics: protectedWhoopProcedure
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
            defaultAddress: {
              not: null,
            },
          },
        }),
        ctx.db.user.findMany({
          skip,
          take: pageSize,
          where: {
            id: {
              not: ctx.session?.user.id,
            },
            whoopUserId: {
              not: null,
            },
            defaultAddress: {
              not: null,
            },
          },
          select: {
            id: true,
            name: true,
            defaultAddress: true,
            whoopSleep: true,
            whoopRecoveries: true,
            whoopWorkouts: true,
          },
          orderBy: {
            name: "asc",
          },
        }),
      ]);

      const totalPages = Math.ceil(totalUsers / pageSize);

      const usersWithMetrics = users.map((user) => ({
        ...user,
        whoopSleep: user.whoopSleep
          ? user?.whoopSleep?.[0]?.score.sleep_efficiency_percentage.toFixed(1)
          : null,
        whoopRecoveries: user.whoopRecoveries
          ? user?.whoopRecoveries?.[0]?.score.recovery_score.toFixed(1)
          : null,
        whoopWorkouts: user.whoopWorkouts
          ? user?.whoopWorkouts?.[0]?.score.strain.toFixed(1)
          : null,
      }));

      return { users: usersWithMetrics, totalPages };
    }),

  updateTargetStatus: protectedWhoopProcedure
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
        // challenger,
        // challenged,
        // tokenAddress,
        // challengerAmount,
        startTime,
        endTime,
        // status,
        challengeType,
        challengeTarget,
        // isCompleted,
        // targetReached,
        // isTwoSided,
      } = input;

      const whoopData = await ctx.db.user.findUnique({
        where: { id: ctx.session?.user.id },
        select: {
          // defaultAddress: true,
          // whoopProfile: true,
          whoopWorkouts: true,
          whoopRecoveries: true,
          whoopSleep: true,
          // whoopCycles: true,
          // whoopBodyMeasurement: true,
        },
      });

      if (!whoopData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      let targetReached = false;
      const challengeStartTime = new Date(Number(startTime) * 1000);
      const challengeEndTime = new Date(Number(endTime) * 1000);

      // Helper function to check if a date is within the challenge period
      const isWithinChallengePeriod = (date) => {
        return date >= challengeStartTime && date <= challengeEndTime;
      };

      // Helper function to check if the user has started the challenge
      const hasStartedChallenge = (data, dateField) => {
        return data.some(
          (item) => new Date(item[dateField]) >= challengeStartTime,
        );
      };

      switch (challengeType) {
        case 0: // Increase HRV
          if (hasStartedChallenge(whoopData.whoopRecoveries, "created_at")) {
            targetReached = whoopData.whoopRecoveries.some((recovery) => {
              const updatedAtDate = new Date(recovery.updated_at);
              return (
                recovery.score.hrv_rmssd_milli >= challengeTarget &&
                recovery.score_state === "SCORED" &&
                !recovery.score.user_calibrating &&
                isWithinChallengePeriod(updatedAtDate)
              );
            });
          }
          break;

        case 1: // Walking Distance in Meters
          if (hasStartedChallenge(whoopData.whoopWorkouts, "start")) {
            targetReached = whoopData.whoopWorkouts.some((workout) => {
              const workoutEndDate = new Date(workout.end);
              return (
                workout.score.distance_meter >= challengeTarget &&
                isWithinChallengePeriod(workoutEndDate) &&
                workout.sport_id === 63 && // Walking
                workout.score_state === "SCORED"
              );
            });
          }
          break;

        case 2: // Sleep Efficiency above challenge target
          if (hasStartedChallenge(whoopData.whoopSleep, "start")) {
            targetReached = whoopData.whoopSleep.some((sleep) => {
              const sleepEndDate = new Date(sleep.end);
              return (
                sleep.score.sleep_efficiency_percentage >= challengeTarget &&
                isWithinChallengePeriod(sleepEndDate) &&
                sleep.score_state === "SCORED" &&
                !sleep.nap // Exclude naps
              );
            });
          }
          break;

        case 3: // Any Workout activity for 1 hour
          if (hasStartedChallenge(whoopData.whoopWorkouts, "start")) {
            targetReached = whoopData.whoopWorkouts.some((workout) => {
              const workoutEndDate = new Date(workout.end);
              const workoutStartDate = new Date(workout.start);
              const workoutDurationMinutes =
                (workoutEndDate.getTime() - workoutStartDate.getTime()) / 60000;

              return (
                workoutDurationMinutes >= challengeTarget &&
                workout.score_state === "SCORED" &&
                isWithinChallengePeriod(workoutEndDate)
              );
            });
          }
          break;

        // Add more cases for other challenge types as needed
      }

      console.log(targetReached);

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
          const tx = await contract?.updateTargetStatus(
            challengeId,
            targetReached,
          );
          await tx.wait();
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

  checkWinner: protectedWhoopProcedure
    .input(
      z.object({
        challengeId: z.bigint(),
        challenger: z.string(),
        challenged: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { challengeId, challenger, challenged } = input;
      const currentUserAddress = ctx.session.user.address;

      // Create a provider and contract instance
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.RPC_URL,
      );
      const contract = new ethers.Contract(
        WhoopTokenAddress,
        WhoopTokenAbi,
        provider,
      );

      try {
        // Call the getChallengeWinner function on the smart contract
        const winner = await contract.getChallengeWinner(challengeId);

        // Check if the current user is the winner
        const isWinner =
          winner.toLowerCase() === currentUserAddress.toLowerCase();

        // Ensure the current user is either the challenger or the challenged
        if (
          currentUserAddress.toLowerCase() !== challenger.toLowerCase() &&
          currentUserAddress.toLowerCase() !== challenged.toLowerCase()
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a participant in this challenge",
          });
        }

        return {
          id: challengeId,
          isWinner,
        };
      } catch (error) {
        console.error("Error checking challenge winner:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check challenge winner",
        });
      }
    }),

  updateSelfTargetStatus: protectedWhoopProcedure
    .input(
      z.object({
        challengeId: z.bigint(),
        user: z.string(),
        startTime: z.bigint(),
        endTime: z.bigint(),
        status: z.number(),
        challengeType: z.number(),
        challengeTarget: z.bigint(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        challengeId,
        // challenger,
        // challenged,
        // tokenAddress,
        // challengerAmount,
        startTime,
        endTime,
        // status,
        challengeType,
        challengeTarget,
        // isCompleted,
        // targetReached,
        // isTwoSided,
      } = input;

      const whoopData = await ctx.db.user.findUnique({
        where: { id: ctx.session?.user.id },
        select: {
          // defaultAddress: true,
          // whoopProfile: true,
          whoopWorkouts: true,
          whoopRecoveries: true,
          whoopSleep: true,
          // whoopCycles: true,
          // whoopBodyMeasurement: true,
        },
      });

      if (!whoopData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      let targetReached = false;
      const challengeStartTime = new Date(Number(startTime) * 1000);
      const challengeEndTime = new Date(Number(endTime) * 1000);

      // Helper function to check if a date is within the challenge period
      const isWithinChallengePeriod = (date) => {
        return date >= challengeStartTime && date <= challengeEndTime;
      };

      // Helper function to check if the user has started the challenge
      const hasStartedChallenge = (data, dateField) => {
        return data.some(
          (item) => new Date(item[dateField]) >= challengeStartTime,
        );
      };

      switch (challengeType) {
        case 0: // Increase HRV
          if (hasStartedChallenge(whoopData.whoopRecoveries, "created_at")) {
            targetReached = whoopData.whoopRecoveries.some((recovery) => {
              const updatedAtDate = new Date(recovery.updated_at);
              return (
                recovery.score.hrv_rmssd_milli >= challengeTarget &&
                recovery.score_state === "SCORED" &&
                !recovery.score.user_calibrating &&
                isWithinChallengePeriod(updatedAtDate)
              );
            });
          }
          break;

        case 1: // Walking Distance in Meters
          if (hasStartedChallenge(whoopData.whoopWorkouts, "start")) {
            targetReached = whoopData.whoopWorkouts.some((workout) => {
              const workoutEndDate = new Date(workout.end);
              return (
                workout.score.distance_meter >= challengeTarget &&
                isWithinChallengePeriod(workoutEndDate) &&
                workout.sport_id === 63 && // Walking
                workout.score_state === "SCORED"
              );
            });
          }
          break;

        case 2: // Sleep Efficiency above challenge target
          if (hasStartedChallenge(whoopData.whoopSleep, "start")) {
            targetReached = whoopData.whoopSleep.some((sleep) => {
              const sleepEndDate = new Date(sleep.end);
              return (
                sleep.score.sleep_efficiency_percentage >= challengeTarget &&
                isWithinChallengePeriod(sleepEndDate) &&
                sleep.score_state === "SCORED" &&
                !sleep.nap // Exclude naps
              );
            });
          }
          break;

        case 3: // Any Workout activity for 1 hour
          if (hasStartedChallenge(whoopData.whoopWorkouts, "start")) {
            targetReached = whoopData.whoopWorkouts.some((workout) => {
              const workoutEndDate = new Date(workout.end);
              const workoutStartDate = new Date(workout.start);
              const workoutDurationMinutes =
                (workoutEndDate.getTime() - workoutStartDate.getTime()) / 60000;

              return (
                workoutDurationMinutes >= challengeTarget &&
                workout.score_state === "SCORED" &&
                isWithinChallengePeriod(workoutEndDate)
              );
            });
          }
          break;

        // Add more cases for other challenge types as needed
      }

      //
      // targetReached = true;

      console.log(targetReached);

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
          if (contract?.updateSelfChallengeStatus) {
            const tx = await contract?.updateSelfChallengeStatus(
              challengeId,
              targetReached,
            );
            await tx.wait();
          } else {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Update Target Status function not available",
            });
          }
        }

        return { success: true };
      } catch (error) {
        console.error("Blockchain transaction failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update target status",
        });
      }
    }),
});
