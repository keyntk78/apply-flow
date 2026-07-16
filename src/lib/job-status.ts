/**
 * The job status lifecycle — docs/product/overview.md.
 *
 *   Saved -> Preparing -> Applied -> Interview -> Offer -> Rejected
 *
 * plus `archived`, a terminal state kept off the pipeline chain.
 *
 * Shared, not owned by a feature: applications, kanban and dashboard all render
 * this same set, and overview.md requires every domain that shows or changes a
 * status to use exactly these values.
 *
 * This is display/reference data only. When the applications domain lands it
 * gains real behavior (transitions, persistence) — US-001 only reads the names.
 */
export const PIPELINE_STATUSES = [
  "saved",
  "preparing",
  "applied",
  "interview",
  "offer",
  "rejected",
] as const;

export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

export const JOB_STATUSES = [...PIPELINE_STATUSES, "archived"] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

/**
 * Static class lookup per status — Tailwind only sees class names it can find
 * as complete literals, so these cannot be built by interpolation.
 */
export const STATUS_DOT_CLASS: Record<PipelineStatus, string> = {
  saved: "bg-st-saved",
  preparing: "bg-st-preparing",
  applied: "bg-st-applied",
  interview: "bg-st-interview",
  offer: "bg-st-offer",
  rejected: "bg-st-rejected",
};

export const STATUS_TEXT_CLASS: Record<PipelineStatus, string> = {
  saved: "text-st-saved",
  preparing: "text-st-preparing",
  applied: "text-st-applied",
  interview: "text-st-interview",
  offer: "text-st-offer",
  rejected: "text-st-rejected",
};
