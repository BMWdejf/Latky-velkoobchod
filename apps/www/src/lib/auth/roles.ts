/**
 * Application roles, sourced from the Neon Auth user's `role` field.
 *
 * - `customer` — registered & verified, but not yet approved. Sees only a
 *   "pending approval" notice in the client panel.
 * - `client` — approved business customer. Sees orders, invoices, prices.
 * - `admin` — staff. Has access to the admin panel.
 *
 * New sign-ups default to `customer`; an admin promotes them to `client`.
 */
export const ROLES = {
  customer: "user",
  client: "client",
  admin: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const DEFAULT_ROLE: Role = ROLES.customer;

export function isRole(value: unknown): value is Role {
  return (
    value === ROLES.customer || value === ROLES.client || value === ROLES.admin
  );
}

/** Normalizes an arbitrary `role` value from Neon Auth into a known {@link Role}. */
export function toRole(value: unknown): Role {
  return isRole(value) ? value : DEFAULT_ROLE;
}
