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

const Login = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isLoading, setIsLoading] = useState(false);
  const [buttonText, setButtonText] = useState("Login");

  const { authenticated } = usePrivy();

  const router = useRouter();

  const { login } = useLogin({
    onComplete: async () => {
      setIsLoading(true);
      setButtonText("Logging in...");
      setSuccess("Login successful!");
      setButtonText("Redirecting...");
      router.push("/dashboard");
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
      router.push("/dashboard");
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
