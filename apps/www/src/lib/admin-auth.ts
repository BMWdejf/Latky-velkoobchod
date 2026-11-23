import { timingSafeEqual } from "node:crypto";

/**
 * Checks an `Authorization: Basic …` header against ADMIN_PASSWORD.
 * The username is ignored. Returns false when the password is not configured.
 */
export const isAdminAuthorized = (header: string | null): boolean => {
  const password = process.env.ADMIN_PASSWORD;

  if (!password || !header?.startsWith("Basic ")) {
    return false;
  }

  const decoded = Buffer.from(header.slice("Basic ".length), "base64").toString(
    "utf8",
  );
  const separator = decoded.indexOf(":");

  if (separator === -1) {
    return false;
  }

  return safeEqual(decoded.slice(separator + 1), password);
};

const safeEqual = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
};
