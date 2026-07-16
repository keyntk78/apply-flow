import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Route protection.
 *
 * The file is `proxy.ts`, not `middleware.ts`: Next.js 16 renamed the convention
 * and warns on the old name. Clerk's docs still say middleware.ts, and
 * `clerkMiddleware` keeps its name — only the file moved.
 *
 * The public surface comes straight from docs/product/auth.md: Landing, Pricing,
 * Login, Register. Everything else requires a session.
 *
 * This list is an allowlist, so a new route is protected by default — forgetting
 * to add one here locks it down rather than exposing it.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    // Redirects anonymous visitors to sign-in rather than throwing a 401
    // (docs/.../US-000-clerk-auth/design.md: "redirect, not 500").
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Everything except Next.js internals and static files, unless a file is
    // requested through a search param.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
