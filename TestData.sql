-- ============================================================
-- TEST DATA cho hệ thống QLTTBTXH
-- Chạy script này sau khi đã tạo database bằng SQLQuery1.sql
-- ============================================================
USE QuanLyTTBT;
GO

-- ============================================================
-- 1. ĐỊA LÝ
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM TINH_TP WHERE MaTinhTP = 'HCM')
    INSERT INTO TINH_TP (MaTinhTP, TenTinhTP) VALUES ('HCM', N'Hồ Chí Minh');
IF NOT EXISTS (SELECT 1 FROM TINH_TP WHERE MaTinhTP = 'HAN')
    INSERT INTO TINH_TP (MaTinhTP, TenTinhTP) VALUES ('HAN', N'Hà Nội');

IF NOT EXISTS (SELECT 1 FROM PHUONG_XA WHERE MaPhuongXa = 'PX0001')
    INSERT INTO PHUONG_XA (MaPhuongXa, TenPhuongXa, MaTinhTP) VALUES ('PX0001', N'Phường Bến Nghé', 'HCM');
IF NOT EXISTS (SELECT 1 FROM PHUONG_XA WHERE MaPhuongXa = 'PX0002')
    INSERT INTO PHUONG_XA (MaPhuongXa, TenPhuongXa, MaTinhTP) VALUES ('PX0002', N'Phường Phạm Ngũ Lão', 'HCM');
IF NOT EXISTS (SELECT 1 FROM PHUONG_XA WHERE MaPhuongXa = 'PX0003')
    INSERT INTO PHUONG_XA (MaPhuongXa, TenPhuongXa, MaTinhTP) VALUES ('PX0003', N'Phường Hoàn Kiếm', 'HAN');
GO

-- ============================================================
-- 2. VAI TRÒ
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM VAITRO WHERE MaVaiTro = 'VT01')
    INSERT INTO VAITRO (MaVaiTro, TenVaiTro) VALUES ('VT01', N'Quản trị viên');
IF NOT EXISTS (SELECT 1 FROM VAITRO WHERE MaVaiTro = 'VT02')
    INSERT INTO VAITRO (MaVaiTro, TenVaiTro) VALUES ('VT02', N'Cán bộ tiếp nhận');
IF NOT EXISTS (SELECT 1 FROM VAITRO WHERE MaVaiTro = 'VT03')
    INSERT INTO VAITRO (MaVaiTro, TenVaiTro) VALUES ('VT03', N'Người gửi trẻ');
IF NOT EXISTS (SELECT 1 FROM VAITRO WHERE MaVaiTro = 'VT04')
    INSERT INTO VAITRO (MaVaiTro, TenVaiTro) VALUES ('VT04', N'Người nhận nuôi');
IF NOT EXISTS (SELECT 1 FROM VAITRO WHERE MaVaiTro = 'VT05')
    INSERT INTO VAITRO (MaVaiTro, TenVaiTro) VALUES ('VT05', N'Trưởng phòng');
GO

-- ============================================================
-- 3. NGƯỜI DÙNG
-- BCrypt hash của "123456": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- ============================================================
-- Cán bộ tiếp nhận
IF NOT EXISTS (SELECT 1 FROM NGUOIDUNG WHERE Email = 'tiepnhan@ttbt.vn')
    INSERT INTO NGUOIDUNG (MaNguoiDung, HoTen, Email, MatKhau, SoDienThoai, NgaySinh, GioiTinh, MaPhuongXa, DiaChiCuThe, CCCD, NgayTao)
    VALUES ('ND000001', N'Nguyễn Văn An', 'tiepnhan@ttbt.vn',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '0901234567', '1985-03-15', N'Nam', 'PX0001', N'12 Lê Lợi', '079085123456', GETDATE());

