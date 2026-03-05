import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import FollowButton from "./FollowButton";
import useAuthStore from "@/store/authStore";

const UserCard = ({ user }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div
      className="flex items-center justify-between p-3 hover:bg-accent/50 cursor-pointer transition-colors rounded-xl"
      onClick={() => navigate(`/${user.username}`)}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback>
            {user.name?.charAt(0).toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="font-semibold text-sm truncate hover:underline">
            {user.name}
          </p>
          <p className="text-muted-foreground text-sm truncate">
            @{user.username}
          </p>
          {user.bio && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {user.bio}
            </p>
          )}
        </div>
      </div>

      {!isOwnProfile && (
        <div className="shrink-0 ml-2">
          <FollowButton
            username={user.username}
            isFollowing={user.isFollowing}
          />
        </div>
      )}
    </div>
  );
};

export default UserCard;