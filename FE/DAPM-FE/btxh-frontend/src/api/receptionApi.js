import axiosClient from './axiosClient';

// axiosClient interceptor đã unwrap response.data.data tự động

const receptionApi = {
  /**
   * Danh sách yêu cầu gửi trẻ — GET /api/receptions
   * params: { page, limit, status, senderId }
   * Trả về: { items, total, page, limit, totalPages }
   */
  getAll: (params = {}) =>
    axiosClient.get('/receptions', { params }),

  /**
   * Chi tiết yêu cầu — GET /api/receptions/:id
   */
  getById: (id) =>
    axiosClient.get(`/receptions/${id}`),

  /**
   * Tạo yêu cầu gửi trẻ — POST /api/receptions
   */
  create: (data) =>
    axiosClient.post('/receptions', data),

  /**
   * Cập nhật yêu cầu — PUT /api/receptions/:id
   */
  update: (id, data) =>
    axiosClient.put(`/receptions/${id}`, data),

  /**
   * Duyệt yêu cầu — POST /api/receptions/:id/approve
   * body: { ghiChu? }
   */
  approve: (id, body = {}) =>
    axiosClient.post(`/receptions/${id}/approve`, body),

  /**
   * Từ chối yêu cầu — POST /api/receptions/:id/reject
   * body: { ghiChu? }
   */
  reject: (id, body = {}) =>
    axiosClient.post(`/receptions/${id}/reject`, body),

  /**
   * Hủy yêu cầu — DELETE /api/receptions/:id
   */
  cancel: (id) =>
    axiosClient.delete(`/receptions/${id}`),
};

export default receptionApi;
