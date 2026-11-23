import { formatCzk, formatQuantity } from "@/lib/format";

describe("formatCzk", () => {
  it("formats whole crowns with a non-breaking space before Kč", () => {
    expect(formatCzk(185)).toBe("185 Kč");
  });

  it("uses a space as the thousands separator", () => {
    expect(formatCzk(15000)).toMatch(/^15\s000 Kč$/);
  });
});

describe("formatQuantity", () => {
  it("groups thousands", () => {
    expect(formatQuantity(1240)).toMatch(/^1\s240$/);
  });
});
