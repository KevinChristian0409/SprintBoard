import { test as base, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { ProjectsPage } from "../pages/ProjectsPage";
import { ProjectBoardPage } from "../pages/ProjectBoardPage";

interface TestProject {
  id: string;
  name: string;
  description: string;
}

interface TestTask {
  id: string;
  title: string;
  description: string;
}

type TestFixtures = {
  testProject: TestProject;
  testTask: TestTask;
  cleanupProject: (name: string) => Promise<void>;
};

function getAuthToken() {
  const state = JSON.parse(
    readFileSync("playwright/.auth/user.json", "utf8"),
  );

  const origin = state.origins?.find((item: any) =>
    item.localStorage?.some((entry: any) => entry.name === "token"),
  );

  const token = origin?.localStorage?.find(
    (entry: any) => entry.name === "token",
  )?.value;

  if (!token) {
    throw new Error("Authentication token was not found in storage state.");
  }

  return token;
}

function getApiUrl() {
  return (
    process.env.PLAYWRIGHT_TEST_API_URL ||
    "https://sprintboard-api-4qps.onrender.com"
  );
}

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${getAuthToken()}`,
    "Content-Type": "application/json",
  };
}

export const test = base.extend<TestFixtures>({
  cleanupProject: async ({ request }, use) => {
    const cleanup = async (name: string) => {
      const apiUrl = getApiUrl();
      const headers = getAuthHeaders();

      const response = await request.get(`${apiUrl}/api/projects`, {
        headers,
      });

      if (!response.ok()) {
        return;
      }

      const body = await response.json();
      const project = body.data?.projects?.find(
        (item: { name: string }) => item.name === name,
      );

      if (project) {
        await request.delete(`${apiUrl}/api/projects/${project._id}`, {
          headers,
        });
      }
    };

    await use(cleanup);
  },

  testProject: async ({ request }, use) => {
    const apiUrl = getApiUrl();
    const headers = getAuthHeaders();
    const name = `Playwright Project ${Date.now()}`;
    const description = "Project created by the Playwright test fixture";

    const response = await request.post(`${apiUrl}/api/projects`, {
      headers,
      data: {
        name,
        description,
        color: "#3B82F6",
      },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    const project = body.data;

    // The fixture owns the data it creates, so the test can focus on behavior.
    await use({
      id: project._id,
      name,
      description,
    });

    // Delete child tasks first, then the project itself, so a failed test
    // does not leave test data behind in the shared environment.
    const tasksResponse = await request.get(
      `${apiUrl}/api/tasks?projectId=${project._id}`,
      { headers },
    );

    if (tasksResponse.ok()) {
      const tasksBody = await tasksResponse.json();

      for (const task of tasksBody.data ?? []) {
        await request.delete(`${apiUrl}/api/tasks/${task._id}`, { headers });
      }
    }

    await request.delete(`${apiUrl}/api/projects/${project._id}`, { headers });
  },

  testTask: async ({ request, testProject }, use) => {
    const apiUrl = getApiUrl();
    const headers = getAuthHeaders();
    const title = `Playwright Task ${Date.now()}`;
    const description = "Task created by the Playwright test fixture";

    const response = await request.post(`${apiUrl}/api/tasks`, {
      headers,
      data: {
        title,
        description,
        project: testProject.id,
        status: "backlog",
        priority: "medium",
      },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    const task = body.data;

    // Keep setup data separate from the UI flow under test.
    await use({
      id: task._id,
      title,
      description,
    });

    await request.delete(`${apiUrl}/api/tasks/${task._id}`, { headers });
  },
});

export { expect, ProjectsPage, ProjectBoardPage };
