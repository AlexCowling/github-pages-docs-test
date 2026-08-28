import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const BASE_PATH = "/github-pages-docs-test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",

  use: {
    // Trailing slash matters: relative goto() paths resolve against it, so
    // without it every navigation would drop the base path and 404.
    baseURL: `http://127.0.0.1:${PORT}${BASE_PATH}/`,
    trace: "on-first-retry",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // Runs against the built _site, the same bytes the deploy uploads, rather
  // than a dev server that could behave differently.
  webServer: {
    command: "node scripts/serve-site.mjs",
    url: `http://127.0.0.1:${PORT}${BASE_PATH}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
