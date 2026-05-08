import axiosClient from './axiosClient';

// axiosClient interceptor đã unwrap response.data.data tự động

export const childApi = {
  // ─── Trẻ (/api/children) ─────────────────────────────────────
  getAll: (params) => axiosClient.get('/children', { params }),
  getById: (id) => axiosClient.get(`/children/${id}`),
  create: (data) => axiosClient.post('/children', data),
  update: (id, data) => axiosClient.put(`/children/${id}`, data),

  // Sức khỏe — GET /children/:id/health (TreController), POST /health-records (TheoDoiSucKhoeController)
  getHealth: (childId) => axiosClient.get(`/children/${childId}/health`),
  addHealth: (childId, data) => axiosClient.post('/health-records', {
    MaTre: childId,
    CanNang: data.weight ?? data.canNang ?? undefined,
    ChieuCao: data.height ?? data.chieuCao ?? undefined,
    NhipTim: data.nhipTim ?? undefined,
    NhomMau: data.nhomMau ?? undefined,
    NhietDo: data.nhietDo ?? undefined,
    KetLuan: data.diagnosis ?? data.ketLuan ?? undefined,
    TinhTrangChiTiet: data.notes ?? data.tinhTrangChiTiet ?? undefined,
  }),

  // ─── Yêu cầu gửi trẻ (/api/receptions) ──────────────────────
  // Các hàm này trỏ đúng vào /receptions thay vì /child-requests
  getRequests: (params) => axiosClient.get('/receptions', { params }),
  getRequestById: (id) => axiosClient.get(`/receptions/${id}`),
  updateRequest: (id, data) => axiosClient.put(`/receptions/${id}`, data),

  // Duyệt / từ chối yêu cầu gửi trẻ
  approveRequest: (id, body = {}) => axiosClient.post(`/receptions/${id}/approve`, body),
  rejectRequest: (id, body = {}) => axiosClient.post(`/receptions/${id}/reject`, body),

  // Tạo hồ sơ tiếp nhận (trực tiếp approve yêu cầu)
  createReceptionProfile: (data) => axiosClient.post('/reception-profiles', data),
};

export default childApi;
