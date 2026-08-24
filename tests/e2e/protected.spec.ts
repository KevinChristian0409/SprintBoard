import { expect } from "@playwright/test";
import { test } from "../fixtures/test";

test.describe("Protected Routes", () => {
  test("authenticated user can access the dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();
  });

  test("authenticated user can access the projects page", async ({ page }) => {
    await page.goto("/projects");

    await expect(page).toHaveURL(/\/projects$/);
    await expect(
      page.getByRole("heading", { name: "My Projects", exact: true }),
    ).toBeVisible();
  });

  test("logging out removes access to protected content", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByRole("button", { name: "Logout", exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);

    // Verify the session is no longer accepted after logout.
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });
});
