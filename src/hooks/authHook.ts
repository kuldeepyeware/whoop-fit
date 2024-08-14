import { usePrivy, useWallets } from "@privy-io/react-auth";

export const useAuth = () => {
  const { authenticated, ready: privyReady } = usePrivy();
  const { ready: walletReady, wallets } = useWallets();
  const wallet = wallets.filter(
    (wallet) => wallet.walletClientType === "privy",
  );
  const address = wallet[0]?.address;

  return {
    authenticated,
    walletReady,
    privyReady,
    address,
  };
};
