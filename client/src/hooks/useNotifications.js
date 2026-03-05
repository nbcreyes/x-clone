import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios";

/**
 * Fetches paginated notifications for the current user.
 */
const useNotifications = () => {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: 20 });
      if (pageParam) params.append("cursor", pageParam);
      return api.get(`/notifications?${params}`);
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage.data.data.nextCursor ?? undefined,
    select: (data) => ({
      pages: data.pages.map((page) => page.data.data.notifications),
      pageParams: data.pageParams,
      unreadCount: data.pages[0]?.data.data.unreadCount ?? 0,
    }),
  });
};

/**
 * Fetches the unread notification count for the badge.
 */
const useUnreadCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => api.get("/notifications/unread-count"),
    select: (data) => data.data.data.count,
    refetchInterval: 30000, // refetch every 30 seconds as a fallback
  });
};

/**
 * Marks all notifications as read.
 */
const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export { useNotifications, useUnreadCount, useMarkAllAsRead };