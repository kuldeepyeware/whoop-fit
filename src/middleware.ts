import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const UNAUTHENTICATED_PAGES = ["/login"];
const PUBLIC_PAGES = ["/profile", "/pendingChallenge", "/"];

export const middleware = async (req: NextRequest) => {
  const { nextUrl } = req;

  if (
    nextUrl.searchParams.get("privy_oauth_code") ??
    nextUrl.searchParams.get("privy_oauth_state") ??
    nextUrl.searchParams.get("privy_oauth_provider")
  ) {
    return NextResponse.next();
  }

  if (
    nextUrl.pathname.startsWith("/api/trpc") ||
    nextUrl.pathname.startsWith("/api/refreshData") ||
    nextUrl.pathname.startsWith("/api/auth/whoop/webhook")
  ) {
    return NextResponse.next();
  }

  for (const publicPage of PUBLIC_PAGES) {
    if (nextUrl.pathname.startsWith(publicPage)) {
      return NextResponse.next();
    }
  }

  const privyToken = req.cookies.get("privy-token");

  if (privyToken) {
    if (UNAUTHENTICATED_PAGES.includes(nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!UNAUTHENTICATED_PAGES.includes(nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
