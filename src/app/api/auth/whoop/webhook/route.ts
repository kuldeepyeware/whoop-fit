import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/server/db";
import { env } from "@/env";
import {
  fetchRecoveryFromId,
  fetchSleepFromId,
  fetchWorkoutFromId,
} from "@/data/whoop";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const parsedBody = JSON.parse(rawBody) as {
      user_id: string;
      id: string;
      type: string;
    };

    if (!validateWebhookSignature(req, rawBody, env.WHOOP_CLIENT_SECRET)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { user_id, id, type } = parsedBody;

    switch (type) {
      case "workout.updated":
      case "workout.deleted":
        await handleWorkoutUpdate(user_id, id, type);
        break;
      case "sleep.updated":
      case "sleep.deleted":
        await handleSleepUpdate(user_id, id, type);
        break;
      case "recovery.updated":
      case "recovery.deleted":
        await handleRecoveryUpdate(user_id, id, type);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    await db.webhook.create({
      data: {
        name: "Pass",
      },
    });

    return NextResponse.json({ message: "Webhook processed" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);

    await db.cron.create({
      data: {
        name: "Error",
      },
    });

    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 },
    );
  }
}

function validateWebhookSignature(
  req: NextRequest,
  body: string,
  clientSecret: string,
): boolean {
  const signature = req.headers.get("x-whoop-signature");
  const timestamp = req.headers.get("x-whoop-signature-timestamp");

  if (!signature || !timestamp) {
    return false;
  }

  const calculatedSignature = crypto
    .createHmac("sha256", clientSecret)
    .update(timestamp + body)
    .digest("base64");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature),
  );
}

async function handleWorkoutUpdate(
  userId: string,
  workoutId: string,
  type: string,
) {
  if (type === "workout.deleted") {
    await db.workout.delete({ where: { id: workoutId } });
    return;
  }

  const workoutData = await fetchWorkoutFromId(userId, workoutId);

  await db.workout.upsert({
    where: { workoutId: workoutId },
    update: {
      createdAtByWhoop: workoutData.created_at,
      updatedAtByWhoop: workoutData.updated_at,
      start: workoutData.start,
      end: workoutData.end,
      timezoneOffset: workoutData.timezone_offset,
      sportId: workoutData.sport_id,
      scoreState: workoutData.score_state,
      strain: workoutData.score.strain,
      averageHeartRate: workoutData.score.average_heart_rate,
      maxHeartRate: workoutData.score.max_heart_rate,
      kilojoule: workoutData.score.kilojoule,
      percentRecorded: workoutData.score.percent_recorded,
      distanceMeter: workoutData.score.distance_meter,
      altitudeGainMeter: workoutData.score.altitude_gain_meter,
      altitudeChangeMeter: workoutData.score.altitude_change_meter,
      zeroMilli: workoutData.score.zone_duration.zone_zero_milli,
      oneMilli: workoutData.score.zone_duration.zone_one_milli,
      twoMilli: workoutData.score.zone_duration.zone_two_milli,
      threeMilli: workoutData.score.zone_duration.zone_three_milli,
      fourMilli: workoutData.score.zone_duration.zone_four_milli,
      fiveMilli: workoutData.score.zone_duration.zone_five_milli,
    },
    create: {
      userId: String(userId),
      workoutId: String(workoutId),
      createdAtByWhoop: workoutData.created_at,
      updatedAtByWhoop: workoutData.updated_at,
      start: workoutData.start,
      end: workoutData.end,
      timezoneOffset: workoutData.timezone_offset,
      sportId: workoutData.sport_id,
      scoreState: workoutData.score_state,
      strain: workoutData.score.strain,
      averageHeartRate: workoutData.score.average_heart_rate,
      maxHeartRate: workoutData.score.max_heart_rate,
      kilojoule: workoutData.score.kilojoule,
      percentRecorded: workoutData.score.percent_recorded,
      distanceMeter: workoutData.score.distance_meter,
      altitudeGainMeter: workoutData.score.altitude_gain_meter,
      altitudeChangeMeter: workoutData.score.altitude_change_meter,
      zeroMilli: workoutData.score.zone_duration.zone_zero_milli,
      oneMilli: workoutData.score.zone_duration.zone_one_milli,
      twoMilli: workoutData.score.zone_duration.zone_two_milli,
      threeMilli: workoutData.score.zone_duration.zone_three_milli,
      fourMilli: workoutData.score.zone_duration.zone_four_milli,
      fiveMilli: workoutData.score.zone_duration.zone_five_milli,
    },
  });
}

