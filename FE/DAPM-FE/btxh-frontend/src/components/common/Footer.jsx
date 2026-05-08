import { Link } from 'react-router-dom';
import email_2 from '../../assets/email_2.png';
import email_1 from '../../assets/icon_email.png';
import icon_fb from '../../assets/icon_fb.png';
import icon_ytb from '../../assets/icon_ytb.png';
import icon_address from '../../assets/icon_address.png';
import icon_phone from '../../assets/icon_phone.png';
import contact_now from '../../assets/contact_now.png';
const QUICK_LINKS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/gui-tre/tao-yeu-cau', label: 'Đăng ký gửi trẻ' },
  { to: '/nhan-nuoi/tao-don', label: 'Đăng ký nhận nuôi' },
  { to: '/huong-dan', label: 'Hướng dẫn' },
];

export default function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{ background: 'linear-gradient(135deg, #daeeff 0%, #c8e8fa 40%, #d6f0fb 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-y-8 gap-x-8">

          {/* Col 1 */}
          <div className="flex">
            <div className="w-full max-w-[270px] mx-auto flex flex-col">
              <div className="flex items-center gap-3 mb-4 min-h-[48px]">
                <img src="/favicon.svg" alt="Logo" className="w-12 h-12 object-contain" />
                <p className="text-[#1a5fa8] font-bold text-sm leading-tight">
                  TRUNG TÂM BẢO TRỢ<br />XÃ HỘI
                </p>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Hệ Thống Quản Lý Bảo Trợ Trẻ Em – Sứ mệnh của chúng tôi là bảo vệ, kết
                nối và mang lại mái ấm yêu thương cho những trẻ em mồ côi, xây dựng
                một tương lai tươi sáng hơn.
              </p>

              <div className="flex gap-2 mt-auto">
                <a
                  href="#"
                  className="w-8 h-8 rounded-full border border-[#7ec8f0] bg-white flex items-center justify-center hover:bg-[#e0f3ff] transition"
                  title="Facebook"
                >
                  <img src={icon_fb} alt="Facebook" className="w-4 h-4 object-contain" />
                </a>
                <a
                  href="mailto:ttbtxhtremocoi@gmail.com"
                  className="w-8 h-8 rounded-full border border-[#7ec8f0] bg-white flex items-center justify-center hover:bg-[#e0f3ff] transition"
                  title="Email"
                >
                  <img src={email_1} alt="Email" className="w-4 h-4 object-contain" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full border border-[#7ec8f0] bg-white flex items-center justify-center hover:bg-[#e0f3ff] transition"
                  title="YouTube"
                >
                  <img src={icon_ytb} alt="YouTube" className="w-4 h-4 object-contain" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2 */}
          <div className="flex">
            <div className="w-full max-w-[270px] mx-auto lg:ml-10 flex flex-col">
              <h3 className="text-[#1a5fa8] font-bold text-sm uppercase tracking-wide mb-4 min-h-[48px] flex items-start">
                Liên kết nhanh
              </h3>

              <ul className="space-y-2.5 text-sm text-gray-700">
                {QUICK_LINKS.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="hover:text-[#1a5fa8] transition flex items-center gap-1.5"
                    >
                      <span className="text-[#1a5fa8] font-bold">›</span>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Col 3 */}
          <div className="flex">
            <div className="w-full max-w-[270px] mx-auto flex flex-col">
              <h3 className="text-[#1a5fa8] font-bold text-sm uppercase tracking-wide mb-4 min-h-[48px] flex items-start">
                Thông tin liên hệ
              </h3>

              <ul className="space-y-2.5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <img src={icon_address} alt="Địa chỉ" className="w-4 h-4 object-contain mt-0.5 flex-shrink-0" />
                  <span>123 Hải Phòng, Hải Châu<br />TP. Đà Nẵng</span>
                </li>
                <li className="flex items-center gap-2">
                  <img src={icon_phone} alt="Điện thoại" className="w-4 h-4 object-contain flex-shrink-0" />
                  <span>0901 234 567</span>
                </li>
                <li className="flex items-center gap-2">
                  <img src={email_2} alt="Email" className="w-4 h-4 object-contain flex-shrink-0" />
                  <span>ttbtxhtremocoi@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 4 */}
          <div className="flex">
            <div className="w-full max-w-[270px] mx-auto flex flex-col">
              <h3 className="text-[#1a5fa8] font-bold text-sm uppercase tracking-wide mb-4 min-h-[48px] flex items-start">
                Hỗ trợ khẩn cấp
              </h3>

              <div className="bg-white rounded-xl p-4 text-sm text-gray-600 leading-relaxed flex flex-col gap-4 min-h-[148px]">
                <p>
                  Cần hỗ trợ ngay? Liên hệ với chúng tôi qua hotline 24/7 để được giải
                  đáp mọi thắc mắc.
                </p>
                <button className="w-full bg-[#1a5fa8] hover:bg-[#154d8a] text-white text-sm font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition">
                  <img src={contact_now} alt="" className="w-4 h-4 object-contain" />
                  Tư vấn ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#b8d9f0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 text-xs text-gray-500">
          ©2026 Copyright All By Trung Tam Bao Tro Xa Hoi
        </div>
      </div>
    </footer>
  );
}