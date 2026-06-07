import { DEFAULT_ROLE, isRole, ROLES, toRole } from "@/lib/auth/roles";

describe("roles", () => {
  it("recognizes known roles", () => {
    expect(isRole("admin")).toBe(true);
    expect(isRole("client")).toBe(true);
    expect(isRole("user")).toBe(true);
  });

  it("rejects unknown values", () => {
    expect(isRole("superuser")).toBe(false);
    expect(isRole(undefined)).toBe(false);
    expect(isRole(42)).toBe(false);
  });

  it("normalizes unknown values to the default role", () => {
    expect(toRole("nope")).toBe(DEFAULT_ROLE);
    expect(toRole(undefined)).toBe(ROLES.customer);
    expect(toRole("admin")).toBe(ROLES.admin);
  });
});
