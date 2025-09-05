import axios from 'axios';
export const baseURL: string = import.meta.env.VITE_API_BASE_URL || '';
export const http = axios.create({ baseURL, withCredentials: false });
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error?.response?.data?.detail
      || error?.response?.data?.message
      || error?.message
      || 'Network error';
    return Promise.reject(new Error(message));
  }
);