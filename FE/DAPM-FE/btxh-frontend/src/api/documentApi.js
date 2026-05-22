import axiosClient from './axiosClient';

const documentApi = {
    getDocuments: (params = {}) => {
        return axiosClient.get('/documents', { params });
    },

    getById: (id) => {
        return axiosClient.get(`/documents/${id}`);
    },

    create: (payload) => {
        return axiosClient.post('/documents', payload);
    },

    update: (id, payload) => {
        return axiosClient.put(`/documents/${id}`, payload);
    },

    delete: (id) => {
        return axiosClient.delete(`/documents/${id}`);
    },

    upload: (formData) => {
        return axiosClient.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default documentApi;