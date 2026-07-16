import { afterEach, describe, expect, it, vi } from "vitest";

import { getDatabaseUrl, getServerEnv } from "@/lib/env";

/**
 * Environment variables are untrusted input parsed at the boundary
 * (docs/ARCHITECTURE.md). What matters is the failure: a message naming the
 * variable, and never printing its value — one of these is a live credential
 * and the message travels into logs.
 */
const validEnv = {
  DATABASE_URL: "postgresql://applyflow:applyflow@localhost:5433/applyflow?schema=public",
  CLERK_SECRET_KEY: "sk_test_super_secret_value",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_publishable_value",
};

/** Stubs the whole set, so a variable left out of `overrides` reads as absent. */
function stubEnv(overrides: Partial<Record<keyof typeof validEnv, string | undefined>> = {}) {
  const merged = { ...validEnv, ...overrides };

  for (const key of Object.keys(validEnv) as (keyof typeof validEnv)[]) {
    vi.stubEnv(key, merged[key]);
  }
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getServerEnv", () => {
  it("returns the parsed environment when everything is present", () => {
    stubEnv();

    expect(getServerEnv()).toEqual(validEnv);
  });

  it("names the missing variable", () => {
    stubEnv({ DATABASE_URL: undefined });

    expect(() => getServerEnv()).toThrow(/DATABASE_URL/);
  });

  it("names every problem at once, not just the first", () => {
    // Fixing one variable per run-and-fail cycle is the thing this avoids.
    stubEnv({ CLERK_SECRET_KEY: undefined, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: undefined });

    expect(() => getServerEnv()).toThrow(/CLERK_SECRET_KEY[\s\S]*NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/);
  });

  it("never puts a variable's value in the error message", () => {
    // The message is logged. A secret in it is a leak, however malformed.
    stubEnv({ CLERK_SECRET_KEY: "pk_wrong_key_pasted_here" });

    expect(() => getServerEnv()).toThrow(
      expect.objectContaining({
        message: expect.not.stringContaining("pk_wrong_key_pasted_here") as unknown as string,
      }),
    );
  });

  it("catches the swapped Clerk keys", () => {
    // The common paste mistake; without the prefix check it surfaces as an
    // opaque 401 from Clerk instead.
    stubEnv({
      CLERK_SECRET_KEY: validEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: validEnv.CLERK_SECRET_KEY,
    });

    expect(() => getServerEnv()).toThrow(/should start with 'sk_'/);
  });

  it("accepts both postgres:// and postgresql://", () => {
    // Neon hands out one, docker-compose the other.
    stubEnv({ DATABASE_URL: "postgres://applyflow:applyflow@localhost:5433/applyflow" });

    expect(getServerEnv().DATABASE_URL).toMatch(/^postgres:\/\//);
  });

  it("rejects a database URL that is not Postgres", () => {
    stubEnv({ DATABASE_URL: "mysql://applyflow:applyflow@localhost:3306/applyflow" });

    expect(() => getServerEnv()).toThrow(/DATABASE_URL/);
  });
});

describe("getDatabaseUrl", () => {
  it("works with no Clerk keys at all", () => {
    // The reason it exists: db tests connect to Postgres without a Clerk account.
    stubEnv({ CLERK_SECRET_KEY: undefined, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: undefined });

    expect(getDatabaseUrl()).toBe(validEnv.DATABASE_URL);
  });

  it("points at `pnpm db:up` when the URL is missing", () => {
    stubEnv({ DATABASE_URL: undefined });

    expect(() => getDatabaseUrl()).toThrow(/pnpm db:up/);
  });

  it("rejects a non-Postgres URL", () => {
    stubEnv({ DATABASE_URL: "not-a-url" });

    expect(() => getDatabaseUrl()).toThrow(/DATABASE_URL/);
  });
});
