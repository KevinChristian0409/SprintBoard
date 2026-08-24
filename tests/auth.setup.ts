import {
  expect,
  request as playwrightRequest,
  test as setup,
} from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  const apiUrl =
    process.env.PLAYWRIGHT_TEST_API_URL ||
    "https://sprintboard-api-4qps.onrender.com";

  const api = await playwrightRequest.newContext({
    baseURL: apiUrl,
    extraHTTPHeaders: {
      "Content-Type": "application/json",
    },
  });

  try {
    // Authenticate once through the API so the protected UI suite can reuse
    // the same session instead of logging in before every test.
    const response = await api.post("/api/auth/login", {
      data: {
        email: process.env.TEST_USER_EMAIL,
        password: process.env.TEST_USER_PASSWORD,
      },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    const token = body.data?.token || body.token;

    if (!token) {
      throw new Error("Login response did not contain an authentication token.");
    }

    // The API returns the JWT; its payload contains the user's ID and role.
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
    );

    const user =
      body.data?.user ||
      body.user || {
        _id: payload.id,
        role: payload.role,
      };

    await page.goto("/login");

    await page.evaluate(
      ({ authToken, authUser }) => {
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(authUser));
      },
      { authToken: token, authUser: user },
    );

    // Reload the protected route so AuthProvider initializes from storage.
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.context().storageState({ path: authFile });
  } finally {
    await api.dispose();
  }
});
