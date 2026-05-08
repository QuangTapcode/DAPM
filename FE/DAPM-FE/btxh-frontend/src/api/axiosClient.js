import axios from 'axios';

const axiosClient = axios.create({
  // Đảm bảo trỏ đúng vào port 8080 của Backend
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: Tự động gắn Token vào tất cả API
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor: Tự động Unwrap dữ liệu
axiosClient.interceptors.response.use(
  (response) => {
    if (response.data && Object.prototype.hasOwnProperty.call(response.data, 'data')) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/dang-nhap';
    }
    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;