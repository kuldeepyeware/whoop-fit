/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";
import { useState, useEffect } from "react";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useSmartAccount } from "@/hooks/smartAccountContext";
import { Button } from "@/app/_components/ui/button";
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card";
import FormError from "@/app/_components/common/FormError";
import FormSuccess from "@/app/_components/common/FormSuccess";
import Image from "next/image";

const Login = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isLoading, setIsLoading] = useState(false);
  const [buttonText, setButtonText] = useState("Login");

  const { authenticated, user } = usePrivy();
  const { smartAccountAddress } = useSmartAccount();
  const router = useRouter();

  const register = api.user.register.useMutation({
    onSuccess: async (data) => {
      setSuccess(data.success);
      setError(undefined);
      setButtonText("Registering...");

      if (smartAccountAddress && user) {
        await updateSmartAccount.mutateAsync({
          privyId: user.id,
          smartAccountAddress,
        });
      }
    },
    onError: async (error) => {
      setError(error.message);
      setSuccess(undefined);
      setButtonText("Login");
      setIsLoading(false);
    },
  });

  const updateSmartAccount = api.user.updateSmartAccount.useMutation({
    onSuccess: async () => {
      console.log("Smart account updated successfully");
      setButtonText("Redirecting...");
      router.push("/dashboard");
    },
    onError: async (error) => {
      console.error("Error updating smart account:", error);
      setError("Failed to update smart account. Please try again.");
      setButtonText("Login");
      setIsLoading(false);
    },
  });

  const { login } = useLogin({
    onComplete: async (
      user,
      isNewUser,
      wasAlreadyAuthenticated,
      loginMethod,
    ) => {
      setIsLoading(true);
      setButtonText(isNewUser ? "Registering..." : "Logging in...");

      if (isNewUser && !wasAlreadyAuthenticated) {
        try {
          if (!loginMethod) {
            throw new Error("Login method is null");
          }

          const registerData = {
            method: loginMethod as "email" | "google",
            privyId: user.id,
            email: user.email?.address ?? user.google?.email ?? "",
            embeddedAddress: user.wallet?.address ?? "",
            smartAccountAddress: smartAccountAddress ?? "",
            ...(loginMethod === "google" && user.google?.name
              ? { name: user.google.name }
              : {}),
          };

          await register.mutateAsync(
            loginMethod === "google"
              ? (registerData as {
                  method: "google";
                  name: string;
                  privyId: string;
                  email: string;
                  embeddedAddress: string;
                  smartAccountAddress: string;
                })
              : (registerData as {
                  method: "email";
                  privyId: string;
                  email: string;
                  embeddedAddress: string;
                  smartAccountAddress: string;
                }),
          );
        } catch (error) {
          console.error("Error adding new user to the database:", error);
          setError("Registration failed. Please try again.");
          setButtonText("Login");
          setIsLoading(false);
        }
      } else {
        setSuccess("Login successful!");
        setButtonText("Redirecting...");
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      setError(error.toString());
      setSuccess(undefined);
      console.error("Login error:", error);
      setButtonText("Login");
      setIsLoading(false);
    },
  });

  const handleLogin = () => {
    setIsLoading(true);
    setButtonText("Connecting...");
    login();
  };

  useEffect(() => {
    if (authenticated) {
      setButtonText("Logged In");
      setIsLoading(true);
    }
  }, [authenticated]);

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
            loading="lazy"
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button
              className="w-[300px] text-base"
              disabled={isLoading || authenticated}
              onClick={handleLogin}
            >
              {buttonText}
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
