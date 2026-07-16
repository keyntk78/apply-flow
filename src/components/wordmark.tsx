import Link from "next/link";

import { LogoMark } from "./logo-mark";

/**
 * The Apply Flow logo lockup. Shared by the marketing header and the auth shell.
 *
 * Two-tone wordmark straight from the brand: "apply" in navy, "flow" in the
 * mark's blue. In dark mode --brand-navy resolves light, so the split stays
 * readable without a second lockup.
 */
export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Apply Flow"
      className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
    >
      <LogoMark className="size-7" />
      <span className="font-display text-[17px] font-bold lowercase tracking-tight">
        <span className="text-brand-navy">apply</span>
        <span className="text-brand-blue"> flow</span>
      </span>
    </Link>
  );
}
