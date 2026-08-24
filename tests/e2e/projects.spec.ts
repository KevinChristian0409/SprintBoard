import { expect } from "@playwright/test";
import { test, ProjectsPage } from "../fixtures/test";

test.describe("Project Management", () => {
  test("user can create a new project", async ({ page, cleanupProject }) => {
    const projectsPage = new ProjectsPage(page);
    const projectName = `QA Automation Project ${Date.now()}`;
    const description = "Project created by Playwright automation testing";

    try {
      await projectsPage.goto();
      await projectsPage.expectPageLoaded();
      await projectsPage.createProject(projectName, description);

      // Verify the project is rendered after the API-backed create operation.
      await expect(
        page.getByRole("heading", { name: projectName, exact: true }),
      ).toBeVisible();
    } finally {
      // Keep the shared test account clean even when an assertion fails.
      await cleanupProject(projectName);
    }
  });

  test("user can open a project board", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    const projectName = `Board Test Project ${Date.now()}`;

    await projectsPage.goto();
    await projectsPage.createProject(
      projectName,
      "Project used to validate board navigation",
    );
    await projectsPage.openProject(projectName);

    await expect(page).toHaveURL(/\/projects\/[^/]+$/);
    await expect(
      page.getByRole("heading", { name: projectName, exact: true }),
    ).toBeVisible();
  });

  test("project form can be cancelled", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);

    await projectsPage.goto();
    await projectsPage.expectPageLoaded();
    await projectsPage.openCreateProjectModal();

    // Cancel should close the modal without creating a project.
    await projectsPage.cancelButton.click();

    await expect(
      page.getByRole("heading", {
        name: "Create Project",
        exact: true,
      }),
    ).not.toBeVisible();
  });

  test("new project appears with its description", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    const projectName = `Description Project ${Date.now()}`;
    const description = "Verify project information is displayed correctly";

    await projectsPage.goto();
    await projectsPage.createProject(projectName, description);

    const card = projectsPage.projectCard(projectName);

    await expect(card).toContainText(description);
    await expect(card).toContainText("1 members");
  });
});
