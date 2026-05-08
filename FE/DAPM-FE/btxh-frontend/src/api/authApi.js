import axiosClient from './axiosClient';

// axiosClient interceptor đã unwrap response.data.data tự động
// KHÔNG gọi thêm .then(extract) vì sẽ bị double-unwrap

const authApi = {
  /**
   * Đăng nhập — POST /api/auth/login
   * @param {{ email: string, password: string }} credentials
   * @returns {{ token: string, user: object }}
   */
  login: (credentials) =>
    axiosClient.post('/auth/login', credentials),

  /**
   * Đăng ký — POST /api/auth/register
   * Body: { SDT, Password, FullName, NgaySinh?, GioiTinh, CCCD?, Email?, MaXaPhuong?, DiaChiCuThe? }
   */
  register: (data) =>
    axiosClient.post('/auth/register', data),

  /**
   * Lấy thông tin người dùng hiện tại — GET /api/auth/profile
   */
  getProfile: () =>
    axiosClient.get('/auth/profile'),

  /**
   * Đổi mật khẩu — POST /api/auth/change-password
   * Body: { oldPassword, newPassword }
   */
  changePassword: (data) =>
    axiosClient.post('/auth/change-password', data),

  /**
   * Đăng xuất — POST /api/auth/logout (stateless, FE chỉ cần xóa token)
   */
  logout: () =>
    axiosClient.post('/auth/logout'),

  /**
   * Refresh token — POST /api/auth/refresh
   */
  refreshToken: () =>
    axiosClient.post('/auth/refresh'),

  /**
   * Cập nhật thông tin cá nhân — PUT /api/auth/profile
   * Body: { FullName, SDT, CCCD, GioiTinh, NgaySinh, DiaChiCuThe, MaXaPhuong? }
   */
  updateProfile: (data) =>
    axiosClient.put('/auth/profile', data),
};

export default authApi;
