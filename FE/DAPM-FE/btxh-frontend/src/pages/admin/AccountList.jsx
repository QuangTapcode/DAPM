import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import adminApi from '../../api/adminApi';
import { formatDate } from '../../utils/formatDate';

const card28 = 'rounded-[28px] border border-[#E3ECF8] bg-white shadow-[0_14px_36px_rgba(42,74,122,0.08)]';

const ROLE_LABEL = {
  admin:             'Quản trị viên',
  sender:            'Người gửi trẻ',
  adopter:           'Người nhận nuôi',
  'staff-reception': 'Cán bộ tiếp nhận',
  'staff-adoption':  'Cán bộ nhận nuôi',
  staff_reception:   'Cán bộ tiếp nhận',
  staff_adoption:    'Cán bộ nhận nuôi',
  manager:           'Trưởng phòng',
  coordinator:       'Điều phối viên',
  accountant:        'Kế toán',
  hr:                'Nhân sự',
};

const ROLE_PILL = {
  admin:             'bg-purple-50 text-purple-700 border border-purple-200',
  coordinator:       'bg-[#EAF3FF] text-[#0D47A1] border border-[#DCE8F7]',
  accountant:        'bg-teal-50 text-teal-700 border border-teal-200',
  hr:                'bg-orange-50 text-orange-700 border border-orange-200',
  sender:            'bg-amber-50 text-amber-700 border border-amber-200',
  adopter:           'bg-pink-50 text-pink-700 border border-pink-200',
  'staff-reception': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  'staff-adoption':  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  staff_reception:   'bg-indigo-50 text-indigo-700 border border-indigo-200',
  staff_adoption:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  manager:           'bg-red-50 text-red-700 border border-red-200',
};

const ROLE_OPTIONS = [
  { value: 'admin',           label: 'Quản trị viên',   desc: 'Toàn quyền hệ thống và quản trị tài khoản.' },
  { value: 'staff-reception', label: 'Cán bộ tiếp nhận',desc: 'Tiếp nhận hồ sơ và xử lý quy trình gửi trẻ.' },
  { value: 'staff-adoption',  label: 'Cán bộ nhận nuôi',desc: 'Đánh giá hồ sơ và hỗ trợ quy trình nhận nuôi.' },
  { value: 'manager',         label: 'Trưởng phòng',    desc: 'Phê duyệt hồ sơ và quản lý nhân sự.' },
  { value: 'sender',          label: 'Người gửi trẻ',   desc: 'Gửi hồ sơ và theo dõi trạng thái.' },
  { value: 'adopter',         label: 'Người nhận nuôi', desc: 'Đăng ký và theo dõi đơn nhận nuôi.' },
];

const DEMO_USERS = [
  { id: 1, fullName: 'Nguyễn Văn Lâm',  email: 'lam.nguyen@guardian.org', role: 'coordinator',    isActive: true,  createdAt: '2023-10-12' },
  { id: 2, fullName: 'Phan Thị Thu',    email: 'thu.phan@guardian.org',    role: 'accountant',     isActive: false, createdAt: '2023-08-05' },
  { id: 3, fullName: 'Lê Hồng Hạnh',   email: 'hanh.lh@guardian.org',    role: 'hr',             isActive: true,  createdAt: '2024-01-20' },
  { id: 4, fullName: 'Trần Thị Hoa',   email: 'hoa.tran@guardian.org',   role: 'staff-reception', isActive: true,  createdAt: '2024-02-14' },
  { id: 5, fullName: 'Đinh Văn Minh',  email: 'minh.dinh@guardian.org',  role: 'staff-adoption',  isActive: true,  createdAt: '2024-03-01' },
  { id: 6, fullName: 'Ngô Thị Lan',    email: 'lan.ngo@guardian.org',    role: 'sender',          isActive: true,  createdAt: '2024-03-18' },
  { id: 7, fullName: 'Bùi Quang Huy',  email: 'huy.bui@guardian.org',    role: 'adopter',         isActive: false, createdAt: '2024-04-05' },
  { id: 8, fullName: 'Vũ Thị Bích',    email: 'bich.vu@guardian.org',    role: 'manager',         isActive: true,  createdAt: '2024-04-22' },
];

const BLANK_FORM = { fullName: '', email: '', role: 'staff-reception', password: '', confirmPassword: '' };

