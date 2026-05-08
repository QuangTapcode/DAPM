import axiosClient from './axiosClient';

// axiosClient interceptor đã unwrap response.data.data tự động

const receptionProfileApi = {
  /**
   * Danh sách hồ sơ tiếp nhận — GET /api/reception-profiles
   * params: { page, limit, status }
   * Trả về: { items, total, page, limit, totalPages }
   */
  getAll: (params = {}) =>
    axiosClient.get('/reception-profiles', { params }),

  /**
   * Chi tiết hồ sơ — GET /api/reception-profiles/:id
   */
  getById: (id) =>
    axiosClient.get(`/reception-profiles/${id}`),

  /**
   * Tạo hồ sơ tiếp nhận — POST /api/reception-profiles
   */
  create: (data) =>
    axiosClient.post('/reception-profiles', data),

  /**
   * Cập nhật hồ sơ — PUT /api/reception-profiles/:id
   */
  update: (id, data) =>
    axiosClient.put(`/reception-profiles/${id}`, data),

  /**
   * Duyệt hồ sơ — POST /api/reception-profiles/:id/approve
   */
  approve: (id, body = {}) =>
    axiosClient.post(`/reception-profiles/${id}/approve`, body),

  /**
   * Từ chối hồ sơ — POST /api/reception-profiles/:id/reject
   */
  reject: (id, body = {}) =>
    axiosClient.post(`/reception-profiles/${id}/reject`, body),
};

export default receptionProfileApi;
