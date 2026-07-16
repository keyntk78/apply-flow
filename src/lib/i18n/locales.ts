/**
 * Supported UI languages — docs/product/settings.md limits MVP to VI/EN.
 *
 * settings.md delegates the initial default to the implementing story:
 * US-001 chooses Vietnamese, matching the primary audience in
 * docs/product/overview.md.
 */
export const LOCALES = ["vi", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "vi";

/** Read server-side in the root layout so the first paint is already correct. */
export const LOCALE_COOKIE = "apply-flow-locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.includes(value as Locale);
}

/** Parse an untrusted cookie value at the boundary (docs/ARCHITECTURE.md). */
export function parseLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
