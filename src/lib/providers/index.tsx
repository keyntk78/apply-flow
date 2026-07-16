import { ClerkProvider } from "@clerk/nextjs";

import { LocaleProvider, type Locale } from "@/lib/i18n";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

/**
 * Every client-side provider the app needs, composed once for the root layout.
 * `initialLocale` is resolved on the server from the locale cookie.
 *
 * ClerkProvider sits outermost because <SignIn/>, <UserButton/> and the `useAuth`
 * hooks all read its context; it takes the publishable key from
 * NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY on its own.
 */
export function AppProviders({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ThemeProvider>
        <QueryProvider>
          <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
        </QueryProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export { QueryProvider, ThemeProvider };
