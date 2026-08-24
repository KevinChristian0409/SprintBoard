import { test, expect } from "../fixtures/api";

test.describe("SprintBoard API", () => {
  test("login API returns a token for valid credentials", async ({ playwright }) => {
    const api = await playwright.request.newContext({
      baseURL:
        process.env.PLAYWRIGHT_TEST_API_URL ||
        "https://sprintboard-api-4qps.onrender.com",
    });

    try {
      const response = await api.post("/api/auth/login", {
        data: {
          email: process.env.TEST_USER_EMAIL,
          password: process.env.TEST_USER_PASSWORD,
        },
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.message).toBe("Login successful");
      expect(typeof body.token).toBe("string");
      expect(body.token.length).toBeGreaterThan(20);
    } finally {
      await api.dispose();
    }
  });

  test("login API rejects invalid credentials", async ({ playwright }) => {
    const api = await playwright.request.newContext({
      baseURL:
        process.env.PLAYWRIGHT_TEST_API_URL ||
        "https://sprintboard-api-4qps.onrender.com",
    });

    try {
      const response = await api.post("/api/auth/login", {
        data: {
          email: "invalid.user@example.com",
          password: "WrongPassword123!",
        },
      });

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.message).toBe("Invalid credentials");
    } finally {
      await api.dispose();
    }
  });

  test("rejects requests without authentication", async ({ playwright }) => {
    const api = await playwright.request.newContext({
      baseURL:
        process.env.PLAYWRIGHT_TEST_API_URL ||
        "https://sprintboard-api-4qps.onrender.com",
    });

    try {
      // Authentication is enforced at the route middleware, so this should
      // fail before the controller is reached.
      const response = await api.get("/api/projects");

      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.message).toBe("Not authorized, no token");
    } finally {
      await api.dispose();
    }
  });

  test("authenticated user can list projects", async ({ api }) => {
    const response = await api.get("/api/projects");

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.projects)).toBe(true);
    expect(Array.isArray(body.data.invitations)).toBe(true);
  });

  test("authenticated user can create and retrieve a project", async ({
    api,
    apiProject,
  }) => {
    // The fixture creates the project; this test verifies the API can retrieve
    // the same resource and return its persisted values.
    const response = await api.get(`/api/projects/${apiProject.id}`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data._id).toBe(apiProject.id);
    expect(body.data.name).toBe(apiProject.name);
    expect(body.data.description).toBe(apiProject.description);
  });

  test("project manager can update a project", async ({ api, apiProject }) => {
    const updatedName = `${apiProject.name} Updated`;
    const updatedDescription = "Updated through the project API";

    const response = await api.put(`/api/projects/${apiProject.id}`, {
      data: {
        name: updatedName,
        description: updatedDescription,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe(updatedName);
    expect(body.data.description).toBe(updatedDescription);
  });

  test("project manager can delete a project", async ({ api }) => {
    const createResponse = await api.post("/api/projects", {
      data: {
        name: `Delete API Project ${Date.now()}`,
        description: "Project used to verify DELETE behavior",
      },
    });

    expect(createResponse.status()).toBe(201);

    const project = (await createResponse.json()).data;

    // This endpoint is intentionally API-tested because project deletion is
    // supported by the backend but is not exposed as a normal UI workflow.
    const deleteResponse = await api.delete(`/api/projects/${project._id}`);

    expect(deleteResponse.status()).toBe(200);

    const deleteBody = await deleteResponse.json();
    expect(deleteBody.success).toBe(true);

    const getResponse = await api.get(`/api/projects/${project._id}`);
    expect(getResponse.status()).toBe(404);
  });

  test("authenticated user can list tasks for a project", async ({
    api,
    apiProject,
    apiTask,
  }) => {
    const response = await api.get(
      `/api/tasks?projectId=${apiProject.id}`,
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(1);
    expect(
      body.data.some((task: { _id: string }) => task._id === apiTask.id),
    ).toBe(true);
  });

  test("user can retrieve a task by id", async ({ api, apiTask }) => {
    const response = await api.get(`/api/tasks/${apiTask.id}`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data._id).toBe(apiTask.id);
    expect(body.data.title).toBe(apiTask.title);
  });

  test("user can update task details", async ({ api, apiTask }) => {
    const updatedTitle = `${apiTask.title} Updated`;

    const response = await api.put(`/api/tasks/${apiTask.id}`, {
      data: {
        title: updatedTitle,
        description: "Updated by the API test",
        priority: "high",
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data.title).toBe(updatedTitle);
    expect(body.data.priority).toBe("high");
  });

  test("user can update task status through the status endpoint", async ({
    api,
    apiTask,
  }) => {
    const response = await api.patch(`/api/tasks/${apiTask.id}/status`, {
      data: {
        status: "in-progress",
        order: 0,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data._id).toBe(apiTask.id);
    expect(body.data.status).toBe("in-progress");
  });

  test("user can delete a task and receive not found afterwards", async ({
    api,
    apiTask,
  }) => {
    const deleteResponse = await api.delete(`/api/tasks/${apiTask.id}`);

    expect(deleteResponse.status()).toBe(200);

    const deleteBody = await deleteResponse.json();
    expect(deleteBody.success).toBe(true);

    const getResponse = await api.get(`/api/tasks/${apiTask.id}`);
    expect(getResponse.status()).toBe(404);
  });

  test("user search endpoint returns a successful response", async ({ api }) => {
    const response = await api.get(
      `/api/projects/users/search?query=${encodeURIComponent(
        process.env.TEST_USER_EMAIL!.slice(0, 2),
      )}`,
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});
