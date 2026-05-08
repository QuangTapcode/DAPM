import axiosClient from './axiosClient';

const adminApi = {
  getUsers: (params = {}) => axiosClient.get('/users', { params }),

  getUserById: (id) => axiosClient.get(`/users/${id}`),

  createUser: (data) => axiosClient.post('/users', data),

  updateUser: (id, data) => axiosClient.put(`/users/${id}`, data),

  deleteUser: (id) => axiosClient.delete(`/users/${id}`),

  setUserStatus: (id, isActive) =>
    axiosClient.patch(`/users/${id}/status`, { isActive }),

  getStats: () => axiosClient.get('/stats'),

  getChildrenByStatus: () => axiosClient.get('/stats/children-by-status'),

  getRequestsByMonth: () => axiosClient.get('/stats/requests-by-month'),

  // Danh mục dùng chung (không cần token)
  getTinhTP: () => axiosClient.get('/lookups/tinh-tp'),
  getPhuongXa: (maTinhTP) => axiosClient.get('/lookups/phuong-xa', { params: { maTinhTP } }),
  getVacxin: () => axiosClient.get('/lookups/vacxin'),
  getLoaiNguoiGui: () => axiosClient.get('/lookups/loai-nguoi-gui'),
  getTrangThaiTre: () => axiosClient.get('/lookups/trang-thai-tre'),
  getTrangThaiYCGuiTre: () => axiosClient.get('/lookups/trang-thai-yeu-cau-gui-tre'),
  getTrangThaiYCNhanNuoi: () => axiosClient.get('/lookups/trang-thai-yeu-cau-nhan-nuoi'),
  getTrangThaiGiayTo: () => axiosClient.get('/lookups/trang-thai-giay-to'),

  getRoles: () => axiosClient.get('/roles'),
  getPermissions: () => axiosClient.get('/roles/permissions'),
};

export default adminApi;
