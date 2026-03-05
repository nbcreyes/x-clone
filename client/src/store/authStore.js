import { create } from "zustand";

/**
 * Global auth store using Zustand.
 * Holds the current user and auth loading state.
 * The user is hydrated on app load via the /api/auth/me endpoint.
 */
const useAuthStore = create((set) => ({
  // The currently authenticated user, or null if not logged in
  user: null,

  // True while the initial auth check is in progress
  // Prevents the app from flashing the login page before auth is verified
  isLoading: true,

  // Set the current user (called after login or on app load)
  setUser: (user) => set({ user, isLoading: false }),

  // Clear the user (called after logout)
  clearUser: () => set({ user: null, isLoading: false }),

  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;