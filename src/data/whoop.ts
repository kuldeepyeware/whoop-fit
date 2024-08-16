import { refreshWhoopToken } from "@/lib/whoopApi";
import type {
  UserProfile,
  BodyMeasurement,
  Cycle,
  Recovery,
  Sleep,
  Workout,
} from "@/schemas/types/whoopDataTypes";
import { db } from "@/server/db";

interface PaginatedResponse<T> {
  records: T[];
  next_token?: string;
}

const WHOOP_API_BASE_URL = "https://api.prod.whoop.com/developer";

async function fetchPaginatedData<T>(
  url: string,
  accessToken: string,
): Promise<T[]> {
  let allRecords: T[] = [];
  let nextToken: string | null = null;

  do {
    const response: Response = await fetch(
      `${WHOOP_API_BASE_URL}${url}${nextToken ? `?nextToken=${nextToken}` : ""}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data: PaginatedResponse<T> =
      (await response.json()) as PaginatedResponse<T>;
    allRecords = allRecords.concat(data.records);
    nextToken = data.next_token ?? null;
  } while (nextToken);

  return allRecords;
}

export async function getWhoopAccessToken(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: {
        whoopUserId: String(userId),
      },
      select: {
        whoopAccessToken: true,
        whoopRefreshToken: true,
        whoopTokenExpiry: true,
      },
    });

    console.log("USer", user);

    if (user) {
      // if (Number(Date.now()) >= Number(user.whoopTokenExpiry)) {
      const newToken = await refreshWhoopToken(user.whoopRefreshToken!);

      console.log("NewTOken", newToken);

      const newuserData = await db.user.update({
        where: {
          whoopUserId: String(userId),
        },
        data: {
          whoopAccessToken: String(newToken.access_token),
          whoopRefreshToken: String(newToken.refresh_token),
          whoopTokenExpiry: new Date(Date.now() + newToken.expires_in * 1000),
        },
      });

      return newuserData.whoopAccessToken;
      // }
      //  else {
      // return user.whoopAccessToken;
      // }
    }
  } catch (error) {
    return console.error(error);
  }
}

async function fetchFromWhoop<T>(userId: string, endpoint: string) {
  const accessToken = await getWhoopAccessToken(userId);

  if (accessToken) {
    const response: Response = await fetch(`${WHOOP_API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from WHOOP API: ${response.statusText}`);
    }

    const data: T = (await response.json()) as T;

    return data;
  } else {
    throw new Error(`Failed to fetch from WHOOP API`);
  }
}

async function fetchWhoopCycles(accessToken: string): Promise<Cycle[]> {
  const url = "/v1/cycle";
  return await fetchPaginatedData<Cycle>(url, accessToken);
}

async function fetchWhoopSleep(accessToken: string): Promise<Sleep[]> {
  const url = "/v1/activity/sleep";
  return await fetchPaginatedData<Sleep>(url, accessToken);
}

async function fetchWhoopRecoveries(accessToken: string): Promise<Recovery[]> {
  const url = "/v1/recovery";
  return await fetchPaginatedData<Recovery>(url, accessToken);
}

async function fetchWhoopWorkouts(accessToken: string): Promise<Workout[]> {
  const url = "/v1/activity/workout";
  return await fetchPaginatedData<Workout>(url, accessToken);
}

async function fetchWorkoutFromId(userId: string, workoutId: string) {
  return fetchFromWhoop<Workout>(userId, `/v1/activity/workout/${workoutId}`);
}

async function fetchSleepFromId(userId: string, sleepId: string) {
  return fetchFromWhoop<Sleep>(userId, `/v1/activity/sleep/${sleepId}`);
}

async function fetchRecoveryFromId(userId: string, cycleId: string) {
  return fetchFromWhoop<Recovery>(userId, `/v1/cycle/${cycleId}/recovery`);
}

async function fetchWhoopBodyMeasurement(
  accessToken: string,
): Promise<BodyMeasurement> {
  const url = "/v1/user/measurement/body";

  const response: Response = await fetch(`${WHOOP_API_BASE_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data: BodyMeasurement = (await response.json()) as BodyMeasurement;

  return data;
}

async function fetchWhoopProfile(accessToken: string): Promise<UserProfile> {
  const url = "/v1/user/profile/basic";

  const response: Response = await fetch(`${WHOOP_API_BASE_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data: UserProfile = (await response.json()) as UserProfile;

  return data;
}

export {
  fetchWhoopProfile,
  fetchWhoopWorkouts,
  fetchWhoopRecoveries,
  fetchWhoopSleep,
  fetchWhoopCycles,
  fetchWhoopBodyMeasurement,
  fetchWorkoutFromId,
  fetchSleepFromId,
  fetchRecoveryFromId,
};
