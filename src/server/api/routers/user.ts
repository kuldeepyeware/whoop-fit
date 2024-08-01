import { compare, hash } from "bcryptjs";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { db } from "@/server/db";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { loginFormSchema, registerFormSchema } from "@/schemas/authFormSchema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getVerificationTokenByToken } from "@/data/verificationToken";
import { env } from "@/env";

const mailerSend = new MailerSend({
  apiKey: env.MAILERSEND_API_KEY,
});

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerFormSchema)
    .mutation(async ({ input }) => {
      const { name, email, password } = input;

      const hashedPassword = await hash(password, 10);

      const existingUser = await getUserByEmail(email);

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email Already Taken",
        });
      }

      try {
        await db.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create account! Try again",
        });
      }

      const verificationToken = await generateVerificationToken(email);

      if (verificationToken) {
        const confirmLink = `${env.DOMAIN_URL}/newVerification?token=${verificationToken.token}`;
        const sentFrom = new Sender(
          "WhoopFit@trial-0r83ql3vrovgzw1j.mlsender.net",
          "Kuldeep",
        );
        const recipients = [new Recipient(verificationToken.email)];
        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setSubject("Confirm your email!")
          .setHtml(
            `<p> Click <a href="${confirmLink}"> here </a> to confirm email. </p>`,
          )
          .setText(
            `<p> Click <a href="${confirmLink}"> here </a> to confirm email. </p>`,
          );

        try {
          await mailerSend.email.send(emailParams);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send verification email",
          });
        }
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch token! Try again",
        });
      }
      return { success: "Confirmation Email Sent!" };
    }),

  login: publicProcedure.input(loginFormSchema).mutation(async ({ input }) => {
    const { email, password } = input;

    const existingUser = await getUserByEmail(email);
    if (!existingUser ?? !existingUser?.email ?? !existingUser?.password) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Email does not exist!",
      });
    }

    if (!existingUser.emailVerified) {
      const verificationToken = await generateVerificationToken(
        existingUser.email,
      );
      if (verificationToken) {
        const confirmLink = `${env.DOMAIN_URL}/newVerification?token=${verificationToken.token}`;
        const sentFrom = new Sender(
          "WhoopFit@trial-0r83ql3vrovgzw1j.mlsender.net",
          "Kuldeep",
        );
        const recipients = [new Recipient(verificationToken.email)];
        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setSubject("Confirm your email!")
          .setHtml(
            `<p> Click <a href="${confirmLink}"> here </a> to confirm email. </p>`,
          )
          .setText(
            `<p> Click <a href="${confirmLink}"> here </a> to confirm email. </p>`,
          );

        try {
          await mailerSend.email.send(emailParams);
          return { success: "Confirmation email sent!" };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send verification email",
          });
        }
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create token! Try again",
        });
      }
    }

    const isPasswordValid = await compare(password, existingUser.password);

    if (!isPasswordValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid password provided!",
      });
    }

    return {
      success: "Logged in successfully!",
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
      },
    };
  }),

  newVerification: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const { token } = input;

      const existingToken = await getVerificationTokenByToken(token);
      if (!existingToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Token does not exist!",
        });
      }

      const hasExpired = new Date(existingToken.expires) < new Date();
      if (hasExpired) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Token has expired!",
        });
      }

      const existingUser = await getUserByEmail(existingToken.email);
      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Email does not exist!",
        });
      }

      try {
        await db.user.update({
          where: { id: existingUser.id },
          data: {
            emailVerified: new Date(),
            email: existingToken.email,
          },
        });

        await db.verificationToken.delete({
          where: { id: existingToken.id },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify! Try again",
        });
      }

      return { success: "Email Verified!" };
    }),
});
