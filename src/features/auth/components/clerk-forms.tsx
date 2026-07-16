"use client";

import { SignIn, SignUp } from "@clerk/nextjs";

/**
 * Clerk's hosted forms, mounted into AuthShell's slot.
 *
 * These wrappers exist so the pages stay free of Clerk configuration and so the
 * appearance is set in exactly one place. They render no inputs of their own —
 * every credential stays inside Clerk's component
 * (docs/decisions/0008-clerk-authentication.md).
 */

/**
 * Strips Clerk's own card so AuthShell's heading, border and spacing show
 * through instead of nesting a second card inside the first.
 *
 * Only layout. Matching Clerk's palette to the theme toggle is left alone
 * deliberately: it needs Clerk's `baseTheme` (a separate @clerk/themes package),
 * and US-000 is about authentication working, not about the form's colors in
 * dark mode. Worth a follow-up once the keys are in and the form can be seen.
 */
const appearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none border-none",
    card: "bg-transparent shadow-none p-0",
    header: "hidden",
    footer: "hidden",
  },
};

export function ClerkSignInForm() {
  return (
    <SignIn
      appearance={appearance}
      // Where Clerk sends people afterwards. docs/product/auth.md: straight to
      // the Dashboard, no interstitial.
      forceRedirectUrl="/dashboard"
      signUpUrl="/sign-up"
    />
  );
}

export function ClerkSignUpForm() {
  return (
    <SignUp appearance={appearance} forceRedirectUrl="/dashboard" signInUrl="/sign-in" />
  );
}
