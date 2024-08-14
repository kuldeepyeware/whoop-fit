"use server";

import { db } from "@/server/db";

async function getAverageCalories(
  userId: string,
  startDate: Date,
): Promise<number> {
  const workouts = await db.workout.findMany({
    where: { userId, start: { gte: startDate } },
    select: { kilojoule: true },
  });
  const totalCalories = workouts.reduce(
    (sum, workout) => sum + workout.kilojoule * 0.239006,
    0,
  );
  return totalCalories / workouts.length || 0;
}

async function getAverageStrain(
  userId: string,
  startDate: Date,
): Promise<number> {
  const workouts = await db.workout.findMany({
    where: { userId, start: { gte: startDate } },
    select: { strain: true },
  });

  const totalStrain = workouts.reduce(
    (sum, workout) => sum + workout.strain,
    0,
  );
  return totalStrain / workouts.length || 0;
}

async function getAverageSleepHours(
  userId: string,
  startDate: Date,
): Promise<number> {
  const sleeps = await db.sleep.findMany({
    where: { userId, start: { gte: startDate } },
    select: { totalInBedTimeMilli: true },
  });

  const totalSleepHours = sleeps.reduce(
    (sum, sleep) => sum + sleep.totalInBedTimeMilli / 3600000,
    0,
  );

  return totalSleepHours / sleeps.length || 0;
}

async function getAverageRecovery(
  userId: string,
  startDate: Date,
): Promise<number> {
  const recoveries = await db.recovery.findMany({
    where: { userId, createdAtByWhoop: { gte: startDate } },
    select: { recoveryScore: true },
  });

  const totalRecovery = recoveries.reduce(
    (sum, recovery) => sum + recovery.recoveryScore,
    0,
  );
  return totalRecovery / recoveries.length || 0;
}

export {
  getAverageCalories,
  getAverageSleepHours,
  getAverageRecovery,
  getAverageStrain,
};
