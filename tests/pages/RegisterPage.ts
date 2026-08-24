import { expect, type Locator, type Page } from "@playwright/test";

export class RegisterPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly createAccountButton: Locator;
  readonly signInLink: Locator;
  readonly passwordToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel("Full Name", { exact: true });
    this.emailInput = page.getByLabel("Email", { exact: true });
    this.passwordInput = page.getByLabel("Password", { exact: true });
    this.confirmPasswordInput = page.getByLabel("Confirm Password", {
      exact: true,
    });
    this.createAccountButton = page.getByRole("button", {
      name: /create account/i,
    });
    this.signInLink = page.getByRole("link", { name: /sign in/i });
    this.passwordToggle = page.getByRole("button", {
      name: "Show password",
      exact: true,
    });
  }

  async goto() {
    await this.page.goto("/register");
  }

  async enterName(name: string) {
    await this.nameInput.fill(name);
  }

  async enterEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async enterConfirmPassword(password: string) {
    await this.confirmPasswordInput.fill(password);
  }

  async clickCreateAccount() {
    await this.createAccountButton.click();
  }

  async register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) {
    await this.enterName(name);
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.enterConfirmPassword(confirmPassword);
    await this.clickCreateAccount();
  }

  async expectError(message: string) {
    await expect(this.page.getByText(message, { exact: true })).toBeVisible();
  }

  async expectLoginPage() {
    await expect(this.page).toHaveURL(/\/login$/);
  }
}
