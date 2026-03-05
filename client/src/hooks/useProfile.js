import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";

/**
 * Fetches a user profile by username.
 */
const useProfile = (username) => {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: () => api.get(`/profile/${username}`),
    select: (data) => data.data.data.profile,
    enabled: !!username,
  });
};

/**
 * Updates the current user's profile.
 */
const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (profileData) => api.patch("/profile", profileData),
    onSuccess: ({ data }) => {
      const updatedProfile = data.data.profile;
      // Update the auth store with new profile data
      setUser({ ...user, ...updatedProfile });
      queryClient.invalidateQueries({ queryKey: ["profile", user.username] });
      toast.success("Profile updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

/**
 * Toggles following a user.
 */
const useToggleFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username) => api.post(`/follows/${username}`),
    onSuccess: (_, username) => {
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.invalidateQueries({ queryKey: ["suggested"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

/**
 * Fetches suggested users to follow.
 */
const useSuggestedUsers = () => {
  return useQuery({
    queryKey: ["suggested"],
    queryFn: () => api.get("/follows/suggested"),
    select: (data) => data.data.data.users,
  });
};

export { useProfile, useUpdateProfile, useToggleFollow, useSuggestedUsers };