-- Người gửi trẻ 1
IF NOT EXISTS (SELECT 1 FROM NGUOIDUNG WHERE Email = 'nguoigui1@ttbt.vn')
    INSERT INTO NGUOIDUNG (MaNguoiDung, HoTen, Email, MatKhau, SoDienThoai, NgaySinh, GioiTinh, MaPhuongXa, DiaChiCuThe, CCCD, NgayTao)
    VALUES ('ND000002', N'Trần Thị Bình', 'nguoigui1@ttbt.vn',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '0912345678', '1990-07-20', N'Nữ', 'PX0002', N'45 Nguyễn Huệ', '079090234567', GETDATE());

-- Người gửi trẻ 2
IF NOT EXISTS (SELECT 1 FROM NGUOIDUNG WHERE Email = 'nguoigui2@ttbt.vn')
    INSERT INTO NGUOIDUNG (MaNguoiDung, HoTen, Email, MatKhau, SoDienThoai, NgaySinh, GioiTinh, MaPhuongXa, DiaChiCuThe, CCCD, NgayTao)
    VALUES ('ND000003', N'Lê Văn Cường', 'nguoigui2@ttbt.vn',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '0923456789', '1988-11-05', N'Nam', 'PX0003', N'78 Hàng Bài', '001088345678', GETDATE());

-- Trưởng phòng
IF NOT EXISTS (SELECT 1 FROM NGUOIDUNG WHERE Email = 'truongphong@ttbt.vn')
    INSERT INTO NGUOIDUNG (MaNguoiDung, HoTen, Email, MatKhau, SoDienThoai, NgaySinh, GioiTinh, MaPhuongXa, DiaChiCuThe, CCCD, NgayTao)
    VALUES ('ND000004', N'Phạm Thị Dung', 'truongphong@ttbt.vn',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '0934567890', '1978-05-12', N'Nữ', 'PX0001', N'5 Đồng Khởi', '079078456789', GETDATE());
GO

-- ============================================================
-- 4. GÁN VAI TRÒ
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM NGUOIDUNG_VAITRO WHERE MaNguoiDung = 'ND000001' AND MaVaiTro = 'VT02')
    INSERT INTO NGUOIDUNG_VAITRO (MaNguoiDung, MaVaiTro) VALUES ('ND000001', 'VT02');
IF NOT EXISTS (SELECT 1 FROM NGUOIDUNG_VAITRO WHERE MaNguoiDung = 'ND000002' AND MaVaiTro = 'VT03')
    INSERT INTO NGUOIDUNG_VAITRO (MaNguoiDung, MaVaiTro) VALUES ('ND000002', 'VT03');
IF NOT EXISTS (SELECT 1 FROM NGUOIDUNG_VAITRO WHERE MaNguoiDung = 'ND000003' AND MaVaiTro = 'VT03')
    INSERT INTO NGUOIDUNG_VAITRO (MaNguoiDung, MaVaiTro) VALUES ('ND000003', 'VT03');
IF NOT EXISTS (SELECT 1 FROM NGUOIDUNG_VAITRO WHERE MaNguoiDung = 'ND000004' AND MaVaiTro = 'VT05')
    INSERT INTO NGUOIDUNG_VAITRO (MaNguoiDung, MaVaiTro) VALUES ('ND000004', 'VT05');
GO

-- ============================================================
-- 5. LOẠI NGƯỜI GỬI TRẺ
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM LOAINGUOIGUITRE WHERE MaLoaiNguoiGui = 'CME')
    INSERT INTO LOAINGUOIGUITRE (MaLoaiNguoiGui, TenLoaiNguoiGui, BatBuocGiayTo, MoTa)
    VALUES ('CME', N'Cha/Mẹ ruột', 1, N'Cha hoặc mẹ đẻ của trẻ');
IF NOT EXISTS (SELECT 1 FROM LOAINGUOIGUITRE WHERE MaLoaiNguoiGui = 'NTH')
    INSERT INTO LOAINGUOIGUITRE (MaLoaiNguoiGui, TenLoaiNguoiGui, BatBuocGiayTo, MoTa)
    VALUES ('NTH', N'Người thân', 1, N'Họ hàng, người thân của trẻ');
