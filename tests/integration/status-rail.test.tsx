import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StatusRail } from "@/features/marketing/components/status-rail";
import { LocaleProvider, dictionaries } from "@/lib/i18n";
import { PIPELINE_STATUSES } from "@/lib/job-status";

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function renderRail(locale: "vi" | "en" = "vi") {
  return render(
    <LocaleProvider initialLocale={locale}>
      <StatusRail />
    </LocaleProvider>,
  );
}

/** The rail advances on an interval, so the timer flush has to be act()-wrapped. */
function tick(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("StatusRail", () => {
  it("shows every status in the lifecycle", () => {
    mockReducedMotion(false);
    renderRail();

    for (const status of PIPELINE_STATUSES) {
      expect(
        screen.getAllByText(dictionaries.vi.status[status]).length,
        `${status} should appear on the rail`,
      ).toBeGreaterThan(0);
    }
  });

  it("advances the application through the pipeline over time", () => {
    mockReducedMotion(false);
    vi.useFakeTimers();
    renderRail();

    const chip = () => screen.getByRole("status");
    expect(chip()).toHaveTextContent(dictionaries.vi.status.saved);

    tick(1600);
    expect(chip()).toHaveTextContent(dictionaries.vi.status.preparing);

    tick(1600);
    expect(chip()).toHaveTextContent(dictionaries.vi.status.applied);
  });

  it("loops back to the start after reaching Offer", () => {
    mockReducedMotion(false);
    vi.useFakeTimers();
    renderRail();

    // saved -> preparing -> applied -> interview -> offer
    tick(1600 * 4);
    expect(screen.getByRole("status")).toHaveTextContent(dictionaries.vi.status.offer);

    tick(1600);
    expect(screen.getByRole("status")).toHaveTextContent(dictionaries.vi.status.saved);
  });

  it("never advances past Offer into Rejected", () => {
    // The rail lists Rejected because the contract includes it, but the demo
    // must not claim an application ends there.
    mockReducedMotion(false);
    vi.useFakeTimers();
    renderRail();

    for (let step = 0; step < 12; step++) {
      tick(1600);
      expect(screen.getByRole("status")).not.toHaveTextContent(
        dictionaries.vi.status.rejected,
      );
    }
  });

  it("rests on a filled-in mid-pipeline state when motion is reduced", () => {
    // Regression: the dots were compared against the animated step while the
    // chip used the resting step, so reduced-motion users saw "Interview" with
    // an entirely empty rail.
    mockReducedMotion(true);
    vi.useFakeTimers();
    renderRail();

    expect(screen.getByRole("status")).toHaveTextContent(dictionaries.vi.status.interview);

    tick(10_000);
    expect(screen.getByRole("status")).toHaveTextContent(dictionaries.vi.status.interview);
  });

  it("renders in English when the locale is English", () => {
    mockReducedMotion(false);
    renderRail("en");

    expect(screen.getByText(dictionaries.en.rail.caption)).toBeInTheDocument();
    expect(screen.queryByText(dictionaries.vi.rail.caption)).not.toBeInTheDocument();
  });
});
