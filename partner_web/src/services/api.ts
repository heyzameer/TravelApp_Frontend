import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import { authService } from './auth';

interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {

    const token = authService.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Prevent infinite loop if refresh token itself fails with 401 or if it's already a retry
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh-token') &&
      !originalRequest.url?.includes('/auth/logout')
    ) {
      const errorMessage = (error.response?.data as { message?: string })?.message || "";

      // IF ACCOUNT IS DEACTIVATED, DO NOT REFRESH - LOGOUT IMMEDIATELY
      if (errorMessage.toLowerCase().includes("deactivated")) {
        toast.error("Your account has been deactivated. Please contact support.");
        authService.clearTokens();
        if (window.location.pathname !== '/partner/login') {
          window.location.href = '/partner/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await authService.refreshAccessToken();
        if (newToken) {
          isRefreshing = false;
          processQueue(null, newToken);

          if (!originalRequest.headers) {
            originalRequest.headers = {};
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // Refresh returned null (failed)
          throw new Error("Refresh failed");
        }
      } catch (refreshError: unknown) {
        isRefreshing = false;

        const refreshErrorResponse = (refreshError as AxiosError)?.response;
        const refreshErrorMessage = (refreshErrorResponse?.data as { message?: string })?.message || "";

        if (refreshErrorMessage.toLowerCase().includes("deactivated")) {
          toast.error("Your account has been deactivated. Please contact support.");
        } else {
          toast.error("Session expired. Please login again.");
        }

        processQueue(refreshError, null);
        authService.clearTokens();
        if (window.location.pathname !== '/partner/login') {
          window.location.href = '/partner/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;