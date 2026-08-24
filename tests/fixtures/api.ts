import { test as base, expect } from "@playwright/test";

interface ApiProject {
  id: string;
  name: string;
  description: string;
}

interface ApiTask {
  id: string;
  title: string;
  description: string;
}

type ApiFixtures = {
  api: import("@playwright/test").APIRequestContext;
  apiProject: ApiProject;
  apiTask: ApiTask;
};

function getApiUrl() {
  return (
    process.env.PLAYWRIGHT_TEST_API_URL ||
    "https://sprintboard-api-4qps.onrender.com"
  );
}

export const test = base.extend<ApiFixtures>({
  // Each API test gets a fresh authenticated request context.
  api: async ({ playwright }, use) => {
    const apiUrl = getApiUrl();

    const loginContext = await playwright.request.newContext({
      baseURL: apiUrl,
      extraHTTPHeaders: {
        "Content-Type": "application/json",
      },
    });

    let token: string;

    try {
      const response = await loginContext.post("/api/auth/login", {
        data: {
          email: process.env.TEST_USER_EMAIL,
          password: process.env.TEST_USER_PASSWORD,
        },
      });

      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      token = body.data?.token || body.token;

      if (!token) {
        throw new Error("API login did not return a token.");
      }
    } finally {
      await loginContext.dispose();
    }

    // Build the authenticated context once, then reuse it across the test.
    const context = await playwright.request.newContext({
      baseURL: apiUrl,
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    try {
      await use(context);
    } finally {
      await context.dispose();
    }
  },

  apiProject: async ({ api }, use) => {
    const name = `API Project ${Date.now()}`;
    const description = "Project created by API automation";

    const response = await api.post("/api/projects", {
      data: {
        name,
        description,
        color: "#3B82F6",
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    const project = body.data;

    await use({
      id: project._id,
      name,
      description,
    });

    // Keep API tests isolated by removing the project after each test.
    await api.delete(`/api/projects/${project._id}`);
  },

  apiTask: async ({ api, apiProject }, use) => {
    const title = `API Task ${Date.now()}`;
    const description = "Task created by API automation";

    const response = await api.post("/api/tasks", {
      data: {
        title,
        description,
        project: apiProject.id,
        status: "backlog",
        priority: "medium",
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    const task = body.data;

    await use({
      id: task._id,
      title,
      description,
    });

    await api.delete(`/api/tasks/${task._id}`);
  },
});

export { expect };
