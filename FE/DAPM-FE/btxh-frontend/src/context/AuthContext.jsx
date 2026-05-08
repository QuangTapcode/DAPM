import { createContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';
import axiosClient from '../api/axiosClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi app khởi động: nếu có token thì lấy thông tin user từ BE
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .getProfile()
      .then((userInfo) => {
        setUser(normalizeUser(userInfo));
      })
      .catch(() => {
        // Token hết hạn hoặc không hợp lệ
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { token, user: beUser } = await authApi.login({ email, password });
    localStorage.setItem('token', token);
    const normalized = normalizeUser(beUser);
    setUser(normalized);
    return normalized;
  }, []);

  const logout = useCallback(async () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  /**
   * Cập nhật thông tin người dùng — gọi PUT /api/users/:id
   * payload: { hoTen?, sDT?, email?, cCCD?, gioiTinh?, ngaySinh?, maXaPhuong?, diaChiCuThe? }
   */
  const updateUser = useCallback(async (payload) => {
    if (!user?.id) return;
    const updated = await axiosClient.put(`/users/${user.id}`, payload);
    const normalized = normalizeUser(updated);
    setUser(normalized);
    return normalized;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Map BE role codes → FE route keys (khớp với ROLES constants)
const BE_ROLE_MAP = {
  ADMI: 'admin',
  QLNT: 'staff_reception',
  QLNN: 'staff_adoption',
  NGGT: 'sender',
  NGNN: 'adopter',
  TPQL: 'manager',
};

/**
 * Chuẩn hóa đối tượng user từ BE (camelCase) sang shape mà FE dùng.
 * BE trả: { id, fullName, email, phone, cccd, gioiTinh, ngaySinh,
 *           maXaPhuong, diaChiCuThe, isActive, roles, role }
 */
function normalizeUser(u) {
  // BE trả role codes dạng ['NGGT','NGNN'] — dịch sang FE keys
  const rawRoles = u.roles || [];
  const feRoles = rawRoles.map(r => BE_ROLE_MAP[r] || r.toLowerCase().replace(/-/g, '_'));

  // primary role: từ u.role (đã qua ToFeKey BE) hoặc lấy feRoles[0]
  const primary = (u.role || feRoles[0] || 'guest').replace(/-/g, '_');

  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    cccd: u.cccd || u.cCCD,
    gioiTinh: u.gioiTinh,
    ngaySinh: u.ngaySinh,
    maXaPhuong: u.maXaPhuong,
    diaChiCuThe: u.diaChiCuThe,
    isActive: u.isActive,
    roles: rawRoles,       // BE codes gốc
    feRoles,               // FE keys đã dịch (tất cả vai trò)
    role: primary,         // primary FE key (dùng cho redirect)
  };
}
