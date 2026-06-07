import { auth } from "@/lib/auth/server";

/**
 * Neon Auth API route. Handles all auth endpoints (sign-in, sign-up,
 * email verification, sign-out, session) under `/api/auth/*`.
 */
export const { GET, POST } = auth.handler();