IF NOT EXISTS (SELECT 1 FROM LOAINGUOIGUITRE WHERE MaLoaiNguoiGui = 'CQDP')
    INSERT INTO LOAINGUOIGUITRE (MaLoaiNguoiGui, TenLoaiNguoiGui, BatBuocGiayTo, MoTa)
    VALUES ('CQDP', N'Cơ quan địa phương', 0, N'Chính quyền, cơ sở xã hội');
GO

-- ============================================================
-- 6. VACXIN
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM VACXIN WHERE MaVacxin = 'VX001')
    INSERT INTO VACXIN (MaVacxin, TenVacxin, PhongBenh) VALUES ('VX001', N'BCG', N'Lao');
IF NOT EXISTS (SELECT 1 FROM VACXIN WHERE MaVacxin = 'VX002')
    INSERT INTO VACXIN (MaVacxin, TenVacxin, PhongBenh) VALUES ('VX002', N'OPV', N'Bại liệt');
IF NOT EXISTS (SELECT 1 FROM VACXIN WHERE MaVacxin = 'VX003')
    INSERT INTO VACXIN (MaVacxin, TenVacxin, PhongBenh) VALUES ('VX003', N'DTP', N'Bạch hầu, ho gà, uốn ván');
GO

-- ============================================================
-- 7. TRẺ EM
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM TRE WHERE MaTre = 'TRE00001')
    INSERT INTO TRE (MaTre, HoTen, NgaySinh, GioiTinh, MaPhuongXa, DiaChiCuThe, DanToc, TinhCach, TinhTrangSucKhoe, GhiChu, TrangThai, NgayTiepNhan)
    VALUES ('TRE00001', N'Nguyễn Minh Tuấn', '2018-04-12', N'Nam', 'PX0001', N'23 Lê Lai', N'Kinh',
        N'Hoạt bát, thích vẽ', N'Bình thường', N'Trẻ khỏe mạnh', N'Đang chăm sóc', '2024-01-15');

IF NOT EXISTS (SELECT 1 FROM TRE WHERE MaTre = 'TRE00002')
    INSERT INTO TRE (MaTre, HoTen, NgaySinh, GioiTinh, MaPhuongXa, DiaChiCuThe, DanToc, TinhCach, TinhTrangSucKhoe, GhiChu, TrangThai, NgayTiepNhan)
    VALUES ('TRE00002', N'Lê Thị Hoa', '2019-09-03', N'Nữ', 'PX0002', N'67 Điện Biên Phủ', N'Kinh',
        N'Hiền lành, thích đọc sách', N'Tốt', NULL, N'Đang chăm sóc', '2024-03-20');

IF NOT EXISTS (SELECT 1 FROM TRE WHERE MaTre = 'TRE00003')
    INSERT INTO TRE (MaTre, HoTen, NgaySinh, GioiTinh, DanToc, TinhCach, TinhTrangSucKhoe, GhiChu, TrangThai, NgayTiepNhan)
    VALUES ('TRE00003', N'Phạm Quốc Bảo', '2020-02-28', N'Nam', N'Kinh',
        N'Vui tươi, hay cười', N'Cần theo dõi', N'Trẻ có tiền sử hen suyễn nhẹ', N'Đang chăm sóc', '2024-06-10');
GO

-- ============================================================
-- 8. YÊU CẦU GỬI TRẺ
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM YEUCAUGUITRE WHERE MaYeuCauGuiTre = 'YCGT0001')
    INSERT INTO YEUCAUGUITRE (MaYeuCauGuiTre, MaNguoiGui, MaLoaiNguoiGui, QuanHeVoiTre, LyDoGui, NgayTao, TrangThaiYC, GhiChu)
    VALUES ('YCGT0001', 'ND000002', 'CME', N'Mẹ ruột', N'Hoàn cảnh gia đình khó khăn, không đủ điều kiện nuôi dưỡng',
        '2024-01-10', N'Đã tiếp nhận', NULL);

