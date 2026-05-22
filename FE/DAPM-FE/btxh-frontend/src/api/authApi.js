import axiosClient from './axiosClient';

const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),

  register: (data) => axiosClient.post('/auth/register', data),

  logout: () => axiosClient.post('/auth/logout'),

  getProfile: () => axiosClient.get('/auth/profile'),

  refreshToken: () => axiosClient.post('/auth/refresh'),

  changePassword: (payload) => axiosClient.post('/auth/change-password', payload),

  updateProfile: (id, payload) => axiosClient.put(`/users/${id}`, payload),
};

export default authApi;
