import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

/**
 * Next.js 16 proxy (formerly `middleware`). Optimistic auth gate: redirects
 * unauthenticated requests for the protected panels to the sign-in page and
 * refreshes the session cookie. Real role checks happen in the Data Access
 * Layer on each page — see `src/lib/auth/dal.ts`.
 *
 * The marketing site (`/`) and the auth pages stay public, so only the panel
 * routes are matched here.
 */
const authMiddleware = auth.middleware({ loginUrl: "/auth/sign-in" });

export default function proxy(request: NextRequest) {
  // Server Action requests (POST carrying the `Next-Action` header) must NOT be
  // touched by the optimistic gate. A 307 redirect preserves the POST method,
  // so the browser would re-submit the action payload to `/auth/sign-in` — the
  // sign-in page returns HTML instead of a Server Action response, which React
  // reports as "An unexpected response was received from the server" (this is
  // exactly what broke the sign-out button). The action itself plus the
  // page-level DAL remain the real gates, so letting these through is safe.
  if (request.headers.get("next-action")) {
    return NextResponse.next();
  }
  return authMiddleware(request);
}

export const config = {
  matcher: ["/admin/:path*", "/client/:path*"],
};
