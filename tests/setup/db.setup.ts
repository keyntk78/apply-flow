// Vitest does not read .env the way Next.js does, so load it explicitly.
import "dotenv/config";

/**
 * Repoints the Prisma singleton at the throwaway test database.
 *
 * This runs before any test file is imported, which matters: `@/lib/db` reads
 * DATABASE_URL when the module is first evaluated, so setting it afterwards
 * would be too late — and the tests would truncate the database you develop
 * against instead.
 */
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL is not set. Copy .env.example to .env, then run `pnpm db:up`.",
  );
}

if (testDatabaseUrl === process.env.DATABASE_URL) {
  // A copy-paste slip here is unrecoverable: the suite truncates User on every
  // run. Refusing is cheaper than restoring a developer's local data.
  throw new Error(
    "TEST_DATABASE_URL must not equal DATABASE_URL — these tests wipe the database they run against.",
  );
}

process.env.DATABASE_URL = testDatabaseUrl;
