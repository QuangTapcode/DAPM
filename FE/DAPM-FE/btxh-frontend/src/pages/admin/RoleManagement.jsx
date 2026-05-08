import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import adminApi from '../../api/adminApi';

// Dùng BE role codes trực tiếp (khớp với Roles.cs)
const ROLE_OPTIONS = [
  { value: 'NGGT', label: 'Người gửi trẻ' },
  { value: 'NGNN', label: 'Người nhận nuôi' },
  { value: 'QLNT', label: 'Cán bộ tiếp nhận' },
  { value: 'QLNN', label: 'Cán bộ nhận nuôi' },
  { value: 'TPQL', label: 'Trưởng phòng' },
  { value: 'ADMI', label: 'Admin' },
];

export default function RoleManagement() {
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(null);
  const { data, loading, refetch } = useFetch(() => adminApi.getUsers({ search }), [search]);

  const handleChangeRole = async (userId, newRole) => {
    setSaving(userId);
    try {
      await adminApi.updateUser(userId, { Roles: [newRole] });
      refetch();
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Phân quyền tài khoản</h1>

      <input
        type="text"
        placeholder="Tìm theo tên, email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
      />

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Họ tên</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Vai trò hiện tại</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Thay đổi vai trò</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Đang tải...</td></tr>
            ) : data?.items?.map((user) => {
              const primaryRole = (user.roles || [])[0] || user.role || '';
              return (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{user.hoTen || user.fullName || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {ROLE_OPTIONS.find(r => r.value === primaryRole)?.label || primaryRole || 'Chưa phân quyền'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue={primaryRole}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                    >
                      {ROLE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    {saving === user.id && <span className="text-xs text-gray-400">Đang lưu...</span>}
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
