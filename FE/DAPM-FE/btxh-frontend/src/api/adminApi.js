import axiosClient from './axiosClient';

const adminApi = {
  // ─── Quản lý người dùng (/api/users) ─────────────────────────

  /**
   * Danh sách người dùng — GET /api/users
   * params: { page, limit, search, role }
   * Trả về: { items, total, page, limit, totalPages }
   */
  getUsers: (params = {}) =>
    axiosClient.get('/users', { params }),

  /**
   * Chi tiết người dùng — GET /api/users/:id
   */
  getUserById: (id) =>
    axiosClient.get(`/users/${id}`),

  /**
   * Tạo người dùng — POST /api/users
   * body: { SDT, HoTen, Password?, GioiTinh, NgaySinh?, CCCD?, Email?,
   *         MaXaPhuong?, DiaChiCuThe?, Roles? }
   */
  createUser: (data) =>
    axiosClient.post('/users', data),

  /**
   * Cập nhật người dùng — PUT /api/users/:id
   * body: { HoTen?, SDT?, Email?, CCCD?, GioiTinh?, NgaySinh?,
   *         MaXaPhuong?, DiaChiCuThe?, TrangThaiTK?, Roles? }
   */
  updateUser: (id, data) =>
    axiosClient.put(`/users/${id}`, data),

  /**
   * Khóa/mở tài khoản — PATCH /api/users/:id/status
   * body: { trangThaiTK: bool }
   */
  updateStatus: (id, trangThaiTK) =>
    axiosClient.patch(`/users/${id}/status`, { trangThaiTK }),

  /**
   * Xóa người dùng — DELETE /api/users/:id
   */
  deleteUser: (id) =>
    axiosClient.delete(`/users/${id}`),

  // ─── Thống kê (/api/stats) ────────────────────────────────────

  /**
   * Thống kê tổng quan — GET /api/stats
   */
  getStats: () =>
    axiosClient.get('/stats'),

  /**
   * Phân bố trẻ theo trạng thái — GET /api/stats/children-by-status
   */
  getChildrenByStatus: () =>
    axiosClient.get('/stats/children-by-status'),

  /**
   * Yêu cầu theo tháng — GET /api/stats/requests-by-month
   */
  getRequestsByMonth: () =>
    axiosClient.get('/stats/requests-by-month'),

  // ─── Vai trò (/api/roles) ─────────────────────────────────────

  /**
   * Danh sách vai trò — GET /api/roles
   */
  getRoles: () =>
    axiosClient.get('/roles'),
};

export default adminApi;