function RoleModal({ user, onClose, onConfirm }) {
  const [selected, setSelected] = useState(user?.role || 'staff-reception');
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-md mx-4 p-8">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF3FF] flex items-center justify-center">
            <svg className="w-7 h-7 text-[#0D47A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-bold text-[#0D47A1] text-center">Phân quyền người dùng</h2>
        <p className="text-sm text-[#8FA0B8] text-center mt-1 mb-6">
          Vai trò cho: <span className="font-semibold text-[#334155]">{user.fullName}</span>
        </p>
        <div className="space-y-2">
          {ROLE_OPTIONS.map(opt => (
            <label key={opt.value}
              className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${
                selected === opt.value ? 'border-[#0D47A1] bg-[#EAF3FF]' : 'border-[#E3ECF8] hover:border-[#DCE8F7]'
              }`}>
              <input type="radio" name="role" value={opt.value} checked={selected === opt.value}
                onChange={() => setSelected(opt.value)} className="mt-0.5 accent-[#0D47A1]"/>
              <div>
                <p className="text-sm font-semibold text-[#334155]">{opt.label}</p>
                <p className="text-xs text-[#8FA0B8] mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-[#E3ECF8] text-sm font-semibold text-[#5F81BC] hover:bg-[#F5F9FE] transition-colors">
            Hủy
          </button>
          <button onClick={() => onConfirm(user.id, selected)}
            className="flex-1 py-3 rounded-2xl bg-[#0D47A1] text-white text-sm font-semibold hover:bg-[#1565C0] transition-colors shadow-md">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

function AddAccountModal({ onClose, onAdd }) {
  const [form, setForm] = useState(BLANK_FORM);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.'); return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.'); return;
    }
    onAdd({ ...form, id: Date.now(), isActive: true, createdAt: new Date().toISOString() });
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-2xl border border-[#D8E6F5] bg-[#F7FBFF] text-sm text-[#334155] placeholder-[#B0C4D8] focus:border-[#2F80ED] focus:ring-4 focus:ring-blue-100 outline-none transition';
  const labelCls = 'block text-[11px] font-bold uppercase tracking-[0.12em] text-[#8FA0B8] mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-lg mx-4 p-8 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0D47A1]">Thêm tài khoản mới</h2>
            <p className="text-sm text-[#8FA0B8] mt-0.5">Tạo tài khoản nhân viên trong hệ thống</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#F5F9FE] flex items-center justify-center text-[#8FA0B8] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>Họ và tên <span className="text-red-500">*</span></label>
            <input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Nguyễn Văn A" className={inputCls}/>
          </div>
          <div>
            <label className={labelCls}>Email <span className="text-red-500">*</span></label>
            <input value={form.email} onChange={e => set('email', e.target.value)} type="email" placeholder="example@btxh.vn" className={inputCls}/>
          </div>
          <div>
            <label className={labelCls}>Vai trò <span className="text-red-500">*</span></label>
            <select value={form.role} onChange={e => set('role', e.target.value)}
              className={inputCls}>
              {ROLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Mật khẩu <span className="text-red-500">*</span></label>
              <input value={form.password} onChange={e => set('password', e.target.value)} type="password" placeholder="••••••••" className={inputCls}/>
            </div>
            <div>
              <label className={labelCls}>Xác nhận MK <span className="text-red-500">*</span></label>
              <input value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} type="password" placeholder="••••••••" className={inputCls}/>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-[#E3ECF8] text-sm font-semibold text-[#5F81BC] hover:bg-[#F5F9FE] transition-colors">
            Hủy
          </button>
          <button onClick={handleSubmit}
            className="flex-1 py-3 rounded-2xl bg-[#0D47A1] text-white text-sm font-semibold hover:bg-[#1565C0] transition-colors shadow-md">
            Tạo tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}

const checkActive = (u) => u.isActive !== false && (u.status || '').toLowerCase() !== 'locked';

export default function AccountList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalUser, setModalUser] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [localUsers, setLocalUsers] = useState(DEMO_USERS);

  const { data } = useFetch(() => adminApi.getUsers({ page, search }), [page, search]);
  const apiItems = data?.items?.length ? data.items : null;
  const items = apiItems
    ? [...apiItems, ...localUsers.filter(u => !apiItems.find(a => a.id === u.id))]
    : localUsers;
  const totalPages = data?.totalPages || Math.ceil(items.length / 10) || 1;

  const filtered = search
    ? items.filter(u => u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.includes(search))
    : items;

  const activeCount = items.filter(checkActive).length;
  const lockedCount = items.length - activeCount;

  const handleConfirmRole = (id, role) => {
    setLocalUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    setModalUser(null);
  };

  const handleToggleLock = (id) => {
    setLocalUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !checkActive(u) } : u));
  };

  const handleAddAccount = (newUser) => {
    setLocalUsers(prev => [...prev, newUser]);
    setShowAdd(false);
  };

  return (
    <>
      <RoleModal user={modalUser} onClose={() => setModalUser(null)} onConfirm={handleConfirmRole}/>
      {showAdd && <AddAccountModal onClose={() => setShowAdd(false)} onAdd={handleAddAccount}/>}

      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[36px] font-bold text-[#0D47A1] leading-none">Quản lý tài khoản người dùng</h1>
            <p className="text-sm text-[#8FA0B8] mt-2">Quản lý và cấp quyền truy cập hệ thống cho nhân viên trung tâm.</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-2xl text-sm font-semibold hover:bg-[#1565C0] transition-colors shadow-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            Thêm tài khoản mới
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Tổng người dùng',    value: items.length, colorBox: 'bg-[#EAF3FF] text-[#0D47A1]' },
            { label: 'Đang hoạt động',      value: activeCount,  colorBox: 'bg-emerald-50 text-emerald-600' },
            { label: 'Tài khoản bị khóa',  value: lockedCount,  colorBox: 'bg-red-50 text-red-500' },
            { label: 'Yêu cầu cấp quyền', value: 3,            colorBox: 'bg-amber-50 text-amber-600' },
          ].map((s, i) => (
            <div key={i} className={`${card28} p-5`}>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8] mb-2">{s.label}</p>
              <p className={`text-[32px] font-bold leading-none ${s.colorBox.includes('EAF') ? 'text-[#0D47A1]' : s.colorBox.includes('emerald') ? 'text-emerald-600' : s.colorBox.includes('red') ? 'text-red-500' : 'text-amber-600'}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* TABLE */}
        <div className={`${card28} overflow-hidden`}>
          {/* Table toolbar */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E3ECF8]">
            <h2 className="text-[15px] font-bold text-[#0D47A1]">Danh sách nhân sự</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FA0B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="text" placeholder="Tìm tên, email..." value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9 pr-4 py-2 rounded-2xl border border-[#DCE8F7] bg-[#F7FBFF] text-sm text-[#334155] focus:border-[#2F80ED] focus:ring-4 focus:ring-blue-100 outline-none transition w-52"/>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-[#DCE8F7] text-xs font-semibold text-[#5F81BC] hover:bg-[#EAF3FF] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
                </svg>
                Bộ lọc
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-[#DCE8F7] text-xs font-semibold text-[#5F81BC] hover:bg-[#EAF3FF] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Xuất báo cáo
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0F5FC]">
                  {['Họ tên', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tạo', 'Hành động'].map(h => (
                    <th key={h} className="px-6 pb-3 pt-4 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F5FC]">
                {filtered.map(u => {
                  const initials = u.fullName?.split(' ').map(w => w[0]).slice(-2).join('') || '?';
                  const roleLabel = ROLE_LABEL[u.role] || u.role;
                  const rolePill  = ROLE_PILL[u.role]  || 'bg-[#EAF3FF] text-[#0D47A1] border border-[#DCE8F7]';
                  const isUserActive = checkActive(u);
                  return (
                    <tr key={u.id} className="hover:bg-[#F5F9FE] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#EAF3FF] flex items-center justify-center font-bold text-[#0D47A1] text-sm shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-[15px] text-[#334155]">{u.fullName}</p>
                            <p className="text-[11px] text-[#8FA0B8]">ID: DG-{1000 + u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#8FA0B8]">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold ${rolePill}`}>
                          {roleLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${isUserActive ? 'text-emerald-600' : 'text-red-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isUserActive ? 'bg-emerald-500' : 'bg-red-400'}`}/>
                          {isUserActive ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#8FA0B8]">{formatDate(u.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setModalUser(u)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#0D47A1] text-white rounded-xl text-xs font-semibold hover:bg-[#1565C0] transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                            Phân quyền
                          </button>
                          <button onClick={() => handleToggleLock(u.id)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                              isUserActive
                                ? 'border border-red-200 text-red-500 hover:bg-red-50'
                                : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {isUserActive
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                              }
                            </svg>
                            {isUserActive ? 'Khóa' : 'Mở khóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-12 text-[#8FA0B8] text-sm">Không có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E3ECF8]">
            <p className="text-xs text-[#8FA0B8]">Hiện thị 1 – {Math.min(10, filtered.length)} của {filtered.length} tài khoản</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-2xl text-xs font-semibold border border-[#DCE8F7] text-[#5F81BC] hover:bg-[#EAF3FF] disabled:opacity-40 transition-colors">← Trước</button>
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-2xl text-xs font-bold transition-colors ${page === p ? 'bg-[#0D47A1] text-white' : 'border border-[#DCE8F7] text-[#5F81BC] hover:bg-[#EAF3FF]'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-2xl text-xs font-semibold border border-[#DCE8F7] text-[#5F81BC] hover:bg-[#EAF3FF] disabled:opacity-40 transition-colors">Sau →</button>
            </div>
          </div>
        </div>

        {/* TIPS */}
        <div className={`${card28} p-5 flex items-start gap-4`}>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#334155]">Mẹo quản lý bảo mật</p>
            <p className="text-xs text-[#8FA0B8] mt-1">
              Hãy thường xuyên kiểm tra danh sách tài khoản "Bị khóa" để dọn dẹp bộ nhớ hoặc khôi phục quyền truy cập khi cần. Hệ thống tự động ghi lại mọi thay đổi phân quyền trong nhật ký.
            </p>
          </div>
          <button className="text-xs font-semibold text-[#0D47A1] hover:underline shrink-0">Xem hướng dẫn →</button>
        </div>
      </div>
    </>
  );
}
