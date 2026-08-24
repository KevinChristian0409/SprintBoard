import { expect, type Locator, type Page } from "@playwright/test";

export class ProjectsPage {
  readonly page: Page;
  readonly pageHeading: Locator;
  readonly newProjectButton: Locator;
  readonly projectNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading = page.getByRole("heading", {
      name: "My Projects",
      exact: true,
    });

    this.newProjectButton = page.getByRole("button", {
      name: "New Project",
      exact: true,
    });

    this.projectNameInput = page.getByLabel("Project Name", {
      exact: true,
    });

    this.descriptionInput = page.getByLabel("Description", {
      exact: true,
    });

    this.createButton = page.getByRole("button", {
      name: "Create",
      exact: true,
    });

    this.cancelButton = page.getByRole("button", {
      name: "Cancel",
      exact: true,
    });
  }

  async goto() {
    await this.page.goto("/projects");
  }

  async expectPageLoaded() {
    await expect(this.page).toHaveURL(/\/projects$/);
    await expect(this.pageHeading).toBeVisible();
  }

  async openCreateProjectModal() {
    await this.newProjectButton.click();

    await expect(
      this.page.getByRole("heading", {
        name: "Create Project",
        exact: true,
      }),
    ).toBeVisible();
  }

  async createProject(name: string, description: string) {
    await this.openCreateProjectModal();

    await this.projectNameInput.fill(name);
    await this.descriptionInput.fill(description);

    await this.createButton.click();

    await expect(
      this.page.getByRole("heading", {
        name,
        exact: true,
      }),
    ).toBeVisible();
  }

  projectCard(name: string): Locator {
    return this.page
      .getByRole("heading", {
        name,
        exact: true,
      })
      .locator('xpath=ancestor::div[contains(@class, "group")]');
  }

  async openProject(name: string) {
    const card = this.projectCard(name);

    await card
      .getByRole("link", {
        name: "View Board",
        exact: true,
      })
      .click();

    await expect(this.page).toHaveURL(/\/projects\/[^/]+$/);
  }
}
