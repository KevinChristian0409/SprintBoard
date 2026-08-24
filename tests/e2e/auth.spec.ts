import { expect, test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

test.describe("Authentication", () => {
  test("user can log in with valid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!,
    );

    await loginPage.expectDashboard();
  });

  test("login shows error for invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login("invalid.user@example.com", "WrongPassword123!");

    await loginPage.expectError("Invalid email or password");
  });

  test("login validates required fields", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.clickSignIn();

    await loginPage.expectError("Please fill in all fields");
  });

  test("password visibility can be toggled", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.enterPassword("TestPassword123!");

    // The button should expose the current state through its accessible name.
    await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
    await loginPage.passwordToggle.click();

    await expect(loginPage.passwordInput).toHaveAttribute("type", "text");
    await expect(
      page.getByRole("button", { name: "Hide password", exact: true }),
    ).toBeVisible();
  });

  test("remember me checkbox can be selected", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.rememberMeCheckbox.check();

    await expect(loginPage.rememberMeCheckbox).toBeChecked();
  });

  test("user can navigate from login to registration", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.signUpLink.click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(
      page.getByRole("heading", { name: /create account/i }),
    ).toBeVisible();
  });
});

test.describe("Registration", () => {
  test("registration validates required fields", async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.clickCreateAccount();

    await registerPage.expectError("Please fill in all fields");
  });

  test("registration validates matching passwords", async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register(
      "Playwright Test User",
      `playwright.mismatch.${Date.now()}@example.com`,
      "test@123",
      "different@123",
    );

    await registerPage.expectError("Passwords do not match");
  });

  test("registration validates minimum password length", async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register(
      "Playwright Test User",
      `playwright.short.${Date.now()}@example.com`,
      "12345",
      "12345",
    );

    await registerPage.expectError(
      "Password must be at least 6 characters",
    );
  });

  test("registration password visibility can be toggled", async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.enterPassword("TestPassword123!");

    await expect(registerPage.passwordInput).toHaveAttribute("type", "password");
    await registerPage.passwordToggle.click();

    await expect(registerPage.passwordInput).toHaveAttribute("type", "text");
  });

  test("user can navigate from registration to login", async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.signInLink.click();

    await registerPage.expectLoginPage();
    await expect(
      page.getByRole("heading", { name: "Welcome back", exact: true }),
    ).toBeVisible();
  });

  test("registration creates a new account with valid information", async ({
    page,
  }) => {
    const registerPage = new RegisterPage(page);
    const uniqueEmail = `playwright.${Date.now()}@example.com`;

    await registerPage.goto();
    await registerPage.register(
      "Playwright Automation User",
      uniqueEmail,
      "test@123",
      "test@123",
    );

    await registerPage.expectLoginPage();
  });

  test("registration rejects an existing email", async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register(
      "Playwright Test User",
      process.env.TEST_USER_EMAIL!,
      "test@123",
      "test@123",
    );

    await registerPage.expectError("User already exists");
  });
});
