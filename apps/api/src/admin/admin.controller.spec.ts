import { BadRequestException } from "@nestjs/common";
import { parseProductQuery } from "./admin.controller";

describe("parseProductQuery", () => {
  it("applies defaults for an empty query", () => {
    expect(parseProductQuery({})).toEqual({
      q: undefined,
      filter: "all",
      group: undefined,
      limit: undefined,
      start: undefined,
    });
  });

  it("clamps paging numbers", () => {
    const parsed = parseProductQuery({ limit: "500", start: "3" });

    expect(parsed.limit).toBe(100);
    expect(parsed.start).toBe(3);
  });

  it("rejects an unknown filter", () => {
    expect(() => parseProductQuery({ filter: "everything" })).toThrow(
      BadRequestException,
    );
  });

  it("rejects non-numeric paging", () => {
    expect(() => parseProductQuery({ start: "x" })).toThrow(
      BadRequestException,
    );
  });

  it("rejects array values", () => {
    expect(() => parseProductQuery({ q: ["a", "b"] })).toThrow(
      BadRequestException,
    );
  });
});