IF NOT EXISTS (SELECT 1 FROM YEUCAUGUITRE WHERE MaYeuCauGuiTre = 'YCGT0002')
    INSERT INTO YEUCAUGUITRE (MaYeuCauGuiTre, MaNguoiGui, MaLoaiNguoiGui, QuanHeVoiTre, LyDoGui, NgayTao, TrangThaiYC, GhiChu)
    VALUES ('YCGT0002', 'ND000003', 'NTH', N'Chú ruột', N'Cha mẹ trẻ mất trong tai nạn, người thân không có khả năng nuôi',
        '2024-03-15', N'Đã tiếp nhận', NULL);

IF NOT EXISTS (SELECT 1 FROM YEUCAUGUITRE WHERE MaYeuCauGuiTre = 'YCGT0003')
    INSERT INTO YEUCAUGUITRE (MaYeuCauGuiTre, MaNguoiGui, MaLoaiNguoiGui, QuanHeVoiTre, LyDoGui, NgayTao, TrangThaiYC, GhiChu)
    VALUES ('YCGT0003', 'ND000002', 'CME', N'Cha ruột', N'Mẹ qua đời, cha không có việc làm ổn định',
        '2024-06-05', N'Đã tiếp nhận', NULL);

IF NOT EXISTS (SELECT 1 FROM YEUCAUGUITRE WHERE MaYeuCauGuiTre = 'YCGT0004')
    INSERT INTO YEUCAUGUITRE (MaYeuCauGuiTre, MaNguoiGui, MaLoaiNguoiGui, QuanHeVoiTre, LyDoGui, NgayTao, TrangThaiYC, GhiChu)
    VALUES ('YCGT0004', 'ND000003', 'CQDP', N'Cán bộ địa phương', N'Trẻ bị bỏ rơi tại bệnh viện',
        DATEADD(DAY, -5, GETDATE()), N'Đang xem xét', NULL);

IF NOT EXISTS (SELECT 1 FROM YEUCAUGUITRE WHERE MaYeuCauGuiTre = 'YCGT0005')
    INSERT INTO YEUCAUGUITRE (MaYeuCauGuiTre, MaNguoiGui, MaLoaiNguoiGui, QuanHeVoiTre, LyDoGui, NgayTao, TrangThaiYC, GhiChu)
    VALUES ('YCGT0005', 'ND000002', 'CME', N'Mẹ ruột', N'Gia đình có 5 con, không đủ kinh tế',
        DATEADD(DAY, -2, GETDATE()), N'Chờ xử lý', NULL);
GO

-- ============================================================
-- 9. THÔNG TIN TRẺ TẠM
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM THONGTINTRETAM WHERE MaYeuCauGuiTre = 'YCGT0001')
    INSERT INTO THONGTINTRETAM (MaThongTin, MaYeuCauGuiTre, TenTre, NgaySinh, GioiTinh, DanToc)
    VALUES ('TTTT0001', 'YCGT0001', N'Nguyễn Minh Tuấn', '2018-04-12', N'Nam', N'Kinh');

IF NOT EXISTS (SELECT 1 FROM THONGTINTRETAM WHERE MaYeuCauGuiTre = 'YCGT0002')
    INSERT INTO THONGTINTRETAM (MaThongTin, MaYeuCauGuiTre, TenTre, NgaySinh, GioiTinh, DanToc)
    VALUES ('TTTT0002', 'YCGT0002', N'Lê Thị Hoa', '2019-09-03', N'Nữ', N'Kinh');

IF NOT EXISTS (SELECT 1 FROM THONGTINTRETAM WHERE MaYeuCauGuiTre = 'YCGT0003')
    INSERT INTO THONGTINTRETAM (MaThongTin, MaYeuCauGuiTre, TenTre, NgaySinh, GioiTinh, DanToc)
    VALUES ('TTTT0003', 'YCGT0003', N'Phạm Quốc Bảo', '2020-02-28', N'Nam', N'Kinh');

