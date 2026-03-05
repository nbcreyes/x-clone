import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  Bell,
  User,
  LogOut,
  Feather,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useAuthStore from "@/store/authStore";
import useAuth from "@/hooks/useAuth";
import { useUnreadCount } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Search", icon: Search, path: "/search" },
  { label: "Notifications", icon: Bell, path: "/notifications" },
  { label: "Profile", icon: User, path: null }, // path set dynamically
];

const Sidebar = ({ onCreatePost }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { logout, isLogoutLoading } = useAuth();
  const { data: unreadCount } = useUnreadCount();

  return (
    <aside className="flex flex-col justify-between h-full py-2 px-3">
      <div className="flex flex-col gap-1">
        {/* X Logo */}
        <Link
          to="/"
          className="flex items-center justify-center xl:justify-start p-3 rounded-full hover:bg-accent transition-colors w-fit mb-2"
        >
          <span className="text-2xl font-black text-foreground">X</span>
        </Link>

        {/* Nav items */}
        {navItems.map((item) => {
          const path = item.label === "Profile" ? `/${user?.username}` : item.path;
          const isActive = item.label === "Profile"
            ? location.pathname === `/${user?.username}`
            : location.pathname === item.path;

          return (
            <Link
              key={item.label}
              to={path}
              className={cn(
                "flex items-center gap-4 p-3 rounded-full hover:bg-accent transition-colors w-fit xl:w-full group",
                isActive && "font-bold"
              )}
            >
              <div className="relative">
                <item.icon
                  className={cn(
                    "h-6 w-6",
                    isActive ? "text-foreground" : "text-foreground"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {/* Notification badge */}
                {item.label === "Notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:block text-lg">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Post button */}
        <Button
          className="mt-4 rounded-full font-bold hidden xl:flex"
          onClick={onCreatePost}
        >
          Post
        </Button>
        <Button
          className="mt-4 rounded-full font-bold xl:hidden w-12 h-12 p-0"
          onClick={onCreatePost}
        >
          <Feather className="h-5 w-5" />
        </Button>
      </div>

      {/* User info and logout */}
      <div
        className="flex items-center gap-3 p-3 rounded-full hover:bg-accent transition-colors cursor-pointer w-fit xl:w-full"
        onClick={() => navigate(`/${user?.username}`)}
      >
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={user?.avatarUrl} />
          <AvatarFallback>
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>

        <div className="hidden xl:flex flex-col min-w-0 flex-1">
          <span className="font-semibold text-sm truncate">{user?.name}</span>
          <span className="text-muted-foreground text-sm truncate">
            @{user?.username}
          </span>
        </div>

        <button
          className="hidden xl:flex text-muted-foreground hover:text-destructive transition-colors ml-auto p-1"
          onClick={(e) => {
            e.stopPropagation();
            logout();
          }}
          disabled={isLogoutLoading}
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;