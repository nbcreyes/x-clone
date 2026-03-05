import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Link as LinkIcon, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PostCard from "@/components/shared/PostCard";
import FollowButton from "@/components/shared/FollowButton";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useUserPosts } from "@/hooks/usePosts";
import useAuthStore from "@/store/authStore";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const TABS = ["Posts", "Likes"];

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("Posts");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isProfileLoading } = useProfile(username);
  const { data: postsData, isLoading: isPostsLoading } = useUserPosts(username);
  const updateProfile = useUpdateProfile();

  const allPosts = postsData?.pages?.flat() ?? [];

  const handleEditOpen = () => {
    setEditForm({
      name: profile?.name ?? "",
      bio: profile?.bio ?? "",
      location: profile?.location ?? "",
      website: profile?.website ?? "",
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateProfile.mutate(editForm, {
      onSuccess: () => setIsEditOpen(false),
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setIsUploadingAvatar(true);
    try {
      const { data } = await api.post("/upload/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Update auth store and refetch profile so avatar shows immediately
      setUser({ ...currentUser, avatarUrl: data.data.user.avatarUrl });
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.refetchQueries({ queryKey: ["profile", username] });
      toast.success("Avatar updated");
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setIsUploadingCover(true);
    try {
      const { data } = await api.post("/upload/cover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.refetchQueries({ queryKey: ["profile", username] });
      toast.success("Cover photo updated");
    } catch {
      toast.error("Failed to upload cover");
    } finally {
      setIsUploadingCover(false);
    }
  };

  if (isProfileLoading) {
    return (
      <div>
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-48 w-full" />
        <div className="px-4 pb-4">
          <Skeleton className="h-20 w-20 rounded-full -mt-10 mb-3" />
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-xl font-bold">User not found</p>
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
        <div>
          <h1 className="font-bold text-xl leading-tight">{profile.name}</h1>
          <p className="text-muted-foreground text-sm">
            {profile.postCount} posts
          </p>
        </div>
      </div>

      {/* Cover photo */}
      <div className="relative h-48 bg-muted">
        {profile.coverUrl ? (
          <img
            src={profile.coverUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40" />
        )}
        {profile.isOwnProfile && (
          <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <span className="text-white text-sm font-semibold">
              {isUploadingCover ? "Uploading..." : "Change cover"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
              disabled={isUploadingCover}
            />
          </label>
        )}
      </div>

      {/* Profile info */}
      <div className="px-4 pb-4">
        <div className="flex justify-between items-start -mt-12 mb-3">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={profile.avatarUrl} />
              <AvatarFallback className="text-2xl">
                {profile.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {profile.isOwnProfile && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-xs font-semibold text-center px-1">
                  {isUploadingAvatar ? "..." : "Change"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                />
              </label>
            )}
          </div>

          {/* Action button */}
          {profile.isOwnProfile ? (
            <Button
              variant="outline"
              className="rounded-full font-bold mt-14"
              onClick={handleEditOpen}
            >
              Edit profile
            </Button>
          ) : (
            <div className="mt-14">
              <FollowButton
                username={profile.username}
                isFollowing={profile.isFollowing}
              />
            </div>
          )}
        </div>

        {/* Name and username */}
        <h2 className="font-bold text-xl">{profile.name}</h2>
        <p className="text-muted-foreground">@{profile.username}</p>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-3 text-sm whitespace-pre-wrap">{profile.bio}</p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-muted-foreground text-sm">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {profile.location}
            </span>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <LinkIcon className="h-4 w-4" />
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Joined {format(new Date(profile.createdAt), "MMMM yyyy")}
          </span>
        </div>

        {/* Follow counts */}
        <div className="flex gap-4 mt-3 text-sm">
          <button
            className="hover:underline"
            onClick={() => navigate(`/${username}/following`)}
          >
            <span className="font-bold">{profile.followingCount}</span>
            <span className="text-muted-foreground ml-1">Following</span>
          </button>
          <button
            className="hover:underline"
            onClick={() => navigate(`/${username}/followers`)}
          >
            <span className="font-bold">{profile.followerCount}</span>
            <span className="text-muted-foreground ml-1">Followers</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-4 text-sm font-semibold transition-colors hover:bg-accent/50 relative ${
              activeTab === tab ? "text-foreground" : "text-muted-foreground"
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

      {/* Tab content */}
      {activeTab === "Posts" && (
        <>
          {isPostsLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading posts...
            </div>
          ) : allPosts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-bold text-xl mb-2">No posts yet</p>
              <p className="text-muted-foreground text-sm">
                {profile.isOwnProfile
                  ? "You have not posted anything yet."
                  : `@${username} has not posted anything yet.`}
              </p>
            </div>
          ) : (
            allPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </>
      )}

      {activeTab === "Likes" && (
        <div className="py-8 text-center text-muted-foreground">
          Liked posts coming soon
        </div>
      )}

      {/* Edit profile dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleEditSubmit}
            className="flex flex-col gap-4 mt-2"
          >
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input
                value={editForm.name ?? ""}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bio</label>
              <Textarea
                value={editForm.bio ?? ""}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, bio: e.target.value }))
                }
                placeholder="Tell the world about yourself"
                maxLength={160}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Location</label>
              <Input
                value={editForm.location ?? ""}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="Where are you based?"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Website</label>
              <Input
                value={editForm.website ?? ""}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, website: e.target.value }))
                }
                placeholder="https://yourwebsite.com"
                type="url"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
