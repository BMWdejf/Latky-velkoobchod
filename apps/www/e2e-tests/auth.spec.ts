import { expect, test } from "@playwright/test";

const pages = [
  { path: "/auth/sign-in", heading: "Přihlášení" },
  { path: "/auth/sign-up", heading: "Registrace" },
  { path: "/auth/verify-email", heading: "Ověření e-mailu" },
];

test.describe("Auth pages", () => {
  for (const { path, heading } of pages) {
    test(`${path} loads`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.getByText(heading, { exact: true })).toBeVisible();
    });
  }
});
