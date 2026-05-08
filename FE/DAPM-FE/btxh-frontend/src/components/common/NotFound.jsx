import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-[#f0f5fb]">
      <div className="text-center max-w-sm">
        {/* Illustration */}
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-[#1d4ed8]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>

        <h1 className="text-7xl font-black text-[#1d4ed8] mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Trang không tồn tại</h2>
        <p className="text-sm text-gray-500 mb-8">
          Đường dẫn bạn truy cập không hợp lệ hoặc đã bị xóa.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1d4ed8] text-white text-sm font-medium rounded-lg hover:bg-[#1e40af] transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
