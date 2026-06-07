import { expect, test } from "@playwright/test";

test.describe("Client panel access", () => {
  test("redirects unauthenticated users to sign-in", async ({ page }) => {
    await page.goto("/client");
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
