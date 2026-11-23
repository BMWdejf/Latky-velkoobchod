import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";

/**
 * Gates /admin pages behind HTTP basic auth. Fails closed when ADMIN_PASSWORD
 * is unset. Server Actions are also checked in their own code, because they
 * can be called from routes this matcher does not cover.
 */
export const proxy = (request: NextRequest): NextResponse => {
  if (!process.env.ADMIN_PASSWORD) {
    return new NextResponse("Admin is not configured", { status: 503 });
  }

  if (isAdminAuthorized(request.headers.get("authorization"))) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin", charset="UTF-8"' },
  });
};

export const config = {
  matcher: ["/admin/:path*"],
};
