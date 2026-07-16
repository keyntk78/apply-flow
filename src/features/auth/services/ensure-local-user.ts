import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

import type { UserModel } from "@/generated/prisma/models";
import { db } from "@/lib/db";

import type { ClerkIdentity } from "./clerk-identity";

/** Postgres unique-constraint violation, surfaced by Prisma. */
const UNIQUE_VIOLATION = "P2002";

/**
 * Creates the local User row for a Clerk identity, or refreshes it if it exists.
 *
 * This is the lazy sync from docs/.../US-000-clerk-auth/design.md: it runs on an
 * authenticated request rather than from a Clerk webhook, so profile changes made
 * in Clerk land the next time the person uses the app. That is the MVP trade —
 * no public endpoint, no signing secret to hold.
 *
 * Idempotent, and safe to call on every request: the upsert keys on
 * `clerkUserId`, never on `email`.
 */
export async function ensureLocalUser(identity: ClerkIdentity): Promise<UserModel> {
  const fields = {
    email: identity.email,
    fullName: identity.fullName,
    avatarUrl: identity.avatarUrl,
  };

  try {
    return await db.user.upsert({
      where: { clerkUserId: identity.clerkUserId },
      create: { clerkUserId: identity.clerkUserId, ...fields },
      update: fields,
    });
  } catch (error) {
    // A brand-new user whose first visit opens several pages at once gives two
    // requests that both see "no row" and both insert; one loses on the unique
    // index. The loser's row is already exactly what it wanted to write, so an
    // update finishes the job. Rethrowing anything else keeps real failures loud.
    if (error instanceof PrismaClientKnownRequestError && error.code === UNIQUE_VIOLATION) {
      return await db.user.update({
        where: { clerkUserId: identity.clerkUserId },
        data: fields,
      });
    }

    throw error;
  }
}
