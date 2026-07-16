# Architecture

The upstream Harness product is implemented as a Rust workspace with a CLI and
SQLite durable layer. Its primary source is `crates/harness-cli/`, organized
into domain, application, infrastructure, and interface modules. Schema
migrations live in `scripts/schema/`, while installers and validation scripts
form the distribution boundary.

The reusable template does not select an application stack for a consumer
project. The discovery guidance below is for that consumer application after a
user-provided spec and stack decision exist; it does not describe the upstream
Harness CLI as unimplemented.

## Discovery Before Shape

Before proposing implementation shape, identify:

- Product surfaces: browser, mobile, desktop, CLI, API, worker, or service.
- Runtime stack: language, framework, database, queues, providers, and hosting.
- Core domains: the product concepts that deserve stable names and contracts.
- Boundary inputs: user input, API requests, webhooks, jobs, files, credentials,
  provider payloads, and environment configuration.
- Validation ladder: the smallest checks that can prove the selected stack.

Record stack choices in `docs/decisions/` when they meaningfully constrain
future work.

## Default Layering

```text
domain
  <- application
      <- infrastructure
          <- interface
              <- app surfaces
```

## Consumer Candidate Structure (generic template)

```text
app/
  domain/
    entities/
    value-objects/
    repositories/
    services/

  application/
    commands/
    queries/
    handlers/

  infrastructure/
    database/
    logging/
    notifications/

  interface/
    controllers/
    dto/
    presenters/
    routes/
    middlewares/

surfaces/
  browser/
  mobile/
  desktop/
  cli/
```

This is a thinking template, not a scaffold. It names the *layers* every
product must respect; it does not mandate a physical folder-per-layer split.

## Apply Flow Structure (feature-sliced)

Apply Flow is a single Next.js app with one surface (browser). Rather than a
global folder-per-layer split, its frontend is organized **by feature**: each
product domain owns its UI, hooks, data access, and client state together. This
keeps a vertical slice cohesive and matches how the MVP is built and shipped —
one domain at a time. The [Default Layering](#default-layering) and rules below
still hold; they are enforced *within and across* features, not by a top-level
`domain/ application/ infrastructure/` directory tree.

```text
src/
  app/                      # Next.js App Router — routes/layouts only, thin
  features/
    <feature>/
      components/           # feature-scoped React UI (composes @/components/ui)
      hooks/                # feature-scoped hooks (incl. TanStack Query hooks)
      services/             # data access: server actions, fetchers, query/mutation fns
      store/                # client-only UI state (Zustand)  [reserved]
      index.ts             # the feature's PUBLIC API — the only import surface
  components/ui/            # shared shadcn/ui primitives
  hooks/                    # shared cross-feature hooks
  lib/                      # shared clients + utils (Prisma, Clerk, query client)
    providers/              # app-wide providers (Theme, QueryClientProvider …)
```

MVP features map 1:1 to the domains in
[docs/product/overview.md](product/overview.md): `auth`, `applications`,
`dashboard`, `kanban`, `settings`. See [src/features/README.md](../src/features/README.md)
for the per-feature contract.

### Where the layers live in a feature

| Layer (Default Layering) | Apply Flow home |
| --- | --- |
| domain (Application/User entities, status lifecycle) | `src/lib/domain` (shared, framework-free) |
| application (use-cases: create job, move status, search) | feature `services/` |
| infrastructure (Prisma/Neon, Clerk adapters) | `src/lib` clients, called from `services/` |
| interface (server actions, route handlers, DTO parsing) | `app/**` route handlers + feature `services/` boundary |
| app surfaces (screens, client state) | feature `components/`, `hooks/`, `store/` |

### Feature import rules

- Import a feature only through its barrel (`@/features/applications`); never
  reach into another feature's `components/`, `hooks/`, `services/`, or `store/`.
- Features may depend on shared code (`@/components/ui`, `@/hooks`, `@/lib`).
  Cross-feature reuse is lifted into shared, not imported feature-to-feature.
- The status lifecycle `Saved → Preparing → Applied → Interview → Offer →
  Rejected (+ Archived)` is a shared domain value in `src/lib/domain`; any
  feature that displays or mutates status uses that single source, not a local
  copy.

### Reserved dependencies

Zustand (`store/`) and TanStack Query (query hooks in `hooks/`, query/mutation
fns in `services/`, `QueryClientProvider` in `lib/providers/`) are structured
now but installed when the first slice needs them. Folders currently hold
`.gitkeep` placeholders; delete each as real files land.

Create real folders only when a story enters implementation and the selected
stack needs them.

## Dependency Rule

Inner layers must not depend on outer layers.

| Layer | May depend on | Must not depend on |
| --- | --- | --- |
| domain | nothing project-external except tiny pure utilities | framework, database, UI, provider, process/env |
| application | domain | framework, UI, provider, database concrete clients |
| infrastructure | domain, application | interface controllers or UI |
| interface | all backend layers | UI state or platform shell assumptions |
| app surfaces | API contracts and app-facing clients | domain internals directly |

## Parse-First Boundary Rule

Unknown data must be parsed at boundaries before it enters inner code.

Boundaries include:

- HTTP request bodies, params, and query strings.
- Session payloads and identity claims.
- Environment variables.
- Database rows returned from external clients.
- Platform shell payloads.
- Deep links, tokens, and signed URLs.
- Provider webhooks, events, and async payloads.

Target flow:

```text
unknown input
  -> parser
  -> typed DTO or command
  -> application use case
  -> domain object/value object
```

Inner layers should work with meaningful product types such as `UserId`,
`AccountId`, `WorkspaceId`, `Role`, `DateRange`, or domain-specific IDs,
rather than repeatedly validating raw strings.

## Command/Query Boundary

If the product has both reads and writes, keep command/query separation clear at
the code level even when the storage layer is simple:

- Commands mutate state and own audit side effects.
- Queries read state and format for consumers.
- Shared domain rules live in domain/application, not controllers.

## Observability Contract

The future server should emit one canonical JSON log line per request with:

- timestamp
- level
- request_id
- user_id when known
- action
- duration_ms
- status_code
- message

Audit logs are product records. Application logs are operational records. Do not
use one as a substitute for the other.
