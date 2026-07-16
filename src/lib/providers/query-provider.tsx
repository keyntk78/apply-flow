"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Shared QueryClient for the app's server-state hooks.
 *
 * Feature query/mutation functions live in `features/<feature>/services/` and
 * the hooks wrapping them in `features/<feature>/hooks/` (src/features/README.md).
 * Nothing consumes this yet — US-001 has no server data — but the provider is
 * mounted so the first data slice only has to add its hook.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Long enough that a refocus during SSR hand-off doesn't immediately refetch.
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState (not useMemo/module scope) so each client gets one stable client
  // and the server never shares cache between requests.
  const [queryClient] = useState(makeQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
