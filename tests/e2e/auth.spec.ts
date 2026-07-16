import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";

/**
 * E2E proof for US-000 (docs/.../US-000-clerk-auth/validation.md).
 *
 * These drive Clerk's real hosted form against a real Clerk test instance, so
 * they need keys. Without them the whole file skips instead of failing: the rest
 * of the suite has nothing to do with auth.
 */
const hasClerkKeys = Boolean(
  process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

test.describe("Route protection", () => {
  test.skip(!hasClerkKeys, "needs Clerk keys in .env — see .env.example");

  test("sends an anonymous visitor from the Dashboard to sign-in", async ({ page }) => {
    // The redirect, not a 401: design.md says "redirect, not 500".
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("keeps the Landing page open to anonymous visitors", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL("/");
  });
});

test.describe("Email sign-up", () => {
  test.skip(!hasClerkKeys, "needs Clerk keys in .env — see .env.example");

  test("registers a new account and lands on the Dashboard", async ({ page }) => {
    // Clerk's bot protection blocks an automated browser without this.
    await setupClerkTestingToken({ page });

    // The `+clerk_test` subaddress is Clerk's test-mode convention: no real
    // inbox, and the verification code is always 424242. A unique local part
    // keeps a re-run from colliding with the account the last run created.
    const email = `e2e_${Date.now()}+clerk_test@applyflow.dev`;

    await page.goto("/sign-up");

    // Clerk's own field names. Preferred over getByLabel here: "Password" also
    // matches the show/hide toggle's aria-label.
    await page.locator('input[name="emailAddress"]').fill(email);
    await page.locator('input[name="password"]').fill(`Fl0w-${Date.now()}!`);
    // `exact`: the Google social button's accessible name also contains
    // "Continue".
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    await page.getByRole("textbox", { name: /verification code/i }).fill("424242");

    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("Google sign-in", () => {
  // Deliberately not automated. Clerk's Google button hands off to Google's own
  // consent screen, which actively blocks automated browsers and cannot be
  // driven with a testing token — Clerk's docs say the same. Proving this needs
  // a manual pass; validation.md tracks it as such rather than pretending a
  // green test covers it.
  test.fixme("signs in with Google and lands on the Dashboard", () => {});
});
