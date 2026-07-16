# Features

Apply Flow's frontend is organized **by feature** (feature-sliced), not by
technical layer. Each folder under `features/` is one product domain from
[docs/product/overview.md](../../docs/product/overview.md) and owns everything
that domain needs.

## Feature anatomy

```text
features/<feature>/
  components/   feature-scoped React UI (composes shadcn/ui from @/components/ui)
  hooks/        feature-scoped React hooks (incl. future TanStack Query hooks)
  services/     data access — server actions, fetchers, query + mutation fns
  store/        client-only UI state (future: Zustand slices)
  index.ts      the feature's PUBLIC API (the only thing others may import)
```

## Current features

| Feature | Product contract | Screens |
| --- | --- | --- |
| `marketing` | — (public surface; contract not written yet) | Landing, Pricing |
| `auth` | [auth.md](../../docs/product/auth.md) | Login, Register, Profile (+ `server` barrel) |
| `applications` | [applications.md](../../docs/product/applications.md) | List, Create, Edit |
| `dashboard` | [dashboard.md](../../docs/product/dashboard.md) | Dashboard |
| `kanban` | [kanban.md](../../docs/product/kanban.md) | Kanban Board |
| `settings` | [settings.md](../../docs/product/settings.md) | Settings |

## Import rules

- Import a feature only through its barrel: `@/features/applications` — never
  reach into `@/features/applications/components/...` from outside.
- A feature whose `services/` touch the database or a secret splits its barrel in
  two: `@/features/<feature>` for client-safe code and
  `@/features/<feature>/server` for server-only code. `auth` is the first to do
  this. One barrel mixing React components with Prisma would pull the database
  client into the browser bundle of any component that imported the feature; the
  `server` barrel imports `server-only`, so that mistake becomes a build error
  instead. The rule above is unchanged — outside code still imports a barrel,
  there are just two of them.
- Features may depend on **shared** code (`@/components/ui`, `@/hooks`,
  `@/lib`) but should **not** import from another feature's internals. If two
  features need the same thing, lift it into shared.
- Next.js routes in `@/app/**` are thin: they compose feature barrels and own
  routing/layout only.

## Libraries

Both are installed and wired:

- **Zustand** → client UI state. The locale store lives in `@/lib/i18n` rather
  than a feature `store/`, because marketing, auth and settings all read it.
- **TanStack Query** → server-state hooks in `hooks/`, query/mutation fns in
  `services/`; the shared `QueryClientProvider` is mounted in `@/lib/providers`.
  Nothing queries yet — no server data exists until the applications domain.

Placeholder `.gitkeep` files keep empty subfolders tracked; delete each one as
real files land.
