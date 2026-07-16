import { z } from "zod";

/**
 * Environment variables are untrusted input, so they get parsed at the boundary
 * like any other (docs/ARCHITECTURE.md). The point is failing at startup with a
 * message naming the missing variable, instead of failing later as
 * `PrismaClientInitializationError` or a Clerk redirect loop that looks like a
 * bug in our code.
 */
const serverEnvSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),

  // Clerk's own key formats. Checking the prefix catches the common mistake of
  // swapping the two keys, which otherwise surfaces as an opaque 401 from Clerk.
  CLERK_SECRET_KEY: z
    .string()
    .min(1, "Missing CLERK_SECRET_KEY — see .env.example")
    .startsWith("sk_", "CLERK_SECRET_KEY should start with 'sk_'"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY — see .env.example")
    .startsWith("pk_", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY should start with 'pk_'"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Parses and returns the server environment.
 *
 * Deliberately a function rather than a module-level `export const env = parse()`:
 * `next build` imports modules without a runtime environment, so parsing at
 * import time would fail the build on a machine that has no `.env` — including
 * CI, where the build step legitimately has no database.
 *
 * `NEXT_PUBLIC_*` is read through a literal property access because Next.js
 * inlines those at build time by matching the source text; `process.env[key]`
 * with a computed key would read as undefined in a client bundle.
 */
export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  });

  if (!parsed.success) {
    // Only names and rules are printed. Never the values: this message travels
    // into logs, and one of these is a live credential.
    const problems = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Invalid environment variables:\n${problems}\n\nCopy .env.example to .env and fill it in.`,
    );
  }

  return parsed.data;
}

/**
 * The database URL alone, for code that needs no Clerk keys — notably
 * integration tests, which must connect to Postgres without a Clerk account.
 */
export function getDatabaseUrl(): string {
  const url = z
    .url({ protocol: /^postgres(ql)?$/ })
    .safeParse(process.env.DATABASE_URL);

  if (!url.success) {
    throw new Error(
      "Invalid or missing DATABASE_URL. Run `pnpm db:up`, then copy .env.example to .env.",
    );
  }

  return url.data;
}
