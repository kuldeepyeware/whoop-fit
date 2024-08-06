"use client";

import { Button } from "@/app/_components/ui/button";
import { loginFormSchema } from "@/schemas/authFormSchema";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import Link from "next/link";
import FormSuccess from "@/app/_components/common/FormSuccess";
import FormError from "@/app/_components/common/FormError";
import { api } from "@/trpc/react";
import { signIn } from "next-auth/react";

const LoginPage = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const loginMutation = api.user.login.useMutation({
    onSuccess: async (data) => {
      if (data.user) {
        try {
          setSuccess(data.success);
          setError(undefined);
          const result = await signIn("credentials", {
            email: data.user.email,
            password: form.getValues().password,
            callbackUrl: "/",
          });
          if (result?.error) {
            setError(result.error);
          }
        } catch (error) {
          setError("Something went wrong try again later!");
        }
      } else {
        setSuccess(data.success);
        setError(undefined);
      }
    },
    onError: (error) => {
      setError(error.message);
      setSuccess(undefined);
    },
  });

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginFormSchema>) => {
    startTransition(() => {
      setError(undefined);
      setSuccess(undefined);
      loginMutation.mutate(values);
    });
  };

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center">
      <h1 className="text-3xl font-semibold">Login</h1>
      <div className="mt-7 flex items-center gap-5">
        <Button
          className="flex h-full cursor-pointer rounded-lg bg-black p-1 hover:bg-black/70"
          onClick={() =>
            signIn("google", {
              callbackUrl: "/",
            })
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon icon-tabler icons-tabler-outline icon-tabler-brand-google"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M20.945 11a9 9 0 1 1 -3.284 -5.997l-2.655 2.392a5.5 5.5 0 1 0 2.119 6.605h-4.125v-3h7.945z" />
          </svg>
        </Button>
      </div>
      <div className="mt-5">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-center space-y-8"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl">Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loginMutation.isPending || isPending}
                      placeholder="johndoe@gmail.com"
                      className="w-[300px] border-[#9F9F9F] md:w-[450px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl">Password</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loginMutation.isPending || isPending}
                      placeholder="********"
                      className="w-[300px] border-[#9F9F9F] md:w-[450px]"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormSuccess message={success} />
            <FormError message={error} />

            <Button
              type="submit"
              disabled={loginMutation.isPending || isPending}
              className="h-full px-8 text-[20px]"
            >
              {loginMutation.isPending || isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
      </div>

      <Link className="mt-5 text-sm hover:underline" href={"/register"}>
        Create Account
      </Link>
    </main>
  );
};

export default LoginPage;
