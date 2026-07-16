import "server-only";

// Public API of the "auth" feature — the server-only half.
//
// Split from "@/features/auth" so that the Prisma client and the Clerk secret
// key can never be pulled into a browser bundle by a component that just wanted
// <AuthShell>. The `server-only` import above turns that mistake into a build
// error naming this file, instead of a runtime failure in the browser.
export { toClerkIdentity, type ClerkIdentity } from "./services/clerk-identity";
export { ensureLocalUser } from "./services/ensure-local-user";
export { getCurrentUser, requireCurrentUser } from "./services/get-current-user";