IF NOT EXISTS (SELECT 1 FROM THONGTINTRETAM WHERE MaYeuCauGuiTre = 'YCGT0004')
    INSERT INTO THONGTINTRETAM (MaThongTin, MaYeuCauGuiTre, TenTre, NgaySinh, GioiTinh, DanToc)
    VALUES ('TTTT0004', 'YCGT0004', N'Trẻ chưa có tên', NULL, N'Khác', N'Kinh');

IF NOT EXISTS (SELECT 1 FROM THONGTINTRETAM WHERE MaYeuCauGuiTre = 'YCGT0005')
    INSERT INTO THONGTINTRETAM (MaThongTin, MaYeuCauGuiTre, TenTre, NgaySinh, GioiTinh, DanToc)
    VALUES ('TTTT0005', 'YCGT0005', N'Nguyễn Thị Mai', '2021-06-15', N'Nữ', N'Kinh');
GO

-- ============================================================
-- 10. HỒ SƠ TIẾP NHẬN TRẺ
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM HOSOTIEPNHANTRE WHERE MaHSTiepNhan = 'HSTN0001')
    INSERT INTO HOSOTIEPNHANTRE (MaHSTiepNhan, MaYeuCauGuiTre, MaTre, MaCanBoTiepNhan, NgayTiepNhan, TrangThai, NgayDuyet, GhiChu)
    VALUES ('HSTN0001', 'YCGT0001', 'TRE00001', 'ND000001', '2024-01-15', N'Đã tiếp nhận', '2024-01-15', N'Hồ sơ đầy đủ');

IF NOT EXISTS (SELECT 1 FROM HOSOTIEPNHANTRE WHERE MaHSTiepNhan = 'HSTN0002')
    INSERT INTO HOSOTIEPNHANTRE (MaHSTiepNhan, MaYeuCauGuiTre, MaTre, MaCanBoTiepNhan, NgayTiepNhan, TrangThai, NgayDuyet, GhiChu)
    VALUES ('HSTN0002', 'YCGT0002', 'TRE00002', 'ND000001', '2024-03-20', N'Đã tiếp nhận', '2024-03-20', NULL);

IF NOT EXISTS (SELECT 1 FROM HOSOTIEPNHANTRE WHERE MaHSTiepNhan = 'HSTN0003')
    INSERT INTO HOSOTIEPNHANTRE (MaHSTiepNhan, MaYeuCauGuiTre, MaTre, MaCanBoTiepNhan, NgayTiepNhan, TrangThai, NgayDuyet, GhiChu)
    VALUES ('HSTN0003', 'YCGT0003', 'TRE00003', 'ND000001', '2024-06-10', N'Đã tiếp nhận', '2024-06-10', N'Trẻ cần theo dõi sức khỏe');
GO

-- ============================================================
-- 11. THEO DÕI SỨC KHỎE
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM THEODOISUCKHOE WHERE MaTheoDoi = 'TDSK0001')
    INSERT INTO THEODOISUCKHOE (MaTheoDoi, MaTre, MaNguoiCapNhat, NgayCapNhat, CanNang, ChieuCao, NhipTim, NhomMau, NhietDo, KetLuan, TinhTrangChiTiet)
    VALUES ('TDSK0001', 'TRE00001', 'ND000001', '2024-02-01', 18.5, 110.0, 85, 'O+', 36.7, N'Bình thường', N'Trẻ phát triển tốt theo lứa tuổi');

IF NOT EXISTS (SELECT 1 FROM THEODOISUCKHOE WHERE MaTheoDoi = 'TDSK0002')
    INSERT INTO THEODOISUCKHOE (MaTheoDoi, MaTre, MaNguoiCapNhat, NgayCapNhat, CanNang, ChieuCao, NhipTim, NhomMau, NhietDo, KetLuan, TinhTrangChiTiet)
    VALUES ('TDSK0002', 'TRE00001', 'ND000001', '2024-05-01', 19.2, 112.0, 82, 'O+', 36.5, N'Tốt', N'Tăng cân và chiều cao ổn định');

