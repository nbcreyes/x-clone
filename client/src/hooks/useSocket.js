import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/lib/socket";
import useAuthStore from "@/store/authStore";

/**
 * Listens to real-time Socket.io events and updates the query cache.
 * Mount this once at the top level of the authenticated app.
 * Each event handler invalidates the relevant queries so the UI
 * updates automatically without a full page refresh.
 */
const useSocket = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    // New post created - add to feed
    const handleNewPost = ({ post }) => {
      queryClient.setQueryData(["feed"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: [[post, ...(old.pages[0] ?? [])], ...old.pages.slice(1)],
        };
      });
    };

    // Post deleted - remove from feed
    const handleDeletePost = ({ postId }) => {
      queryClient.setQueryData(["feed"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.filter((p) => p.id !== postId)
          ),
        };
      });
    };

    // Like toggled - update count in feed
    const handleLikeToggled = ({ postId, liked, likeCount }) => {
      queryClient.setQueryData(["feed"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((p) =>
              p.id === postId
                ? { ...p, _count: { ...p._count, likes: likeCount }, isLiked: liked }
                : p
            )
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    };

    // Retweet toggled - update count in feed
    const handleRetweetToggled = ({ postId, retweeted, retweetCount }) => {
      queryClient.setQueryData(["feed"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    _count: { ...p._count, retweets: retweetCount },
                    isRetweeted: retweeted,
                  }
                : p
            )
          ),
        };
      });
    };

    // New reply - invalidate the post thread
    const handleNewReply = ({ postId }) => {
      queryClient.invalidateQueries({ queryKey: ["replies", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    };

    // New notification - update notification cache and unread count
    const handleNewNotification = ({ notification }) => {
      queryClient.setQueryData(["notifications", "unread"], (old) =>
        (old ?? 0) + 1
      );
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    socket.on("newPost", handleNewPost);
    socket.on("deletePost", handleDeletePost);
    socket.on("likeToggled", handleLikeToggled);
    socket.on("retweetToggled", handleRetweetToggled);
    socket.on("newReply", handleNewReply);
    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newPost", handleNewPost);
      socket.off("deletePost", handleDeletePost);
      socket.off("likeToggled", handleLikeToggled);
      socket.off("retweetToggled", handleRetweetToggled);
      socket.off("newReply", handleNewReply);
      socket.off("newNotification", handleNewNotification);
    };
  }, [user, queryClient]);
};

export default useSocket;