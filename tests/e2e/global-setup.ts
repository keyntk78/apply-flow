import { clerkSetup } from "@clerk/testing/playwright";

/**
 * Fetches a Clerk Testing Token and puts it in the environment the workers
 * inherit.
 *
 * Without it, Clerk's bot protection sees an automated browser and blocks
 * sign-up — the flow fails for a reason that has nothing to do with our code.
 *
 * Missing keys are not an error here: the landing and theme specs need no Clerk
 * account, and auth.spec.ts skips itself rather than failing the run.
 */
export default async function globalSetup() {
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return;
  }

  await clerkSetup({ publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY });
}
