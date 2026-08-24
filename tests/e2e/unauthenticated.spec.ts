import { expect, test } from "@playwright/test";

test.describe("Unauthenticated Access", () => {
  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/dashboard");

    // Protected routes should never expose authenticated content to a new session.
    await expect(page).toHaveURL(/\/login$/);
  });
});
