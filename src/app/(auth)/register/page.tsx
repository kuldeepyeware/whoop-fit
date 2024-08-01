"use client";

import { Button } from "@/app/_components/ui/button";
import { registerFormSchema } from "@/schemas/authFormSchema";
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

const RegisterPage = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const registerMutation = api.user.register.useMutation({
    onSuccess: (data) => {
      setSuccess(data.success);
      setError(undefined);
      form.reset();
    },
    onError: (error) => {
      setError(error.message);
      setSuccess(undefined);
    },
  });

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerFormSchema>) => {
    startTransition(() => {
      setError(undefined);
      setSuccess(undefined);
      registerMutation.mutate(values);
    });
  };

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center">
      <h1 className="mt-7 text-3xl font-semibold">Create account</h1>
      <div className="mt-5">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-center space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl"> Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={registerMutation.isPending || isPending}
                      placeholder="John"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl">Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={registerMutation.isPending || isPending}
                      placeholder="johndoe@gmail.com"
                      type="email"
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
                      disabled={registerMutation.isPending || isPending}
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
              disabled={registerMutation.isPending || isPending}
              className="h-full px-8 text-[20px]"
            >
              {registerMutation.isPending || isPending
                ? "Creating..."
                : "Create"}
            </Button>
          </form>
        </Form>
      </div>

      <div className="mb-5 mt-5 text-sm hover:underline">
        <Link href={"/login"}>Login</Link>
      </div>
    </main>
  );
};

export default RegisterPage;
