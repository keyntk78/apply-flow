'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

import { useT } from '@/lib/i18n';
import {
  PIPELINE_STATUSES,
  STATUS_DOT_CLASS,
  STATUS_TEXT_CLASS,
  type PipelineStatus,
} from '@/lib/job-status';

/** How long one application rests in each status before advancing, in ms. */
const STEP_MS = 1600;

/**
 * The demo advances Saved -> Offer and loops. `rejected` is on the rail because
 * the lifecycle contract includes it, but the demo never lands there: the rail
 * shows the real set of statuses, not a promise about outcomes.
 */
const LAST_DEMO_STEP = PIPELINE_STATUSES.indexOf('offer');

/** Where the rail sits when the visitor asked for reduced motion. */
const RESTING_STEP = PIPELINE_STATUSES.indexOf('interview');

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/**
 * Subscribes to the OS motion preference.
 *
 * useSyncExternalStore rather than useState+useEffect: the media query is
 * external state, so React reads it directly instead of us mirroring it into
 * state on mount (which renders once with a wrong value, then re-renders).
 */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false, // server: assume motion is fine, the client corrects on hydrate
  );
}

/**
 * Signature element: one application walking its own lifecycle.
 *
 * The status lifecycle is the product, so the hero demonstrates it rather than
 * describing it — and it's the same rising gesture as the logo's arrow.
 * Everything else on the page stays still.
 */
export function StatusRail() {
  const t = useT();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setStep((current) => (current >= LAST_DEMO_STEP ? 0 : current + 1));
    }, STEP_MS);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  // Derived, not stored: with reduced motion the rail rests on a mid-pipeline
  // status — still a truthful snapshot, just not animated.
  const currentStep = prefersReducedMotion ? RESTING_STEP : step;
  const activeStatus: PipelineStatus = PIPELINE_STATUSES[currentStep];
  const progress = (currentStep / LAST_DEMO_STEP) * 100;

  return (
    <figure className="mt-14 sm:mt-16">
      <figcaption className="data-label mb-3 text-muted-foreground">
        {t.rail.caption}
      </figcaption>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-7">
        {/* The application itself */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold tracking-tight text-card-foreground">
              {t.rail.demoRole}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t.rail.demoCompany} · {t.rail.demoMeta}
            </p>
          </div>

          <div className="text-right">
            <p className="data-label text-muted-foreground">
              {t.rail.deadlineLabel}
            </p>
            <p className="font-mono text-sm text-card-foreground">
              {t.rail.deadlineValue}
            </p>
          </div>
        </div>

        {/* Its current status. aria-live so the loop is announced, not just seen. */}
        <div className="mt-5" role="status" aria-live="polite" aria-atomic="true">
          <span
            className={`inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 font-mono text-xs ${STATUS_TEXT_CLASS[activeStatus]}`}
          >
            <span
              className={`size-1.5 rounded-full ${STATUS_DOT_CLASS[activeStatus]}`}
            />
            {t.status[activeStatus]}
          </span>
        </div>

        {/* The rail */}
        <div className="mt-7">
          <div className="relative">
            <div
              className="absolute inset-x-0 top-[5px] h-px bg-border"
              aria-hidden
            />
            <div
              aria-hidden
              className="absolute top-[5px] left-0 h-px bg-primary transition-[width] duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />

            <ol className="relative flex justify-between">
              {PIPELINE_STATUSES.map((status, index) => {
                const reached = index <= currentStep;

                return (
                  <li
                    key={status}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2 first:items-start last:items-end"
                  >
                    <span
                      className={`size-2.5 rounded-full border-2 transition-colors duration-500 ${
                        reached
                          ? `${STATUS_DOT_CLASS[status]} border-transparent`
                          : 'border-border bg-card'
                      }`}
                    />
                    <span
                      className={`text-center font-mono text-[9px] leading-tight tracking-tight transition-colors duration-500 sm:text-[11px] ${
                        reached
                          ? 'text-card-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {t.status[status]}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <p className="mt-5 font-mono text-[11px] text-muted-foreground">
            {t.rail.note}
          </p>
        </div>
      </div>
    </figure>
  );
}
