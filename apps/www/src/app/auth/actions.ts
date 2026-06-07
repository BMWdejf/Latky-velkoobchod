"use server";

import { redirect } from "next/navigation";
import * as z from "zod";
import { auth } from "@/lib/auth/server";

export type AuthFormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
      /** Set by sign-up so the verify-email step knows which address to confirm. */
      email?: string;
    }
  | undefined;

const emailField = z.email({ error: "Zadejte platný e-mail." }).trim();
const passwordField = z
  .string()
  .min(8, { error: "Heslo musí mít alespoň 8 znaků." });

const SignInSchema = z.object({
  email: emailField,
  password: z.string().min(1, { error: "Zadejte heslo." }),
});

const SignUpSchema = z.object({
  name: z.string().min(2, { error: "Jméno musí mít alespoň 2 znaky." }).trim(),
  email: emailField,
  password: passwordField,
});

const VerifyEmailSchema = z.object({
  email: emailField,
  otp: z.string().min(4, { error: "Zadejte ověřovací kód z e-mailu." }).trim(),
});

export async function signInAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await auth.signIn.email({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    return { error: error.message ?? "Přihlášení se nezdařilo." };
  }

  redirect("/client");
}

export async function signUpAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = SignUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await auth.signUp.email({
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    return { error: error.message ?? "Registrace se nezdařila." };
  }

  // Send the verification code immediately so the user can confirm their email.
  await auth.emailOtp.sendVerificationOtp({
    email: parsed.data.email,
    type: "email-verification",
  });

  redirect(`/auth/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function verifyEmailAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = VerifyEmailSchema.safeParse({
    email: formData.get("email"),
    otp: formData.get("otp"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await auth.emailOtp.verifyEmail({
    email: parsed.data.email,
    otp: parsed.data.otp,
  });
  if (error) {
    return { error: error.message ?? "Ověření se nezdařilo." };
  }

  redirect("/client");
}

export async function signOutAction(): Promise<void> {
  await auth.signOut();
  redirect("/");
}

export async function resendOtpAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = z
    .object({ email: emailField })
    .safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await auth.emailOtp.sendVerificationOtp({
    email: parsed.data.email,
    type: "email-verification",
  });

  return { email: parsed.data.email };
}
