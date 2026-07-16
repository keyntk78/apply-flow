import "dotenv/config";
import { execSync } from "node:child_process";

/**
 * Applies migrations to the test database.
 *
 * Exists because the Prisma CLI takes its datasource from prisma.config.ts,
 * which reads DATABASE_URL — there is no `--database-url` flag to point one
 * command somewhere else. Overriding the variable for a child process is the
 * way to migrate a second database without editing .env back and forth.
 */
const url = process.env.TEST_DATABASE_URL;

if (!url) {
  throw new Error("TEST_DATABASE_URL is not set. Copy .env.example to .env.");
}

// A fixed command string, not execFileSync(..., { shell: true }): passing args
// alongside `shell` is deprecated (DEP0190) because they get concatenated
// unescaped. Nothing here is interpolated.
execSync("prisma migrate deploy", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
});
