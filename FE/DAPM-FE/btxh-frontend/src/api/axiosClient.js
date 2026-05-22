import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:44380/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (error.config?.url !== '/auth/login' && window.location.pathname !== '/dang-nhap') {
        window.location.href = '/dang-nhap';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
