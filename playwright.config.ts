import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "on",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "Desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } },
      testIgnore: ["**/mobile.spec.ts"],
    },
    {
      name: "Mobile",
      use: { ...devices["Pixel 5"], viewport: { width: 375, height: 812 } },
      testMatch: ["**/mobile.spec.ts"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
