"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  currentOrigin,
  isAdminRole,
  isAllowedAdmin,
  storeAdminSession,
} from "@/lib/admin-session";
import { signInWithEmail } from "@/lib/neon-auth";

export type LoginState = {
  status: "idle" | "error";
  message?: string;
};

export const signInAction = async (
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> => {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { status: "error", message: "Zadejte e-mail a heslo." };
  }

  const result = await signInWithEmail(email, password, await currentOrigin());

  if (result.status === "unavailable") {
    return { status: "error", message: "Přihlašovací služba není dostupná." };
  }
  if (
    result.status === "invalid" ||
    !isAdminRole(result.user) ||
    !isAllowedAdmin(result.user.email)
  ) {
    return { status: "error", message: "Neplatné přihlašovací údaje." };
  }

  await storeAdminSession(result.cookie);
  redirect("/admin");
};

export const signOutAction = async (): Promise<void> => {
  await clearAdminSession();
  redirect("/admin/login");
};
