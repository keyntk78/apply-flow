"use client";

import { Wordmark } from "@/components/wordmark";
import { useT } from "@/lib/i18n";

export function SiteFooter() {
  const t = useT();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-8 sm:px-8">
        <Wordmark />
        <p className="font-mono text-[11px] text-muted-foreground">{t.footer.tagline}</p>
      </div>
    </footer>
  );
}
