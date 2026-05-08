import axiosClient from './axiosClient';

const adoptionApi = {
  getAll: (params = {}) => axiosClient.get('/adoptions', { params }),

  getById: (id) => axiosClient.get(`/adoptions/${id}`),

  create: (data) => axiosClient.post('/adoptions', data),

  update: (id, data) => axiosClient.put(`/adoptions/${id}`, data),

  approve: (id) => axiosClient.post(`/adoptions/${id}/approve`),

  reject: (id, reason) => axiosClient.post(`/adoptions/${id}/reject`, { reason }),

  uploadDocument: (id, formData) => {
    // map YCNN -> document upload
    if (!formData.has('MaYeuCauNN')) formData.append('MaYeuCauNN', id);
    return axiosClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default adoptionApi;
