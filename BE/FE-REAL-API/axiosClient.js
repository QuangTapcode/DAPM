import axios from 'axios';

/**
 * Axios client dùng chung cho toàn bộ FE.
 *
 * BE trả response đóng gói: { success, message, data }.
 * Ở đây ta unwrap luôn trường `data` để các api module gọi `axiosClient.get(...)` là nhận thẳng payload.
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    // ApiResponse<T> -> { success, message, data }
    if (body && typeof body === 'object' && 'data' in body && 'success' in body) {
      if (body.success === false) {
        return Promise.reject(new Error(body.message || 'Request failed'));
      }
      return body.data;
    }
    return body;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const payload = error.response?.data;
    const message = payload?.message || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
