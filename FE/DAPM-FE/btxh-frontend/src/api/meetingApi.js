import axiosClient from './axiosClient';

const meetingApi = {
  getAll: (params = {}) => axiosClient.get('/adoption-meetings', { params }),

  getByRequest: (maYeuCauNhan) =>
    axiosClient.get(`/adoption-meetings/by-request/${maYeuCauNhan}`),

  getById: (id) => axiosClient.get(`/adoption-meetings/${id}`),

  create: (data) => axiosClient.post('/adoption-meetings', data),

  update: (id, data) => axiosClient.put(`/adoption-meetings/${id}`, data),

  confirm: (id) => axiosClient.post(`/adoption-meetings/${id}/confirm`),

  recordResult: (id, data) => axiosClient.post(`/adoption-meetings/${id}/result`, data),

  delete: (id) => axiosClient.delete(`/adoption-meetings/${id}`),
};

export default meetingApi;
