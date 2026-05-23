import axiosClient from './axiosClient';

const adoptionProfileApi = {
  getAll: (params = {}) => axiosClient.get('/adoption-profiles', { params }),

  getById: (id) => axiosClient.get(`/adoption-profiles/${id}`),

  create: (data) => axiosClient.post('/adoption-profiles', data),

  update: (id, data) => axiosClient.put(`/adoption-profiles/${id}`, data),

  approve: (id) => axiosClient.post(`/adoption-profiles/${id}/approve`),

  reject: (id, reason) => axiosClient.post(`/adoption-profiles/${id}/reject`, { reason }),

  delete: (id) => axiosClient.delete(`/adoption-profiles/${id}`),
};

export default adoptionProfileApi;
