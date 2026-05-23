import axiosClient from './axiosClient';

const receptionProfileApi = {
  getAll: (params = {}) => axiosClient.get('/reception-profiles', { params }),

  getById: (id) => axiosClient.get(`/reception-profiles/${id}`),

  create: (data) => axiosClient.post('/reception-profiles', data),

  update: (id, data) => axiosClient.put(`/reception-profiles/${id}`, data),

  delete: (id) => axiosClient.delete(`/reception-profiles/${id}`),

  approve: (id) => axiosClient.post(`/reception-profiles/${id}/approve`),

  reject: (id, reason) => axiosClient.post(`/reception-profiles/${id}/reject`, { reason }),
};

export default receptionProfileApi;
