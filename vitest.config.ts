import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Three projects, because docs/TEST_MATRIX.md treats the proof layers as distinct
 * evidence and the harness records them as separate columns:
 *
 *   unit         pure domain and application rules — no DOM, no I/O
 *   integration  components wired together, provider behavior — jsdom
 *   db           real Postgres, real Prisma — Node, no DOM
 *
 * `db` is separate from `integration` rather than a folder inside it because the
 * two need opposite environments: the integration setup touches `window`, which
 * does not exist in the Node environment Prisma requires. Both count as
 * integration proof when reporting to the harness.
 *
 * E2E lives in Playwright (playwright.config.ts), not here.
 */
export default defineConfig({
  plugins: [react()],
  // Resolves the "@/*" alias from tsconfig.json natively — no plugin needed.
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/unit/**/*.test.{ts,tsx}"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "jsdom",
          setupFiles: ["./tests/setup/integration.setup.ts"],
          include: ["tests/integration/**/*.test.{ts,tsx}"],
        },
      },
      {
        extends: true,
        test: {
          name: "db",
          environment: "node",
          setupFiles: ["./tests/setup/db.setup.ts"],
          include: ["tests/db/**/*.test.ts"],
          // One connection pool, one database: parallel files would truncate
          // each other's rows mid-test.
          fileParallelism: false,
        },
      },
    ],
  },
});
