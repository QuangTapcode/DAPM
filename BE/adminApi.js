import axiosClient from './axiosClient';

const adminApi = {
    getUsers: (params) => axiosClient.get('/users', { params }),
    getUserById: (id) => axiosClient.get(`/users/${id}`),
    createUser: (data) => axiosClient.post('/users', data),
    // API cập nhật thông tin và phân quyền
    updateUser: (id, data) => axiosClient.put(`/users/${id}`, data),
    deleteUser: (id) => axiosClient.delete(`/users/${id}`),
    // Lấy danh sách các vai trò (ADMI, QLNT, QLNN, TPQL, NGGT, NGNN)
    getRoles: () => axiosClient.get('/roles'),
    getStats: () => axiosClient.get('/stats'),
};

export default adminApi;