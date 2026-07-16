# Project Memory — Apply Flow

> This file is shared **AI memory**. `CLAUDE.md` and `AGENTS.md` are kept
> **identical** on purpose: any coding agent (Claude Code, Codex, Cursor, …)
> should read either one and understand both *what we are building* and *how we
> are allowed to build it*. If you edit one, mirror the change into the other.

---

## 1. What we are building

**Apply Flow** — a web app that helps job seekers manage their entire job
application process in one place. Users save jobs they care about, track the
status of each application, take notes, and manage their job-search pipeline
through a visual interface. Think "replace the Excel/Google Sheet everyone uses
to track applications."

The MVP (v1.0) is a **job tracker only — no AI yet**. AI features are explicitly
deferred to v2/v3.

Full product spec: [SPEC.md](SPEC.md). SPEC.md is the source of truth for
product decisions; this section is a summary for quick orientation.

### MVP scope (in)
- **Authentication** (Clerk — email + Google).
- **Dashboard** — status totals + recently updated jobs + jobs near deadline
  (no charts in MVP).
- **Job Application CRUD** — the core module (create / edit / delete / search /
  filter / sort).
- **Kanban Board** — drag-and-drop jobs between status columns.
- **Profile** and **Settings** (theme: Light/Dark/System; language: VI/EN).
- ~9 screens total: Landing, Pricing, Login, Register, Dashboard,
  Applications List, Create/Edit Application, Kanban, Profile, Settings.

### Out of MVP scope (future)
AI (job analysis, resume↔JD matching, email/cover-letter generation), CV/resume
management, calendar/reminders, interview management, company management,
browser extension, Gmail/Google Calendar, advanced analytics.

### Job status lifecycle
`Saved → Preparing → Applied → Interview → Offer → Rejected`, plus `Archived`.
These are the Kanban columns.

### Data model (see SPEC §9)
- **User**: id, clerkUserId, email, fullName, avatarUrl, createdAt, updatedAt.
- **Application**: id, userId, title, company, jobUrl, location, salary, status,
  priority, appliedAt, deadline, notes, createdAt, updatedAt.

### Tech stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS, shadcn/ui.
- **Auth**: Clerk.
- **DB**: Neon PostgreSQL + Prisma ORM.
- **Storage**: Vercel Blob (reserved for later versions).
- **Payment**: Stripe (reserved for the Pro plan).
- **Deploy**: Vercel.

### Roadmap direction
- **v1** — a simple, stable job tracker (this MVP).
- **v2** — AI to analyze jobs and generate content.
- **v3** — AI career assistant (skills, CV, career-path analysis).

Priority: nail a smooth application-management experience **before** any AI.

---

## 2. Current repository state

There is **no application code yet**. The repo currently contains only the
`repository-harness` — a repository-level operating harness for coding agents
(agent-facing docs in `docs/`, automation in `scripts/`, and a prebuilt Rust
CLI at `scripts/bin/harness-cli.exe`). Product code, stack folders, and tests
appear only after a spec passes through intake.

Mental model the harness enforces: *the app is what users touch; the harness is
what agents touch.* Before changing anything, the harness answers: what to read
first, what class of work this is, which product contract it affects, how risky
it is, and what proof is required.

---

## 3. The Authority Gate (read before doing anything)

This file (and `AGENTS.md`) is the bounded authority entrypoint. **Classify the
request class before any harness operation** — this decides both what you may
mutate and what you should read:

- **Read-only requests** (answer, explain, review, diagnose, plan, status):
  Inspect only what is needed to respond. Do **not** bootstrap, init/migrate the
  database, record intake, update durable state, or record a trace. Discovery
  does not grant authority — finding a missing migration during a diagnosis does
  not let you create it.
- **Change requests** (change, build, fix, or "review and apply fixes"): First
  bootstrap, then run intake classification, then perform story/proof/trace/
  backlog mutations as the chosen lane requires. Request *outcome*, not a single
  keyword, decides authority.

Full rules: [docs/CONTEXT_RULES.md](docs/CONTEXT_RULES.md) (authority gate,
per-phase reading tables, token budgets) and
[docs/FEATURE_INTAKE.md](docs/FEATURE_INTAKE.md) (lane classification).

---

## 4. Change-Request Workflow

For any change/build/fix request, in order:

1. **Bootstrap the local runtime** (builds/verifies the CLI, initializes the
   ignored `harness.db`):
   - Windows: `.\scripts\bootstrap-harness.ps1`
   - macOS/Linux: `scripts/bootstrap-harness.sh`
2. **Classify via intake** using [docs/FEATURE_INTAKE.md](docs/FEATURE_INTAKE.md):
   pick a lane (tiny / normal / high-risk) using the risk checklist, and record
   the intake row. Any hard gate (auth, authorization, data loss/migration,
   audit/security, external provider, weakening validation) is high-risk unless
   the human explicitly narrows scope.
3. **Query the active work matrix** to see unfinished work needing proof:
   `.\scripts\bin\harness-cli.exe query matrix --active --summary`
