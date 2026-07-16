import { LocaleProvider, type Locale } from "@/lib/i18n";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

/**
 * Every client-side provider the app needs, composed once for the root layout.
 * `initialLocale` is resolved on the server from the locale cookie.
 */
export function AppProviders({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export { QueryProvider, ThemeProvider };
