import axiosClient from './axiosClient';

const documentApi = {
  getAll: (params = {}) => axiosClient.get('/documents', { params }),
  getById: (id) => axiosClient.get(`/documents/${id}`),
  verify: (id, status) =>
    axiosClient.patch(`/documents/${id}/verify`, null, { params: { status } }),
};

export default documentApi;
