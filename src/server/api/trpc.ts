import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "@/server/db";

import { env } from "@/env";
import { PrivyClient } from "@privy-io/server-auth";

const privy = new PrivyClient(
  env.NEXT_PUBLIC_PRIVY_APP_ID || "",
  env.PRIVY_APP_SECRET || "",
);

export const createTRPCContext = async ({
  headers,
  privyUserId: overridePrivyUserId,
}: {
  headers: Headers;
  privyUserId?: string;
}) => {
  let userId: string | undefined = overridePrivyUserId;

  if (!userId) {
    const authHeader = headers.get("Authorization");
    if (authHeader) {
      const authToken = authHeader.replace("Bearer ", "");
      try {
        const authTokenClaims = await privy.verifyAuthToken(authToken);
        userId = authTokenClaims.userId;
      } catch (err) {
        console.error(err);
      }
    }
  }

  return {
    db: db,
    privyUserId: userId,
  };
};

export type Context = ReturnType<typeof createTRPCContext>;

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  const result = await next();
  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.privyUserId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx,
    });
  });
