import { timingSafeEqual } from "node:crypto";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";

export const ADMIN_TOKEN_HEADER = "x-admin-token";

/**
 * Protects admin routes with a shared secret from `ADMIN_TOKEN`.
 * Fails closed: when the secret is not configured, admin routes are unavailable.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.ADMIN_TOKEN;

    if (!expected) {
      throw new ServiceUnavailableException("Admin is not configured");
    }

    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.headers[ADMIN_TOKEN_HEADER];

    if (typeof provided !== "string" || !safeEqual(provided, expected)) {
      throw new UnauthorizedException();
    }

    return true;
  }
}

const safeEqual = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
};
