import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

/**
 * Searches for both users and posts.
 * Only runs when the query is at least 2 characters long.
 */
const useSearch = (query) => {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => api.get(`/search?q=${encodeURIComponent(query)}`),
    select: (data) => data.data.data,
    enabled: query?.trim().length >= 2,
    staleTime: 1000 * 30, // cache search results for 30 seconds
  });
};

/**
 * Searches for users only with pagination support.
 */
const useSearchUsers = (query) => {
  return useQuery({
    queryKey: ["search", "users", query],
    queryFn: () => api.get(`/search/users?q=${encodeURIComponent(query)}`),
    select: (data) => data.data.data.users,
    enabled: query?.trim().length >= 2,
  });
};

/**
 * Searches for posts only with pagination support.
 */
const useSearchPosts = (query) => {
  return useQuery({
    queryKey: ["search", "posts", query],
    queryFn: () => api.get(`/search/posts?q=${encodeURIComponent(query)}`),
    select: (data) => data.data.data.posts,
    enabled: query?.trim().length >= 2,
  });
};

export { useSearch, useSearchUsers, useSearchPosts };