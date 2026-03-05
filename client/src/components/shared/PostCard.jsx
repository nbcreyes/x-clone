import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Repeat2, Trash2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToggleLike, useToggleRetweet, useDeletePost } from "@/hooks/usePosts";
import useAuthStore from "@/store/authStore";
import { cn } from "@/lib/utils";

const PostCard = ({ post }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const toggleLike = useToggleLike();
  const toggleRetweet = useToggleRetweet();
  const deletePost = useDeletePost();

  const isOwnPost = user?.id === post.author.id;

  const handleLike = (e) => {
    e.stopPropagation();
    if (!user) return navigate("/login");
    toggleLike.mutate(post.id);
  };

  const handleRetweet = (e) => {
    e.stopPropagation();
    if (!user) return navigate("/login");
    toggleRetweet.mutate(post.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deletePost.mutate(post.id);
    setShowMenu(false);
  };

  const handleCardClick = () => {
    navigate(`/posts/${post.id}`);
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    navigate(`/${post.author.username}`);
  };

  return (
    <article
      className="border-b border-border px-4 py-3 hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={handleCardClick}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div onClick={handleAuthorClick} className="shrink-0">
          <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage src={post.author.avatarUrl} />
            <AvatarFallback>
              {post.author.name?.charAt(0).toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          {/* Author info and timestamp */}
          <div className="flex items-center justify-between gap-2">
            <div
              className="flex items-center gap-1 min-w-0 cursor-pointer"
              onClick={handleAuthorClick}
            >
              <span className="font-semibold text-sm truncate hover:underline">
                {post.author.name}
              </span>
              <span className="text-muted-foreground text-sm truncate">
                @{post.author.username}
              </span>
              <span className="text-muted-foreground text-sm shrink-0">
                · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: false })}
              </span>
            </div>

            {/* More menu for own posts */}
            {isOwnPost && (
              <div className="relative shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>

                {showMenu && (
                  <div className="absolute right-0 top-8 z-50 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[140px]">
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Post content */}
          <p className="text-sm mt-1 whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {/* Post image */}
          {post.imageUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-border">
              <img
                src={post.imageUrl}
                alt="Post image"
                className="w-full max-h-96 object-cover"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-6 mt-3">
            {/* Reply count */}
            <button
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/posts/${post.id}`);
              }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="text-xs">{post._count.replies}</span>
            </button>

            {/* Retweet */}
            <button
              className={cn(
                "flex items-center gap-1.5 transition-colors group",
                post.isRetweeted
                  ? "text-green-500"
                  : "text-muted-foreground hover:text-green-500"
              )}
              onClick={handleRetweet}
            >
              <div className="p-1.5 rounded-full group-hover:bg-green-500/10 transition-colors">
                <Repeat2 className="h-4 w-4" />
              </div>
              <span className="text-xs">{post._count.retweets}</span>
            </button>

            {/* Like */}
            <button
              className={cn(
                "flex items-center gap-1.5 transition-colors group",
                post.isLiked
                  ? "text-pink-500"
                  : "text-muted-foreground hover:text-pink-500"
              )}
              onClick={handleLike}
            >
              <div className="p-1.5 rounded-full group-hover:bg-pink-500/10 transition-colors">
                <Heart
                  className={cn("h-4 w-4", post.isLiked && "fill-current")}
                />
              </div>
              <span className="text-xs">{post._count.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;