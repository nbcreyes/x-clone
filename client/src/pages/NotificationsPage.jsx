import { formatDistanceToNow } from "date-fns";
import { Heart, Repeat2, MessageCircle, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications, useMarkAllAsRead } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const notificationConfig = {
  LIKE: {
    icon: Heart,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    label: "liked your post",
  },
  RETWEET: {
    icon: Repeat2,
    color: "text-green-500",
    bg: "bg-green-500/10",
    label: "retweeted your post",
  },
  REPLY: {
    icon: MessageCircle,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "replied to your post",
  },
  FOLLOW: {
    icon: UserPlus,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "followed you",
  },
};

const NotificationItem = ({ notification }) => {
  const navigate = useNavigate();
  const config = notificationConfig[notification.type];
  if (!config) return null;

  const Icon = config.icon;

  const handleClick = () => {
    if (notification.post) {
      navigate(`/posts/${notification.post.id}`);
    } else if (notification.type === "FOLLOW") {
      navigate(`/${notification.sender.username}`);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 border-b border-border hover:bg-accent/50 cursor-pointer transition-colors",
        !notification.read && "bg-primary/5"
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={cn("p-2 rounded-full h-fit shrink-0", config.bg)}>
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>

      <div className="flex-1 min-w-0">
        {/* Sender avatar and action */}
        <div className="flex items-center gap-2 mb-1">
          <Avatar className="h-8 w-8">
            <AvatarImage src={notification.sender.avatarUrl} />
            <AvatarFallback>
              {notification.sender.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <p className="text-sm">
          <span
            className="font-semibold hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/${notification.sender.username}`);
            }}
          >
            {notification.sender.name}
          </span>{" "}
          {config.label}
        </p>

        {notification.post && (
          <p className="text-muted-foreground text-sm truncate mt-0.5">
            {notification.post.content}
          </p>
        )}

        <p className="text-muted-foreground text-xs mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="shrink-0 mt-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      )}
    </div>
  );
};

const NotificationsPage = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications();
  const markAllAsRead = useMarkAllAsRead();

  const allNotifications = data?.pages?.flat() ?? [];

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-xl">Notifications</h1>
        {allNotifications.some((n) => !n.read) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 px-4 py-3 border-b border-border">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : allNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <p className="text-xl font-bold mb-2">No notifications yet</p>
          <p className="text-muted-foreground">
            When someone likes, retweets, or replies to your posts, it will show up here.
          </p>
        </div>
      ) : (
        <>
          {allNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}

          {hasNextPage && (
            <div className="p-4 text-center">
              <Button
                variant="ghost"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsPage;