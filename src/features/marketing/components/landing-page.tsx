"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { StatusRail } from "./status-rail";

export function LandingPage() {
  const t = useT();

  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <section className="mx-auto max-w-5xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28">
          <p className="data-label text-primary">{t.hero.eyebrow}</p>

          <h1 className="display-xl mt-5 max-w-3xl text-balance">{t.hero.title}</h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {t.hero.body}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-11 rounded-full px-6"
              render={<Link href="/sign-up">{t.hero.ctaPrimary}</Link>}
            />
            <Button
              variant="outline"
              size="lg"
              className="h-11 rounded-full px-6"
              render={<Link href="/sign-in">{t.hero.ctaSecondary}</Link>}
            />
          </div>

          <StatusRail />
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-24">
            <p className="data-label text-muted-foreground">{t.features.eyebrow}</p>

            <ul className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-3">
              {t.features.items.map((item) => (
                <li key={item.title}>
                  <h2 className="font-display text-xl font-semibold tracking-tight text-card-foreground">
                    {item.title}
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-24 sm:px-8 sm:py-28">
          <h2 className="display-md max-w-lg text-balance">{t.closing.title}</h2>
          <p className="mt-4 text-muted-foreground">{t.closing.body}</p>
          <Button
            size="lg"
            className="mt-8 h-11 rounded-full px-6"
            render={<Link href="/sign-up">{t.closing.cta}</Link>}
          />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
