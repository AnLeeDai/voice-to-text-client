import axios from "axios";
import { toast } from "sonner";
import { getToken } from "@/helpers/has-token";

const getAuthToken = () => {
  const token = getToken();
  return token ? `Bearer ${token}` : "";
};

const AUTH_TOKEN = getAuthToken();

const instance = axios.create();

instance.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
instance.defaults.headers.common["Authorization"] = AUTH_TOKEN;
instance.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

// check server health on startup
instance.get("/", {
  timeout: 5000,
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Cập nhật token cho mỗi request để đảm bảo token luôn mới nhất
    const currentToken = getAuthToken();
    if (currentToken) {
      config.headers.Authorization = currentToken;
    }

    // Log request for debugging
    console.log(
      `Making ${config.method?.toUpperCase()} request to: ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`Successful response from: ${response.config.url}`);
    return response;
  },
  (error) => {
    // Centralized error handling
    let errorDetails = "";

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          errorDetails = data?.message || "Invalid request data";
          break;
        case 401:
          errorDetails = data?.message || "Please login again";
          // Xóa token không hợp lệ và redirect về login
          import("@/helpers/has-token").then(({ removeToken }) => {
            removeToken();
            if (
              typeof window !== "undefined" &&
              !window.location.pathname.includes("/login")
            ) {
              window.location.href = "/login";
            }
          });
          break;
        case 403:
          errorDetails = data?.message || "Access denied";
          break;
        case 404:
          errorDetails = data?.message || "Resource not found";
          break;
        case 422:
          errorDetails = data?.message || "Invalid input data";
          break;
        case 500:
          errorDetails = data?.message || "Internal server error";
          break;
        default:
          errorDetails = data?.message || "Something went wrong";
      }

      // Log detailed error info
      console.error("API Error:", {
        status,
        url: error.config?.url,
        method: error.config?.method,
        message: errorDetails,
        data: data,
      });
    } else if (error.request) {
      // Network error
      errorDetails =
        "Unable to connect to server. Please check your internet connection.";
      console.error("Network Error:", error.request);
    } else {
      // Something else happened
      errorDetails =
        error.message || "Something went wrong setting up the request";
      console.error("Request Setup Error:", error.message);
    }

    // Show toast notification for user
    toast.error(errorDetails);

    return Promise.reject(error);
  }
);

export default instance;
