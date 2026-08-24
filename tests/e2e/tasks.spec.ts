import { expect } from "@playwright/test";
import { test, ProjectBoardPage } from "../fixtures/test";
import { TaskDetailPage } from "../pages/TaskDetailPage";

test.describe("Task Management", () => {
  test("user can create a task with project defaults", async ({
    page,
    testProject,
  }) => {
    const board = new ProjectBoardPage(page);
    const taskTitle = `Create Task ${Date.now()}`;

    await page.goto(`/projects/${testProject.id}`);
    await board.expectLoaded(testProject.name);

    await board.createTask({
      title: taskTitle,
      description: "Task created through the project board",
    });

    await expect(
      page.getByRole("heading", { name: taskTitle, exact: true }),
    ).toBeVisible();
  });

  test("user can create a task with custom status, priority, and due date", async ({
    page,
    testProject,
  }) => {
    const board = new ProjectBoardPage(page);
    const taskTitle = `Custom Task ${Date.now()}`;

    await page.goto(`/projects/${testProject.id}`);
    await board.expectLoaded(testProject.name);

    await board.createTask({
      title: taskTitle,
      description: "Task with non-default project board values",
      status: "in-progress",
      priority: "high",
      dueDate: "2099-12-31",
    });

    // The task card should appear in the board after the create request succeeds.
    await expect(
      page.getByRole("heading", { name: taskTitle, exact: true }),
    ).toBeVisible();
  });

  test("create task modal can be cancelled", async ({
    page,
    testProject,
  }) => {
    const board = new ProjectBoardPage(page);

    await page.goto(`/projects/${testProject.id}`);
    await board.expectLoaded(testProject.name);
    await board.openCreateTaskModal();

    // Closing the modal should not submit the form or create a task.
    await board.cancelCreateTask();
  });

  test("user can open task details", async ({
    page,
    testProject,
    testTask,
  }) => {
    const board = new ProjectBoardPage(page);

    await page.goto(`/projects/${testProject.id}`);
    await board.expectLoaded(testProject.name);
    await board.openTask(testTask.title);

    const taskDetails = new TaskDetailPage(page);
    await taskDetails.expectLoaded(testTask.title);
  });

  test("user can edit a task", async ({ page, testProject, testTask }) => {
    const board = new ProjectBoardPage(page);
    const taskDetails = new TaskDetailPage(page);
    const updatedTitle = `Updated Task ${Date.now()}`;

    await page.goto(`/projects/${testProject.id}`);
    await board.openTask(testTask.title);
    await taskDetails.expectLoaded(testTask.title);

    await taskDetails.updateTask({
      title: updatedTitle,
      description: "Updated through the task details page",
      priority: "high",
      status: "in-progress",
    });

    await expect(
      page.getByRole("heading", { name: updatedTitle, exact: true }),
    ).toBeVisible();
  });

  test("user can cancel task editing without saving", async ({
    page,
    testProject,
    testTask,
  }) => {
    const board = new ProjectBoardPage(page);
    const taskDetails = new TaskDetailPage(page);

    await page.goto(`/projects/${testProject.id}`);
    await board.openTask(testTask.title);
    await taskDetails.expectLoaded(testTask.title);

    await taskDetails.cancelEditing();

    // The original title should remain visible after cancelling edit mode.
    await expect(
      page.getByRole("heading", { name: testTask.title, exact: true }),
    ).toBeVisible();
  });

  test("user can delete a task", async ({ page, testProject, testTask }) => {
    const board = new ProjectBoardPage(page);
    const taskDetails = new TaskDetailPage(page);

    await page.goto(`/projects/${testProject.id}`);
    await board.openTask(testTask.title);
    await taskDetails.expectLoaded(testTask.title);

    await taskDetails.deleteTask();
    await taskDetails.expectTaskDeleted();

    await expect(
      page.getByRole("heading", { name: testTask.title, exact: true }),
    ).not.toBeVisible();
  });

  test("project members dialog opens and closes successfully", async ({
    page,
    testProject,
  }) => {
    const board = new ProjectBoardPage(page);

    await page.goto(`/projects/${testProject.id}`);
    await board.expectLoaded(testProject.name);
    await board.openMembersModal();
    await board.closeMembersModal();
  });

  test("project member search handles an unknown user", async ({
    page,
    testProject,
  }) => {
    const board = new ProjectBoardPage(page);

    await page.goto(`/projects/${testProject.id}`);
    await board.expectLoaded(testProject.name);
    await board.openMembersModal();

    const search = page.getByLabel("Invite by Email or Name", {
      exact: true,
    });

    // Use a unique value so the test does not depend on a particular user account.
    await search.fill(`nobody-${Date.now()}@example.invalid`);

    await expect(page.getByText("No users found", { exact: true })).toBeVisible();
  });
});
