import { z } from "zod";

const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email("Not An Valid Email"),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Minimum of 8 characters required" }),
});

const registerFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email("Not An Valid Email"),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Minimum of 8 characters required" }),
});

export { loginFormSchema, registerFormSchema };