IF NOT EXISTS (SELECT 1 FROM THEODOISUCKHOE WHERE MaTheoDoi = 'TDSK0003')
    INSERT INTO THEODOISUCKHOE (MaTheoDoi, MaTre, MaNguoiCapNhat, NgayCapNhat, CanNang, ChieuCao, NhipTim, NhomMau, NhietDo, KetLuan, TinhTrangChiTiet)
    VALUES ('TDSK0003', 'TRE00002', 'ND000001', '2024-04-10', 14.0, 98.5, 90, 'A+', 36.8, N'Bình thường', N'Trẻ phát triển tốt');

IF NOT EXISTS (SELECT 1 FROM THEODOISUCKHOE WHERE MaTheoDoi = 'TDSK0004')
    INSERT INTO THEODOISUCKHOE (MaTheoDoi, MaTre, MaNguoiCapNhat, NgayCapNhat, CanNang, ChieuCao, NhipTim, NhomMau, NhietDo, KetLuan, TinhTrangChiTiet)
    VALUES ('TDSK0004', 'TRE00003', 'ND000001', '2024-06-15', 12.5, 90.0, 95, 'B+', 36.9, N'Cần theo dõi', N'Trẻ có tiền sử hen suyễn, đang được theo dõi định kỳ');
GO

-- ============================================================
-- 12. LỊCH SỬ TIÊM CHỦNG
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM LICHSUTIEMCHUNG WHERE MaTre = 'TRE00001' AND MaVacxin = 'VX001' AND MuiSo = 1)
    INSERT INTO LICHSUTIEMCHUNG (MaLSTiemChung, MaTre, MaVacxin, MuiSo, NgayTiem, GhiChu)
    VALUES ('LSTC0001', 'TRE00001', 'VX001', 1, '2018-04-20', N'Tiêm sau sinh');

IF NOT EXISTS (SELECT 1 FROM LICHSUTIEMCHUNG WHERE MaTre = 'TRE00001' AND MaVacxin = 'VX003' AND MuiSo = 1)
    INSERT INTO LICHSUTIEMCHUNG (MaLSTiemChung, MaTre, MaVacxin, MuiSo, NgayTiem, GhiChu)
    VALUES ('LSTC0002', 'TRE00001', 'VX003', 1, '2018-06-15', NULL);

IF NOT EXISTS (SELECT 1 FROM LICHSUTIEMCHUNG WHERE MaTre = 'TRE00002' AND MaVacxin = 'VX001' AND MuiSo = 1)
    INSERT INTO LICHSUTIEMCHUNG (MaLSTiemChung, MaTre, MaVacxin, MuiSo, NgayTiem, GhiChu)
    VALUES ('LSTC0003', 'TRE00002', 'VX001', 1, '2019-09-10', N'Tiêm sau sinh');
GO

-- ============================================================
-- Kiểm tra kết quả
-- ============================================================
SELECT 'NGUOIDUNG' AS Bang, COUNT(*) AS SoLuong FROM NGUOIDUNG
UNION ALL SELECT 'TRE', COUNT(*) FROM TRE
UNION ALL SELECT 'YEUCAUGUITRE', COUNT(*) FROM YEUCAUGUITRE
UNION ALL SELECT 'HOSOTIEPNHANTRE', COUNT(*) FROM HOSOTIEPNHANTRE
UNION ALL SELECT 'THEODOISUCKHOE', COUNT(*) FROM THEODOISUCKHOE
UNION ALL SELECT 'THONGTINTRETAM', COUNT(*) FROM THONGTINTRETAM
UNION ALL SELECT 'LICHSUTIEMCHUNG', COUNT(*) FROM LICHSUTIEMCHUNG;
GO
