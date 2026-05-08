// ============================================================
// src/utils/constants.js
// ============================================================
export const ROLES = {
  ADMIN: 'admin',
  SENDER: 'sender',
  ADOPTER: 'adopter',
  STAFF_RECEPTION: 'staff_reception',
  STAFF_ADOPTION: 'staff_adoption',
  MANAGER: 'manager',
};

export const REQUEST_STATUS = {
  PENDING: 'pending',
  MISSING_INFO: 'missing_info',
  INVALID: 'invalid',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const STATUS_LABELS = {
  pending: 'Đang chờ xử lý',
  missing_info: 'Thiếu thông tin',
  invalid: 'Không hợp lệ',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  missing_info: 'bg-orange-100 text-orange-800',
  invalid: 'bg-red-100 text-red-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-gray-100 text-gray-800',
};


// ============================================================
// src/context/AuthContext.jsx   — Người 1 sở hữu
// ============================================================
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const isAuthenticated = !!token;

  useEffect(() => {
    // TODO: Khi có BE, gọi /api/me để lấy thông tin user từ token
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  function login(userData, accessToken) {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


// ============================================================
// src/hooks/useAuth.js
// ============================================================
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  return useContext(AuthContext);
}


// ============================================================
// src/api/authApi.js   — Người 1 sở hữu
// ============================================================
// Trong code thực tế, hãy sử dụng axiosClient.js cho toàn bộ các API
// const axiosClient = ...

export const authApi = {
  login: (email, password) => axiosClient.post('/auth/login', { email, password }),
  register: (data) => axiosClient.post('/auth/register', data),
  getMe: () => axiosClient.get('/auth/profile'),
};


// ============================================================
// src/api/childApi.js   — Người 3 sở hữu
// ============================================================
export const childApi = {
  getAll: (params) => axiosClient.get('/children', { params }),
  getById: (id) => axiosClient.get(`/children/${id}`),
  create: (data) => axiosClient.post('/children', data),
  update: (id, data) => axiosClient.put(`/children/${id}`, data),
  getHealth: (childId) => axiosClient.get(`/children/${childId}/health`),
  // Gọi API lưu Health Record đúng theo BE
  addHealth: (childId, data) => axiosClient.post(`/health-records`, { ...data, maTre: childId }),

  // Yêu cầu gửi trẻ
  getRequests: (params) => axiosClient.get('/receptions', { params }),
  getRequestById: (id) => axiosClient.get(`/receptions/${id}`),
  approveRequest: (id, note) => axiosClient.post(`/receptions/${id}/approve`, null, { params: { ghiChu: note } }),
  rejectRequest: (id, reason) => axiosClient.post(`/receptions/${id}/reject`, { reason, reasonReject: reason }),
  createReceptionProfile: (data) => axiosClient.post('/reception-profiles', data),
};


// ============================================================
// src/api/adoptionApi.js   — Người 2 (tạo YC) + Người 4 (xử lý YC)
// ============================================================
export const adoptionApi = {
  // Người nhận nuôi (Người 2)
  createRequest: (data) => axiosClient.post('/adoptions', data),
  updateRequest: (id, data) => axiosClient.put(`/adoptions/${id}`, data),
  uploadDocument: (formData) => axiosClient.post(`/documents/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Cán bộ nhận nuôi + Trưởng phòng (Người 4)
  getAll: (params) => axiosClient.get('/adoptions', { params }),
  getById: (id) => axiosClient.get(`/adoptions/${id}`),
  approveRequest: (id) => axiosClient.post(`/adoptions/${id}/approve`),
  rejectRequest: (id, reason) => axiosClient.post(`/adoptions/${id}/reject`, { reason, reasonReject: reason }),
  createProfile: (data) => axiosClient.post('/adoption-profiles', data),
  approveProfile: (id) => axiosClient.post(`/adoption-profiles/${id}/approve`),
};


// ============================================================
// src/api/adminApi.js   — Người 1 sở hữu
// ============================================================
// import { adminApi } from './adminApi';


// ============================================================
// src/components/common/Badge.jsx   — Shared component
// ============================================================
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';

export default function Badge({ status }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}


// ============================================================
// src/pages/guest/LoginPage.jsx   — Người 1 (ví dụ scaffold)
// ============================================================
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/authApi';
import { ROLES } from '../../utils/constants';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const ROLE_REDIRECT = {
    [ROLES.SENDER]: '/gui-tre',
    [ROLES.ADOPTER]: '/nhan-nuoi',
    [ROLES.STAFF_RECEPTION]: '/can-bo-tiep-nhan',
    [ROLES.STAFF_ADOPTION]: '/can-bo-nhan-nuoi',
    [ROLES.MANAGER]: '/truong-phong',
    [ROLES.ADMIN]: '/admin/tai-khoan',
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // TODO: Thay bằng API thật khi có BE
      // const res = await authApi.login(form.email, form.password);
      // login(res.data.user, res.data.token);
      // navigate(ROLE_REDIRECT[res.data.user.role] || '/');

      // Mock login tạm thời
      const mockUser = { id: 1, name: 'Test User', role: ROLES.SENDER, email: form.email };
      login(mockUser, 'mock-token-123');
      navigate(ROLE_REDIRECT[mockUser.role]);
    } catch (err) {
      setError('Email hoặc mật khẩu không đúng');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Đăng nhập</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input type="password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}


// ============================================================
// src/pages/staff-reception/ChildRequestList.jsx  — Người 3 (ví dụ scaffold)
// ============================================================
// Mock data — xóa khi có BE
const MOCK_REQUESTS = [
  { id: 1, childName: 'Nguyễn Văn A', senderName: 'Trần Thị B', submittedAt: '2026-03-10', status: 'pending' },
  { id: 2, childName: 'Lê Thị C', senderName: 'Phạm Văn D', submittedAt: '2026-03-12', status: 'missing_info' },
];

export default function ChildRequestList() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // TODO: Thay bằng API thật
    // childApi.getRequests().then(res => setRequests(res.data));
    setRequests(MOCK_REQUESTS);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Danh sách yêu cầu gửi trẻ</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Tên trẻ</th>
              <th className="px-4 py-3 text-left">Người gửi</th>
              <th className="px-4 py-3 text-left">Ngày nộp</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{req.childName}</td>
                <td className="px-4 py-3">{req.senderName}</td>
                <td className="px-4 py-3">{req.submittedAt}</td>
                <td className="px-4 py-3"><Badge status={req.status} /></td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:underline text-sm">Xem chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ============================================================
// src/App.jsx
// ============================================================
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
