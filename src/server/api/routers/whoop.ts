import { z } from "zod";
import {
  createCallerFactory,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";
import crypto from "crypto";
import {
  fetchWhoopProfile,
  fetchWhoopWorkouts,
  fetchWhoopRecoveries,
  fetchWhoopSleep,
  fetchWhoopCycles,
  fetchWhoopBodyMeasurement,
} from "@/data/whoop";
import { db } from "@/server/db";

export const whoopRouter = createTRPCRouter({
  getAuthUrl: protectedProcedure.mutation(({ ctx }) => {
    const stateData = {
      random: crypto.randomBytes(16).toString("hex"),
      privyUserId: ctx.privyUserId,
    };
    const state = Buffer.from(JSON.stringify(stateData)).toString("base64");

    const authorizationUrl =
      `${env.WHOOP_API_HOSTNAME}/oauth/oauth2/auth?` +
      `client_id=${env.WHOOP_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(env.WHOOP_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent("offline read:profile read:body_measurement read:workout read:sleep read:cycles read:recovery")}&` +
      `state=${state}`;

    return authorizationUrl;
  }),

  oauthCallback: protectedProcedure
    .input(z.object({ code: z.string(), state: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const tokenResponse = await fetch(
          `${env.WHOOP_API_HOSTNAME}/oauth/oauth2/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code: input.code,
              client_id: env.WHOOP_CLIENT_ID,
              client_secret: env.WHOOP_CLIENT_SECRET,
              redirect_uri: env.WHOOP_REDIRECT_URI,
            }),
          },
        );

        const tokenData = (await tokenResponse.json()) as {
          access_token: string;
          refresh_token: string;
          expires_in: number;
        };

        if (!tokenData.access_token) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to obtain access token",
          });
        }

        const profileData = await fetchWhoopProfile(tokenData.access_token);

        const whoopUserId = String(profileData.user_id);

        await ctx.db.user.update({
          where: { privyId: ctx.privyUserId },
          data: {
            whoopAccessToken: tokenData.access_token,
            whoopRefreshToken: tokenData.refresh_token,
            whoopTokenExpiry: new Date(
              Date.now() + tokenData.expires_in * 1000,
            ),
            whoopUserId: whoopUserId,
          },
        });

        const caller = createCallerFactory(whoopRouter);

        await caller({ ...ctx }).storeWhoopData();

        return { success: true };
      } catch (error) {
        console.error("Error in OAuth callback:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to connect WHOOP device",
        });
      }
    }),

  storeWhoopData: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { privyId: ctx.privyUserId },
      select: {
        id: true,
        whoopAccessToken: true,
        whoopUserId: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    if (!user?.whoopAccessToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "WHOOP not connected",
      });
    }

    try {
      const [profile, workouts, recoveries, sleep, cycles, bodyMeasurement] =
        await Promise.all([
          fetchWhoopProfile(user.whoopAccessToken),
          fetchWhoopWorkouts(user.whoopAccessToken),
          fetchWhoopRecoveries(user.whoopAccessToken),
          fetchWhoopSleep(user.whoopAccessToken),
          fetchWhoopCycles(user.whoopAccessToken),
          fetchWhoopBodyMeasurement(user.whoopAccessToken),
        ]);

      await ctx.db.whoopProfile.upsert({
        where: { userId: user.whoopUserId! },
        update: {
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
        },
        create: {
          userId: user.whoopUserId!,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
        },
      });

      await Promise.all([
        ctx.db.cycle.deleteMany({
          where: { userId: user.whoopUserId! },
        }),
        ctx.db.sleep.deleteMany({
          where: { userId: user.whoopUserId! },
        }),
        ctx.db.recovery.deleteMany({
          where: { userId: user.whoopUserId! },
        }),
        ctx.db.workout.deleteMany({
          where: { userId: user.whoopUserId! },
        }),
        ctx.db.bodyMeasurement.deleteMany({
          where: { userId: user.whoopUserId! },
        }),
      ]);

      await Promise.all([
        ctx.db.cycle.createMany({
          data: cycles.map((cycle) => ({
            cycleId: String(cycle.id),
            userId: String(cycle.user_id),
            createdAtByWhoop: cycle.created_at,
            updatedAtByWhoop: cycle.updated_at,
            start: cycle.start,
            end: cycle.end,
            timezoneOffset: cycle.timezone_offset,
            scoreState: cycle.score_state,
            strain: cycle.score.strain,
            kilojoule: cycle.score.kilojoule,
            averageHeartRate: cycle.score.average_heart_rate,
            maxHeartRate: cycle.score.max_heart_rate,
          })),
        }),

        ctx.db.sleep.createMany({
          data: sleep.map((sleepRecord) => ({
            sleepId: String(sleepRecord.id),
            userId: String(sleepRecord.user_id),
            createdAtByWhoop: sleepRecord.created_at,
            updatedAtByWhoop: sleepRecord.updated_at,
            start: sleepRecord.start,
            end: sleepRecord.end,
            timezoneOffset: sleepRecord.timezone_offset,
            nap: sleepRecord.nap,
            scoreState: sleepRecord.score_state,
            totalInBedTimeMilli:
              sleepRecord.score?.stage_summary?.total_in_bed_time_milli || 0,
            totalAwakeTimeMilli:
              sleepRecord.score?.stage_summary?.total_awake_time_milli || 0,
            totalNoDataTimeMilli:
              sleepRecord.score?.stage_summary?.total_no_data_time_milli || 0,
            totalLightSleepTimeMilli:
              sleepRecord.score?.stage_summary?.total_light_sleep_time_milli ||
              0,
            totalSlowWaveSleepTimeMilli:
              sleepRecord.score?.stage_summary
                ?.total_slow_wave_sleep_time_milli || 0,
            totalRemSleepTimeMilli:
              sleepRecord.score?.stage_summary?.total_rem_sleep_time_milli || 0,
            sleepCycleCount:
              sleepRecord.score?.stage_summary?.sleep_cycle_count || 0,
            disturbanceCount:
              sleepRecord.score?.stage_summary?.disturbance_count || 0,
            baseline_milli_sleep_needed:
              sleepRecord.score?.sleep_needed?.baseline_milli || 0,
            need_from_sleep_debt_milli:
              sleepRecord.score?.sleep_needed?.need_from_sleep_debt_milli || 0,
            need_from_recent_strain_milli:
              sleepRecord.score?.sleep_needed?.need_from_recent_strain_milli ||
              0,
            need_from_recent_nap_milli:
              sleepRecord.score?.sleep_needed?.need_from_recent_nap_milli || 0,
            respiratoryRate: sleepRecord.score?.respiratory_rate || 0,
            sleepPerformancePercentage:
              sleepRecord.score?.sleep_performance_percentage || 0,
            sleepConsistencyPercentage:
              sleepRecord.score?.sleep_consistency_percentage || 0,
            sleepEfficiencyPercentage:
              sleepRecord.score?.sleep_efficiency_percentage || 0,
          })),
        }),

        ctx.db.recovery.createMany({
          data: recoveries.map((recovery) => ({
            userId: String(recovery.user_id),
            cycleId: String(recovery.cycle_id),
            sleepId: String(recovery.sleep_id),
            createdAtByWhoop: recovery.created_at,
            updatedAtByWhoop: recovery.updated_at,
            scoreState: recovery.score_state,
            userCalibrating: recovery.score.user_calibrating,
            recoveryScore: recovery.score.recovery_score,
            restingHeartRate: recovery.score.resting_heart_rate,
            hrvRmssd: recovery.score.hrv_rmssd_milli,
            spo2Percentage: recovery.score.spo2_percentage,
            skinTempCelsius: recovery.score.skin_temp_celsius,
          })),
        }),

        ctx.db.workout.createMany({
          data: workouts.map((workout) => ({
            workoutId: String(workout.id),
            userId: String(workout.user_id),
            createdAtByWhoop: workout.created_at,
            updatedAtByWhoop: workout.updated_at,
            start: workout.start,
            end: workout.end,
            timezoneOffset: workout.timezone_offset,
            sportId: workout.sport_id,
            scoreState: workout.score_state,
            strain: workout.score.strain,
            averageHeartRate: workout.score.average_heart_rate,
            maxHeartRate: workout.score.max_heart_rate,
            kilojoule: workout.score.kilojoule,
            percentRecorded: workout.score.percent_recorded,
            distanceMeter: workout.score.distance_meter,
            altitudeGainMeter: workout.score.altitude_gain_meter,
            altitudeChangeMeter: workout.score.altitude_change_meter,
            zeroMilli: workout.score.zone_duration.zone_zero_milli,
            oneMilli: workout.score.zone_duration.zone_one_milli,
            twoMilli: workout.score.zone_duration.zone_two_milli,
            threeMilli: workout.score.zone_duration.zone_three_milli,
            fourMilli: workout.score.zone_duration.zone_four_milli,
            fiveMilli: workout.score.zone_duration.zone_five_milli,
          })),
        }),
      ]);

      await ctx.db.bodyMeasurement.create({
        data: {
          userId: user.whoopUserId!,
          height: bodyMeasurement.height_meter,
          weight: bodyMeasurement.weight_kilogram,
          maxHeartRate: bodyMeasurement.max_heart_rate,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Error fetching WHOOP data:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch WHOOP data",
      });
    }
  }),

  getWhoopProfileData: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { privyId: ctx.privyUserId },
      select: {
        smartAccountAddress: true,
        id: true,
        whoopProfile: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
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
        whoopBodyMeasurements: {
          select: {
            height: true,
            weight: true,
            maxHeartRate: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  getWhoopPublicProfileData: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "ID is required"),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;
      const user = await db.user.findUnique({
        where: { id },
        select: {
          smartAccountAddress: true,
          whoopProfile: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
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
          whoopBodyMeasurements: {
            select: {
              height: true,
              weight: true,
              maxHeartRate: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),

  checkWhoopConnection: publicProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { privyId: ctx.privyUserId },
      select: { whoopAccessToken: true },
    });

    return { isConnected: !!user?.whoopAccessToken };
  }),

  checkPublicWhoopConnection: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "ID is required"),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;
      const user = await db.user.findUnique({
        where: { id },
        select: { whoopAccessToken: true },
      });

      return { isConnected: !!user?.whoopAccessToken };
    }),
});
