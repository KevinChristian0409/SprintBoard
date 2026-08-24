import { expect, type Locator, type Page } from "@playwright/test";

export class TaskDetailPage {
  readonly page: Page;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.editButton = page.getByRole("button", {
      name: "Edit task",
      exact: true,
    });

    this.deleteButton = page.getByRole("button", {
      name: "Delete task",
      exact: true,
    });

    this.saveButton = page.getByRole("button", {
      name: "Save task",
      exact: true,
    });

    this.cancelButton = page.getByRole("button", {
      name: "Cancel editing",
      exact: true,
    });
  }

  async expectLoaded(taskTitle: string) {
    await expect(this.page).toHaveURL(
      /\/projects\/[^/]+\/tasks\/[^/]+$/,
    );

    await expect(
      this.page.getByRole("heading", {
        name: taskTitle,
        exact: true,
      }),
    ).toBeVisible();
  }

  async startEditing() {
    await this.editButton.click();
    await expect(this.saveButton).toBeVisible();
  }

  async updateTask({
    title,
    description,
    status,
    priority,
    dueDate,
  }: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
  }) {
    await this.startEditing();

    if (title !== undefined) {
      await this.page.getByLabel("Task title", { exact: true }).fill(title);
    }

    if (description !== undefined) {
      await this.page
        .getByLabel("Task description", { exact: true })
        .fill(description);
    }

    if (status !== undefined) {
      await this.page
        .getByLabel("Task status", { exact: true })
        .selectOption(status);
    }

    if (priority !== undefined) {
      await this.page
        .getByLabel("Task priority", { exact: true })
        .selectOption(priority);
    }

    if (dueDate !== undefined) {
      await this.page.getByLabel("Due date", { exact: true }).fill(dueDate);
    }

    await this.saveButton.click();
  }

  async cancelEditing() {
    await this.startEditing();
    await this.cancelButton.click();

    await expect(this.saveButton).not.toBeVisible();
    await expect(this.editButton).toBeVisible();
  }

  async deleteTask() {
    // Register the dialog handler before clicking because confirm() opens
    // immediately after the delete action.
    this.page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe(
        "Are you sure you want to delete this task?",
      );
      await dialog.accept();
    });

    await this.deleteButton.click();
  }

  async expectTaskDeleted() {
    await expect(this.page).toHaveURL(/\/projects\/[^/]+$/);
  }
}
