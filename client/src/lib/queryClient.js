import { QueryClient } from "@tanstack/react-query";

// Create the TanStack Query client with sensible defaults.
// staleTime: how long data is considered fresh before refetching
// gcTime: how long unused data stays in cache before being removed
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: 1, // retry failed requests once
      refetchOnWindowFocus: false, // do not refetch when tab regains focus
    },
    mutations: {
      retry: 0, // do not retry failed mutations
    },
  },
});

export default queryClient;