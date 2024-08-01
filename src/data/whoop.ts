/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { env } from "@/env";
async function fetchWhoopProfile(accessToken: string) {
  const response = await fetch(
    `${env.WHOOP_API_HOSTNAME}/developer/v1/user/profile/basic`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch WHOOP profile: ${response.statusText}`);
  }

  return response.json();
}

async function fetchWhoopWorkouts(accessToken: string) {
  const response = await fetch(
    `${env.WHOOP_API_HOSTNAME}/developer/v1/activity/workout`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch WHOOP workouts: ${response.statusText}`);
  }

  const data = await response.json();
  return data.records;
}

async function fetchWhoopRecoveries(accessToken: string) {
  const response = await fetch(
    `${env.WHOOP_API_HOSTNAME}/developer/v1/recovery`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch WHOOP recoveries: ${response.statusText}`);
  }

  const data = await response.json();
  return data.records;
}

async function fetchWhoopSleep(accessToken: string) {
  const response = await fetch(
    `${env.WHOOP_API_HOSTNAME}/developer/v1/activity/sleep`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch WHOOP sleep data: ${response.statusText}`);
  }

  const data = await response.json();
  return data.records;
}

async function fetchWhoopCycles(accessToken: string) {
  const response = await fetch(`${env.WHOOP_API_HOSTNAME}/developer/v1/cycle`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch WHOOP cycles: ${response.statusText}`);
  }

  const data = await response.json();
  return data.records;
}

async function fetchWhoopBodyMeasurement(accessToken: string) {
  const response = await fetch(
    `${env.WHOOP_API_HOSTNAME}/developer/v1/user/measurement/body`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch WHOOP body measurements: ${response.statusText}`,
    );
  }

  return response.json();
}

export {
  fetchWhoopProfile,
  fetchWhoopWorkouts,
  fetchWhoopRecoveries,
  fetchWhoopSleep,
  fetchWhoopCycles,
  fetchWhoopBodyMeasurement,
};
