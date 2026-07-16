"use client";

import Link from "next/link";

import { LanguageSwitch } from "@/components/language-switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export function SiteHeader() {
  const t = useT();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5 sm:px-8">
        <Wordmark />

        <nav className="flex items-center gap-1.5 sm:gap-2.5">
          <LanguageSwitch />
          <ThemeToggle />

          <Button
            variant="ghost"
            size="lg"
            className="hidden rounded-full px-3.5 text-muted-foreground sm:inline-flex"
            render={<Link href="/sign-in">{t.nav.signIn}</Link>}
          />

          <Button
            size="lg"
            className="rounded-full px-4"
            render={<Link href="/sign-up">{t.nav.signUp}</Link>}
          />
        </nav>
      </div>
    </header>
  );
}
