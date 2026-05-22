import axiosClient from './axiosClient';

const adoptionApi = {
  create: (payload) => {
    return axiosClient.post('/adoptions', payload);
  },

  submit: (formData) => {
    return axiosClient.post('/adoptions/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getAll: (params = {}) => {
    return axiosClient.get('/adoptions', { params });
  },

  getById: (id) => {
    return axiosClient.get(`/adoptions/${id}`);
  },

  delete: (id) => {
    return axiosClient.delete(`/adoptions/${id}`);
  },

  approve: (id) => {
    return axiosClient.post(`/adoptions/${id}/approve`);
  },

  startMatching: (id) => {
    return axiosClient.post(`/adoptions/${id}/start-matching`);
  },

  reject: (id, payload = {}) => {
    return axiosClient.post(`/adoptions/${id}/reject`, payload);
  },

  getMatchingChildren: (id, params = {}) => {
    return axiosClient.get(`/adoptions/${id}/matching-children`, { params });
  },
};

export default adoptionApi;