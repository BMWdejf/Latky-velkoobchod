import { expect, test } from "@playwright/test";

test.describe("Home Page", () => {
  test("renders the header, hero, value propositions and footer", async ({
    page,
  }) => {
    await page.goto("/");

    await test.step("renders header and hero", async () => {
      await expect(page.locator("header")).toBeVisible();
      await expect(
        page.getByRole("heading", {
          name: "Velkoobchodní dodávky prémiových textilií & ložního prádla",
        }),
      ).toBeVisible();
    });

    await test.step("renders value propositions and catalog", async () => {
      await expect(
        page.getByRole("region", { name: "Výhody pro velkoobchod" }),
      ).toBeVisible();
      await expect(page.locator("#katalog")).toBeVisible();
    });

    await test.step("renders footer", async () => {
      await expect(page.locator("footer")).toBeVisible();
    });
  });

  test("shows the product catalog or an error state", async ({ page }) => {
    await page.goto("/");

    const catalog = page.locator("#katalog");
    const cards = catalog.getByRole("article");
    const status = catalog.getByRole("status");

    await expect(cards.first().or(status)).toBeVisible();
  });

  test("links the category navigation to the catalog", async ({ page }) => {
    await page.goto("/");

    const navigation = page.getByRole("navigation", {
      name: "Hlavní navigace",
    });
    await expect(
      navigation.getByRole("link", { name: "Látky – metráž" }),
    ).toHaveAttribute("href", "#katalog");
  });
});
