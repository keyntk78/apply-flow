import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { ensureLocalUser } from "@/features/auth/services/ensure-local-user";
import { db } from "@/lib/db";

/**
 * Real Postgres, real Prisma, real constraints — the schema decisions in
 * docs/.../US-000-clerk-auth/design.md are only true if the database enforces
 * them, which a mocked client could not show.
 *
 * Requires `pnpm db:up` and `pnpm db:migrate:test`.
 */
describe("ensureLocalUser", () => {
  const identity = {
    clerkUserId: "user_test_1",
    email: "mai@example.com",
    fullName: "Mai Nguyễn",
    avatarUrl: "https://img.clerk.com/a.png",
  };

  beforeEach(async () => {
    await db.user.deleteMany();
  });

  afterAll(async () => {
    await db.user.deleteMany();
    await db.$disconnect();
  });

  it("creates the local row on first sign-in", async () => {
    const user = await ensureLocalUser(identity);

    expect(user.id).toBeTruthy();
    expect(user.clerkUserId).toBe("user_test_1");
    expect(user.email).toBe("mai@example.com");
    expect(user.fullName).toBe("Mai Nguyễn");
  });

  it("is idempotent — a second call returns the same row, not a duplicate", async () => {
    // This runs on every authenticated request, so it must not accumulate rows.
    const first = await ensureLocalUser(identity);
    const second = await ensureLocalUser(identity);

    expect(second.id).toBe(first.id);
    expect(await db.user.count()).toBe(1);
  });

  it("refreshes profile fields that changed in Clerk", async () => {
    const first = await ensureLocalUser(identity);
    const updated = await ensureLocalUser({
      ...identity,
      fullName: "Mai Trần",
      avatarUrl: "https://img.clerk.com/new.png",
    });

    expect(updated.id).toBe(first.id);
    expect(updated.fullName).toBe("Mai Trần");
    expect(updated.avatarUrl).toBe("https://img.clerk.com/new.png");
  });

  it("keeps createdAt from the first sign-in while advancing updatedAt", async () => {
    const first = await ensureLocalUser(identity);
    const second = await ensureLocalUser({ ...identity, fullName: "Đổi tên" });

    expect(second.createdAt.getTime()).toBe(first.createdAt.getTime());
    expect(second.updatedAt.getTime()).toBeGreaterThanOrEqual(first.updatedAt.getTime());
  });

  it("clears a name that was removed in Clerk", async () => {
    await ensureLocalUser(identity);
    const cleared = await ensureLocalUser({ ...identity, fullName: null, avatarUrl: null });

    // Null must win over "keep what we had", or the profile would show a name
    // the person already deleted upstream.
    expect(cleared.fullName).toBeNull();
    expect(cleared.avatarUrl).toBeNull();
  });

  it("allows two Clerk identities to share an email address", async () => {
    // The reason email carries an index and not a unique constraint. Clerk owns
    // email uniqueness; a constraint here would turn this into a failed sign-in.
    await ensureLocalUser(identity);
    const other = await ensureLocalUser({ ...identity, clerkUserId: "user_test_2" });

    expect(other.clerkUserId).toBe("user_test_2");
    expect(await db.user.count()).toBe(2);
  });

  it("survives concurrent first sign-ins without duplicating or throwing", async () => {
    // A new user opening several pages at once: both requests see "no row" and
    // both insert. One loses on the unique index, and must recover rather than
    // surface a P2002 as a broken sign-in.
    const results = await Promise.all([
      ensureLocalUser(identity),
      ensureLocalUser(identity),
      ensureLocalUser(identity),
    ]);

    expect(await db.user.count()).toBe(1);
    expect(new Set(results.map((user) => user.id)).size).toBe(1);
  });

  it("enforces the unique constraint on clerkUserId", async () => {
    await ensureLocalUser(identity);

    await expect(
      db.user.create({
        data: { clerkUserId: identity.clerkUserId, email: "someone.else@example.com" },
      }),
    ).rejects.toThrow();
  });
});
