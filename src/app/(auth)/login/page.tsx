/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import FormError from "@/app/_components/common/FormError";
import FormSuccess from "@/app/_components/common/FormSuccess";
import { Button } from "@/app/_components/ui/button";
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card";
import { useSmartAccount } from "@/hooks/smartAccountContext";
import { api } from "@/trpc/react";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useState } from "react";

const Login = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const { ready, authenticated } = usePrivy();
  const { smartAccountAddress } = useSmartAccount();
  const router = useRouter();

  const register = api.user.register.useMutation({
    onSuccess: async (data) => {
      setSuccess(data.success);
      setError(undefined);
    },
    onError: async (error) => {
      setError(error.message);
      setSuccess(undefined);
    },
  });

  const { login } = useLogin({
    onComplete: async (
      user,
      isNewUser,
      wasAlreadyAuthenticated,
      loginMethod,
    ) => {
      if (isNewUser && !wasAlreadyAuthenticated) {
        try {
          if (loginMethod === null) {
            console.error("Login method is null");
            return;
          }

          await waitForSmartAccountAddress();

          let registerData:
            | {
                method: "email";
                email: string;
                privyId: string;
                embeddedAddress: string;
                smartAccountAddress: string;
              }
            | {
                method: "google";
                name: string;
                email: string;
                privyId: string;
                embeddedAddress: string;
                smartAccountAddress: string;
              };

          switch (loginMethod) {
            case "email":
              registerData = {
                method: "email",
                privyId: user.id,
                email: user.email?.address ?? "",
                embeddedAddress: user.wallet?.address ?? "",
                smartAccountAddress: smartAccountAddress ?? "",
              };
              break;
            case "google":
              registerData = {
                method: "google",
                privyId: user.id,
                name: user.google?.name ?? "",
                email: user.google?.email ?? "",
                embeddedAddress: user.wallet?.address ?? "",
                smartAccountAddress: smartAccountAddress ?? "",
              };
              break;
            default:
              console.error("Unsupported login method");
              return;
          }

          await register.mutateAsync(registerData);
        } catch (error) {
          console.error("Error adding new user to the database:", error);
        }
      }
      setSuccess("Login successful!");
      setError(undefined);
      router.push("/dashboard");
    },
    onError: (error) => {
      setError(error);
      setSuccess(undefined);
      console.error("Login error:", error);
    },
  });

  const waitForSmartAccountAddress = () => {
    return new Promise<void>((resolve) => {
      const checkAddress = () => {
        if (smartAccountAddress) {
          resolve();
        } else {
          setTimeout(checkAddress, 250);
        }
      };
      checkAddress();
    });
  };

  return (
    <main className="flex h-screen w-screen items-center justify-center">
      <Card className="m-4 flex flex-col items-center justify-center">
        <CardHeader>
          <Image
            src={"https://i.ibb.co/d77PV1y/Logo.png"}
            alt="Fitcentive Logo"
            width={500}
            height={500}
            className="h-full w-full rounded-full"
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button
              className="w-[300px] text-base"
              disabled={!ready || authenticated}
              onClick={login}
            >
              Login
            </Button>
            <FormSuccess message={success} />
            <FormError message={error} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Login;
