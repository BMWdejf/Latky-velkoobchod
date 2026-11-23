import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  type AuthUser,
  getUserForCookie,
} from "./neon-auth";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** Origin of the current request, used for CSRF-safe calls to Neon Auth. */
export const currentOrigin = async (): Promise<string> => {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3001";
  const proto = requestHeaders.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
};

/** Returns the signed-in admin, or null when not signed in or not allowed. */
export const getAdminUser = async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!session) {
    return null;
  }

  const user = await getUserForCookie(session, await currentOrigin());
  if (!user || !isAdminRole(user) || !isAllowedAdmin(user.email)) {
    return null;
  }

  return user;
};

/** Redirects to the login page unless an allowed admin is signed in. */
export const requireAdminUser = async (): Promise<AuthUser> => {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
};

export const storeAdminSession = async (cookie: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, cookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
};

export const clearAdminSession = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
};

/** Neon Auth role set on the account; only `admin` may enter the panel. */
export const isAdminRole = (user: AuthUser): boolean => user.role === "admin";

/**
 * Only the single configured admin email is allowed. Fails closed when
 * ADMIN_EMAIL is not set.
 */
export const isAllowedAdmin = (email: string): boolean => {
  const allowed = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(allowed) && email.trim().toLowerCase() === allowed;
};
