import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../api/adminApi';

const ROLE_LABELS = {
  ADMI: 'Admin',
  TPQL: 'Trưởng phòng',
  QLNT: 'Cán bộ tiếp nhận',
  QLNN: 'Cán bộ nhận nuôi',
  NGGT: 'Người gửi trẻ',
  NGNN: 'Người nhận nuôi',
};

function getRoleDisplay(roles) {
  if (!Array.isArray(roles) || roles.length === 0) return 'Chưa phân quyền';
  return roles.map((r) => ROLE_LABELS[r] || r).join(', ');
}

export default function AccountList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminApi.getUsers();
      // Unwrap an toàn từ biến items nếu BE trả về PagedResult
      const data = res?.items || res?.data?.items || res || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Không thể kết nối đến Backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Mở / Khóa trạng thái tài khoản
  const handleToggleStatus = async (id, currentStatus) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ${currentStatus ? 'khóa' : 'mở khóa'} tài khoản này?`)) return;
    try {
      await adminApi.updateStatus(id, !currentStatus);
      fetchUsers();
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.')) return;
    try {
      await adminApi.deleteUser(id);
      alert('Đã xóa tài khoản thành công.');
      fetchUsers();
    } catch (err) {
      // BE trả 400 nếu có dữ liệu liên quan (đã tự khóa tài khoản thay thế)
      alert(err.message || 'Lỗi xóa tài khoản.');
      fetchUsers();
    }
  };

  if (loading) return <div className="p-6">Đang tải danh sách tài khoản...</div>;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0D47A1]">Quản lý Tài khoản</h1>
        <button
          onClick={() => navigate('/admin/accounts/new')}
          className="bg-[#0D47A1] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition font-semibold"
        >
          + Thêm tài khoản
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600 border border-red-200">
          <p className="font-semibold">Lỗi tải dữ liệu:</p>
          <p>{error}</p>
          <p className="text-sm mt-1 italic">* Đảm bảo Backend đang chạy ở cổng 8080 và bạn đã đăng nhập quyền Admin.</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden border border-[#E3ECF8]">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#F8FBFF] border-b border-[#E3ECF8]">
            <tr>
              <th className="px-6 py-4 font-bold text-[#0D47A1]">Họ và tên</th>
              <th className="px-6 py-4 font-bold text-[#0D47A1]">Email / SĐT</th>
              <th className="px-6 py-4 font-bold text-[#0D47A1]">Vai trò</th>
              <th className="px-6 py-4 font-bold text-[#0D47A1]">Trạng thái</th>
              <th className="px-6 py-4 font-bold text-[#0D47A1]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3ECF8]">
            {users.length === 0 && !error ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Chưa có tài khoản nào trong hệ thống.</td>
              </tr>
            ) : (
              users.map((u) => {
                const isActive = u.trangThaiTK ?? u.isActive ?? true;
                const statusText = isActive ? 'Hoạt động' : 'Đã khóa';
                const statusClass = isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                const displayRole = getRoleDisplay(u.roles);

                return (
                  <tr key={u.id} className="hover:bg-[#F8FBFF] transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{u.hoTen || u.fullName || 'Chưa cập nhật'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div>{u.email}</div>
                      <div className="text-xs text-gray-400">{u.sdt || u.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-semibold">{displayRole}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>{statusText}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => navigate(`/admin/accounts/${u.id}/edit`)} className="text-blue-600 hover:text-blue-800 font-semibold">Sửa</button>
                        <button onClick={() => handleToggleStatus(u.id, isActive)} className={`${isActive ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'} font-semibold`}>
                          {isActive ? 'Khóa' : 'Mở khóa'}
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800 font-semibold">Xóa</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}