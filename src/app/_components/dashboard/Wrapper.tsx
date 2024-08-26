/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { api } from "@/trpc/react";
import { useSmartAccount } from "@/hooks/smartAccountContext";
import { useRouter } from "next/navigation";
import { encodeFunctionData } from "viem";
import { tokenAbi, tokenAddress } from "TokenContract";
import { useToast } from "../ui/use-toast";

type DashboardWrapperProps = {
  children: React.ReactNode;
};

const DashboardWrapper: React.FC<DashboardWrapperProps> = ({ children }) => {
  const { user, authenticated } = usePrivy();
  const { smartAccountAddress, sendUserOperation } = useSmartAccount();
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const {
    data: registrationStatus,
    refetch,
    isLoading: isCheckingRegistration,
  } = api.user.checkRegistration.useQuery(
    { privyUserId: user?.id ?? "" },
    {
      enabled: authenticated && !!user?.id,
      staleTime: Infinity,
      // cacheTime: 24 * 60 * 60 * 1000,
    },
  );

  const register = api.user.register.useMutation({
    onSuccess: async () => {
      setIsRegistered(true);

      const mintAmount = 500;

      const mintCallData = encodeFunctionData({
        abi: tokenAbi,
        functionName: "mint",
        args: [mintAmount],
      });

      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await sendUserOperation({
          to: tokenAddress,
          data: mintCallData,
        });

        toast({
          title: `Added 500 MockUSDC to you account address`,
        });
      } catch (error) {
        console.error("Minting failed:", error);
      }
    },
    onError: async (error) => {
      console.error("Registration error:", error);
    },
  });

  const refetchStatus = async () => {
    await refetch();
  };

  useEffect(() => {
    if (registrationStatus) {
      setIsRegistered(registrationStatus.isRegistered);
    }
  }, [registrationStatus, refetch]);

  useEffect(() => {
    if (!authenticated) {
      router.push("/login");
    }
  }, [authenticated, router]);

  useEffect(() => {
    if (
      authenticated &&
      user &&
      isRegistered === false &&
      smartAccountAddress &&
      !isCheckingRegistration
    ) {
      const registerData = {
        method: user.google?.email ? ("google" as const) : ("email" as const),
        privyId: user.id,
        email: user.email?.address ?? user.google?.email ?? "",
        embeddedAddress: user.wallet?.address ?? "",
        smartAccountAddress,
        ...(user.google?.name ? { name: user.google.name } : {}),
      };

      register.mutate(registerData);
      refetchStatus().catch((error) => console.error(error));
    }
  }, [
    authenticated,
    user,
    isRegistered,
    smartAccountAddress,
    isCheckingRegistration,
    refetch,
  ]);

  return <>{children}</>;
};

export default DashboardWrapper;
