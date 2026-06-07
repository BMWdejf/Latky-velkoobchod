import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ROLES, type Role, toRole } from "@/lib/auth/roles";
import { auth } from "@/lib/auth/server";

/**
 * Data Access Layer for authentication & authorization.
 *
 * Per the Next.js docs, auth checks live here (close to the data source) and
 * are invoked from each protected `page.tsx` — never from a `layout.tsx`, which
 * does not re-run on every navigation due to partial rendering. The optimistic
 * cookie check in `proxy.ts` is a first pass only; these are the real gates.
 */

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  emailVerified: boolean;
  role: Role;
};

/** Returns the authenticated user, or `null` when not signed in. Memoized per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const { data } = await auth.getSession();
  const user = data?.user;
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: Boolean(user.emailVerified),
    // `role` is added by Better Auth's admin plugin and may be absent on the base type.
    role: toRole((user as { role?: unknown }).role),
  };
});

/** Reads the role of a user object (defaults to `customer`). */
export function getRole(user: Pick<SessionUser, "role">): Role {
  return user.role;
}

/** Requires an authenticated user; redirects to sign-in otherwise. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  return user;
}

/** Requires an authenticated **and email-verified** user. */
export async function requireVerified(): Promise<SessionUser> {
  const user = await requireUser();
  if (!user.emailVerified) redirect("/auth/verify-email");
  return user;
}

/**
 * Requires a verified user with the given role. Non-matching users are sent to
 * the client panel (the default landing area for authenticated users).
 */
export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await requireVerified();
  if (getRole(user) !== role) redirect("/client");
  return user;
}

export { ROLES };
