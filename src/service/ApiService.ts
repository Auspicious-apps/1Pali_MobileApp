import axios from "axios";
import {
  deleteLocalStorageData,
  getLocalStorageData,
  storeLocalStorageData,
} from "../utils/Helpers";
import STORAGE_KEYS from "../utils/Constants";
import { RefreshTokenResponse } from "./ApiResponses/RefreshToken";
import ENDPOINTS from "./ApiEndpoints";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
  error: any;
};

// Create the Axios instance
const api = axios.create({
  // baseURL: 'https://onepali-backend.onrender.com/',
  baseURL: "https://hydrometric-untimeous-ayaan.ngrok-free.dev/",
  // timeout: 10000,
});

// Refresh token function
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = await getLocalStorageData(STORAGE_KEYS.refreshToken);

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
    `${api.defaults.baseURL}${ENDPOINTS.RefreshToken}`,
    { refreshToken },
  );

  const newAccessToken = response.data.data.accessToken;
  const expiresIn = response.data.data.expiresIn;

  await storeLocalStorageData(STORAGE_KEYS.accessToken, newAccessToken);
  await storeLocalStorageData(STORAGE_KEYS.expiresIn, expiresIn.toString());

  return newAccessToken;
};

// Request interceptor to add auth token dynamically
api.interceptors.request.use(
  async (config) => {
    const token = await getLocalStorageData(STORAGE_KEYS.accessToken);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 1. Check if the error is due to request cancellation (Axios specific check)
    if (axios.isCancel(error)) {
      console.log("Request was aborted by AbortController");
      // Return a unique, silent rejection for the component to handle
      return Promise.reject({
        success: false,
        message: "Request Aborted", // Unique message
        isCancelled: true, // Unique flag for client-side check
      });
    }

    if (error.response) {
      // Handle 401 errors with token refresh
      if (error.response.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return api(error.config);
        } catch (refreshError) {
          // Clear all stored data and redirect to login
          await AsyncStorage.clear();
          return Promise.reject({
            success: false,
            message: "Session expired. Please login again.",
            requiresLogin: true,
          });
        }
      }

      // Extract API error response
      console.error("API Error:", error.response);
      return Promise.reject({
        ...error.response.data,
        status: error.response.status,
      }); // Reject with only response data
    } else {
      // Handle network or unexpected errors (excluding cancellation now)
      console.error("Network/Unexpected Error:", error.message);
      return Promise.reject({
        success: false,
        message: "Something went wrong",
      });
    }
  },
);

// API methods with optional headers and signal support
export const fetchData = <T>(
  endpoint: string,
  params?: any,
  headers?: any,
  signal?: AbortSignal,
) => api.get<ApiResponse<T>>(endpoint, { params, headers, signal });

export const postData = <T>(
  endpoint: string,
  data?: any,
  headers?: any,
  signal?: AbortSignal,
) => api.post<ApiResponse<T>>(endpoint, data, { headers, signal });

export const postFormData = <T>(
  endpoint: string,
  data: FormData,
  customHeaders?: any,
  signal?: AbortSignal,
) =>
  api.post<ApiResponse<T>>(endpoint, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...customHeaders,
    },
    signal,
  });

export const patchData = <T>(
  endpoint: string,
  data: any,
  headers?: any,
  signal?: AbortSignal,
) => api.patch<ApiResponse<T>>(endpoint, data, { headers, signal });

export const putData = <T>(
  endpoint: string,
  data: any,
  headers?: any,
  signal?: AbortSignal,
) => api.put<ApiResponse<T>>(endpoint, data, { headers, signal });

export const putFormData = <T>(
  endpoint: string,
  data: FormData,
  signal?: AbortSignal,
) =>
  api.put<ApiResponse<T>>(endpoint, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    signal,
  });

export const deleteData = <T>(
  endpoint: string,
  data?: any,
  headers?: any,
  signal?: AbortSignal,
) => api.delete<ApiResponse<T>>(endpoint, { data, signal });

export default api;
