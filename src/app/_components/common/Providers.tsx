"use client";

import { useState, type ReactNode } from "react";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { baseSepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { env } from "@/env";
import { type PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { http } from "viem";
import { SmartAccountProvider } from "@/hooks/smartAccountContext";

const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
    // [base.id]: http(),
  },
});

const privyConfig: PrivyClientConfig = {
  appearance: {
    accentColor: "#6A6FF5",
    theme: "#222224",
    showWalletLoginFirst: false,
    // walletList: ["coinbase_wallet"],
    // logo: "https://pub-dc971f65d0aa41d18c1839f8ab426dcb.r2.dev/privy-dark.png",
  },

  loginMethods: [
    "email",
    "google",
    // "wallet"
  ],
  // fundingMethodConfig: {
  //   moonpay: {
  //     useSandbox: true,
  //   },
  // },

  // externalWallets: {
  //   coinbaseWallet: {
  //     // Valid connection options include 'eoaOnly' (default), 'smartWalletOnly', or 'all'
  //     connectionOptions: "all",
  //   },
  // },
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
    // requireUserPasswordOnCreate: true,
  },
  mfa: {
    noPromptOnMfaRequired: false,
  },
  defaultChain: baseSepolia,
};

const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <PrivyProvider appId={env.NEXT_PUBLIC_PRIVY_APP_ID} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <SmartAccountProvider>{children}</SmartAccountProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
};

export default Providers;
