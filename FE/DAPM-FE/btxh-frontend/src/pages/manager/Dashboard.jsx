import { useFetch } from '../../hooks/useFetch';
import receptionProfileApi from '../../api/receptionProfileApi';
import adoptionProfileApi from '../../api/adoptionProfileApi';
import childApi from '../../api/childApi';
import { formatDate } from '../../utils/formatDate';
import { Link } from 'react-router-dom';

const PENDING = ['Chờ duyệt', 'Đang lập', 'Đang xử lý'];

function StatCard({ label, value, sub, color = 'blue', linkTo }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
  };
  const inner = (
    <div className={`rounded-2xl border p-5 ${colors[color]} flex flex-col gap-1`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-3xl font-bold">{value ?? '—'}</p>
      {sub && <p className="text-xs opacity-60">{sub}</p>}
    </div>
  );
  return linkTo ? <Link to={linkTo}>{inner}</Link> : inner;
}

function RecentRow({ item, type }) {
  const name =
    type === 'reception'
      ? item.tenNguoiGui || item.TenNguoiGui || '—'
      : item.tenNguoiNhan || item.TenNguoiNhan || '—';
  const id =
    type === 'reception'
      ? item.maHSTiepNhan || item.id || '—'
      : item.maHSNhanNuoi || item.id || '—';
  const date = item.ngayLap || item.ngayTiepNhan || item.createdAt || '';
  const status = item.trangThai || item.status || '';

  const statusColor = {
    'Chờ duyệt': 'bg-indigo-100 text-indigo-700',
    'Đang lập': 'bg-slate-100 text-slate-600',
    'Đã duyệt': 'bg-emerald-100 text-emerald-700',
    'Từ chối': 'bg-red-100 text-red-600',
  };

  return (
    <Link
      to={`/truong-phong/duyet/${type}/${id}`}
      className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 transition hover:bg-blue-50/40"
    >
      <div>
        <p className="text-sm font-semibold text-gray-800">{name}</p>
        <p className="text-xs text-gray-400">
          #{id} · {formatDate(date)}
        </p>
      </div>
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[status] ?? 'bg-gray-100 text-gray-500'}`}
      >
        {status || '—'}
      </span>
    </Link>
  );
}

export default function ManagerDashboard() {
  const { data: recData } = useFetch(() => receptionProfileApi.getAll({ page: 1, limit: 500 }));
  const { data: adpData } = useFetch(() => adoptionProfileApi.getAll({ page: 1, limit: 500 }));
  const { data: childData } = useFetch(() => childApi.getAll({ page: 1, limit: 500 }));

  const receptions = recData?.items ?? recData ?? [];
  const adoptions = adpData?.items ?? adpData ?? [];
  const children = childData?.items ?? childData ?? [];

  const pendingRec = receptions.filter((r) =>
    PENDING.includes(r.trangThai || r.status)
  );
  const pendingAdp = adoptions.filter((a) =>
    PENDING.includes(a.trangThai || a.status)
  );
  const approvedRec = receptions.filter((r) =>
    (r.trangThai || r.status) === 'Đã duyệt'
  );
  const approvedAdp = adoptions.filter((a) =>
    (a.trangThai || a.status) === 'Đã duyệt'
  );

  const childrenWaiting = children.filter(
    (c) => (c.trangThai || c.TrangThai) === 'Chờ nhận nuôi'
  );
  const childrenCared = children.filter(
    (c) => (c.trangThai || c.TrangThai) === 'Đang chăm sóc'
  );
  const childrenAdopted = children.filter(
    (c) => (c.trangThai || c.TrangThai) === 'Đã nhận nuôi'
  );

  const recentPending = [
    ...pendingRec.slice(0, 5).map((r) => ({ ...r, __type: 'reception' })),
    ...pendingAdp.slice(0, 5).map((a) => ({ ...a, __type: 'adoption' })),
  ]
    .sort((a, b) => {
      const da = new Date(a.ngayLap || a.ngayTiepNhan || 0);
      const db = new Date(b.ngayLap || b.ngayTiepNhan || 0);
      return db - da;
    })
    .slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-8 px-5 py-8 sm:px-8 lg:px-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
        <p className="mt-1 text-sm text-gray-400">
          Theo dõi tiến độ xử lý hồ sơ và tình trạng trẻ trong trung tâm.
        </p>
      </div>

      {/* Hồ sơ */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
          Hồ sơ
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Chờ duyệt – Gửi trẻ"
            value={pendingRec.length}
            sub="Hồ sơ tiếp nhận"
            color="orange"
            linkTo="/truong-phong/cho-duyet"
          />
          <StatCard
            label="Chờ duyệt – Nhận nuôi"
            value={pendingAdp.length}
            sub="Hồ sơ nhận nuôi"
            color="violet"
            linkTo="/truong-phong/cho-duyet"
          />
          <StatCard
            label="Đã duyệt – Gửi trẻ"
            value={approvedRec.length}
            sub="Hồ sơ tiếp nhận"
            color="green"
            linkTo="/truong-phong/lichsu-hoso"
          />
          <StatCard
            label="Đã duyệt – Nhận nuôi"
            value={approvedAdp.length}
            sub="Hồ sơ nhận nuôi"
            color="blue"
            linkTo="/truong-phong/lichsu-hoso"
          />
        </div>
      </div>

      {/* Trẻ em */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
          Trẻ em
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard
            label="Đang chăm sóc"
            value={childrenCared.length}
            sub="Trẻ trong trung tâm"
            color="blue"
          />
          <StatCard
            label="Chờ nhận nuôi"
            value={childrenWaiting.length}
            sub="Sẵn sàng ghép hồ sơ"
            color="orange"
          />
          <StatCard
            label="Đã nhận nuôi"
            value={childrenAdopted.length}
            sub="Thành công"
            color="green"
          />
        </div>
      </div>

      {/* Hồ sơ chờ duyệt gần đây */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">
            Hồ sơ chờ duyệt gần đây
          </h2>
          <Link
            to="/truong-phong/cho-duyet"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>

        {recentPending.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-10 text-center text-sm text-gray-400">
            Không có hồ sơ nào đang chờ duyệt.
          </div>
        ) : (
          <div className="space-y-2 rounded-2xl border border-gray-100 bg-gray-50 p-3">
            {recentPending.map((item) => (
              <RecentRow
                key={`${item.__type}-${item.maHSTiepNhan || item.maHSNhanNuoi || item.id}`}
                item={item}
                type={item.__type}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
