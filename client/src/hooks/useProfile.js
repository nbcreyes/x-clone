import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";

const useProfile = (username) => {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: () => api.get(`/profile/${username}`),
    select: (data) => data.data.data.profile,
    enabled: !!username,
  });
};

const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (profileData) => api.patch("/profile", profileData),
    onSuccess: ({ data }) => {
      const updatedProfile = data.data.profile;
      setUser({ ...user, ...updatedProfile });
      queryClient.invalidateQueries({ queryKey: ["profile", user.username] });
      queryClient.refetchQueries({ queryKey: ["profile", user.username] });
      toast.success("Profile updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useToggleFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username) => api.post(`/follows/${username}`),
    onSuccess: (_, username) => {
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.refetchQueries({ queryKey: ["profile", username] });
      queryClient.invalidateQueries({ queryKey: ["suggested"] });
      queryClient.refetchQueries({ queryKey: ["suggested"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

const useSuggestedUsers = () => {
  return useQuery({
    queryKey: ["suggested"],
    queryFn: () => api.get("/follows/suggested"),
    select: (data) => data.data.data.users,
  });
};

export { useProfile, useUpdateProfile, useToggleFollow, useSuggestedUsers };