import axiosClient from './axiosClient';

const authApi = {
  login: async (credentials) => {
    return axiosClient.post('/auth/login', credentials);
  },

  register: async (data) => {
    return axiosClient.post('/auth/register', data);
  },

  updateProfile: async (payload) => {
    return axiosClient.put('/auth/profile', payload);
  },

  logout: async () => {
    return axiosClient.post('/auth/logout');
  },

  getProfile: async () => {
    return axiosClient.get('/auth/profile');
  },

  refreshToken: async () => {
    return axiosClient.post('/auth/refresh');
  },

  changePassword: async (data) => {
    return axiosClient.post('/auth/change-password', data);
  }
};

export default authApi;
