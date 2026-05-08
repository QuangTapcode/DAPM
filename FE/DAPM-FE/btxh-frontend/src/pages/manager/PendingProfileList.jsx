import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import receptionApi from '../../api/receptionApi';
import adoptionApi from '../../api/adoptionApi';
import Badge from '../../components/common/Badge';
import { REQUEST_STATUS } from '../../utils/constants';
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
  'bg-blue-500',
  'bg-orange-400',
  'bg-teal-500',
  'bg-rose-400',
  'bg-violet-500',
  'bg-emerald-500',
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
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${AVATAR_COLORS[idx % AVATAR_COLORS.length]
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
    ? item.senderName || item.parentName || item.fullName || 'Chưa có tên'
    : item.adopterName || item.applicantName || item.fullName || 'Chưa có tên';

  const detailPath = `/truong-phong/duyet/${type}/${item.id}`;

  return (
    <tr
      className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-blue-50/40 [&>td]:align-middle"
      onClick={() => navigate(detailPath)}
    >
      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="h-4 w-4 rounded border-gray-300 accent-[#BFD8FF] focus:ring-2 focus:ring-[#DDEBFF]"
        />
      </td>

      <td className="whitespace-nowrap px-4 py-3.5 text-sm font-bold text-blue-600">
        #{item.id}
      </td>

      <td className="px-3 py-3.5">
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${isReception
            ? 'bg-blue-100 text-blue-700'
            : 'bg-emerald-100 text-emerald-700'
            }`}
        >
          {isReception ? 'Gửi trẻ' : 'Nhận nuôi'}
        </span>
      </td>

      <td className="px-3 py-3.5">
        <div className="flex items-center gap-2.5">
          <Avatar name={mainName} idx={idx} />

          <div>
            <p className="text-sm font-semibold leading-tight text-gray-800">
              {mainName}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              CCCD: {item.cccd || item.nationalId || 'Chưa cập nhật'}
            </p>
          </div>
        </div>
      </td>

      <td className="px-3 py-3.5">
        <p className="text-sm font-medium text-gray-700">
          {item.phone || '—'}
        </p>
        <p className="mt-0.5 text-xs text-gray-400">
          {item.city || item.address || 'Chưa cập nhật'}
        </p>
      </td>

      <td className="whitespace-nowrap px-3 py-3.5 text-sm text-gray-500">
        {formatDate(item.createdAt)}
      </td>

      <td className="px-3 py-3.5">
        <Badge status={item.status} />
      </td>

      <td
        className="px-4 py-3.5 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Link
          to={detailPath}
          title="Xem chi tiết"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-blue-500 transition-colors hover:bg-blue-100 hover:text-blue-700"
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

  const { data: recData } = useFetch(() =>
    receptionApi.getAll({ status: REQUEST_STATUS.PENDING })
  );

  const { data: adpData } = useFetch(() =>
    adoptionApi.getAll({ status: REQUEST_STATUS.PENDING })
  );

  const receptions = recData?.items || [];
  const adoptions = adpData?.items || [];

  const tabs = [
    {
      value: 'all',
      label: 'Tất cả',
      count: receptions.length + adoptions.length,
    },
    {
      value: 'reception',
      label: 'Gửi trẻ',
      count: receptions.length,
    },
    {
      value: 'adoption',
      label: 'Nhận nuôi',
      count: adoptions.length,
    },
  ];

  const visibleReceptions = tab !== 'adoption' ? receptions : [];
  const visibleAdoptions = tab !== 'reception' ? adoptions : [];
  const totalVisible = visibleReceptions.length + visibleAdoptions.length;

  const visibleRows = [
    ...visibleReceptions.map((item) => ({ ...item, __type: 'reception' })),
    ...visibleAdoptions.map((item) => ({ ...item, __type: 'adoption' })),
  ];

  const getRowKey = (item, type) => `${type}-${item.id}`;

  const allVisibleKeys = visibleRows.map((item) =>
    getRowKey(item, item.__type)
  );

  const isAllSelected =
    allVisibleKeys.length > 0 &&
    allVisibleKeys.every((key) => selectedRows.includes(key));

  const isIndeterminate =
    selectedRows.length > 0 &&
    allVisibleKeys.some((key) => selectedRows.includes(key)) &&
    !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows((prev) =>
        prev.filter((key) => !allVisibleKeys.includes(key))
      );
    } else {
      setSelectedRows((prev) => [...new Set([...prev, ...allVisibleKeys])]);
    }
  };

  const toggleSelectRow = (key) => {
    setSelectedRows((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedRows.length === 0) return;

    try {
      for (const rowKey of selectedRows) {
        const [type, id] = rowKey.split('-');

        if (type === 'reception') {
          await receptionApi.approve(id);
        }

        if (type === 'adoption') {
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
    <div className="mx-auto w-full max-w-[1720px] space-y-6 px-5 py-8 sm:px-8 lg:px-10">
      {/* Page header */}
      <div className="flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Danh sách hồ sơ chờ duyệt
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Quản lý và theo dõi tiến độ các hồ sơ đang được xử lý.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleBulkApprove}
            disabled={selectedRows.length === 0}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${selectedRows.length === 0
              ? 'cursor-not-allowed bg-blue-300'
              : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            ✓ Phê duyệt
          </button>

          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50">
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-fit gap-1.5 rounded-xl bg-gray-100 p-1">
        {tabs.map((item) => {
          const active = tab === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${active
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {item.label}

              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${active
                  ? 'bg-blue-50 text-blue-500'
                  : 'bg-gray-200 text-gray-400'
                  }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left">
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

                {[
                  'MÃ ĐƠN',
                  'LOẠI HỒ SƠ',
                  'NGƯỜI ĐĂNG KÝ',
                  'THÔNG TIN LIÊN HỆ',
                  'NGÀY NỘP',
                  'TRẠNG THÁI',
                  'THAO TÁC',
                ].map((header) => (
                  <th
                    key={header}
                    className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400 ${header === 'THAO TÁC' ? 'text-center' : 'text-left'
                      }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visibleReceptions.map((item, index) => {
                const rowKey = getRowKey(item, 'reception');

                return (
                  <ProfileRow
                    key={`rec-${item.id}`}
                    item={item}
                    type="reception"
                    idx={index}
                    checked={selectedRows.includes(rowKey)}
                    onToggle={() => toggleSelectRow(rowKey)}
                  />
                );
              })}

              {visibleAdoptions.map((item, index) => {
                const rowKey = getRowKey(item, 'adoption');

                return (
                  <ProfileRow
                    key={`adp-${item.id}`}
                    item={item}
                    type="adoption"
                    idx={index + visibleReceptions.length}
                    checked={selectedRows.includes(rowKey)}
                    onToggle={() => toggleSelectRow(rowKey)}
                  />
                );
              })}

              {totalVisible === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm text-gray-400"
                  >
                    Không có hồ sơ nào chờ duyệt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm text-gray-400">
          <span>
            Hiển thị 1 – {totalVisible} trong tổng số{' '}
            {receptions.length + adoptions.length} hồ sơ
          </span>

          <div className="flex gap-1">
            {['‹', '1', '2', '3', '›'].map((page, index) => (
              <button
                key={index}
                className={`h-8 w-8 rounded-lg border text-sm font-semibold transition-colors ${page === '1'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}