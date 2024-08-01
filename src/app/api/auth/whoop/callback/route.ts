import { type NextRequest, NextResponse } from "next/server";
import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "Invalid code or state" },
      { status: 400 },
    );
  }

  try {
    const ctx = await createTRPCContext({ headers: request.headers });

    const caller = createCaller(ctx);

    await caller.whoop.oauthCallback({ code, state });

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Error in WHOOP callback:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}
