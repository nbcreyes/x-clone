import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import { connectSocket, disconnectSocket } from "@/lib/socket";

/**
 * Provides login, register, and logout mutations.
 * Updates the global auth store and manages socket connection.
 */
const useAuth = () => {
  const { setUser, clearUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (credentials) => api.post("/auth/login", credentials),
    onSuccess: ({ data }) => {
      setUser(data.data.user);
      connectSocket(data.data.user.id);
      navigate("/");
      toast.success("Welcome back!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (userData) => api.post("/auth/register", userData),
    onSuccess: ({ data }) => {
      setUser(data.data.user);
      connectSocket(data.data.user.id);
      navigate("/");
      toast.success("Account created successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSuccess: () => {
      clearUser();
      disconnectSocket();
      queryClient.clear();
      navigate("/login");
      toast.success("Logged out successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
  };
};

export default useAuth;