"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useStore } from "zustand";

import { dictionaries, type Dictionary } from "./dictionaries";
import { createLocaleStore, type LocaleState, type LocaleStore } from "./locale-store";
import type { Locale } from "./locales";

const LocaleStoreContext = createContext<LocaleStore | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  // Lazy useState, not useRef: the store must be created exactly once per
  // provider, and reading a ref during render is not allowed.
  const [store] = useState(() => createLocaleStore(initialLocale));

  return (
    <LocaleStoreContext.Provider value={store}>
      <HtmlLangSync />
      {children}
    </LocaleStoreContext.Provider>
  );
}

/** The server renders <html lang>; keep it truthful after a client-side switch. */
function HtmlLangSync() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}

function useLocaleStore<T>(selector: (state: LocaleState) => T): T {
  const store = useContext(LocaleStoreContext);

  if (!store) {
    throw new Error("useLocale must be used inside <LocaleProvider>");
  }

  return useStore(store, selector);
}

export function useLocale(): Locale {
  return useLocaleStore((state) => state.locale);
}

export function useSetLocale(): (locale: Locale) => void {
  return useLocaleStore((state) => state.setLocale);
}

/** The copy for the active language. */
export function useT(): Dictionary {
  return dictionaries[useLocale()];
}
