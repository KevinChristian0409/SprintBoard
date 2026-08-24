import { expect, test } from "@playwright/test";

test("SprintBoard loads successfully", async ({ page }) => {
  // A lightweight smoke test catches a broken deployment before deeper suites run.
  await page.goto("/");

  await expect(page).toHaveTitle(/SprintBoard/i);
});
