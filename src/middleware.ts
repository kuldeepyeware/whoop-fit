/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NextResponse } from "next/server";
import { type NextMiddleware } from "next/server";
import { getToken } from "next-auth/jwt";
import { authRoutes, DEFAULT_LOGIN_REDIRECT, apiAuthPrefix } from "./routes";
import { refreshWhoopToken } from "@/lib/whoopApi";
import { db } from "@/server/db";

export const middleware: NextMiddleware = async (req) => {
  const { nextUrl } = req;
  const token = await getToken({ req });
  const isLoggedIn = !!token;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (nextUrl.pathname.startsWith("/api/trpc")) {
    return NextResponse.next();
  }

  // Unprotected login page
  if (nextUrl.pathname === "/login") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  const user = await db.user.findUnique({
    where: { id: token.sub },
    select: {
      id: true,
      whoopAccessToken: true,
      whoopRefreshToken: true,
      whoopTokenExpiry: true,
    },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (
    user.whoopAccessToken &&
    user.whoopRefreshToken &&
    user.whoopTokenExpiry
  ) {
    const whoopTokenExpiry = new Date(user.whoopTokenExpiry);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (whoopTokenExpiry < fiveMinutesFromNow) {
      try {
        const newTokens = await refreshWhoopToken(user.whoopRefreshToken);
        await db.user.update({
          where: { id: user.id },
          data: {
            whoopAccessToken: newTokens.access_token,
            whoopRefreshToken: newTokens.refresh_token,
            whoopTokenExpiry: new Date(
              Date.now() + newTokens.expires_in * 1000,
            ),
          },
        });
        console.log("Token Refresh");
      } catch (error) {
        console.error("Failed to refresh WHOOP token:", error);
        return NextResponse.redirect(new URL("/", nextUrl));
      }
    }
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
