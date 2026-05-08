import axiosClient from './axiosClient';

// axiosClient interceptor đã unwrap response.data.data tự động

const adoptionApi = {
  /**
   * Danh sách yêu cầu nhận nuôi — GET /api/adoptions
   * params: { page, limit, status, adopterId }
   * Trả về: { items, total, page, limit, totalPages }
   */
  getAll: (params = {}) =>
    axiosClient.get('/adoptions', { params }),

  /**
   * Chi tiết yêu cầu — GET /api/adoptions/:id
   */
  getById: (id) =>
    axiosClient.get(`/adoptions/${id}`),

  /**
   * Tạo yêu cầu nhận nuôi — POST /api/adoptions
   */
  create: (data) =>
    axiosClient.post('/adoptions', data),

  /**
   * Cập nhật yêu cầu — PUT /api/adoptions/:id
   */
  update: (id, data) =>
    axiosClient.put(`/adoptions/${id}`, data),

  /**
   * Duyệt yêu cầu — POST /api/adoptions/:id/approve
   * body: { ghiChu? }
   */
  approve: (id, body = {}) =>
    axiosClient.post(`/adoptions/${id}/approve`, body),

  /**
   * Từ chối yêu cầu — POST /api/adoptions/:id/reject
   * body: { ghiChu? }
   */
  reject: (id, body = {}) =>
    axiosClient.post(`/adoptions/${id}/reject`, body),

  /**
   * Xóa yêu cầu — DELETE /api/adoptions/:id
   */
  remove: (id) =>
    axiosClient.delete(`/adoptions/${id}`),

  // ─── Hồ sơ nhận nuôi (/api/adoption-profiles) ───────────────

  /**
   * Danh sách hồ sơ nhận nuôi — GET /api/adoption-profiles
   * params: { page, limit, status }
   */
  getAllProfiles: (params = {}) =>
    axiosClient.get('/adoption-profiles', { params }),

  /**
   * Chi tiết hồ sơ — GET /api/adoption-profiles/:id
   */
  getProfileById: (id) =>
    axiosClient.get(`/adoption-profiles/${id}`),

  /**
   * Tạo hồ sơ nhận nuôi — POST /api/adoption-profiles
   */
  createProfile: (data) =>
    axiosClient.post('/adoption-profiles', data),

  /**
   * Cập nhật hồ sơ — PUT /api/adoption-profiles/:id
   */
  updateProfile: (id, data) =>
    axiosClient.put(`/adoption-profiles/${id}`, data),

  /**
   * Duyệt hồ sơ — POST /api/adoption-profiles/:id/approve
   */
  approveProfile: (id, body = {}) =>
    axiosClient.post(`/adoption-profiles/${id}/approve`, body),

  /**
   * Từ chối hồ sơ — POST /api/adoption-profiles/:id/reject
   */
  rejectProfile: (id, body = {}) =>
    axiosClient.post(`/adoption-profiles/${id}/reject`, body),

  // ─── Giấy tờ (/api/documents) ────────────────────────────────

  /**
   * Danh sách giấy tờ — GET /api/documents
   * params: { maYeuCauGuiTre?, maYeuCauNhan?, status? }
   */
  getDocuments: (params = {}) =>
    axiosClient.get('/documents', { params }),

  /**
   * Upload file giấy tờ — POST /api/documents/upload (multipart/form-data)
   * formData phải chứa: file, subfolder?
   * Trả về: { filePath }
   */
  uploadDocument: (formData) =>
    axiosClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Tạo bản ghi giấy tờ — POST /api/documents
   */
  createDocument: (data) =>
    axiosClient.post('/documents', data),

  /**
   * Xác minh giấy tờ — PATCH /api/documents/:id/verify
   * body: { trangThai }
   */
  verifyDocument: (id, body) =>
    axiosClient.patch(`/documents/${id}/verify`, body),
};

export default adoptionApi;
