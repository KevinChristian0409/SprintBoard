import { expect, type Locator, type Page } from "@playwright/test";

export class ProjectBoardPage {
  readonly page: Page;
  readonly addTaskButton: Locator;
  readonly membersButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Scope the navigation button because the task modal has another
    // "Add Task" button used to submit the form.
    this.addTaskButton = page.getByRole("navigation").getByRole("button", {
      name: "Add Task",
      exact: true,
    });

    this.membersButton = page.getByRole("button", {
      name: "View project members",
      exact: true,
    });
  }

  async expectLoaded(projectName: string) {
    await expect(this.page).toHaveURL(/\/projects\/[^/]+$/);

    await expect(
      this.page.getByRole("heading", {
        name: projectName,
        exact: true,
      }),
    ).toBeVisible();
  }

  async openCreateTaskModal() {
    const modalHeading = this.page.getByRole("heading", {
      name: "Add Task",
      exact: true,
    });

    // Avoid clicking through the modal overlay if another test step already
    // opened the form.
    if (!(await modalHeading.isVisible())) {
      await this.addTaskButton.click();
    }

    await expect(modalHeading).toBeVisible();
  }

  async createTask({
    title,
    description,
    status = "backlog",
    priority = "medium",
    dueDate,
  }: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
  }) {
    await this.openCreateTaskModal();

    await this.page.getByLabel(/^Title/).fill(title);

    if (description !== undefined) {
      await this.page.getByLabel(/^Description/).fill(description);
    }

    await this.page.getByLabel("Status", { exact: true }).selectOption(status);
    await this.page
      .getByLabel("Priority", { exact: true })
      .selectOption(priority);

    if (dueDate) {
      await this.page.getByLabel(/^Due Date/).fill(dueDate);
    }

    // The form contains the submit button; this avoids the navigation
    // button with the same visible text.
    const taskForm = this.page.locator("form").filter({
      has: this.page.getByLabel(/^Title/),
    });

    await taskForm
      .getByRole("button", {
        name: "Add Task",
        exact: true,
      })
      .click();

    await expect(
      this.page.getByRole("heading", {
        name: title,
        exact: true,
      }),
    ).toBeVisible();
  }

  async cancelCreateTask() {
    const modal = this.page.getByRole("heading", {
      name: "Add Task",
      exact: true,
    });

    await expect(modal).toBeVisible();

    await this.page
      .getByRole("button", { name: "Cancel", exact: true })
      .click();

    await expect(modal).not.toBeVisible();
  }

  taskCard(title: string): Locator {
    return this.page.getByRole("heading", {
      name: title,
      exact: true,
    });
  }

  async openTask(title: string) {
    await this.taskCard(title).click();

    await expect(this.page).toHaveURL(/\/projects\/[^/]+\/tasks\/[^/]+$/);
  }

  async openMembersModal() {
    await this.membersButton.click();

    await expect(
      this.page.getByRole("heading", {
        name: "Project Members",
        exact: true,
      }),
    ).toBeVisible();
  }

  async closeMembersModal() {
    await this.page
      .getByRole("button", {
        name: "Close project members dialog",
        exact: true,
      })
      .click();

    await expect(
      this.page.getByRole("heading", {
        name: "Project Members",
        exact: true,
      }),
    ).not.toBeVisible();
  }
}
