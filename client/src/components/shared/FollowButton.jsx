import { Button } from "@/components/ui/button";
import { useToggleFollow } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

const FollowButton = ({ username, isFollowing, className }) => {
  const toggleFollow = useToggleFollow();

  const handleClick = (e) => {
    e.stopPropagation();
    toggleFollow.mutate(username);
  };

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={cn("rounded-full font-bold min-w-[90px]", className)}
      onClick={handleClick}
      disabled={toggleFollow.isPending}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
};

export default FollowButton;