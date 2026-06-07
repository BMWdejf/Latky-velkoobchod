// Avoid initializing the real Neon Auth SDK (needs env + ESM) in unit tests.
jest.mock("@/lib/auth/server", () => ({
  auth: { handler: () => ({ GET: () => {}, POST: () => {} }) },
}));

import * as route from "../[...path]/route";

describe("auth API route", () => {
  it("exposes GET and POST handlers", () => {
    expect(typeof route.GET).toBe("function");
    expect(typeof route.POST).toBe("function");
  });
});
