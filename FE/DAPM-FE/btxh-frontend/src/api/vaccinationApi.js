import axiosClient from './axiosClient';

const vaccinationApi = {
  getAll: (params = {}) => axiosClient.get('/vaccinations', { params }),
  create: (data) => axiosClient.post('/vaccinations', data),
  update: (id, data) => axiosClient.put(`/vaccinations/${id}`, data),
  delete: (id) => axiosClient.delete(`/vaccinations/${id}`),
};

export default vaccinationApi;
