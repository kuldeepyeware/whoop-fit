import { env } from "@/env";

// export async function refreshWhoopToken(refreshToken: string) {
//   console.log("Refresh token (first 10 chars):", refreshToken.substring(0, 10));

//   const refreshParams = {
//     grant_type: "refresh_token",
//     client_id: env.WHOOP_CLIENT_ID,
//     client_secret: env.WHOOP_CLIENT_SECRET,
//     scope: "offline",
//     refresh_token: refreshToken.trim(),
//   };

//   // Log the request details (excluding sensitive information)
//   console.log("Request URL:", `${env.WHOOP_API_HOSTNAME}/oauth/oauth2/token`);
//   console.log(
//     "Request body:",
//     new URLSearchParams({
//       ...refreshParams,
//       client_secret: "[REDACTED]",
//     }).toString(),
//   );

//   const tokenResponse = await fetch(
//     `${env.WHOOP_API_HOSTNAME}/oauth/oauth2/token`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       body: new URLSearchParams(refreshParams),
//     },
//   );

//   const responseText = await tokenResponse.text();
//   console.log("Raw response:", responseText);

//   if (!tokenResponse.ok) {
//     const errorText = await tokenResponse.text();
//     console.log("Token response error:", errorText);
//     console.log("Response status:", tokenResponse.status);
//     console.log("Response headers:", [...tokenResponse.headers.entries()]);
//     throw new Error("Failed to refresh WHOOP token");
//   }

//   // const tokenResponse = await fetch(
//   //   `${env.WHOOP_API_HOSTNAME}/oauth/oauth2/token`,
//   //   {
//   //     method: "POST",
//   //     headers: {
//   //       "Content-Type": "application/x-www-form-urlencoded",
//   //     },
//   //     body: new URLSearchParams({
//   //       grant_type: "refresh_token",
//   //       scope:
//   //         "offline read:profile read:body_measurement read:workout read:sleep read:cycles read:recovery",
//   //       refresh_token: refreshToken.trim(),
//   //       client_id: env.WHOOP_CLIENT_ID,
//   //       client_secret: env.WHOOP_CLIENT_SECRET,
//   //     }),
//   //   },
//   // );

//   // if (!tokenResponse.ok) {
//   //   const errorText = await tokenResponse.text();
//   //   console.log("Token response error:", errorText);
//   //   console.log("Response status:", tokenResponse.status);
//   //   console.log("Response headers:", [...tokenResponse.headers.entries()]);

//   //   throw new Error("Failed to refresh WHOOP token");
//   // }

//   const tokenData = (await tokenResponse.json()) as {
//     access_token: string;
//     refresh_token: string;
//     expires_in: number;
//   };

//   return {
//     access_token: tokenData.access_token,
//     refresh_token: tokenData.refresh_token,
//     expires_in: tokenData.expires_in,
//   };
// }

export async function refreshWhoopToken(refreshToken: string) {
  const refreshParams = {
    // grant_type: "refresh_token",
    // client_id: env.WHOOP_CLIENT_ID,
    // client_secret: env.WHOOP_CLIENT_SECRET,
    // scope:
    //   "offline read:profile read:body_measurement read:workout read:sleep read:cycles read:recovery",
    // refresh_token: refreshToken,
    grant_type: "refresh_token".trim(),
    client_id: env.WHOOP_CLIENT_ID.trim(),
    client_secret: env.WHOOP_CLIENT_SECRET.trim(),
    scope: "offline".trim(),
    refresh_token: refreshToken.trim(),
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

    const responseText = await response.text();

    console.log("Response text", responseText);

    if (!response.ok) {
      throw new Error(
        `Failed to refresh WHOOP token: ${response.status} ${responseText}`,
      );
    }

    const tokenData = JSON.parse(responseText) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      scope: string;
      token_type: "bearer";
    };

    return tokenData;
  } catch (error) {
    console.error("Error in refreshWhoopToken:", error);
    throw error;
  }
}
