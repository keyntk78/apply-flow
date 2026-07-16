# Product Docs

This directory is intentionally generic and mostly empty in Harness v0.

When a user provides a project spec, derive smaller product contract files here
instead of keeping one large spec as the living plan. Name files by the product
domains that actually exist in that spec, for example `overview.md`,
`billing.md`, `workflows.md`, `permissions.md`, or `api-conventions.md`.

Do not create domain files before the spec just to fill the folder. Empty
structure is healthier than fake product truth.

## Current Product Contracts

Apply Flow MVP contracts, derived from [SPEC.md](../../SPEC.md) (written in
Vietnamese; SPEC remains the source of truth for product decisions):

- [overview.md](overview.md) — product summary, users, shared status lifecycle.
- [auth.md](auth.md) — Clerk authentication + local User record.
- [applications.md](applications.md) — core Job Application CRUD/search/filter.
- [dashboard.md](dashboard.md) — status totals + recent + near-deadline.
- [kanban.md](kanban.md) — status columns + drag-drop rules.
- [settings.md](settings.md) — theme + language preferences.

Marketing screens (Landing, Pricing) are copy-only and have no contract yet.

## Update Rule

When behavior changes:

1. Update the affected product doc.
2. Update or create the story packet.
3. Update durable proof status with `scripts/bin/harness-cli story add` or
   `scripts/bin/harness-cli story update`.
4. Record a decision if the change affects architecture, scope, risk, or a
   previously settled product rule.
