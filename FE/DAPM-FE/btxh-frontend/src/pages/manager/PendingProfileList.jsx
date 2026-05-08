import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import receptionApi from '../../api/receptionApi';
import adoptionApi from '../../api/adoptionApi';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatDate';

function EyeIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-orange-400', 'bg-teal-500',
  'bg-rose-400', 'bg-violet-500', 'bg-emerald-500',
];

function Avatar({ name, idx }) {
  const safeName = (name || 'Người dùng').trim();
  const initials = safeName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]
        }`}
    >
      {initials || 'ND'}
    </div>
  );
}

function ProfileRow({ item, type, idx, checked, onToggle }) {
  const navigate = useNavigate();
  const isReception = type === 'reception';
  const mainName = isReception
    ? item.tenNguoiGui || item.senderName || item.fullName || 'Chưa có tên'
    : item.tenNguoiNhan || item.adopterName || item.fullName || 'Chưa có tên';

  const detailPath = `/truong-phong/duyet/${type}/${item.id}`;

  return (
    <tr
      className="border-b border-gray-100 hover:bg-blue-50/40 cursor-pointer transition-colors"
      onClick={() => navigate(detailPath)}
    >
      {/* Checkbox */}
      <td
        className="py-3.5 px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="h-4 w-4 rounded border-gray-300 accent-[#BFD8FF] focus:ring-2 focus:ring-[#DDEBFF]"
        />
      </td>

      {/* Mã đơn */}
      <td className="py-3.5 px-4 text-sm font-bold text-blue-600 whitespace-nowrap">
        #{item.id}
      </td>

      {/* Loại hồ sơ */}
      <td className="py-3.5 px-3">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap
            ${isReception ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}
        >
          {isReception ? 'Gửi trẻ' : 'Nhận nuôi'}
        </span>
      </td>

      {/* Người đăng ký */}
      <td className="py-3.5 px-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={mainName} idx={idx} />
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">{mainName}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Mã: {item.maNguoiGui || item.maNguoiNhan || item.id || '—'}
            </p>
          </div>
        </div>
      </td>

      {/* Thông tin liên hệ */}
      <td className="py-3.5 px-3">
        <p className="text-sm font-medium text-gray-700">{item.soDienThoai || item.phone || '—'}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {item.diaChi || item.city || 'Chưa cập nhật'}
        </p>
      </td>

      {/* Ngày nộp */}
      <td className="py-3.5 px-3 text-sm text-gray-500 whitespace-nowrap">
        {formatDate(item.ngayTao || item.createdAt)}
      </td>

      {/* Trạng thái */}
      <td className="py-3.5 px-3">
        <Badge status={item.trangThaiYC || item.trangThai || item.status} />
      </td>

      {/* Thao tác */}
      <td className="py-3.5 px-4 text-center align-middle" onClick={(e) => e.stopPropagation()}>
        <Link
          to={detailPath}
          title="Xem chi tiết"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors"
        >
          <EyeIcon />
        </Link>
      </td>
    </tr>
  );
}

export default function PendingProfileList() {
  const [tab, setTab] = useState('all');

  const [selectedRows, setSelectedRows] = useState([]);

  const { data: recData } = useFetch(() => receptionApi.getAll({ status: 'Chờ xử lý' }));
  const { data: adpData } = useFetch(() => adoptionApi.getAll({ status: 'Chờ xử lý' }));

  const receptions = recData?.items || [];
  const adoptions = adpData?.items || [];

  const tabs = [
    { value: 'all', label: 'Tất cả', count: receptions.length + adoptions.length },
    { value: 'reception', label: 'Gửi trẻ', count: receptions.length },
    { value: 'adoption', label: 'Nhận nuôi', count: adoptions.length },
  ];

  const visibleReceptions = tab !== 'adoption' ? receptions : [];
  const visibleAdoptions = tab !== 'reception' ? adoptions : [];
  const totalVisible = visibleReceptions.length + visibleAdoptions.length;

  const visibleRows = [
    ...visibleReceptions.map((r) => ({ ...r, __type: 'reception' })),
    ...visibleAdoptions.map((a) => ({ ...a, __type: 'adoption' })),
  ];

  const getRowKey = (item, type) => `${type}-${item.id}`;

  const allVisibleKeys = visibleRows.map((item) => getRowKey(item, item.__type));

  const isAllSelected =
    allVisibleKeys.length > 0 &&
    allVisibleKeys.every((key) => selectedRows.includes(key));

  const isIndeterminate =
    selectedRows.length > 0 &&
    allVisibleKeys.some((key) => selectedRows.includes(key)) &&
    !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows((prev) => prev.filter((key) => !allVisibleKeys.includes(key)));
    } else {
      setSelectedRows((prev) => [...new Set([...prev, ...allVisibleKeys])]);
    }
  };

  const toggleSelectRow = (key) => {
    setSelectedRows((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedRows.length === 0) return;

    try {
      for (const rowKey of selectedRows) {
        const [type, id] = rowKey.split('-');

        if (type === 'reception') {
          await receptionApi.approve(id);
        } else if (type === 'adoption') {
          await adoptionApi.approve(id);
        }
      }

      setSelectedRows([]);
      window.location.reload();
    } catch (error) {
      console.error('Bulk approve failed:', error);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Danh sách hồ sơ chờ duyệt</h1>
          <p className="text-sm text-gray-400 mt-1">Quản lý và theo dõi tiến độ các hồ sơ đang được xử lý.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleBulkApprove}
            disabled={selectedRows.length === 0}
            className={`flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${selectedRows.length === 0
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            ✓ Phê duyệt
          </button>
          <button className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
              ${tab === t.value
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
              ${tab === t.value ? 'bg-blue-50 text-blue-500' : 'bg-gray-200 text-gray-400'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-3 px-4 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 accent-[#BFD8FF] focus:ring-2 focus:ring-[#DDEBFF]"
                />
              </th>

              {['MÃ ĐƠN', 'LOẠI HỒ SƠ', 'NGƯỜI ĐĂNG KÝ', 'THÔNG TIN LIÊN HỆ', 'NGÀY NỘP', 'TRẠNG THÁI', 'THAO TÁC'].map(h => (
                <th
                  key={h}
                  className={`py-3 px-4 text-xs font-bold text-gray-400 tracking-wide uppercase ${h === 'THAO TÁC' ? 'text-center' : 'text-left'
                    }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleReceptions.map((r, i) => {
              const rowKey = getRowKey(r, 'reception');
              return (
                <ProfileRow
                  key={`rec-${r.id}`}
                  item={r}
                  type="reception"
                  idx={i}
                  checked={selectedRows.includes(rowKey)}
                  onToggle={() => toggleSelectRow(rowKey)}
                />
              );
            })}

            {visibleAdoptions.map((a, i) => {
              const rowKey = getRowKey(a, 'adoption');
              return (
                <ProfileRow
                  key={`adp-${a.id}`}
                  item={a}
                  type="adoption"
                  idx={i + visibleReceptions.length}
                  checked={selectedRows.includes(rowKey)}
                  onToggle={() => toggleSelectRow(rowKey)}
                />
              );
            })}

            {totalVisible === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-sm text-gray-400">
                  Không có hồ sơ nào chờ duyệt.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-400">
          <span>Hiển thị 1 – {totalVisible} trong tổng số {receptions.length + adoptions.length} hồ sơ</span>
          <div className="flex gap-1">
            {['‹', '1', '2', '3', '›'].map((p, i) => (
              <button key={i} className={`w-8 h-8 rounded-lg border text-sm font-semibold transition-colors
                ${p === '1'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}