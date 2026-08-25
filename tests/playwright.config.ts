import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

export default defineConfig({
  testDir: "./e2e",

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL:
      process.env.PLAYWRIGHT_TEST_BASE_URL ||
      "https://sprint-board-seven-omega.vercel.app",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: true,
  },

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      testMatch: [
        /auth\.spec\.ts/,
        /smoke\.spec\.ts/,
        /unauthenticated\.spec\.ts/,
      ],
    },

    {
      name: "chromium-auth",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      testMatch: [
        /projects\.spec\.ts/,
        /tasks\.spec\.ts/,
        /protected\.spec\.ts/,
      ],
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
      testMatch: [
        /auth\.spec\.ts/,
        /smoke\.spec\.ts/,
        /unauthenticated\.spec\.ts/,
      ],
    },

    {
      name: "firefox-auth",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Firefox"],
        storageState: "playwright/.auth/user.json",
      },
      testMatch: [
        /projects\.spec\.ts/,
        /tasks\.spec\.ts/,
        /protected\.spec\.ts/,
      ],
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
      },
      testMatch: [
        /auth\.spec\.ts/,
        /smoke\.spec\.ts/,
        /unauthenticated\.spec\.ts/,
      ],
    },

    {
      name: "webkit-auth",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Safari"],
        storageState: "playwright/.auth/user.json",
      },
      testMatch: [
        /projects\.spec\.ts/,
        /tasks\.spec\.ts/,
        /protected\.spec\.ts/,
      ],
    },

    {
      name: "api",
      testMatch: /.*api.*\.spec\.ts/,
      use: {
        baseURL:
          process.env.PLAYWRIGHT_TEST_API_URL ||
          "https://sprintboard-api-4qps.onrender.com",
      },
    },
  ],
});
