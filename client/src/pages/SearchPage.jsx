import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "@/components/shared/PostCard";
import UserCard from "@/components/shared/UserCard";
import { useSearchUsers, useSearchPosts } from "@/hooks/useSearch";

const TABS = ["Users", "Posts"];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("Users");

  // Update the input when the URL query param changes
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const { data: users, isLoading: isUsersLoading } = useSearchUsers(query);
  const { data: posts, isLoading: isPostsLoading } = useSearchPosts(query);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      setSearchParams({ q: value.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div>
      {/* Header with search input */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users and posts"
            className="pl-10 rounded-full bg-muted border-transparent focus-visible:border-primary"
            value={query}
            onChange={handleSearchChange}
            autoFocus
          />
        </div>
      </div>

      {/* Tabs */}
      {query.trim().length >= 2 && (
        <div className="flex border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-4 text-sm font-semibold transition-colors hover:bg-accent/50 relative ${
                activeTab === tab
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {query.trim().length < 2 && (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-xl font-bold mb-2">Search X</p>
          <p className="text-muted-foreground">
            Search for people and posts on X.
          </p>
        </div>
      )}

      {/* Users tab */}
      {query.trim().length >= 2 && activeTab === "Users" && (
        <div>
          {isUsersLoading ? (
            <div className="flex flex-col gap-2 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : users?.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-bold text-lg mb-1">No users found</p>
              <p className="text-muted-foreground text-sm">
                No one matches the search term "{query}"
              </p>
            </div>
          ) : (
            <div className="p-2">
              {users?.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Posts tab */}
      {query.trim().length >= 2 && activeTab === "Posts" && (
        <div>
          {isPostsLoading ? (
            <div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border-b border-border px-4 py-3"
                >
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts?.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-bold text-lg mb-1">No posts found</p>
              <p className="text-muted-foreground text-sm">
                No posts match the search term "{query}"
              </p>
            </div>
          ) : (
            posts?.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;