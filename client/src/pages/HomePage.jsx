import { useEffect, useRef, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CreatePost from "@/components/shared/CreatePost";
import PostCard from "@/components/shared/PostCard";
import { useFeed } from "@/hooks/usePosts";

const PostSkeleton = () => (
  <div className="border-b border-border px-4 py-3">
    <div className="flex gap-3">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useFeed();

  const observerRef = useRef(null);

  // Infinite scroll - observe the last post and load more when it is visible
  const lastPostRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const allPosts = data?.pages?.flat() ?? [];

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="font-bold text-xl">Home</h1>
      </div>

      {/* Create post */}
      <CreatePost />

      {/* Feed */}
      {isLoading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : allPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <p className="text-xl font-bold mb-2">Nothing here yet</p>
          <p className="text-muted-foreground">
            Follow some users or create a post to get started.
          </p>
        </div>
      ) : (
        <>
          {allPosts.map((post, index) => {
            const isLast = index === allPosts.length - 1;
            return (
              <div key={post.id} ref={isLast ? lastPostRef : null}>
                <PostCard post={post} />
              </div>
            );
          })}

          {isFetchingNextPage && (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          )}

          {!hasNextPage && allPosts.length > 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              You have reached the end
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;