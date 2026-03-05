import axios from "axios";

// Create a configured Axios instance.
// All API calls in the app go through this instance.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // required to send session cookies cross-origin
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor - handle common error cases globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract a readable message from the error response
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    // Attach the message to the error for easy access in components
    error.message = message;

    return Promise.reject(error);
  }
);

export default api;