import axiosClient from './axiosClient';

const receptionApi = {
  getAll: (params = {}) => axiosClient.get('/receptions', { params }),

  getById: (id) => axiosClient.get(`/receptions/${id}`),

  create: (data) => axiosClient.post('/receptions', data),

  update: (id, data) => axiosClient.put(`/receptions/${id}`, data),

  approve: (id) => axiosClient.post(`/receptions/${id}/approve`),

  reject: (id, reason) => axiosClient.post(`/receptions/${id}/reject`, { reason }),

  uploadDocument: (id, formData) => {
    if (!formData.has('maYeuCauGuiTre')) formData.append('maYeuCauGuiTre', id);
    return axiosClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default receptionApi;
