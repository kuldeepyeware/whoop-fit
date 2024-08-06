/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// app/api/refreshData/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import {
  fetchWhoopProfile,
  fetchWhoopWorkouts,
  fetchWhoopRecoveries,
  fetchWhoopSleep,
  fetchWhoopCycles,
  fetchWhoopBodyMeasurement,
} from "@/data/whoop";
import { refreshWhoopToken } from "@/lib/whoopApi";
import { env } from "@/env";

export const GET = async (req: NextRequest) => {
  const authorizationHeader = req.headers.get("Authorization");
  if (authorizationHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const users = await db.user.findMany({
      where: {
        whoopRefreshToken: {
          not: null,
        },
      },
    });

    for (const user of users) {
      try {
        // Refresh tokens
        const { access_token, refresh_token, expires_in } =
          await refreshWhoopToken(user.whoopRefreshToken!);

        // Fetch new data
        const [profile, workouts, recoveries, sleep, cycles, bodyMeasurement] =
          await Promise.all([
            fetchWhoopProfile(access_token),
            fetchWhoopWorkouts(access_token),
            fetchWhoopRecoveries(access_token),
            fetchWhoopSleep(access_token),
            fetchWhoopCycles(access_token),
            fetchWhoopBodyMeasurement(access_token),
          ]);

        // Update user in the database
        await db.user.update({
          where: { id: user.id },
          data: {
            whoopAccessToken: access_token,
            whoopRefreshToken: refresh_token,
            whoopTokenExpiry: new Date(Date.now() + expires_in * 1000),
            whoopProfile: profile,
            whoopWorkouts: workouts,
            whoopRecoveries: recoveries,
            whoopSleep: sleep,
            whoopCycles: cycles,
            whoopBodyMeasurement: bodyMeasurement,
          },
        });
      } catch (error) {
        console.error(
          `Failed to update WHOOP data for user ${user.id}:`,
          error,
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in refresh WHOOP data:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
};
