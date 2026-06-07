import { expect, test } from "@playwright/test";

test.describe("Admin panel access", () => {
  test("redirects unauthenticated users to sign-in", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
