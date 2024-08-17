/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import {
  fetchWhoopWorkouts,
  fetchWhoopRecoveries,
  fetchWhoopSleep,
  fetchWhoopCycles,
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

  const res = await fetch("https://httpbin.org/get");
  const result = await res.json();
  console.log(result);

  return NextResponse.json({ success: true, result });

  try {
    // const users = await db.user.findMany({
    //   where: {
    //     whoopRefreshToken: {
    //       not: null,
    //     },
    //   },
    // });
    // for (const user of users) {
    //   try {
    //     const { access_token, refresh_token, expires_in } =
    //       await refreshWhoopToken(user.whoopRefreshToken!);
    //     await db.user.update({
    //       where: { privyId: user.privyId },
    //       data: {
    //         whoopAccessToken: access_token,
    //         whoopRefreshToken: refresh_token,
    //         whoopTokenExpiry: new Date(Date.now() + expires_in * 1000),
    //       },
    //     });
    //     const [workouts, recoveries, sleep, cycles] = await Promise.all([
    //       fetchWhoopWorkouts(access_token),
    //       fetchWhoopRecoveries(access_token),
    //       fetchWhoopSleep(access_token),
    //       fetchWhoopCycles(access_token),
    //     ]);
    //     await Promise.all([
    //       db.cycle.deleteMany({
    //         where: { userId: user.whoopUserId! },
    //       }),
    //       db.sleep.deleteMany({
    //         where: { userId: user.whoopUserId! },
    //       }),
    //       db.recovery.deleteMany({
    //         where: { userId: user.whoopUserId! },
    //       }),
    //       db.workout.deleteMany({
    //         where: { userId: user.whoopUserId! },
    //       }),
    //     ]);
    //     await Promise.all([
    //       db.cycle.createMany({
    //         data: cycles.map((cycle) => ({
    //           cycleId: String(cycle.id),
    //           userId: String(cycle.user_id),
    //           createdAtByWhoop: cycle.created_at,
    //           updatedAtByWhoop: cycle.updated_at,
    //           start: cycle.start,
    //           end: cycle.end,
    //           timezoneOffset: cycle.timezone_offset,
    //           scoreState: cycle.score_state,
    //           strain: cycle.score.strain,
    //           kilojoule: cycle.score.kilojoule,
    //           averageHeartRate: cycle.score.average_heart_rate,
    //           maxHeartRate: cycle.score.max_heart_rate,
    //         })),
    //       }),
    //       db.sleep.createMany({
    //         data: sleep.map((sleepRecord) => ({
    //           sleepId: String(sleepRecord.id),
    //           userId: String(sleepRecord.user_id),
    //           createdAtByWhoop: sleepRecord.created_at,
    //           updatedAtByWhoop: sleepRecord.updated_at,
    //           start: sleepRecord.start,
    //           end: sleepRecord.end,
    //           timezoneOffset: sleepRecord.timezone_offset,
    //           nap: sleepRecord.nap,
    //           scoreState: sleepRecord.score_state,
    //           totalInBedTimeMilli:
    //             sleepRecord.score.stage_summary.total_in_bed_time_milli,
    //           totalAwakeTimeMilli:
    //             sleepRecord.score.stage_summary.total_awake_time_milli,
    //           totalNoDataTimeMilli:
    //             sleepRecord.score.stage_summary.total_no_data_time_milli,
    //           totalLightSleepTimeMilli:
    //             sleepRecord.score.stage_summary.total_light_sleep_time_milli,
    //           totalSlowWaveSleepTimeMilli:
    //             sleepRecord.score.stage_summary
    //               .total_slow_wave_sleep_time_milli,
    //           totalRemSleepTimeMilli:
    //             sleepRecord.score.stage_summary.total_rem_sleep_time_milli,
    //           sleepCycleCount:
    //             sleepRecord.score.stage_summary.sleep_cycle_count,
    //           disturbanceCount:
    //             sleepRecord.score.stage_summary.disturbance_count,
    //           baseline_milli_sleep_needed:
    //             sleepRecord.score.sleep_needed.baseline_milli,
    //           need_from_sleep_debt_milli:
    //             sleepRecord.score.sleep_needed.need_from_sleep_debt_milli,
    //           need_from_recent_strain_milli:
    //             sleepRecord.score.sleep_needed.need_from_recent_strain_milli,
    //           need_from_recent_nap_milli:
    //             sleepRecord.score.sleep_needed.need_from_recent_nap_milli,
    //           respiratoryRate: sleepRecord.score.respiratory_rate,
    //           sleepPerformancePercentage:
    //             sleepRecord.score.sleep_performance_percentage,
    //           sleepConsistencyPercentage:
    //             sleepRecord.score.sleep_consistency_percentage,
    //           sleepEfficiencyPercentage:
    //             sleepRecord.score.sleep_efficiency_percentage,
    //         })),
    //       }),
    //       db.recovery.createMany({
    //         data: recoveries.map((recovery) => ({
    //           userId: String(recovery.user_id),
    //           cycleId: String(recovery.cycle_id),
    //           sleepId: String(recovery.sleep_id),
    //           createdAtByWhoop: recovery.created_at,
    //           updatedAtByWhoop: recovery.updated_at,
    //           scoreState: recovery.score_state,
    //           userCalibrating: recovery.score.user_calibrating,
    //           recoveryScore: recovery.score.recovery_score,
    //           restingHeartRate: recovery.score.resting_heart_rate,
    //           hrvRmssd: recovery.score.hrv_rmssd_milli,
    //           spo2Percentage: recovery.score.spo2_percentage,
    //           skinTempCelsius: recovery.score.skin_temp_celsius,
    //         })),
    //       }),
    //       db.workout.createMany({
    //         data: workouts.map((workout) => ({
    //           workoutId: String(workout.id),
    //           userId: String(workout.user_id),
    //           createdAtByWhoop: workout.created_at,
    //           updatedAtByWhoop: workout.updated_at,
    //           start: workout.start,
    //           end: workout.end,
    //           timezoneOffset: workout.timezone_offset,
    //           sportId: workout.sport_id,
    //           scoreState: workout.score_state,
    //           strain: workout.score.strain,
    //           averageHeartRate: workout.score.average_heart_rate,
    //           maxHeartRate: workout.score.max_heart_rate,
    //           kilojoule: workout.score.kilojoule,
    //           percentRecorded: workout.score.percent_recorded,
    //           distanceMeter: workout.score.distance_meter,
    //           altitudeGainMeter: workout.score.altitude_gain_meter,
    //           altitudeChangeMeter: workout.score.altitude_change_meter,
    //           zeroMilli: workout.score.zone_duration.zone_zero_milli,
    //           oneMilli: workout.score.zone_duration.zone_one_milli,
    //           twoMilli: workout.score.zone_duration.zone_two_milli,
    //           threeMilli: workout.score.zone_duration.zone_three_milli,
    //           fourMilli: workout.score.zone_duration.zone_four_milli,
    //           fiveMilli: workout.score.zone_duration.zone_five_milli,
    //         })),
    //       }),
    //     ]);
    //   } catch (error) {
    //     console.error("Error in refresh WHOOP data:", error);
    //     return NextResponse.json(
    //       { success: false, error: (error as Error).message },
    //       { status: 500 },
    //     );
    //   }
    //   await db.cron.create({
    //     data: {
    //       name: "Pass",
    //     },
    //   });
    //   return NextResponse.json({ success: true });
    // }
  } catch (error) {
    console.error("Error in refresh WHOOP data:", error);
    await db.cron.create({
      data: {
        name: "Error",
      },
    });

    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
};
