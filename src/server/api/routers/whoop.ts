/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { z } from "zod";
import {
  createCallerFactory,
  createTRPCRouter,
  protectedWhoopProcedure,
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

export const whoopRouter = createTRPCRouter({
  getAuthUrl: protectedWhoopProcedure.mutation(() => {
    const state = crypto.randomBytes(16).toString("hex");
    const authorizationUrl =
      `${env.WHOOP_API_HOSTNAME}/oauth/oauth2/auth?` +
      `client_id=${env.WHOOP_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(env.WHOOP_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent("offline read:profile read:body_measurement read:workout read:sleep read:cycles read:recovery")}&` +
      `state=${state}`;

    return authorizationUrl;
  }),

  fetchAndStoreWhoopData: protectedWhoopProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session?.user.id },
    });

    if (!user?.whoopAccessToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "WHOOP not connected",
      });
    }

    try {
      // Fetch data from WHOOP API
      const [profile, workouts, recoveries, sleep, cycles, bodyMeasurement] =
        await Promise.all([
          fetchWhoopProfile(user.whoopAccessToken),
          fetchWhoopWorkouts(user.whoopAccessToken),
          fetchWhoopRecoveries(user.whoopAccessToken),
          fetchWhoopSleep(user.whoopAccessToken),
          fetchWhoopCycles(user.whoopAccessToken),
          fetchWhoopBodyMeasurement(user.whoopAccessToken),
        ]);

      // Store the fetched data in the database
      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          whoopProfile: profile,
          whoopWorkouts: workouts,
          whoopRecoveries: recoveries,
          whoopSleep: sleep,
          whoopCycles: cycles,
          whoopBodyMeasurement: bodyMeasurement,
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

  oauthCallback: protectedWhoopProcedure
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

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to obtain access token",
          });
        }

        // Fetch WHOOP user profile
        const profileResponse = await fetch(
          `${env.WHOOP_API_HOSTNAME}/developer/v1/user/profile/basic`,
          {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          },
        );

        const profileData = await profileResponse.json();

        const whoopUserId = String(profileData.user_id);

        // Update user in database with WHOOP tokens and user ID
        await ctx.db.user.update({
          where: { id: ctx.session?.user.id },
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

        await caller({ ...ctx }).fetchAndStoreWhoopData();

        return { success: true };
      } catch (error) {
        console.error("Error in OAuth callback:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to connect WHOOP device",
        });
      }
    }),

  getProfile: protectedWhoopProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session?.user.id },
    });

    if (!user?.whoopAccessToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "WHOOP not connected",
      });
    }

    const profileResponse = await fetch(
      `${env.WHOOP_API_HOSTNAME}/developer/v1/user/profile/basic`,
      {
        headers: {
          Authorization: `Bearer ${user.whoopAccessToken}`,
        },
      },
    );

    if (!profileResponse.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch WHOOP profile",
      });
    }

    return profileResponse.json();
  }),

  getWhoopData: protectedWhoopProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session?.user.id },
      select: {
        defaultAddress: true,
        whoopProfile: true,
        whoopWorkouts: true,
        whoopRecoveries: true,
        whoopSleep: true,
        whoopCycles: true,
        whoopBodyMeasurement: true,
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

  checkWhoopConnection: protectedWhoopProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session?.user.id },
      select: { whoopAccessToken: true },
    });

    return { isConnected: !!user?.whoopAccessToken };
  }),
});
