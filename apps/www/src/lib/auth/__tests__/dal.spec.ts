import { ROLES } from "@/lib/auth/roles";

// `cache` from React only works inside a request scope; make it a passthrough.
jest.mock("react", () => {
  const actual = jest.requireActual("react");
  return { ...actual, cache: (fn: unknown) => fn };
});

// Control what the Neon Auth session looks like per test.
jest.mock("@/lib/auth/server", () => ({
  auth: { getSession: jest.fn() },
}));

// Make redirect observable by throwing a sentinel we can assert on. A plain
// function (not jest.fn) survives the suite's `resetMocks: true`.
jest.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

import {
  getCurrentUser,
  getRole,
  requireRole,
  requireUser,
  requireVerified,
} from "@/lib/auth/dal";
import { auth } from "@/lib/auth/server";

const mockGetSession = auth.getSession as jest.Mock;

type SessionOverrides = {
  emailVerified?: boolean;
  role?: unknown;
};

function mockSession(overrides: SessionOverrides = {}) {
  mockGetSession.mockResolvedValue({
    data: {
      user: {
        id: "u1",
        email: "user@example.com",
        name: "Test User",
        emailVerified: overrides.emailVerified ?? true,
        role: overrides.role,
      },
    },
  });
}

function mockNoSession() {
  mockGetSession.mockResolvedValue({ data: null });
}

describe("getCurrentUser", () => {
  it("returns null when there is no session", async () => {
    mockNoSession();
    expect(await getCurrentUser()).toBeNull();
  });

  it("defaults unknown roles to customer", async () => {
    mockSession({ role: undefined });
    const user = await getCurrentUser();
    expect(user?.role).toBe(ROLES.customer);
  });

  it("maps a known role from the session", async () => {
    mockSession({ role: "admin" });
    const user = await getCurrentUser();
    expect(user?.role).toBe(ROLES.admin);
  });
});

describe("getRole", () => {
  it("returns the role of the user", () => {
    expect(getRole({ role: ROLES.client })).toBe(ROLES.client);
  });
});

describe("requireUser", () => {
  it("redirects unauthenticated users to sign-in", async () => {
    mockNoSession();
    await expect(requireUser()).rejects.toThrow("REDIRECT:/auth/sign-in");
  });

  it("returns the user when authenticated", async () => {
    mockSession();
    await expect(requireUser()).resolves.toMatchObject({ id: "u1" });
  });
});

describe("requireVerified", () => {
  it("redirects unverified users to verify-email", async () => {
    mockSession({ emailVerified: false });
    await expect(requireVerified()).rejects.toThrow(
      "REDIRECT:/auth/verify-email",
    );
  });

  it("passes verified users", async () => {
    mockSession({ emailVerified: true });
    await expect(requireVerified()).resolves.toMatchObject({ id: "u1" });
  });
});

describe("requireRole", () => {
  it("lets a matching role through", async () => {
    mockSession({ role: "admin" });
    await expect(requireRole(ROLES.admin)).resolves.toMatchObject({
      role: ROLES.admin,
    });
  });

  it("redirects a non-matching role to the client panel", async () => {
    mockSession({ role: "client" });
    await expect(requireRole(ROLES.admin)).rejects.toThrow("REDIRECT:/client");
  });

  it("redirects an unapproved customer away from admin", async () => {
    mockSession({ role: "user" });
    await expect(requireRole(ROLES.admin)).rejects.toThrow("REDIRECT:/client");
  });
});
