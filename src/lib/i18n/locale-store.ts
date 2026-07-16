import { createStore } from "zustand/vanilla";

import { LOCALE_COOKIE, type Locale } from "./locales";

export type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * One store per request, created by <LocaleProvider>.
 *
 * Deliberately not a module-level store: on the server a module singleton is
 * shared across concurrent requests, which would leak one visitor's language
 * into another's render.
 *
 * The choice persists to a cookie rather than localStorage so the server can
 * read it in the root layout and render the correct language on first paint.
 */
export function createLocaleStore(initialLocale: Locale) {
  return createStore<LocaleState>()((set) => ({
    locale: initialLocale,
    setLocale: (locale) => {
      document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${ONE_YEAR_SECONDS};samesite=lax`;
      set({ locale });
    },
  }));
}

export type LocaleStore = ReturnType<typeof createLocaleStore>;
