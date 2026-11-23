import {
  ExecutionContext,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ADMIN_TOKEN_HEADER, AdminGuard } from "./admin.guard";

const contextWithHeaders = (
  headers: Record<string, string>,
): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ headers }) }),
  }) as unknown as ExecutionContext;

describe("AdminGuard", () => {
  const guard = new AdminGuard();

  afterEach(() => {
    delete process.env.ADMIN_TOKEN;
  });

  it("fails closed when ADMIN_TOKEN is not configured", () => {
    expect(() => guard.canActivate(contextWithHeaders({}))).toThrow(
      ServiceUnavailableException,
    );
  });

  it("rejects a missing or wrong token", () => {
    process.env.ADMIN_TOKEN = "secret-token";

    expect(() => guard.canActivate(contextWithHeaders({}))).toThrow(
      UnauthorizedException,
    );
    expect(() =>
      guard.canActivate(contextWithHeaders({ [ADMIN_TOKEN_HEADER]: "wrong!" })),
    ).toThrow(UnauthorizedException);
  });

  it("accepts the matching token", () => {
    process.env.ADMIN_TOKEN = "secret-token";

    expect(
      guard.canActivate(
        contextWithHeaders({ [ADMIN_TOKEN_HEADER]: "secret-token" }),
      ),
    ).toBe(true);
  });
});