4. Retrieve only the lane- and trigger-specific context from
   [docs/CONTEXT_RULES.md](docs/CONTEXT_RULES.md), implement the smallest slice,
   then record proof and a trace.

Lane requirements in brief:

- **Tiny**: record intake, patch directly, keep docs current, run quick checks.
- **Normal**: create/update one story from `docs/templates/story.md`, link
  product docs, record proof with `harness-cli story add`/`story update`.
- **High-risk**: use the `docs/templates/high-risk-story/` folder (overview,
  design, execplan, validation), confirm with the human if ambiguous, and record
  a durable decision in `docs/decisions/NNNN-*.md` + `harness-cli decision add`.

---

## 5. The Harness CLI

The Rust CLI at `scripts/bin/harness-cli.exe` (Windows) /
`scripts/bin/harness-cli` (Unix) is the **primary interface to the durable
layer**. Prefer it over editing durable state by hand. Key commands (see
[scripts/README.md](scripts/README.md) for the full list):

```text
harness-cli init                                  # create harness.db
harness-cli migrate                               # apply pending schema migrations
harness-cli intake ...                            # record a feature-intake classification
harness-cli story add|update|verify|complete ...  # stories + proof lifecycle
harness-cli decision add|verify ...               # durable decisions
harness-cli backlog add|close ...                 # improvement items
harness-cli trace ... / score-trace               # execution traces (see docs/TRACE_SPEC.md)
harness-cli query matrix|backlog|decisions|intakes|traces|stats|sql ...
```

Command semantics that are easy to get wrong:

- Proof flags on `story update` are numeric booleans (`1`/`0`). `story verify
  <id>` runs the configured `verify_command` and takes no proof flags.
- `story update --status implemented` is **rejected**; move work to
  `in_progress`/`changed`, then use `story complete <id>` so fresh proof and the
  `implemented` transition happen atomically.
- Backlog `--risk` uses lanes (`tiny`, `normal`, `high-risk`), not severity
  words — use `tiny`, not `low`.
- `query sql` accepts one **read-only** SQLite statement (enforced at the
  connection); use typed mutation commands for writes.
- `query matrix` filters combine with AND: `--active` (planned/in_progress/
  changed), `--runnable` (protocol discovery rule), `--story <id>` (one exact
  ID), `--summary` (omit evidence column), `--numeric` (flags as 1/0).

### Environment overrides

- `HARNESS_DB_PATH=/path/to/harness.db` — operate on an isolated database
  (takes precedence over legacy `HARNESS_DB`; default is `harness.db` at repo root).
- `HARNESS_RUN_ID=<run-id>` — append semantic operation records to
  `.harness/changesets/<run-id>.changeset.jsonl`. Without it, no changeset is written.

### This machine

The prebuilt `harness-cli.exe` is currently **blocked by a Windows Application
Control policy** on this host (fails with "An Application Control policy has
blocked this file"). Until that is resolved, CLI commands will not run here; work
that depends on the durable layer must account for this rather than assume the
binary executes.

---

## 6. Layout & Durable State

- `docs/` — the operating harness: `HARNESS.md` (collaboration model),
  `FEATURE_INTAKE.md`, `CONTEXT_RULES.md`, `ARCHITECTURE.md` (consumer discovery
  + dependency/parse-at-boundary rules), `TEST_MATRIX.md`, `TRACE_SPEC.md`,
  `TOOL_REGISTRY.md`, `HARNESS_*` component/maturity docs, plus `decisions/`,
  `stories/`, `templates/`, `product/` (empty until a consumer spec exists),
  and `contracts/` (machine-readable orchestration contract).
- `scripts/schema/` — version-controlled SQLite migrations named
  `NNN-description.sql`; adding one only requires committing the SQL file.
- `harness.db` (+ `-wal`/`-shm`) and `target/`, `dist/`, `scripts/bin/harness-cli*`
  are `.gitignore`d — each project instance generates its own durable data and
  fetches its own CLI binary. The CLI release is pinned via
  `scripts/harness-cli-release-tag` (currently `harness-cli-v0.1.17`).

`docs/TEST_MATRIX.md` and `docs/HARNESS_BACKLOG.md` are **legacy** markdown; the
live proof and backlog state are queried through the CLI (`query matrix`,
`query backlog`), not read from those files.

---

## 7. Consumer Architecture Rules (once product code exists)

[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) governs future application code.
The candidate structure (`domain <- application <- infrastructure <- interface
<- app surfaces`) is a *thinking template, not a scaffold* — create real folders
only when a story enters implementation. Enforced principles: inner layers never
depend on outer layers; parse unknown input at boundaries into typed DTOs/domain
value objects before it reaches inner code; keep command/query separation; and
keep audit logs (product records) distinct from application logs (operational
records).

For Apply Flow specifically, when we start building: domain = Application/User
entities + the status lifecycle; application = use-cases (create job, move
status, search/filter); infrastructure = Prisma/Neon + Clerk adapters;
interface/app surfaces = Next.js routes, server actions, and shadcn/ui screens.
