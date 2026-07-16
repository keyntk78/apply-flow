// Public API of the "dashboard" feature.
// Import from "@/features/dashboard" only — never reach into subfolders from outside.
//
//   components/  feature-scoped React UI (uses shadcn/ui primitives from @/components/ui)
//   hooks/       feature-scoped hooks (incl. future TanStack Query hooks)
//   services/    data access: server actions / fetchers / query + mutation fns
//   store/       client-only UI state (future: Zustand)
//
// Re-export the feature's public surface here as it is built, e.g.:
//   export { ApplicationsBoard } from "./components/applications-board";
//   export { useApplications } from "./hooks/use-applications";
export {};
