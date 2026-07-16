import { auth, currentUser } from "@clerk/nextjs/server";

import type { UserModel } from "@/generated/prisma/models";
import { db } from "@/lib/db";

import { toClerkIdentity } from "./clerk-identity";
import { ensureLocalUser } from "./ensure-local-user";

/**
 * The local User row for the signed-in person, or null when nobody is signed in.
 *
 * Read-only: it does not create the row. Use it where "no user" is an ordinary
 * answer, such as a header deciding whether to show an avatar.
 */
export async function getCurrentUser(): Promise<UserModel | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return await db.user.findUnique({ where: { clerkUserId: userId } });
}

/**
 * The local User row for the signed-in person, creating or refreshing it first.
 *
 * This is the sync point: call it from authenticated surfaces that need the row
 * to exist — the Dashboard, and anything that will own Applications by `userId`
 * (docs/product/auth.md requires the row to exist before an Application does).
 *
 * @throws if called without a session. Middleware already redirects anonymous
 * requests, so reaching here unauthenticated means a route escaped the matcher —
 * a bug worth surfacing, not papering over with a null.
 */
export async function requireCurrentUser(): Promise<UserModel> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error(
      "requireCurrentUser() called without a Clerk session — is this route covered by middleware?",
    );
  }

  return await ensureLocalUser(toClerkIdentity(clerkUser));
}
