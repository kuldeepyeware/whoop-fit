"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { api } from "@/trpc/react";
import { BeatLoader } from "react-spinners";
import FormError from "@/app/_components/common/FormError";
import FormSuccess from "@/app/_components/common/FormSuccess";
import Link from "next/link";

const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const verifyMutation = api.user.newVerification.useMutation({
    onSuccess: (data) => {
      setSuccess(data.success);
      setError(undefined);
    },
    onError: (error) => {
      setError(error.message);
      setSuccess(undefined);
    },
  });

  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setError("Missing Token!");
      return;
    }

    if (hasRequestedRef.current) return;

    hasRequestedRef.current = true;

    verifyMutation.mutate({ token });
  }, [token, success, error, verifyMutation]);

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center">
      <div className="flex w-[300px] flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-semibold">🔐 Auth</h1>
        <p>Confirming your verification</p>

        {!success && !error && <BeatLoader />}
        <FormSuccess message={success} />
        {!success && <FormError message={error} />}

        <Link href={"/login"} className="underline">
          Login
        </Link>
      </div>
    </main>
  );
};

const NewVerificationFormPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewVerificationForm />
    </Suspense>
  );
};

export default NewVerificationFormPage;
