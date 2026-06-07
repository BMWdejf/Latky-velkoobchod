import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Singleton Neon Auth server instance. Exposes Better Auth server methods
 * (`signIn`, `signUp`, `getSession`, `emailOtp`, `signOut`, ...) plus
 * `.handler()` for the API route and `.middleware()` for the proxy.
 *
 * Only import this from server code (Server Components, Server Actions,
 * Route Handlers, proxy).
 */
export const auth = createNeonAuth({
  baseUrl: requireEnv("NEON_AUTH_BASE_URL"),
  cookies: {
    secret: requireEnv("NEON_AUTH_COOKIE_SECRET"),
  },
});
