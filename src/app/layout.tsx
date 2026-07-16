import type { Metadata } from "next";
import { Be_Vietnam_Pro, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";

import { LOCALE_COOKIE, parseLocale } from "@/lib/i18n";
import { AppProviders } from "@/lib/providers";
import { cn } from "@/lib/utils";

import "./globals.css";

/*
 * Every face here ships the `vietnamese` subset. That rules out Geist, which
 * `shadcn init` wires in by default: it has no Vietnamese glyphs, so Vietnamese
 * text set in it falls back to a system font mid-sentence.
 */

// Display: carries the product's voice in headlines, used sparingly.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

// Body: drawn for Vietnamese diacritics rather than retrofitted for them.
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Mono is not decoration here: it marks anything that is tracker data.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Apply Flow — Quản lý ứng tuyển",
  description:
    "Lưu job bạn quan tâm, theo dõi từng đơn qua sáu trạng thái, và giữ ghi chú ngay cạnh đơn — thay cho file Excel bạn đang dùng.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve the language on the server so the first paint is already correct;
  // an untrusted cookie is parsed at the boundary (docs/ARCHITECTURE.md).
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return (
    // suppressHydrationWarning: next-themes sets the `class` and `style` on
    // <html> before React hydrates, so the server markup intentionally differs.
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "h-full",
        bricolage.variable,
        beVietnamPro.variable,
        jetbrainsMono.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <AppProviders initialLocale={locale}>{children}</AppProviders>
      </body>
    </html>
  );
}
