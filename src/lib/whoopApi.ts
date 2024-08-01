/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { env } from "@/env";

export async function refreshWhoopToken(refreshToken: string) {
  const tokenResponse = await fetch(
    `${env.WHOOP_API_HOSTNAME}/oauth/oauth2/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        scope:
          "offline read:profile read:body_measurement read:workout read:sleep read:cycles read:recovery",
        refresh_token: refreshToken,
        client_id: env.WHOOP_CLIENT_ID,
        client_secret: env.WHOOP_CLIENT_SECRET,
      }),
    },
  );

  if (!tokenResponse.ok) {
    throw new Error("Failed to refresh WHOOP token");
  }

  const tokenData = await tokenResponse.json();

  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in,
  };
}
