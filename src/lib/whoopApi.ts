import { env } from "@/env";

export async function refreshWhoopToken(refreshToken: string) {
  const refreshParams = {
    grant_type: "refresh_token",
    client_id: env.WHOOP_CLIENT_ID,
    client_secret: env.WHOOP_CLIENT_SECRET,
    scope:
      "offline read:profile read:body_measurement read:workout read:sleep read:cycles read:recovery",
    refresh_token: refreshToken,
  };

  try {
    const response = await fetch(
      `${env.WHOOP_API_HOSTNAME}/oauth/oauth2/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(refreshParams),
      },
    );

    const responseJson = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      scope: string;
      token_type: "bearer";
    };

    if (!response.ok) {
      throw new Error(
        `Failed to refresh WHOOP token: ${response.status} ${JSON.stringify(responseJson)}`,
      );
    }

    const tokenData = responseJson;

    return tokenData;
  } catch (error) {
    console.error("Error in refreshWhoopToken:", error);
    throw error;
  }
}
