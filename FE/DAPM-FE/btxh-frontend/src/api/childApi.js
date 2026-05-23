import axiosClient from './axiosClient';

const childApi = {
  getAll: (params = {}) => axiosClient.get('/children', { params }),

  getById: (id) => axiosClient.get(`/children/${id}`),

  create: (data) => axiosClient.post('/children', data),

  update: (id, data) => axiosClient.put(`/children/${id}`, data),

  delete: (id) => axiosClient.delete(`/children/${id}`),

  getVaccinations: (id) => axiosClient.get(`/children/${id}/vaccinations`),

  getHealthRecords: (id) => axiosClient.get(`/children/${id}/health`),

  uploadDocument: (id, formData) => {
    if (!formData.has('MaTre')) formData.append('MaTre', id);
    return axiosClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default childApi;
