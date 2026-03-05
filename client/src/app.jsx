import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import api from "@/lib/axios";
import { connectSocket, disconnectSocket } from "@/lib/socket";

// Layout
import MainLayout from "@/components/layout/MainLayout";

// Pages - imported individually so we can add them one by one
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProfilePage from "@/pages/ProfilePage";
import PostPage from "@/pages/PostPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SearchPage from "@/pages/SearchPage";
import NotFoundPage from "@/pages/NotFoundPage";

/**
 * Route guard for pages that require authentication.
 * Redirects to /login if the user is not logged in.
 */
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * Route guard for auth pages (login, register).
 * Redirects to home if the user is already logged in.
 */
const GuestRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const { setUser, clearUser, setLoading } = useAuthStore();

  // Check if the user is already logged in on app load.
  // This hydrates the auth store from the existing session.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.data.user);
        connectSocket(data.data.user.id);
      } catch {
        // No active session - user is not logged in
        clearUser();
      }
    };

    checkAuth();

    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Guest only routes */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

        {/* Protected routes wrapped in the main layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="posts/:postId" element={<PostPage />} />
          <Route path=":username" element={<ProfilePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;