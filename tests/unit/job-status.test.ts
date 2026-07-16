import { describe, expect, it } from "vitest";

import { dictionaries } from "@/lib/i18n";
import {
  JOB_STATUSES,
  PIPELINE_STATUSES,
  STATUS_DOT_CLASS,
  STATUS_TEXT_CLASS,
} from "@/lib/job-status";

describe("job status lifecycle", () => {
  it("matches the order in the product contract", () => {
    // docs/product/overview.md:
    //   Saved -> Preparing -> Applied -> Interview -> Offer -> Rejected
    // Any domain that shows or changes a status must use exactly this set, so
    // this test is the contract, not an implementation detail.
    expect(PIPELINE_STATUSES).toEqual([
      "saved",
      "preparing",
      "applied",
      "interview",
      "offer",
      "rejected",
    ]);
  });

  it("keeps Archived out of the pipeline but inside the status set", () => {
    expect(PIPELINE_STATUSES).not.toContain("archived");
    expect(JOB_STATUSES).toContain("archived");
    expect(JOB_STATUSES).toHaveLength(PIPELINE_STATUSES.length + 1);
  });

  it("gives every pipeline status a colour in both lookups", () => {
    // Tailwind can only see complete literal class names, so a missing entry
    // fails silently as an unstyled dot in the UI.
    for (const status of PIPELINE_STATUSES) {
      expect(STATUS_DOT_CLASS[status], `dot class for ${status}`).toBeTruthy();
      expect(STATUS_TEXT_CLASS[status], `text class for ${status}`).toBeTruthy();
    }
  });

  it("names every status in both languages", () => {
    for (const status of JOB_STATUSES) {
      expect(dictionaries.vi.status[status], `vi label for ${status}`).toBeTruthy();
      expect(dictionaries.en.status[status], `en label for ${status}`).toBeTruthy();
    }
  });
});
