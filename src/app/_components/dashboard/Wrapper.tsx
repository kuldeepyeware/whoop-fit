/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { api } from "@/trpc/react";
import { useSmartAccount } from "@/hooks/smartAccountContext";
import { useRouter } from "next/navigation";

type DashboardWrapperProps = {
  children: React.ReactNode;
};

const DashboardWrapper: React.FC<DashboardWrapperProps> = ({ children }) => {
  const { user, authenticated } = usePrivy();
  const { smartAccountAddress } = useSmartAccount();
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const router = useRouter();

  const { data: registrationStatus, isLoading: isCheckingRegistration } =
    api.user.checkRegistration.useQuery(
      { privyUserId: user?.id ?? "" },
      {
        enabled: authenticated && !!user?.id,
        staleTime: Infinity,
        // cacheTime: 24 * 60 * 60 * 1000,
      },
    );

  const register = api.user.register.useMutation({
    onSuccess: () => {
      setIsRegistered(true);
    },
    onError: (error) => {
      console.error("Registration error:", error);
    },
  });

  useEffect(() => {
    if (!authenticated) {
      router.push("/login");
    }
  }, [authenticated, router]);

  useEffect(() => {
    if (registrationStatus) {
      setIsRegistered(registrationStatus.isRegistered);
    }
  }, [registrationStatus]);

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
    }
  }, [
    authenticated,
    user,
    isRegistered,
    smartAccountAddress,
    isCheckingRegistration,
  ]);

  return <>{children}</>;
};

export default DashboardWrapper;
