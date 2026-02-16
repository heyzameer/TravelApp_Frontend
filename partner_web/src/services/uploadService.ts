import type { ApiResponse, UploadProgress } from "../types";
export type { UploadProgress };
import api from "./api";

export class UploadService {
  static async uploadWithProgress<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: UploadProgress) => void,
    timeout: number = 180000 // 3 minutes default
  ): Promise<T> {
    try {
      const response = await api.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
            };
            onProgress(progress);
          }
        }
      });

      return response.data.data;
    } catch (error) {
      const err = error as {
        code?: string;
        response?: {
          status?: number;
          data?: { message?: string }
        };
        message?: string;
      };

      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        throw new Error('Upload timeout - please check your internet connection and try again');
      }

      if (err.response?.status === 413) {
        throw new Error('Files are too large - please reduce file sizes and try again');
      }

      const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
      throw new Error(errorMessage);
    }
  }
}