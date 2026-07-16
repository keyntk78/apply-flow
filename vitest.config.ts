import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Two projects, because docs/TEST_MATRIX.md treats the proof layers as distinct
 * evidence and the harness records them as separate columns:
 *
 *   unit         pure domain and application rules — no DOM, no I/O
 *   integration  components wired together, data access, provider behavior
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
    ],
  },
});
