"use client";

import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  usePrivy,
  useWallets,
  type ConnectedWallet,
} from "@privy-io/react-auth";
import {
  type RpcTransactionRequest,
  createWalletClient,
  custom,
  http,
} from "viem";
import { baseSepolia } from "viem/chains";
import {
  createSmartAccountClient,
  walletClientToSmartAccountSigner,
  ENTRYPOINT_ADDRESS_V06,
} from "permissionless";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import { env } from "@/env";

const BASE_SEPOLIA_RPC_URL = env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL;
const BASE_SEPOLIA_ENTRYPOINT_ADDRESS = ENTRYPOINT_ADDRESS_V06;
const BASE_SEPOLIA_FACTORY_ADDRESS =
  "0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232";

interface SmartAccountInterface {
  eoa?: ConnectedWallet;
  smartAccountClient?: ReturnType<typeof createSmartAccountClient>;
  smartAccountAddress?: `0x${string}` | undefined;
  sendUserOperation: (
    transactionRequest: RpcTransactionRequest,
  ) => Promise<`0x${string}`>;
  smartAccountReady: boolean;
}

const SmartAccountContext = React.createContext<SmartAccountInterface>({
  eoa: undefined,
  smartAccountClient: undefined,
  smartAccountAddress: undefined,
  sendUserOperation: () => {
    throw new Error("Not implemented.");
  },
  smartAccountReady: false,
});

export const useSmartAccount = () => {
  return useContext(SmartAccountContext);
};

export const SmartAccountProvider = ({ children }: { children: ReactNode }) => {
  const { user, ready } = usePrivy();
  const { wallets } = useWallets();

  const [smartAccountReady, setSmartAccountReady] = useState(false);
  const [eoa, setEoa] = useState<ConnectedWallet>();
  const [smartAccountClient, setSmartAccountClient] = useState<
    ReturnType<typeof createSmartAccountClient> | undefined
  >();
  const [smartAccountAddress, setSmartAccountAddress] = useState<
    `0x${string}` | undefined
  >();

  const paymaster = useMemo(
    () =>
      createPimlicoPaymasterClient({
        chain: baseSepolia,
        transport: http(BASE_SEPOLIA_RPC_URL),
        entryPoint: BASE_SEPOLIA_ENTRYPOINT_ADDRESS,
      }),
    [],
  );

  useEffect(() => {
    const createSmartWallet = async () => {
      if (!ready ?? !user ?? !user?.wallet) return;

      const embeddedWallet = wallets.find(
        (wallet) => wallet.walletClientType === "privy",
      );

      if (!embeddedWallet) return;

      setEoa(embeddedWallet);

      const eip1193provider = await embeddedWallet.getEthereumProvider();
      const privyClient = createWalletClient({
        account: embeddedWallet.address as `0x${string}`,
        chain: baseSepolia,
        transport: custom(eip1193provider),
      });

      const signer = walletClientToSmartAccountSigner(privyClient);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const simpleAccount = await signerToSimpleSmartAccount(privyClient, {
        entryPoint: BASE_SEPOLIA_ENTRYPOINT_ADDRESS,
        signer,
        factoryAddress: BASE_SEPOLIA_FACTORY_ADDRESS,
      });

      const smartAccountClient = createSmartAccountClient({
        account: simpleAccount,
        entryPoint: BASE_SEPOLIA_ENTRYPOINT_ADDRESS,
        chain: baseSepolia,
        bundlerTransport: http(BASE_SEPOLIA_RPC_URL),
        middleware: {
          sponsorUserOperation: paymaster.sponsorUserOperation,
        },
      });

      setSmartAccountClient(
        smartAccountClient as unknown as ReturnType<
          typeof createSmartAccountClient
        >,
      );
      const address = smartAccountClient?.account?.address;
      setSmartAccountAddress(address);
      setSmartAccountReady(true);
    };

    if (ready && user) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      createSmartWallet();
    }
  }, [ready, user, wallets, paymaster]);

  useEffect(() => {
    if (!user) {
      setSmartAccountReady(false);
      setSmartAccountClient(undefined);
      setSmartAccountAddress(undefined);
      setEoa(undefined);
    }
  }, [user]);

  const sendUserOperation = async (
    transactionRequest: RpcTransactionRequest,
  ) => {
    if (!smartAccountClient || !smartAccountAddress) {
      throw new Error("Smart account has not yet initialized.");
    }

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const txHash = await smartAccountClient.sendTransaction({
        to: transactionRequest.to,
        data: transactionRequest.data,
        value: BigInt(0),
        chain: baseSepolia,
      });

      console.log("✅ UserOperation successfully sponsored and executed!");
      console.log(
        `🔍 View on BaseScan: https://sepolia.basescan.org/tx/${txHash}`,
      );

      return txHash;
    } catch (error) {
      console.error("Error sending user operation: ", error);
      throw error;
    }
  };

  return (
    <SmartAccountContext.Provider
      value={{
        smartAccountReady,
        smartAccountClient,
        smartAccountAddress,
        sendUserOperation,
        eoa,
      }}
    >
      {children}
    </SmartAccountContext.Provider>
  );
};
