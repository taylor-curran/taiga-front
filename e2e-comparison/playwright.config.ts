import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  retries: 0,
  use: {
    browserName: "chromium",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  reporter: [["list"], ["html", { open: "never", outputFolder: "artifacts/html-report" }]],
  projects: [
    {
      name: "angular",
      use: {
        baseURL: "http://localhost:9000",
      },
    },
    {
      name: "react",
      use: {
        baseURL: "http://localhost:5173",
      },
    },
  ],
});
