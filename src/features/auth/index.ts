// Public API of the "auth" feature — the client-safe half.
// Import from "@/features/auth" only — never reach into subfolders from outside.
//
//   components/  feature-scoped React UI (uses shadcn/ui primitives from @/components/ui)
//   hooks/       feature-scoped hooks (incl. future TanStack Query hooks)
//   services/    data access: server actions / fetchers / query + mutation fns
//   store/       client-only UI state (future: Zustand)
//
// Server-only work — the local User record and the Clerk sync — is exported from
// "@/features/auth/server" instead. This feature is the first to need two entry
// points: a barrel that mixes React components with `services/` would drag the
// Prisma client into any client component that touched it, and the browser
// bundle must never contain the database. The rule that outside code imports a
// barrel and not a subfolder still holds — there are simply two barrels.
//
// US-001 shipped the UI shell; US-000 adds the Clerk forms and the sync.
export { AuthShell, type AuthVariant } from "./components/auth-shell";
export { ClerkSignInForm, ClerkSignUpForm } from "./components/clerk-forms";
