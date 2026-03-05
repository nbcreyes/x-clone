import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Repeat2, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PostCard from "@/components/shared/PostCard";
import { useToggleLike, useToggleRetweet } from "@/hooks/usePosts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/store/authStore";
import { socket } from "@/lib/socket";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState("");

  // Fetch the thread (post + replies)
  const { data, isLoading } = useQuery({
    queryKey: ["thread", postId],
    queryFn: () => api.get(`/replies/${postId}/thread`),
    select: (res) => res.data.data,
    enabled: !!postId,
  });

  // Fetch the post itself for interaction counts
  const { data: postData } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => api.get(`/posts/${postId}`),
    select: (res) => res.data.data.post,
    enabled: !!postId,
  });

  const toggleLike = useToggleLike();
  const toggleRetweet = useToggleRetweet();

  // Join the post room for real-time reply updates
  useEffect(() => {
    if (!postId) return;
    socket.emit("joinPost", postId);
    return () => socket.emit("leavePost", postId);
  }, [postId]);

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: (content) =>
      api.post(`/replies/${postId}`, { content }),
    onSuccess: () => {
      setReplyContent("");
      queryClient.invalidateQueries({ queryKey: ["thread", postId] });
      toast.success("Reply posted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleReply = () => {
    if (!replyContent.trim()) return;
    replyMutation.mutate(replyContent.trim());
  };

  const post = data?.post ?? postData;
  const replies = data?.replies ?? [];

  if (isLoading) {
    return (
      <div>
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="p-4">
          <div className="flex gap-3 mb-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-xl font-bold">Post not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-bold text-xl">Post</h1>
      </div>

      {/* Original post - expanded view */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="flex gap-3 mb-3">
          <Avatar
            className="h-12 w-12 cursor-pointer"
            onClick={() => navigate(`/${post.author.username}`)}
          >
            <AvatarImage src={post.author.avatarUrl} />
            <AvatarFallback>
              {post.author.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p
              className="font-semibold hover:underline cursor-pointer"
              onClick={() => navigate(`/${post.author.username}`)}
            >
              {post.author.name}
            </p>
            <p className="text-muted-foreground text-sm">
              @{post.author.username}
            </p>
          </div>
        </div>

        <p className="text-xl whitespace-pre-wrap break-words mb-4">
          {post.content}
        </p>

        {post.imageUrl && (
          <div className="mb-4 rounded-2xl overflow-hidden border border-border">
            <img
              src={post.imageUrl}
              alt="Post image"
              className="w-full max-h-96 object-cover"
            />
          </div>
        )}

        <p className="text-muted-foreground text-sm mb-3">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </p>

        <Separator />

        {/* Counts */}
        <div className="flex gap-4 py-3 text-sm">
          <span>
            <span className="font-bold">{post._count?.replies ?? 0}</span>
            <span className="text-muted-foreground ml-1">Replies</span>
          </span>
          <span>
            <span className="font-bold">{post._count?.retweets ?? 0}</span>
            <span className="text-muted-foreground ml-1">Retweets</span>
          </span>
          <span>
            <span className="font-bold">{post._count?.likes ?? 0}</span>
            <span className="text-muted-foreground ml-1">Likes</span>
          </span>
        </div>

        <Separator />

        {/* Action buttons */}
        <div className="flex gap-6 py-2">
          <button
            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors group"
          >
            <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
              <MessageCircle className="h-5 w-5" />
            </div>
          </button>

          <button
            className={cn(
              "flex items-center gap-1 transition-colors group",
              post.isRetweeted
                ? "text-green-500"
                : "text-muted-foreground hover:text-green-500"
            )}
            onClick={() => toggleRetweet.mutate(post.id)}
          >
            <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
              <Repeat2 className="h-5 w-5" />
            </div>
          </button>

          <button
            className={cn(
              "flex items-center gap-1 transition-colors group",
              post.isLiked
                ? "text-pink-500"
                : "text-muted-foreground hover:text-pink-500"
            )}
            onClick={() => toggleLike.mutate(post.id)}
          >
            <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
              <Heart
                className={cn("h-5 w-5", post.isLiked && "fill-current")}
              />
            </div>
          </button>
        </div>

        <Separator />

        {/* Reply input */}
        {user && (
          <div className="flex gap-3 pt-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Post your reply"
                className="border-none resize-none bg-transparent text-base focus-visible:ring-0 p-0 min-h-[80px]"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                maxLength={280}
              />
              <div className="flex justify-end mt-2">
                <Button
                  className="rounded-full font-bold"
                  size="sm"
                  disabled={!replyContent.trim() || replyMutation.isPending}
                  onClick={handleReply}
                >
                  {replyMutation.isPending ? "Replying..." : "Reply"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      <div>
        {replies.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No replies yet. Be the first to reply.
          </div>
        ) : (
          replies.map((reply) => (
            <div key={reply.id} className="border-b border-border px-4 py-3">
              <div className="flex gap-3">
                <Avatar
                  className="h-10 w-10 shrink-0 cursor-pointer"
                  onClick={() => navigate(`/${reply.author.username}`)}
                >
                  <AvatarImage src={reply.author.avatarUrl} />
                  <AvatarFallback>
                    {reply.author.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span
                      className="font-semibold text-sm hover:underline cursor-pointer"
                      onClick={() => navigate(`/${reply.author.username}`)}
                    >
                      {reply.author.name}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      @{reply.author.username}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      · {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: false })}
                    </span>
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {reply.content}
                  </p>
                  {reply._count?.children > 0 && (
                    <p className="text-primary text-sm mt-1">
                      {reply._count.children} more{" "}
                      {reply._count.children === 1 ? "reply" : "replies"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PostPage;