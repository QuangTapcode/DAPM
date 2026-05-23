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

  createMeeting: (payload) => {
    return axiosClient.post('/meetings', payload);
  },

  updateMeeting: (id, payload) => {
    return axiosClient.put(`/meetings/${id}`, payload);
  },

  getMeetings: (params = {}) => {
    return axiosClient.get('/meetings', { params });
  },

  createProfile: (payload) => {
    return axiosClient.post('/adoption-profiles', payload);
  },

  reject: (id, payload = {}) => {
    return axiosClient.post(`/adoptions/${id}/reject`, payload);
  },

  getMatchingChildren: (id, params = {}) => {
    return axiosClient.get(`/adoptions/${id}/matching-children`, { params });
  },

  getAdoptionProfiles: (params = {}) => {
    return axiosClient.get('/adoption-profiles', { params });
  },

  getProfileById: (id) => {
    return axiosClient.get(`/adoption-profiles/${id}`);
  },

  getDocuments: (params = {}) => {
    return axiosClient.get('/documents', { params });
  },

  getChildById: (id) => {
    return axiosClient.get(`/children/${id}`);
  },
};

export default adoptionApi;