/**
 * The Apply Flow mark: a blue lowercase "a" with a green arrow rising out of it.
 *
 * Drawn as SVG rather than shipped as a raster so it stays sharp at favicon size
 * and picks up the theme's brand tokens in both light and dark.
 *
 * The arrow is the product's promise (an application moving forward) and is the
 * same gesture as the status rail in the hero — mark and hero say one thing.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="af-blue" x1="8" y1="40" x2="38" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--brand-blue)" />
          <stop offset="1" stopColor="var(--brand-blue-bright)" />
        </linearGradient>
      </defs>

      {/* bowl of the "a" */}
      <circle
        cx="19.5"
        cy="28"
        r="10.25"
        fill="none"
        stroke="url(#af-blue)"
        strokeWidth="5.5"
      />

      {/* stem of the "a" */}
      <rect x="27" y="17.5" width="5.5" height="21" rx="2.75" fill="url(#af-blue)" />

      {/* the arrow: sweeps out of the bowl and up to the right */}
      <path
        d="M11.5 32.5c3.8 4.6 11 3 15.8-3.4 2.6-3.5 5.2-7 8.4-10.2"
        fill="none"
        stroke="var(--brand-green)"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <path d="M42 10 39.9 19.2 32.8 12.1Z" fill="var(--brand-green)" />
    </svg>
  );
}
