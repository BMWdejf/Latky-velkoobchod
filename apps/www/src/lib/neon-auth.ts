import "server-only";

/**
 * Minimal client for the Neon Auth (Better Auth) REST API.
 * The session is kept as the upstream cookies, stored in one httpOnly cookie
 * on our own domain and forwarded on every session check.
 */

export const ADMIN_SESSION_COOKIE = "admin_session";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
};

export type SignInResult =
  | { status: "ok"; cookie: string; user: AuthUser }
  | { status: "invalid" }
  | { status: "unavailable" };

const toAuthUser = (user: AuthUser): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

const authBaseUrl = (): string | null => {
  const url = process.env.NEON_AUTH_BASE_URL;
  return url ? url.replace(/\/+$/, "") : null;
};

/** Signs in with email and password and returns the upstream session cookies. */
export const signInWithEmail = async (
  email: string,
  password: string,
  origin: string,
): Promise<SignInResult> => {
  const base = authBaseUrl();
  if (!base) {
    return { status: "unavailable" };
  }

  try {
    const response = await fetch(`${base}/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      return { status: "invalid" };
    }
    if (!response.ok) {
      return { status: "unavailable" };
    }

    const cookie = response.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .filter((pair): pair is string => Boolean(pair))
      .join("; ");
    const body = (await response.json()) as { user?: AuthUser };

    if (!cookie || !body.user) {
      return { status: "invalid" };
    }

    return {
      status: "ok",
      cookie,
      user: toAuthUser(body.user),
    };
  } catch {
    return { status: "unavailable" };
  }
};

/** Returns the signed-in user for the given upstream cookies, or null. */
export const getUserForCookie = async (
  cookie: string,
  origin: string,
): Promise<AuthUser | null> => {
  const base = authBaseUrl();
  if (!base) {
    return null;
  }

  try {
    const response = await fetch(`${base}/get-session`, {
      headers: { Cookie: cookie, Origin: origin },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as { user?: AuthUser } | null;
    if (!body?.user) {
      return null;
    }

    return toAuthUser(body.user);
  } catch {
    return null;
  }
};
