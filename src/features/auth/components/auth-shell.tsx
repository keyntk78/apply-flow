"use client";

import Link from "next/link";

import { LanguageSwitch } from "@/components/language-switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { Wordmark } from "@/components/wordmark";
import { useT } from "@/lib/i18n";

export type AuthVariant = "sign-in" | "sign-up";

/**
 * Chrome around the authentication form: branding, heading, the slot the form
 * mounts into, and the link to the opposite screen.
 *
 * It deliberately contains NO authentication:
 *   - no password/email inputs, no submit, no session, no redirect
 *   - no @clerk/nextjs import
 *
 * Clerk owns every credential the product touches
 * (docs/decisions/0008-clerk-authentication.md). US-000 replaces `children`
 * with <SignIn/> / <SignUp/>; nothing else here has to change. Building a
 * lookalike form now would be code we throw away and a security boundary we
 * are not allowed to own.
 */
export function AuthShell({
  variant,
  children,
}: {
  variant: AuthVariant;
  children?: React.ReactNode;
}) {
  const t = useT();
  const copy = variant === "sign-in" ? t.auth.signIn : t.auth.signUp;
  const switchHref = variant === "sign-in" ? "/sign-up" : "/sign-in";

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Wordmark />
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <LanguageSwitch />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <h1 className="display-md text-balance">{copy.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
            {copy.body}
          </p>

          <div className="mt-8">{children ?? <AuthFormSlot />}</div>

          <p className="mt-8 text-sm text-muted-foreground">
            {copy.switchPrompt}{" "}
            <Link
              href={switchHref}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {copy.switchCta}
            </Link>
          </p>

          <p className="mt-10">
            <Link
              href="/"
              className="font-mono text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              ← {t.auth.backHome}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

/** Placeholder for the Clerk form. Says plainly that it is not wired up yet. */
function AuthFormSlot() {
  const t = useT();

  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-6">
      <p className="data-label text-muted-foreground">{t.auth.placeholder.label}</p>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground text-pretty">
        {t.auth.placeholder.body}
      </p>
    </div>
  );
}
