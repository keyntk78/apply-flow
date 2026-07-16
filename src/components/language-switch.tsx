"use client";

import { LOCALES, useLocale, useSetLocale, useT } from "@/lib/i18n";

const LOCALE_LABEL: Record<(typeof LOCALES)[number], string> = {
  vi: "VI",
  en: "EN",
};

/**
 * VI/EN switch. Two languages, so both are always visible — a dropdown would
 * hide half the choice behind a click.
 *
 * Shared rather than owned by marketing: the auth screens need it too, and
 * settings will later (src/features/README.md — lift what two features share).
 *
 * Language as a saved *user* preference belongs to the settings story; this
 * only drives the cookie-backed UI locale.
 */
export function LanguageSwitch() {
  const t = useT();
  const locale = useLocale();
  const setLocale = useSetLocale();

  return (
    <div
      role="group"
      aria-label={t.nav.languageLabel}
      className="flex items-center rounded-full border border-border bg-card p-0.5"
    >
      {LOCALES.map((option) => {
        const isActive = option === locale;

        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={isActive}
            className={`rounded-full px-2.5 py-1 font-mono text-[11px] tracking-wider transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {LOCALE_LABEL[option]}
          </button>
        );
      })}
    </div>
  );
}
