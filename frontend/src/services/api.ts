/**
 * Base Axios instance configuration
 * Handles API communication with the backend
 */

import axios, { type AxiosError, type AxiosInstance } from 'axios';
import type { ApiError } from '../types';

/**
 * Create and configure the base Axios instance
 */
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Enable sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Response interceptor for error handling
 * Transforms API errors into a consistent format
 */
api.interceptors.response.use(
  (response) => {
    // Pass through successful responses
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle error responses
    if (error.response) {
      // Server responded with error status
      const apiError: ApiError = {
        code: error.response.data?.code || 'UNKNOWN_ERROR',
        message: error.response.data?.message || '서버 오류가 발생했습니다.',
        statusCode: error.response.status,
      };
      return Promise.reject(apiError);
    } else if (error.request) {
      // Request was made but no response received
      const networkError: ApiError = {
        code: 'NETWORK_ERROR',
        message: '네트워크 연결을 확인해주세요.',
        statusCode: 0,
      };
      return Promise.reject(networkError);
    } else {
      // Something else happened
      const unknownError: ApiError = {
        code: 'UNKNOWN_ERROR',
        message: '알 수 없는 오류가 발생했습니다.',
        statusCode: 0,
      };
      return Promise.reject(unknownError);
    }
  }
);

export default api;
