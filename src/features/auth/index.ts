// Public API of the "auth" feature.
// Import from "@/features/auth" only — never reach into subfolders from outside.
//
//   components/  feature-scoped React UI (uses shadcn/ui primitives from @/components/ui)
//   hooks/       feature-scoped hooks (incl. future TanStack Query hooks)
//   services/    data access: server actions / fetchers / query + mutation fns
//   store/       client-only UI state (future: Zustand)
//
// US-001 ships the UI shell only. Authentication behavior — Clerk provider,
// middleware, the local User record — arrives with US-000 and gets exported here.
export { AuthShell, type AuthVariant } from "./components/auth-shell";
