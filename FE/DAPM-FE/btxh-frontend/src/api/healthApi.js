import axiosClient from './axiosClient';

const healthApi = {
  getAll: (params = {}) => axiosClient.get('/health-records', { params }),
  getById: (id) => axiosClient.get(`/health-records/${id}`),
  create: (data) => axiosClient.post('/health-records', data),
  update: (id, data) => axiosClient.put(`/health-records/${id}`, data),
  delete: (id) => axiosClient.delete(`/health-records/${id}`),
};

export default healthApi;
