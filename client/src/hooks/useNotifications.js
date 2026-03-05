import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios";

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

const useUnreadCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => api.get("/notifications/unread-count"),
    select: (data) => data.data.data.count,
    refetchInterval: 30000,
  });
};

const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => {
      // Reset unread count to zero immediately
      queryClient.setQueryData(["notifications", "unread"], 0);
      // Refetch notifications so read status updates in the list
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.refetchQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) =>
      api.patch(`/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.refetchQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
      queryClient.refetchQueries({ queryKey: ["notifications", "unread"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export { useNotifications, useUnreadCount, useMarkAllAsRead, useMarkAsRead };