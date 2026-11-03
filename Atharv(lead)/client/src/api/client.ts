import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true, // Enables browser to automatically transmit session cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Authorization Bearer token from localStorage as fallback
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("almalink_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

