import axiosClient from './axiosClient';

const meetingApi = {
  getAll: (params = {}) => axiosClient.get('/meetings', { params }),

  getById: (id) => axiosClient.get(`/meetings/${id}`),

  create: (data) => axiosClient.post('/meetings', data),

  update: (id, data) => axiosClient.put(`/meetings/${id}`, data),

  delete: (id) => axiosClient.delete(`/meetings/${id}`),
};

export default meetingApi;
