import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import { childApi } from '../../api/childApi';
import { formatDate } from '../../utils/formatDate';

export default function ChildRequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await childApi.getRequests();

        // Unwrap data an toàn từ Backend (PagedResult)
        const actualData = res?.items || res?.data?.items || res?.data || res || [];
        setRequests(Array.isArray(actualData) ? actualData : []);
      } catch (err) {
        console.error('Lỗi lấy danh sách yêu cầu gửi trẻ:', err);
        setError(err.message || 'Không thể kết nối đến máy chủ.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return <div className="p-6 text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0D47A1]">Danh sách yêu cầu gửi trẻ</h1>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600 border border-red-200">
          <p className="font-semibold">Lỗi tải dữ liệu:</p>
          <p>{error}</p>
          <p className="text-sm mt-2 italic">* Nếu là lỗi "401 Unauthorized", vui lòng kiểm tra lại file <b>LoginPage.jsx</b> xem đã dùng API thật thay cho Mock Login chưa.</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden border border-[#E3ECF8]">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#F8FBFF] border-b border-[#E3ECF8]">
            <tr>
              <th className="px-6 py-4 font-bold text-[#0D47A1]">Mã YC</th>
              <th className="px-6 py-4 font-bold text-[#0D47A1]">Tên trẻ</th>
              <th className="px-6 py-4 font-bold text-[#0D47A1]">Người gửi</th>
              <th className="px-6 py-4 font-bold text-[#0D47A1]">Ngày nộp</th>
              <th className="px-6 py-4 font-bold text-[#0D47A1]">Trạng thái</th>
              <th className="px-6 py-4 font-bold text-[#0D47A1]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3ECF8]">
            {requests.length === 0 && !error ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  Chưa có yêu cầu gửi trẻ nào trong hệ thống.
                </td>
              </tr>
            ) : (
              requests.map((req) => {
                const code = req.id || req.maYeuCauGuiTre;
                const childName = req.thongTinTre?.tenTre || 'Chưa cập nhật';
                const senderName = req.tenNguoiGui || '—';
                const date = req.createdAt || req.ngayTao;
                const status = req.status || req.trangThaiYC || 'Chờ xử lý';

                const badgeStatus = status;

                return (
                  <tr key={code} className="hover:bg-[#F8FBFF] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#1d4ed8]">#{code}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{childName}</td>
                    <td className="px-6 py-4 text-gray-600">{senderName}</td>
                    <td className="px-6 py-4 text-gray-600">{date ? formatDate(date) : '—'}</td>
                    <td className="px-6 py-4">
                      <Badge status={badgeStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/can-bo-tiep-nhan/yeu-cau/${code}`)}
                        className="text-[#1d4ed8] hover:text-blue-800 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg transition"
                      >
                        Xem chi tiết
                      </button>
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