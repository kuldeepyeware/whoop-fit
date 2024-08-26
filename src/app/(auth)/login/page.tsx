/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";
import { useState, useEffect } from "react";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/ui/button";
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card";
import FormError from "@/app/_components/common/FormError";
import FormSuccess from "@/app/_components/common/FormSuccess";
import Image from "next/image";
// import { Label } from "@/app/_components/ui/label";

const Login = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isLoading, setIsLoading] = useState(false);
  const [buttonText, setButtonText] = useState("Login");

  const { authenticated, ready, user } = usePrivy();

  const router = useRouter();

  const { login } = useLogin({
    onComplete: async () => {
      setIsLoading(true);
      setButtonText("Logging in...");
      setSuccess("Login successful!");
      setButtonText("Redirecting...");
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
    if (ready && authenticated && user) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          router.push("/dashboard");

          setTimeout(() => {
            if (window.location.pathname !== "/dashboard") {
              window.location.href = "/dashboard";
            }
          }, 2000);
        }, 2000);
      });
    }
  }, [ready, authenticated, user, router]);

  if (authenticated) {
    router.push("/dashboard");
  }

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-white">Welcome to Fitcentive</h1>
      <Card className="m-4 flex flex-col items-center justify-center border-none bg-white/10 shadow-lg backdrop-blur-md">
        <CardHeader>
          <Image
            src={"https://i.ibb.co/d77PV1y/Logo.png"}
            alt="Fitcentive Logo"
            width={500}
            height={500}
            className="h-full w-full rounded-full"
          />
          {/* <Label className="text-xl text-white">Log in to get started </Label> */}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button
              className="w-[300px] bg-white text-base text-black hover:bg-white/90"
              disabled={isLoading || authenticated || !ready}
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
