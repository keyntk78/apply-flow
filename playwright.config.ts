// Playwright does not read .env the way Next.js does, and global-setup needs the
// Clerk keys before the first worker starts.
import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

const PORT = 3210;
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * E2E proof — user-visible browser flows (docs/TEST_MATRIX.md).
 *
 * Runs against a production build: the locale cookie is read in the root layout
 * on the server, and `next dev` behaves differently enough around caching and
 * hydration that dev-only passes would not be honest evidence.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