async function handleSleepUpdate(
  userId: string,
  sleepId: string,
  type: string,
) {
  if (type === "sleep.deleted") {
    await db.sleep.delete({ where: { id: sleepId } });
    return;
  }

  const sleepData = await fetchSleepFromId(userId, sleepId);

  await db.sleep.upsert({
    where: { sleepId: sleepId },
    update: {
      createdAtByWhoop: sleepData.created_at,
      updatedAtByWhoop: sleepData.updated_at,
      start: sleepData.start,
      end: sleepData.end,
      timezoneOffset: sleepData.timezone_offset,
      nap: sleepData.nap,
      scoreState: sleepData.score_state,
      totalInBedTimeMilli:
        sleepData.score.stage_summary.total_in_bed_time_milli,
      totalAwakeTimeMilli: sleepData.score.stage_summary.total_awake_time_milli,
      totalNoDataTimeMilli:
        sleepData.score.stage_summary.total_no_data_time_milli,
      totalLightSleepTimeMilli:
        sleepData.score.stage_summary.total_light_sleep_time_milli,
      totalSlowWaveSleepTimeMilli:
        sleepData.score.stage_summary.total_slow_wave_sleep_time_milli,
      totalRemSleepTimeMilli:
        sleepData.score.stage_summary.total_rem_sleep_time_milli,
      sleepCycleCount: sleepData.score.stage_summary.sleep_cycle_count,
      disturbanceCount: sleepData.score.stage_summary.disturbance_count,
      baseline_milli_sleep_needed: sleepData.score.sleep_needed.baseline_milli,
      need_from_sleep_debt_milli:
        sleepData.score.sleep_needed.need_from_sleep_debt_milli,
      need_from_recent_strain_milli:
        sleepData.score.sleep_needed.need_from_recent_strain_milli,
      need_from_recent_nap_milli:
        sleepData.score.sleep_needed.need_from_recent_nap_milli,
      respiratoryRate: sleepData.score.respiratory_rate,
      sleepPerformancePercentage: sleepData.score.sleep_performance_percentage,
      sleepConsistencyPercentage: sleepData.score.sleep_consistency_percentage,
      sleepEfficiencyPercentage: sleepData.score.sleep_efficiency_percentage,
    },
    create: {
      userId: String(userId),
      sleepId: String(sleepId),
      createdAtByWhoop: sleepData.created_at,
      updatedAtByWhoop: sleepData.updated_at,
      start: sleepData.start,
      end: sleepData.end,
      timezoneOffset: sleepData.timezone_offset,
      nap: sleepData.nap,
      scoreState: sleepData.score_state,
      totalInBedTimeMilli:
        sleepData.score.stage_summary.total_in_bed_time_milli,
      totalAwakeTimeMilli: sleepData.score.stage_summary.total_awake_time_milli,
      totalNoDataTimeMilli:
        sleepData.score.stage_summary.total_no_data_time_milli,
      totalLightSleepTimeMilli:
        sleepData.score.stage_summary.total_light_sleep_time_milli,
      totalSlowWaveSleepTimeMilli:
        sleepData.score.stage_summary.total_slow_wave_sleep_time_milli,
      totalRemSleepTimeMilli:
        sleepData.score.stage_summary.total_rem_sleep_time_milli,
      sleepCycleCount: sleepData.score.stage_summary.sleep_cycle_count,
      disturbanceCount: sleepData.score.stage_summary.disturbance_count,
      baseline_milli_sleep_needed: sleepData.score.sleep_needed.baseline_milli,
      need_from_sleep_debt_milli:
        sleepData.score.sleep_needed.need_from_sleep_debt_milli,
      need_from_recent_strain_milli:
        sleepData.score.sleep_needed.need_from_recent_strain_milli,
      need_from_recent_nap_milli:
        sleepData.score.sleep_needed.need_from_recent_nap_milli,
      respiratoryRate: sleepData.score.respiratory_rate,
      sleepPerformancePercentage: sleepData.score.sleep_performance_percentage,
      sleepConsistencyPercentage: sleepData.score.sleep_consistency_percentage,
      sleepEfficiencyPercentage: sleepData.score.sleep_efficiency_percentage,
    },
  });
}

async function handleRecoveryUpdate(
  userId: string,
  cycleId: string,
  type: string,
) {
  if (type === "recovery.deleted") {
    await db.recovery.delete({ where: { cycleId: cycleId } });
    return;
  }

  const recoveryData = await fetchRecoveryFromId(userId, cycleId);

  await db.recovery.upsert({
    where: { cycleId: cycleId, userId: userId },
    update: {
      sleepId: String(recoveryData.sleep_id),
      createdAtByWhoop: recoveryData.created_at,
      updatedAtByWhoop: recoveryData.updated_at,
      scoreState: recoveryData.score_state,
      userCalibrating: recoveryData.score.user_calibrating,
      recoveryScore: recoveryData.score.recovery_score,
      restingHeartRate: recoveryData.score.resting_heart_rate,
      hrvRmssd: recoveryData.score.hrv_rmssd_milli,
      spo2Percentage: recoveryData.score.spo2_percentage,
      skinTempCelsius: recoveryData.score.skin_temp_celsius,
    },
    create: {
      userId: String(userId),
      cycleId: String(cycleId),
      sleepId: String(recoveryData.sleep_id),
      createdAtByWhoop: recoveryData.created_at,
      updatedAtByWhoop: recoveryData.updated_at,
      scoreState: recoveryData.score_state,
      userCalibrating: recoveryData.score.user_calibrating,
      recoveryScore: recoveryData.score.recovery_score,
      restingHeartRate: recoveryData.score.resting_heart_rate,
      hrvRmssd: recoveryData.score.hrv_rmssd_milli,
      spo2Percentage: recoveryData.score.spo2_percentage,
      skinTempCelsius: recoveryData.score.skin_temp_celsius,
    },
  });
}
