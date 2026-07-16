"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Light / Dark / System, driven by the theme toggle.
 *
 * `class` strategy: next-themes puts `.dark` on <html>, which is the variant
 * globals.css defines. It also writes the choice before first paint, so a dark
 * user never gets a white flash.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
