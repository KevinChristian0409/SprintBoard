import { expect, type Locator, type Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly signUpLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly passwordToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email", { exact: true });
    this.passwordInput = page.getByLabel("Password", { exact: true });
    this.signInButton = page.getByRole("button", { name: /sign in/i });
    this.signUpLink = page.getByRole("link", { name: /sign up/i });
    this.forgotPasswordLink = page.getByRole("link", {
      name: /forgot password/i,
    });
    this.rememberMeCheckbox = page.getByRole("checkbox", {
      name: /remember me/i,
    });
    this.passwordToggle = page.getByRole("button", {
      name: "Show password",
      exact: true,
    });
  }

  async goto() {
    await this.page.goto("/login");
  }

  async enterEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickSignIn() {
    await this.signInButton.click();
  }

  async login(email: string, password: string) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickSignIn();
  }

  async expectError(message: string) {
    await expect(this.page.getByText(message, { exact: true })).toBeVisible();
  }

  async expectDashboard() {
    await expect(this.page).toHaveURL(/\/dashboard$/);
  }
}
