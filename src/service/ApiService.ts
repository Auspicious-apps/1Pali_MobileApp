import axios from 'axios';
import { getLocalStorageData } from '../utils/Helpers';
import STORAGE_KEYS from '../utils/Constants';

type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
  error: any;
};

// Create the Axios instance
const api = axios.create({
  baseURL: 'https://onepali-backend.onrender.com/',
  // baseURL: '',
  // timeout: 10000,
});

// Request interceptor to add auth token dynamically
api.interceptors.request.use(
  async config => {
    const token = await getLocalStorageData(STORAGE_KEYS.deviceId);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // 1. Check if the error is due to request cancellation (Axios specific check)
    if (axios.isCancel(error)) {
      console.log('Request was aborted by AbortController');
      // Return a unique, silent rejection for the component to handle
      return Promise.reject({
        success: false,
        message: 'Request Aborted', // Unique message
        isCancelled: true, // Unique flag for client-side check
      });
    }

    if (error.response) {
      // Extract API error response
      console.error('API Error:', error.response);
      return Promise.reject({
        ...error.response.data,
        status: error.response.status,
      }); // Reject with only response data
    } else {
      // Handle network or unexpected errors (excluding cancellation now)
      console.error('Network/Unexpected Error:', error.message);
      return Promise.reject({
        success: false,
        message: 'Something went wrong',
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
      'Content-Type': 'multipart/form-data',
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
      'Content-Type': 'multipart/form-data',
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
