import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true, // Enables browser to automatically transmit session cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor for centralized API error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected network error occurred.";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;

