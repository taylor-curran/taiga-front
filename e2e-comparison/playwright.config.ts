import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  retries: 0,
  use: {
    headless: true,
    screenshot: "on",
    video: "on",
  },
  reporter: [["html", { open: "never" }], ["list"]],
  projects: [
    {
      name: "angular",
      use: { baseURL: "http://localhost:9000" },
    },
    {
      name: "react",
      use: { baseURL: "http://localhost:5173" },
    },
  ],
});
