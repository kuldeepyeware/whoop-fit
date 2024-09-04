import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    WHOOP_CLIENT_ID: z.string(),
    WHOOP_CLIENT_SECRET: z.string(),
    WHOOP_API_HOSTNAME: z.string(),
    WHOOP_REDIRECT_URI: z.string(),
    DIRECT_DATABASE_URL: z.string(),
    PRIVATE_KEY: z.string(),
    RPC_URL: z.string(),
    CRON_SECRET: z.string(),
    PRIVY_APP_SECRET: z.string(),
    MAILER_API_KEY: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_PRIVY_APP_ID: z.string(),
    NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL: z.string(),
    NEXT_PUBLIC_DOMAIN_URL: z.string(),
    NEXT_PUBLIC_UPLOADCARE: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    WHOOP_CLIENT_ID: process.env.WHOOP_CLIENT_ID,
    WHOOP_CLIENT_SECRET: process.env.WHOOP_CLIENT_SECRET,
    WHOOP_API_HOSTNAME: process.env.WHOOP_API_HOSTNAME,
    WHOOP_REDIRECT_URI: process.env.WHOOP_REDIRECT_URI,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    RPC_URL: process.env.RPC_URL,
    CRON_SECRET: process.env.CRON_SECRET,
    PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET,
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL:
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL,
    NEXT_PUBLIC_DOMAIN_URL: process.env.NEXT_PUBLIC_DOMAIN_URL,
    NEXT_PUBLIC_UPLOADCARE: process.env.NEXT_PUBLIC_UPLOADCARE,
    MAILER_API_KEY: process.env.MAILER_API_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
