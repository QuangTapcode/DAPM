import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import adminApi from '../../api/adminApi';
import Button from '../../components/common/Button';
import { ROLES } from '../../utils/constants';

const ROLE_OPTIONS = [
  { value: ROLES.SENDER,          label: 'Người gửi trẻ' },
  { value: ROLES.ADOPTER,         label: 'Người nhận nuôi' },
  { value: ROLES.STAFF_RECEPTION, label: 'Cán bộ tiếp nhận' },
  { value: ROLES.STAFF_ADOPTION,  label: 'Cán bộ nhận nuôi' },
  { value: ROLES.MANAGER,         label: 'Trưởng phòng' },
  { value: ROLES.ADMIN,           label: 'Admin' },
];

export default function RoleManagement() {
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(null);
  const { data, loading, refetch } = useFetch(() => adminApi.getUsers({ search }), [search]);

  const handleChangeRole = async (userId, newRole) => {
    setSaving(userId);
    try {
      await adminApi.updateUser(userId, { role: newRole });
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
            ) : data?.items?.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{user.fullName}</td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {ROLE_OPTIONS.find(r => r.value === user.role)?.label || user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue={user.role}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
