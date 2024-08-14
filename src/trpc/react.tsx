"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { loggerLink, httpBatchLink } from "@trpc/client";

import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import SuperJSON from "superjson";

import { type AppRouter } from "@/server/api/root";
import { createQueryClient } from "./query-client";
import { getAccessToken } from "@privy-io/react-auth";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= createQueryClient());
};

export const api = createTRPCReact<AppRouter>();

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({
          url: getBaseUrl() + "/api/trpc",
          async headers() {
            const token = await getAccessToken();
            return {
              Authorization: token ? `Bearer ${token}` : "",
            };
          },
          transformer: SuperJSON,
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
