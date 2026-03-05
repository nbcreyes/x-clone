import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios";

/**
 * Fetches the paginated main feed using infinite query for infinite scroll.
 */
const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: 10 });
      if (pageParam) params.append("cursor", pageParam);
      return api.get(`/posts/feed?${params}`);
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.data.data.nextCursor ?? undefined,
    select: (data) => ({
      pages: data.pages.map((page) => page.data.data.posts),
      pageParams: data.pageParams,
    }),
  });
};

/**
 * Fetches paginated posts by a specific user.
 */
const useUserPosts = (username) => {
  return useInfiniteQuery({
    queryKey: ["posts", "user", username],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: 10 });
      if (pageParam) params.append("cursor", pageParam);
      return api.get(`/posts/user/${username}?${params}`);
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.data.data.nextCursor ?? undefined,
    select: (data) => ({
      pages: data.pages.map((page) => page.data.data.posts),
      pageParams: data.pageParams,
    }),
    enabled: !!username,
  });
};

/**
 * Creates a new post mutation.
 */
const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postData) => api.post("/posts", postData),
    onSuccess: () => {
      // Invalidate and refetch the feed immediately
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.refetchQueries({ queryKey: ["feed"] });
      toast.success("Post created");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

/**
 * Deletes a post mutation.
 */
const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => api.delete(`/posts/${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Post deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

/**
 * Toggles a like on a post.
 * Uses optimistic updates for instant UI feedback.
 */
const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => api.post(`/likes/${postId}`),
    onSuccess: (_, postId) => {
      // Invalidate any query that might contain this post
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

/**
 * Toggles a retweet on a post.
 */
const useToggleRetweet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => api.post(`/retweets/${postId}`),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export {
  useFeed,
  useUserPosts,
  useCreatePost,
  useDeletePost,
  useToggleLike,
  useToggleRetweet,
};