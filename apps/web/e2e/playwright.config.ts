import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env['E2E_BASE_URL'] ?? "http://localhost:18080";

export default defineConfig({
  testDir: ".",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: process.env['CI'] ? 1 : 2,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env['CI']
    ? [["list"], ["junit", { outputFile: "test-results/junit.xml" }], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "en-US",
    timezoneId: "UTC",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "smoke",
      testMatch: /smoke\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
      fullyParallel: false,
    },
    {
      name: "brewday",
      testMatch: /brewday\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
