USE master
GO
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'QuanLyTTBT')
BEGIN
    ALTER DATABASE QuanLyTTBT SET SINGLE_USER WITH ROLLBACK IMMEDIATE
    DROP DATABASE QuanLyTTBT
END
GO
CREATE DATABASE QuanLyTTBT
GO
USE QuanLyTTBT
GO
-- ============================================================
-- BẢNG DANH MỤC ĐỊA LÝ
-- ============================================================
CREATE TABLE TINH_TP (
    MaTinhTP    CHAR(3)        NOT NULL,
    TenTinhTP   NVARCHAR(100)  NOT NULL,
    CONSTRAINT PK_TINH_TP PRIMARY KEY (MaTinhTP)
);

CREATE TABLE PHUONG_XA (
    MaPhuongXa  CHAR(6)        NOT NULL,
    TenPhuongXa NVARCHAR(100)  NOT NULL,
    MaTinhTP    CHAR(3)        NOT NULL,
    CONSTRAINT PK_PHUONG_XA    PRIMARY KEY (MaPhuongXa),
    CONSTRAINT FK_PHUONGXA_TINHTP FOREIGN KEY (MaTinhTP)
        REFERENCES TINH_TP(MaTinhTP)
);
-- ============================================================
-- PHÂN QUYỀN
-- ============================================================

CREATE TABLE VAITRO (
    MaVaiTro    CHAR(4)        NOT NULL,
    TenVaiTro   NVARCHAR(50)   NOT NULL,
    MoTa        NVARCHAR(200)  NULL,
    CONSTRAINT PK_VAITRO PRIMARY KEY (MaVaiTro)
);

CREATE TABLE QUYENHAN (
    MaQuyen     CHAR(5)        NOT NULL,
    TenQuyen    NVARCHAR(100)  NOT NULL,
    MoTa        NVARCHAR(200)  NULL,
    CONSTRAINT PK_QUYENHAN PRIMARY KEY (MaQuyen)
);

CREATE TABLE QUYENHAN_VAITRO (
    MaQuyen     CHAR(5)        NOT NULL,
    MaVaiTro    CHAR(4)        NOT NULL,
    CONSTRAINT PK_QUYENHAN_VAITRO PRIMARY KEY (MaQuyen, MaVaiTro),
    CONSTRAINT FK_QHV_QUYEN  FOREIGN KEY (MaQuyen)   REFERENCES QUYENHAN(MaQuyen),
    CONSTRAINT FK_QHV_VAITRO FOREIGN KEY (MaVaiTro)  REFERENCES VAITRO(MaVaiTro)
);

-- ============================================================
-- NGƯỜI DÙNG
-- ============================================================

CREATE TABLE NGUOIDUNG (
    MaNguoiDung     CHAR(8)        NOT NULL,
    SDT             VARCHAR(15)    NOT NULL,
    MatKhau         VARCHAR(255)   NOT NULL,
    HoTen           NVARCHAR(100)  NOT NULL,
    NgaySinh        DATE           NULL,
    GioiTinh        NVARCHAR(5)    NOT NULL,
    CCCD            CHAR(12)       NULL UNIQUE,
    Email           VARCHAR(254)   NULL UNIQUE,
    MaXaPhuong      CHAR(6)        NULL,
    DiaChiCuThe     NVARCHAR(200)  NULL,
    NgayTao         DATETIME       NOT NULL DEFAULT GETDATE(),
    TrangThaiTK     BIT            NOT NULL DEFAULT 1,
    CONSTRAINT PK_NGUOIDUNG PRIMARY KEY (MaNguoiDung),
    CONSTRAINT FK_ND_PHUONGXA FOREIGN KEY (MaXaPhuong)
        REFERENCES PHUONG_XA(MaPhuongXa),
    CONSTRAINT CHK_ND_GIOITINH CHECK (GioiTinh IN (N'Nam', N'Nữ', N'Khác')),
    CONSTRAINT CHK_ND_SDT CHECK (SDT NOT LIKE '%[^0-9+() -]%' AND LEN(SDT) BETWEEN 9 AND 15)
);

CREATE TABLE NGUOIDUNG_VAITRO (
    MaNguoiDung CHAR(8) NOT NULL,
    MaVaiTro    CHAR(4) NOT NULL,
    CONSTRAINT PK_NGUOIDUNG_VAITRO PRIMARY KEY (MaNguoiDung, MaVaiTro),
    CONSTRAINT FK_NDV_ND FOREIGN KEY (MaNguoiDung) REFERENCES NGUOIDUNG(MaNguoiDung),
    CONSTRAINT FK_NDV_VT FOREIGN KEY (MaVaiTro)    REFERENCES VAITRO(MaVaiTro)
);

-- ============================================================
-- DANH MỤC HỖ TRỢ
-- ============================================================

CREATE TABLE LOAINGUOIGUITRE (
    MaLoaiNguoiGui  CHAR(4)       NOT NULL,
    TenLoaiNguoiGui NVARCHAR(100) NOT NULL,
    BatBuocGiayTo   BIT           NOT NULL DEFAULT 1,
    MoTa            NVARCHAR(200) NULL,
    CONSTRAINT PK_LOAINGUOIGUITRE PRIMARY KEY (MaLoaiNguoiGui)
);

CREATE TABLE VACXIN (
    MaVacxin    CHAR(5)        NOT NULL,
    TenVacxin   NVARCHAR(50)   NOT NULL,
    PhongBenh   NVARCHAR(100)  NOT NULL,
    CONSTRAINT PK_VACXIN PRIMARY KEY (MaVacxin)
);

-- ============================================================
-- TRẺ EM
-- ============================================================

CREATE TABLE TRE (
    MaTre               CHAR(8)        NOT NULL,
    HoTen               NVARCHAR(100)  NOT NULL,
    NgaySinh            DATE           NULL,
    GioiTinh            NVARCHAR(5)    NOT NULL,
    MaPhuongXa          CHAR(6)        NULL,
    DiaChiCuThe         NVARCHAR(200)  NULL,
    DanToc              NVARCHAR(30)   NULL,
    TinhCach            NVARCHAR(150)  NULL,
    SoThich             NVARCHAR(150)  NULL,
    DacDiemNhanDang     NVARCHAR(150)  NULL,
    TrangThai           NVARCHAR(20)   NOT NULL,
    NgayTiepNhan        DATE           NULL,
    NgayCapNhat         DATETIME2(0)   NULL,
    NgayNhanNuoi        DATE           NULL,
    GhiChu              NVARCHAR(200)  NULL,
    MaNguoiCapNhat      CHAR(8)        NULL,
    HinhAnh             NVARCHAR(255)  NULL,
    CONSTRAINT PK_TRE PRIMARY KEY (MaTre),
    CONSTRAINT FK_TRE_PHUONGXA  FOREIGN KEY (MaPhuongXa)     REFERENCES PHUONG_XA(MaPhuongXa),
    CONSTRAINT FK_TRE_NGUOIDUNG FOREIGN KEY (MaNguoiCapNhat) REFERENCES NGUOIDUNG(MaNguoiDung),
    CONSTRAINT CHK_TRE_GIOITINH CHECK (GioiTinh IN (N'Nam', N'Nữ', N'Khác')),
    CONSTRAINT CHK_TRE_TRANGTHAI CHECK (TrangThai IN (
        N'Chờ tiếp nhận', N'Đang chăm sóc', N'Chờ nhận nuôi', N'Đã nhận nuôi', N'Đã trả về gia đình'
    ))
);

-- ============================================================
-- THEO DÕI SỨC KHỎE & TIÊM CHỦNG
-- ============================================================

CREATE TABLE LICHSUTIEMCHUNG (
    MaLSTiemChung   CHAR(8)        NOT NULL,
    MaTre           CHAR(8)        NOT NULL,
    MaVacxin        CHAR(5)        NOT NULL,
    MuiSo           INT            NOT NULL,
    NgayTiem        DATE           NOT NULL,
    GhiChu          NVARCHAR(100)  NULL,
    CONSTRAINT PK_LICHSUTIEMCHUNG PRIMARY KEY (MaLSTiemChung),
    CONSTRAINT FK_LSTC_TRE FOREIGN KEY (MaTre) REFERENCES TRE(MaTre),
    CONSTRAINT FK_LSTC_VACXIN FOREIGN KEY (MaVacxin) REFERENCES VACXIN(MaVacxin),
    CONSTRAINT CK_LSTC_MuiSo CHECK (MuiSo >= 0),
    CONSTRAINT UQ_LSTC_TRE_VACXIN_MUISO UNIQUE (MaTre, MaVacxin, MuiSo)
);

CREATE TABLE THEODOISUCKHOE (
    MaTheoDoi           CHAR(8)        NOT NULL,
    MaTre               CHAR(8)        NOT NULL,
    MaNguoiCapNhat      CHAR(8)        NULL,
    NgayCapNhat         DATETIME       NOT NULL DEFAULT GETDATE(),
    CanNang             DECIMAL(5,2)   NULL,
    ChieuCao            DECIMAL(5,2)   NULL,
    NhipTim             SMALLINT       NULL,
    NhomMau             CHAR(3)        NULL,
    NhietDo             DECIMAL(4,2)   NULL,
    KetLuan             NVARCHAR(100)  NULL,
    TinhTrangChiTiet    NVARCHAR(200)  NULL,
    CONSTRAINT PK_THEODOISUCKHOE PRIMARY KEY (MaTheoDoi),
    CONSTRAINT FK_TDSK_TRE       FOREIGN KEY (MaTre)           REFERENCES TRE(MaTre),
    CONSTRAINT FK_TDSK_NGUOIDUNG FOREIGN KEY (MaNguoiCapNhat) REFERENCES NGUOIDUNG(MaNguoiDung),
    CONSTRAINT CHK_TDSK_NHOMMAU  CHECK (NhomMau IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
    CONSTRAINT CHK_TDSK_CANNANG  CHECK (CanNang  > 0 AND CanNang  < 300),
    CONSTRAINT CHK_TDSK_CHIEUCAO CHECK (ChieuCao > 0 AND ChieuCao < 250),
    CONSTRAINT CHK_TDSK_NHIPTIM  CHECK (NhipTim  > 0 AND NhipTim  < 300),
    CONSTRAINT CHK_TDSK_NHIETDO  CHECK (NhietDo  > 30 AND NhietDo  < 45)
);

-- ============================================================
-- YÊU CẦU & HỒ SƠ NHẬN NUÔI
-- ============================================================

CREATE TABLE YEUCAUNHANNUOI (
    MaYeuCauNhan        CHAR(8)        NOT NULL,
    MaNguoiNhan         CHAR(8)        NOT NULL,
    LyDoNhanNuoi        NVARCHAR(200)  NULL,
    MongMuonVeTre       NVARCHAR(200)  NULL,
    ThuNhapHangThang    DECIMAL(12,2)  NULL,
    NgheNghiep          NVARCHAR(100)  NULL,
    NgayTao             DATETIME       NOT NULL DEFAULT GETDATE(),
    NgayCapNhat         DATETIME       NULL,
    TrangThai           NVARCHAR(20)   NOT NULL,
    NguoiDuyet          CHAR(8)        NULL,
    CONSTRAINT PK_YEUCAUNHANNUOI  PRIMARY KEY (MaYeuCauNhan),
    CONSTRAINT FK_YCNN_NGUOIDUNG  FOREIGN KEY (MaNguoiNhan) REFERENCES NGUOIDUNG(MaNguoiDung),
    CONSTRAINT FK_YCNN_NGUOIDUYET FOREIGN KEY (NguoiDuyet)  REFERENCES NGUOIDUNG(MaNguoiDung),
    CONSTRAINT CHK_YCNN_TRANGTHAI CHECK (TrangThai IN (
        N'Chờ xử lý', N'Đang xem xét', N'Chờ ghép trẻ', N'Đã duyệt', N'Từ chối')),
    CONSTRAINT CHK_YCNN_THUNHAP   CHECK (ThuNhapHangThang IS NULL OR ThuNhapHangThang >= 0)
);

-- ============================================================
-- YÊU CẦU & HỒ SƠ GỬI TRẺ
-- ============================================================

CREATE TABLE YEUCAUGUITRE (
    MaYeuCauGuiTre  CHAR(8)        NOT NULL,
    MaNguoiGui      CHAR(8)        NOT NULL,
    MaLoaiNguoiGui  CHAR(4)        NOT NULL,
    QuanHeVoiTre    NVARCHAR(50)   NULL,
    LyDoGui         NVARCHAR(200)  NULL,
    NgayTao         DATETIME2(0)   NOT NULL DEFAULT SYSDATETIME(),
    NgayCapNhat     DATETIME2(0)   NULL,
    TrangThaiYC     NVARCHAR(20)   NOT NULL,
    GhiChu          NVARCHAR(200)  NULL,
    CONSTRAINT PK_YEUCAUGUITRE  PRIMARY KEY (MaYeuCauGuiTre),
    CONSTRAINT FK_YCGT_NGUOIDUNG FOREIGN KEY (MaNguoiGui)      REFERENCES NGUOIDUNG(MaNguoiDung),
    CONSTRAINT FK_YCGT_LOAI      FOREIGN KEY (MaLoaiNguoiGui)  REFERENCES LOAINGUOIGUITRE(MaLoaiNguoiGui),
    CONSTRAINT CHK_YCGT_TRANGTHAI CHECK (TrangThaiYC IN (
        N'Chờ xử lý', N'Đang xem xét', N'Đã tiếp nhận', N'Từ chối', N'Đã hủy'
    ))
);

-- ============================================================
-- GIẤY TỜ PHÁP LÝ
-- ============================================================

CREATE TABLE GIAYTOPHAPLY (
    MaGiayTo        CHAR(8)        NOT NULL,
    TenGiayTo       NVARCHAR(150)  NOT NULL,
    LoaiGiayTo      NVARCHAR(50)   NOT NULL,
    DuongDanFile    NVARCHAR(255)  NULL,
    TrangThai       NVARCHAR(20)   NOT NULL DEFAULT N'Chờ xác minh',
    MaYeuCauGuiTre  CHAR(8)        NULL,
    MaYeuCauNhan    CHAR(8)        NULL,
    NgayCapNhat     DATETIME2(0)   NULL,
    CONSTRAINT PK_GIAYTOPHAPLY PRIMARY KEY (MaGiayTo),
    CONSTRAINT FK_GTPL_YEUCAUGUITRE FOREIGN KEY (MaYeuCauGuiTre)
        REFERENCES YEUCAUGUITRE(MaYeuCauGuiTre),
    CONSTRAINT FK_GTPL_YEUCAUNHAN FOREIGN KEY (MaYeuCauNhan)
        REFERENCES YEUCAUNHANNUOI(MaYeuCauNhan),
    CONSTRAINT CHK_GTPL_YEUCAU CHECK (
        (MaYeuCauGuiTre IS NOT NULL AND MaYeuCauNhan IS NULL)
        OR
        (MaYeuCauGuiTre IS NULL AND MaYeuCauNhan IS NOT NULL)
    ),
    CONSTRAINT CHK_GTPL_TRANGTHAI CHECK (TrangThai IN (
        N'Chờ xác minh', N'Hợp lệ', N'Không hợp lệ', N'Hết hạn', N'Cần bổ sung'
    ))
);

-- ============================================================
-- THÔNG TIN TRẺ TẠM (trước khi tiếp nhận chính thức)
-- ============================================================

CREATE TABLE THONGTINTRETAM (
    MaThongTin      CHAR(8)        NOT NULL,
    MaYeuCauGuiTre  CHAR(8)        NOT NULL UNIQUE,
    TenTre          NVARCHAR(100)  NOT NULL,
    NgaySinh        DATE           NULL,
    GioiTinh        NVARCHAR(5)    NOT NULL DEFAULT N'Khác',
    DanToc          NVARCHAR(30)   NULL,
    CONSTRAINT PK_THONGTINTRETAM  PRIMARY KEY (MaThongTin),
    CONSTRAINT FK_TTTT_YEUCAU     FOREIGN KEY (MaYeuCauGuiTre)
        REFERENCES YEUCAUGUITRE(MaYeuCauGuiTre),
    CONSTRAINT CHK_TTTT_GIOITINH  CHECK (GioiTinh IN (N'Nam', N'Nữ', N'Khác'))
);

-- ============================================================
-- HỒ SƠ NHẬN NUÔI
-- ============================================================

CREATE TABLE HOSONHANNUOI (
    MaHSNhanNuoi    CHAR(8)       NOT NULL,
    MaYeuCauNhan    CHAR(8)       NOT NULL UNIQUE,
    MaTre           CHAR(8)       NOT NULL,
    MaCanBo         CHAR(8)       NULL,
    NgayLap         DATE          NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    NgayDuyet       DATE          NULL,
    TrangThai       NVARCHAR(20)  NOT NULL,
    GhiChu          NVARCHAR(100) NULL,
    CONSTRAINT PK_HOSONHANNUOI PRIMARY KEY (MaHSNhanNuoi),
    CONSTRAINT FK_HSNN_YEUCAU  FOREIGN KEY (MaYeuCauNhan) REFERENCES YEUCAUNHANNUOI(MaYeuCauNhan),
    CONSTRAINT FK_HSNN_TRE     FOREIGN KEY (MaTre)        REFERENCES TRE(MaTre),
    CONSTRAINT FK_HSNN_CANBO   FOREIGN KEY (MaCanBo)      REFERENCES NGUOIDUNG(MaNguoiDung),
    CONSTRAINT CHK_HSNN_TRANGTHAI CHECK (TrangThai IN (
        N'Đang lập', N'Chờ duyệt', N'Đã duyệt', N'Từ chối', N'Đã hoàn tất'
    )),
    CONSTRAINT CHK_HSNN_NGAY CHECK (NgayDuyet IS NULL OR NgayDuyet >= NgayLap)
);
CREATE TABLE LICHHENGAPMATNHANNUOI (
    MaLichGap           CHAR(8)        NOT NULL,
    MaYeuCauNhan        CHAR(8)        NOT NULL,
    MaTre               CHAR(8)        NOT NULL,
    MaCanBo             CHAR(8)        NOT NULL,
	NgayGapMat     DATETIME       NULL,
    ThoiGian      DATETIME       NOT NULL,
    DiaDiem             NVARCHAR(200)  NULL,
    TrangThai           NVARCHAR(30)   NOT NULL,
    KetQua              NVARCHAR(30)   NULL,
    PhanHoiNguoiNhan    NVARCHAR(200)  NULL,
    ThoiGianDeXuatMoi   DATETIME       NULL,
    GhiChuCanBo         NVARCHAR(200)  NULL,
    NgayTao             DATETIME       NOT NULL DEFAULT GETDATE(),
    NgayCapNhat         DATETIME       NULL,
    CONSTRAINT PK_LICHHENGAPMATNHANNUOI PRIMARY KEY (MaLichGap),
    CONSTRAINT FK_LHGM_YEUCAUNHAN FOREIGN KEY (MaYeuCauNhan) REFERENCES YEUCAUNHANNUOI(MaYeuCauNhan),
    CONSTRAINT FK_LHGM_TRE FOREIGN KEY (MaTre) REFERENCES TRE(MaTre),
    CONSTRAINT FK_LHGM_CANBO FOREIGN KEY (MaCanBo) REFERENCES NGUOIDUNG(MaNguoiDung),
    CONSTRAINT CK_LHGM_TRANGTHAI CHECK (TrangThai IN (N'Chờ xác nhận',N'Đã xác nhận',N'Yêu cầu đổi lịch',N'Đã đổi lịch',N'Đã gặp mặt',N'Đã hủy')),
    CONSTRAINT CK_LHGM_KETQUA CHECK (KetQua IS NULL OR KetQua IN (N'Phù hợp',N'Không phù hợp',N'Cần gặp lại'))
);
-- ============================================================
-- HỒ SƠ TIẾP NHẬN TRẺ
-- ============================================================
CREATE TABLE HOSOTIEPNHANTRE (
    MaHSTiepNhan        CHAR(8)       NOT NULL,
    MaYeuCauGuiTre      CHAR(8)       NOT NULL UNIQUE,
    MaTre               CHAR(8)       NULL,
    MaCanBoTiepNhan     CHAR(8)       NOT NULL,
    NgayTiepNhan        DATE          NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    TrangThai           NVARCHAR(20)  NOT NULL,
    NgayDuyet           DATE          NULL,
    GhiChu              NVARCHAR(200) NULL,
    CONSTRAINT PK_HOSOTIEPNHANTRE  PRIMARY KEY (MaHSTiepNhan),
    CONSTRAINT FK_HSTN_YEUCAU      FOREIGN KEY (MaYeuCauGuiTre)  REFERENCES YEUCAUGUITRE(MaYeuCauGuiTre),
    CONSTRAINT FK_HSTN_TRE         FOREIGN KEY (MaTre)            REFERENCES TRE(MaTre),
    CONSTRAINT FK_HSTN_CANBO       FOREIGN KEY (MaCanBoTiepNhan)  REFERENCES NGUOIDUNG(MaNguoiDung),
    CONSTRAINT CHK_HSTN_TRANGTHAI CHECK (TrangThai IN (
        N'Đang xử lý', N'Chờ duyệt', N'Đã duyệt', N'Từ chối', N'Đã hủy'
    )),
    CONSTRAINT CHK_HSTN_NGAY CHECK (NgayDuyet IS NULL OR NgayDuyet >= NgayTiepNhan)
);
GO

INSERT INTO TINH_TP (MaTinhTP, TenTinhTP)
VALUES
('DNG', N'Thành phố Đà Nẵng'),
('HUE', N'Thành phố Huế');

INSERT INTO PHUONG_XA (MaPhuongXa, TenPhuongXa, MaTinhTP)
VALUES
('HKHN01', N'Phường Hòa Khánh Nam', 'DNG'),
('HHAC01', N'Phường Hòa Hải', 'DNG'),
('ANXU01', N'Phường Thanh Khê', 'DNG'),
('ANTH01', N'Phường Xuân Phú', 'HUE');

INSERT INTO VAITRO (MaVaiTro, TenVaiTro, MoTa)
VALUES
('ADMI', N'Quản trị viên', N'Quản lý toàn bộ hệ thống'),
('QLNT', N'Cán bộ quản lý tiếp nhận trẻ', N'Tiếp nhận, xử lý hồ sơ, cập nhật thông tin trẻ'),
('QLNN', N'Cán bộ quản lý nhận nuôi trẻ', N'Tiếp nhận, xử lý hồ sơ nhận nuôi'),
('NGGT', N'Người gửi trẻ', N'Người gửi trẻ'),
('NGNN', N'Người nhận nuôi trẻ', N'Người đăng ký nhận nuôi'),
('TPQL', N'Trưởng phòng quản lý', N'Quản lý các cán bộ');

INSERT INTO QUYENHAN (MaQuyen, TenQuyen, MoTa)
VALUES
('Q001', N'Quản lý người dùng', N'Tạo, cập nhật, khóa tài khoản'),
('Q002', N'Quản lý trẻ em', N'Thêm, sửa, xem hồ sơ trẻ'),
('Q003', N'Quản lý yêu cầu gửi trẻ', N'Tiếp nhận và xử lý yêu cầu gửi trẻ'),
('Q004', N'Quản lý yêu cầu nhận nuôi', N'Tiếp nhận và xử lý yêu cầu nhận nuôi'),
('Q005', N'Quản lý giấy tờ pháp lý', N'Kiểm tra và xác minh giấy tờ'),
('Q006', N'Xem báo cáo', N'Xem thống kê và báo cáo hệ thống');

INSERT INTO QUYENHAN_VAITRO (MaQuyen, MaVaiTro)
VALUES
('Q001', 'ADMI'),
('Q002', 'ADMI'),
('Q003', 'ADMI'),
('Q004', 'ADMI'),
('Q005', 'ADMI'),
('Q006', 'ADMI'),

('Q002', 'QLNT'),
('Q003', 'QLNT'),
('Q005', 'QLNT'),
('Q006', 'QLNT'),

('Q004', 'QLNN'),
('Q005', 'QLNN'),
('Q006', 'QLNN'),

('Q003', 'NGGT'),

('Q004', 'NGNN'),

('Q001', 'TPQL'),
('Q002', 'TPQL'),
('Q003', 'TPQL'),
('Q004', 'TPQL'),
('Q005', 'TPQL'),
('Q006', 'TPQL');

INSERT INTO NGUOIDUNG (MaNguoiDung, SDT, MatKhau, HoTen, NgaySinh, GioiTinh, CCCD, Email, MaXaPhuong, DiaChiCuThe, NgayTao, TrangThaiTK)
VALUES
('ND000001', '0905123001', '123456', N'Lê Thị Minh Châu', '1988-03-12', N'Nữ', '048188001201', 'admin@ttbt.vn', 'HKHN01', N'Tổ 8 Đà Sơn', '2026-03-01 08:00:00', 1),
('ND000002', '0905123002', '123456', N'Trần Văn Phúc', '1986-07-21', N'Nam', '048186001202', 'tiepnhan@ttbt.vn', 'HKHN01', N'Khu Đà Sơn', '2026-03-01 08:10:00', 1),
('ND000003', '0905123003', '123456', N'Nguyễn Thị Bích Lan', '1990-11-04', N'Nữ', '046190001203', 'nhannuoi@ttbt.vn', 'ANTH01', N'Đường Xuân Phú', '2026-03-01 08:20:00', 1),
('ND000004', '0905123004', '123456', N'Phạm Thị Hồng Nhung', '1995-05-14', N'Nữ', '048195001204', 'nguoigui1@gmail.com', 'HKHN01', N'Khu dân cư Hòa Khánh Nam', '2026-03-02 09:00:00', 1),
('ND000005', '0905123005', '123456', N'Đặng Quốc Huy', '1989-01-25', N'Nam', '046189001205', 'nguoinhan1@gmail.com', 'ANXU01', N'Đường Trần Cao Vân', '2026-03-02 09:05:00', 1),
('ND000006', '0905123006', '123456', N'Võ Thị Mỹ Linh', '1993-08-17', N'Nữ', '046193001206', 'nguoigui2@gmail.com', 'ANTH01', N'Khu dân cư Xuân Phú', '2026-03-02 09:10:00', 1),
('ND000015', '0905123015', '123456', N'Nguyễn Hải Yến', '1998-06-21', N'Nữ', '048198001215', 'haiyen15@gmail.com', 'HKHN01', N'Khu dân cư Hòa Khánh Nam', '2026-03-18 08:10:00', 1),
('ND000016', '0905123016', '123456', N'Trương Minh Đức', '1992-04-03', N'Nam', '046192001216', 'minhduc16@gmail.com', 'ANXU01', N'Đường Trần Cao Vân', '2026-03-18 08:20:00', 1),
('ND000017', '0905123017', '123456', N'Phan Ngọc Trâm', '1996-12-15', N'Nữ', '048196001217', 'ngoctram17@gmail.com', 'HHAC01', N'Khu ven biển Hòa Hải', '2026-03-18 08:30:00', 1),
('ND000018', '0905123018', '123456', N'Lý Quốc Thịnh', '1987-09-09', N'Nam', '046187001218', 'quocthinh18@gmail.com', 'ANTH01', N'Đường Xuân Phú', '2026-03-18 08:40:00', 1),
('ND000019', '0905123019', '123456', N'Đào Thu Phương', '1994-11-27', N'Nữ', '048194001219', 'thuphuong19@gmail.com', 'HKHN01', N'Tổ 8 Đà Sơn', '2026-03-18 08:50:00', 1),
('ND000020', '0905123020', '123456', N'Đinh Gia Huy', '1991-02-14', N'Nam', '046191001220', 'giahuy20@gmail.com', 'ANXU01', N'Khu dân cư Thanh Khê', '2026-03-18 09:00:00', 1);

INSERT INTO NGUOIDUNG_VAITRO (MaNguoiDung, MaVaiTro)
VALUES
('ND000001', 'ADMI'),
('ND000002', 'QLNT'),
('ND000003', 'QLNN'),
('ND000003', 'TPQL'),
('ND000004', 'NGGT'),
('ND000004', 'NGNN'),
('ND000005', 'NGGT'),
('ND000005', 'NGNN'),
('ND000006', 'NGGT'),
('ND000006', 'NGNN'),
('ND000015', 'NGGT'),
('ND000015', 'NGNN'),
('ND000016', 'NGGT'),
('ND000016', 'NGNN'),
('ND000017', 'NGGT'),
('ND000017', 'NGNN'),
('ND000018', 'NGGT'),
('ND000018', 'NGNN'),
('ND000019', 'NGGT'),
('ND000019', 'NGNN'),
('ND000020', 'NGGT'),
('ND000020', 'NGNN');

INSERT INTO LOAINGUOIGUITRE (MaLoaiNguoiGui, TenLoaiNguoiGui, BatBuocGiayTo, MoTa)
VALUES
('CME', N'Cha hoặc mẹ ruột', 1, N'Cha hoặc mẹ ruột trực tiếp gửi trẻ'),
('NTH', N'Người thân', 1, N'Ông bà, cô dì, chú bác hoặc người thân hợp pháp'),
('CQDP', N'Cơ quan địa phương', 1, N'UBND, công an, bệnh viện hoặc cơ quan chức năng');

INSERT INTO VACXIN (MaVacxin, TenVacxin, PhongBenh)
VALUES
('HBV',   N'Vắc xin viêm gan B đơn giá',        N'Phòng bệnh viêm gan B'),
('BCG',   N'Vắc xin BCG',                       N'Phòng bệnh lao'),
('PENTA', N'Vắc xin 5 trong 1 DPT-VGB-Hib',     N'Phòng bạch hầu, ho gà, uốn ván, viêm gan B và Hib'),
('OPV',   N'Vắc xin bại liệt uống',             N'Phòng bệnh bại liệt'),
('IPV',   N'Vắc xin bại liệt tiêm',             N'Phòng bệnh bại liệt'),
('MV',    N'Vắc xin sởi đơn',                   N'Phòng bệnh sởi'),
('MR',    N'Vắc xin sởi - rubella',             N'Phòng bệnh sởi và rubella'),
('DPT',   N'Vắc xin bạch hầu - ho gà - uốn ván', N'Tiêm nhắc phòng bạch hầu, ho gà, uốn ván'),
('JEV',   N'Vắc xin viêm não Nhật Bản',         N'Phòng bệnh viêm não Nhật Bản');

INSERT INTO YEUCAUGUITRE (MaYeuCauGuiTre, MaNguoiGui, MaLoaiNguoiGui, QuanHeVoiTre, LyDoGui, NgayTao, NgayCapNhat, TrangThaiYC, GhiChu)
VALUES
('YCGT0001', 'ND000004', 'CME', N'Mẹ ruột', N'Hoàn cảnh kinh tế khó khăn, chưa đủ điều kiện chăm sóc trẻ ổn định', '2026-03-05 09:00:00', '2026-03-06 10:15:00', N'Đã tiếp nhận', N'Hồ sơ đã được kiểm tra và tiếp nhận ban đầu'),
('YCGT0002', 'ND000006', 'NTH', N'Cô ruột', N'Gia đình không còn khả năng chăm sóc lâu dài cho trẻ', '2026-03-08 14:20:00', '2026-03-09 09:40:00', N'Đang xem xét', N'Đang chờ bổ sung xác nhận cư trú'),
('YCGT0003', 'ND000004', 'CME', N'Mẹ ruột', N'Mẹ đơn thân, đang điều trị bệnh dài ngày', '2026-03-12 08:30:00', '2026-03-12 15:20:00', N'Chờ xử lý', N'Hồ sơ mới tạo trên hệ thống'),
('YCGT0004', 'ND000015', 'CME', N'Mẹ ruột', N'Hoàn cảnh kinh tế khó khăn, cần hỗ trợ chăm sóc trẻ trong thời gian ngắn', '2026-03-18 09:15:00', '2026-03-19 10:00:00', N'Đang xem xét', N'Đã tiếp nhận hồ sơ và đang kiểm tra giấy tờ'),
('YCGT0005', 'ND000017', 'NTH', N'Bà ngoại', N'Người giám hộ hiện tại không còn đủ sức khỏe để chăm sóc trẻ', '2026-03-18 10:20:00', '2026-03-19 14:20:00', N'Đã tiếp nhận', N'Hồ sơ đã được duyệt tiếp nhận'),
('YCGT0006', 'ND000019', 'CME', N'Mẹ ruột', N'Mẹ đang điều trị bệnh dài ngày, chưa thể trực tiếp nuôi dưỡng trẻ', '2026-03-19 08:45:00', '2026-03-20 09:30:00', N'Từ chối', N'Hồ sơ thiếu giấy xác nhận tình trạng hiện tại');

INSERT INTO THONGTINTRETAM (MaThongTin, MaYeuCauGuiTre, TenTre, NgaySinh, GioiTinh, DanToc)
VALUES
('TTTT0001', 'YCGT0001', N'Phạm Gia Hân', '2021-08-14', N'Nữ', N'Kinh'),
('TTTT0002', 'YCGT0002', N'Võ Nhật Minh', '2020-12-03', N'Nam', N'Kinh'),
('TTTT0003', 'YCGT0003', N'Nguyễn Khánh An', '2022-01-19', N'Nữ', N'Kinh'),
('TTTT0004', 'YCGT0004', N'Trần Gia Bảo', '2022-09-11', N'Nam', N'Kinh'),
('TTTT0005', 'YCGT0005', N'Phan An Nhi', '2021-07-23', N'Nữ', N'Kinh'),
('TTTT0006', 'YCGT0006', N'Đào Khôi Nguyên', '2020-03-05', N'Nam', N'Kinh');

INSERT INTO YEUCAUNHANNUOI (MaYeuCauNhan, MaNguoiNhan, LyDoNhanNuoi, MongMuonVeTre, ThuNhapHangThang, NgheNghiep, NgayTao, NgayCapNhat, TrangThai, NguoiDuyet)
VALUES
('YCNN0001', 'ND000005', N'Mong muốn chăm sóc và nuôi dạy một trẻ nhỏ trong môi trường gia đình ổn định', N'Trẻ dưới 7 tuổi, sức khỏe ổn định', 32000000, N'Kỹ sư xây dựng', '2026-03-10 09:00:00', '2026-03-12 15:00:00', N'Đang xem xét', 'ND000003'),
('YCNN0002', 'ND000005', N'Gia đình mong muốn nhận nuôi trẻ nam đã đủ hồ sơ pháp lý', N'Trẻ từ 5 đến 8 tuổi, hòa đồng', 32000000, N'Kỹ sư xây dựng', '2026-03-14 08:45:00', '2026-03-15 16:10:00', N'Chờ ghép trẻ', 'ND000003'),
('YCNN0003', 'ND000016', N'Mong muốn nhận nuôi trẻ để chăm sóc lâu dài trong môi trường gia đình ổn định', N'Trẻ dưới 6 tuổi, sức khỏe tốt', 28000000, N'Nhân viên kỹ thuật', '2026-03-18 13:20:00', '2026-03-19 09:45:00', N'Chờ xử lý', 'ND000003'),
('YCNN0004', 'ND000018', N'Gia đình mong muốn nhận nuôi trẻ nam đã đủ điều kiện pháp lý', N'Trẻ nam từ 4 đến 8 tuổi, hòa đồng', 35000000, N'Chủ hộ kinh doanh', '2026-03-19 08:40:00', '2026-03-20 10:00:00', N'Chờ ghép trẻ', 'ND000003'),
('YCNN0005', 'ND000020', N'Mong muốn nhận nuôi trẻ nữ và tạo điều kiện học tập ổn định', N'Trẻ nữ từ 3 đến 7 tuổi', 30000000, N'Giáo viên', '2026-03-19 15:10:00', '2026-03-20 11:30:00', N'Đang xem xét', 'ND000003');

INSERT INTO GIAYTOPHAPLY (MaGiayTo, TenGiayTo, LoaiGiayTo, DuongDanFile, TrangThai, MaYeuCauGuiTre, MaYeuCauNhan, NgayCapNhat)
VALUES
('GT000007', N'Ảnh CCCD người nhận nuôi', N'Tùy thân', N'/uploads/giayto/ycnn0001/anh-cccd.pdf', N'Hợp lệ', NULL, 'YCNN0001', '2026-03-12 15:05:00'),
('GT000008', N'Giấy khám sức khỏe', N'Y tế', N'/uploads/giayto/ycnn0001/giay-kham-suc-khoe.pdf', N'Hợp lệ', NULL, 'YCNN0001', '2026-03-12 15:10:00'),
('GT000009', N'Giấy xác nhận tình trạng hôn nhân', N'Hộ tịch', N'/uploads/giayto/ycnn0001/tinh-trang-hon-nhan.pdf', N'Hợp lệ', NULL, 'YCNN0001', '2026-03-12 15:12:00'),
('GT000010', N'Minh chứng thu nhập', N'Tài chính', N'/uploads/giayto/ycnn0001/minh-chung-thu-nhap.pdf', N'Hợp lệ', NULL, 'YCNN0001', '2026-03-12 15:15:00'),

('GT000011', N'Ảnh CCCD người nhận nuôi', N'Tùy thân', N'/uploads/giayto/ycnn0002/anh-cccd.pdf', N'Hợp lệ', NULL, 'YCNN0002', '2026-03-15 16:15:00'),
('GT000012', N'Giấy khám sức khỏe', N'Y tế', N'/uploads/giayto/ycnn0002/giay-kham-suc-khoe.pdf', N'Hợp lệ', NULL, 'YCNN0002', '2026-03-15 16:18:00'),
('GT000013', N'Giấy xác nhận tình trạng hôn nhân', N'Hộ tịch', N'/uploads/giayto/ycnn0002/tinh-trang-hon-nhan.pdf', N'Hợp lệ', NULL, 'YCNN0002', '2026-03-15 16:20:00'),
('GT000014', N'Minh chứng thu nhập', N'Tài chính', N'/uploads/giayto/ycnn0002/minh-chung-thu-nhap.pdf', N'Hợp lệ', NULL, 'YCNN0002', '2026-03-15 16:22:00'),

('GT000001', N'Ảnh CCCD người gửi trẻ', N'Tùy thân', N'/uploads/giayto/ycgt0001/anh-cccd.pdf', N'Hợp lệ', 'YCGT0001', NULL, '2026-03-06 10:20:00'),
('GT000002', N'Giấy khai sinh của trẻ', N'Hộ tịch', N'/uploads/giayto/ycgt0001/giay-khai-sinh.pdf', N'Hợp lệ', 'YCGT0001', NULL, '2026-03-06 10:25:00'),
('GT000003', N'Sổ hộ khẩu', N'Cư trú', N'/uploads/giayto/ycgt0001/so-ho-khau.pdf', N'Hợp lệ', 'YCGT0001', NULL, '2026-03-06 10:30:00'),
('GT000004', N'Giấy tờ khác', N'Khác', N'/uploads/giayto/ycgt0001/giay-to-khac.pdf', N'Hợp lệ', 'YCGT0001', NULL, '2026-03-06 10:32:00'),

('GT000005', N'Ảnh CCCD người gửi trẻ', N'Tùy thân', N'/uploads/giayto/ycgt0002/anh-cccd.pdf', N'Hợp lệ', 'YCGT0002', NULL, '2026-03-09 09:45:00'),
('GT000006', N'Giấy khai sinh của trẻ', N'Hộ tịch', N'/uploads/giayto/ycgt0002/giay-khai-sinh.pdf', N'Hợp lệ', 'YCGT0002', NULL, '2026-03-09 09:50:00'),
('GT000015', N'Sổ hộ khẩu', N'Cư trú', N'/uploads/giayto/ycgt0002/so-ho-khau.pdf', N'Cần bổ sung', 'YCGT0002', NULL, '2026-03-09 09:52:00'),
('GT000016', N'Giấy tờ khác', N'Khác', N'/uploads/giayto/ycgt0002/giay-to-khac.pdf', N'Hợp lệ', 'YCGT0002', NULL, '2026-03-09 09:55:00');

INSERT INTO TRE (MaTre, HoTen, NgaySinh, GioiTinh, MaPhuongXa, DiaChiCuThe, DanToc, TinhCach, SoThich, DacDiemNhanDang, TrangThai, NgayTiepNhan, NgayCapNhat, NgayNhanNuoi, GhiChu, MaNguoiCapNhat, HinhAnh)
VALUES
('TRE00001', N'Phạm Gia Hân', '2021-08-14', N'Nữ', 'HKHN01', N'Ghi nhận từ hồ sơ gửi trẻ tại Hòa Khánh Nam', N'Kinh', N'Hiền, dễ hòa nhập', N'Vẽ tranh, xếp hình', N'Nốt ruồi nhỏ ở cổ tay trái', N'Đang chăm sóc', '2026-03-07', '2026-03-07 15:00:00', NULL, N'Trẻ đã được tiếp nhận vào trung tâm', 'ND000002', N'/images/tre/pham-gia-han.jpg'),
('TRE00002', N'Nguyễn Minh Khang', '2019-11-21', N'Nam', 'ANXU01', N'Tiếp nhận từ hồ sơ lưu trữ cũ', N'Kinh', N'Năng động, hoạt bát', N'Đá bóng, lắp ghép mô hình', N'Sẹo nhỏ ở đầu gối phải', N'Chờ nhận nuôi', '2025-12-18', '2026-03-04 10:00:00', NULL, N'Hồ sơ sức khỏe ổn định, đủ điều kiện giới thiệu nhận nuôi', 'ND000003', N'/images/tre/nguyen-minh-khang.jpg'),
('TRE00003', N'Lê Khánh Ngọc', '2022-05-09', N'Nữ', 'HKHN01', N'Tiếp nhận từ cơ sở bảo trợ xã hội', N'Kinh', N'Nhút nhát lúc mới gặp', N'Nghe nhạc thiếu nhi, tô màu', N'Không', N'Đang chăm sóc', '2026-01-12', '2026-03-03 08:45:00', NULL, N'Cần theo dõi thêm về dinh dưỡng', 'ND000002', N'/images/tre/le-khanh-ngoc.jpg'),
('TRE00004', N'Hoàng Nhật Nam', '2018-06-02', N'Nam', 'ANTH01', N'Tiếp nhận từ hồ sơ chuyển tuyến tại Huế', N'Kinh', N'Tự lập, lễ phép', N'Đọc truyện tranh, tô tượng', N'Vết bớt nhỏ sau gáy', N'Đã nhận nuôi', '2025-10-10', '2026-02-20 09:15:00', '2026-03-18', N'Đã hoàn tất hồ sơ nhận nuôi', 'ND000003', N'/images/tre/hoang-nhat-nam.jpg'),
('TRE00005', N'Phan An Nhi', '2021-07-23', N'Nữ', 'HHAC01', N'Tiếp nhận từ hồ sơ được duyệt tại Hòa Hải', N'Kinh', N'Hiền, dễ gần', N'Tô màu, ghép hình', N'Nốt ruồi nhỏ ở má trái', N'Đang chăm sóc', '2026-03-19', '2026-03-19 15:10:00', NULL, N'Trẻ được tạo từ yêu cầu gửi trẻ đã tiếp nhận', 'ND000002', N'/images/tre/phan-an-nhi.jpg'),
('TRE00006', N'Đặng Minh Phúc', '2020-10-30', N'Nam', 'ANTH01', N'Trẻ đang được chăm sóc tại cơ sở Huế', N'Kinh', N'Nhanh nhẹn, hòa đồng', N'Xếp lego, nghe kể chuyện', N'Không', N'Chờ nhận nuôi', '2026-02-15', '2026-03-18 11:20:00', NULL, N'Đủ điều kiện xem xét ghép hồ sơ nhận nuôi', 'ND000003', N'/images/tre/dang-minh-phuc.jpg'),
('TRE00007', N'Ngô Gia Linh', '2019-05-18', N'Nữ', 'HKHN01', N'Trẻ đang được chăm sóc tại Đà Sơn', N'Kinh', N'Ngoan, ít nói', N'Nghe nhạc, tô tượng', N'Vết bớt nhỏ ở cánh tay phải', N'Đang chăm sóc', '2025-11-20', '2026-03-18 14:00:00', NULL, N'Đang theo dõi phát triển thể chất', 'ND000002', N'/images/tre/ngo-gia-linh.jpg');

INSERT INTO HOSOTIEPNHANTRE (MaHSTiepNhan, MaYeuCauGuiTre, MaTre, MaCanBoTiepNhan, NgayTiepNhan, TrangThai, NgayDuyet, GhiChu)
VALUES
('HSTN0001', 'YCGT0001', 'TRE00001', 'ND000002', '2026-03-07', N'Đã duyệt', '2026-03-07', N'Đã hoàn tất tiếp nhận trẻ vào hồ sơ chính thức'),
('HSTN0002', 'YCGT0002', NULL, 'ND000002', '2026-03-09', N'Đang xử lý', NULL, N'Đang chờ bổ sung giấy tờ còn thiếu'),
('HSTN0003', 'YCGT0005', 'TRE00005', 'ND000002', '2026-03-19', N'Đã duyệt', '2026-03-19', N'Đã tiếp nhận và tạo hồ sơ trẻ chính thức'),
('HSTN0004', 'YCGT0004', NULL, 'ND000002', '2026-03-19', N'Đang xử lý', NULL, N'Đang chờ hoàn tất xác minh hồ sơ');

INSERT INTO THEODOISUCKHOE (MaTheoDoi, MaTre, MaNguoiCapNhat, NgayCapNhat, CanNang, ChieuCao, NhipTim, NhomMau, NhietDo, KetLuan, TinhTrangChiTiet)
VALUES
('TDSK0001', 'TRE00001', 'ND000002', '2026-03-08 08:30:00', 15.20, 98.50, 96, 'O+', 36.80, N'Sức khỏe ổn định', N'Thể trạng phù hợp với độ tuổi, ăn ngủ tốt'),
('TDSK0002', 'TRE00002', 'ND000003', '2026-03-05 09:10:00', 19.40, 109.00, 92, 'A+', 36.70, N'Đủ điều kiện sinh hoạt bình thường', N'Trẻ phát triển tốt, không ghi nhận bất thường'),
('TDSK0003', 'TRE00003', 'ND000002', '2026-03-03 14:15:00', 12.60, 90.20, 98, 'B+', 36.90, N'Cần bổ sung dinh dưỡng', N'Thể trạng hơi nhẹ cân so với độ tuổi'),
('TDSK0004', 'TRE00004', 'ND000003', '2026-03-16 10:20:00', 23.10, 118.00, 88, 'O+', 36.60, N'Sức khỏe tốt', N'Đủ điều kiện bàn giao hồ sơ sau nhận nuôi'),
('TDSK0005', 'TRE00005', 'ND000002', '2026-03-20 08:15:00', 14.30, 96.00, 97, 'A+', 36.70, N'Sức khỏe ổn định', N'Trẻ ăn ngủ tốt, thích nghi nhanh với môi trường mới'),
('TDSK0006', 'TRE00006', 'ND000003', '2026-03-20 09:10:00', 17.80, 104.50, 93, 'O+', 36.80, N'Phát triển bình thường', N'Đủ điều kiện tham gia sinh hoạt nhóm'),
('TDSK0007', 'TRE00007', 'ND000002', '2026-03-20 10:25:00', 18.20, 107.00, 91, 'B+', 36.60, N'Cần theo dõi thêm', N'Khuyến nghị bổ sung dinh dưỡng và tái khám định kỳ');

INSERT INTO LICHSUTIEMCHUNG (MaLSTiemChung, MaTre, MaVacxin, MuiSo, NgayTiem, GhiChu)
VALUES
('LSTC0001', 'TRE00001', 'HBV',   0, '2021-08-20', N'Viêm gan B mũi sơ sinh'),
('LSTC0002', 'TRE00001', 'BCG',   1, '2021-08-20', N'BCG mũi 1'),
('LSTC0003', 'TRE00001', 'PENTA', 1, '2021-10-20', N'5 trong 1 mũi 1'),
('LSTC0004', 'TRE00001', 'OPV',   1, '2021-10-20', N'Bại liệt uống mũi 1'),
('LSTC0005', 'TRE00001', 'PENTA', 2, '2021-11-20', N'5 trong 1 mũi 2'),
('LSTC0006', 'TRE00001', 'OPV',   2, '2021-11-20', N'Bại liệt uống mũi 2'),
('LSTC0007', 'TRE00001', 'PENTA', 3, '2021-12-20', N'5 trong 1 mũi 3'),
('LSTC0008', 'TRE00001', 'OPV',   3, '2021-12-20', N'Bại liệt uống mũi 3'),
('LSTC0009', 'TRE00001', 'IPV',   1, '2022-01-20', N'Bại liệt tiêm mũi 1'),
('LSTC0010', 'TRE00001', 'MV',    1, '2022-05-20', N'Sởi mũi 1'),
('LSTC0011', 'TRE00001', 'IPV',   2, '2022-05-20', N'Bại liệt tiêm mũi 2'),
('LSTC0012', 'TRE00001', 'JEV',   1, '2022-08-20', N'Viêm não Nhật Bản mũi 1'),
('LSTC0013', 'TRE00001', 'JEV',   2, '2022-09-03', N'Viêm não Nhật Bản mũi 2'),
('LSTC0014', 'TRE00001', 'MR',    1, '2023-02-20', N'Sởi - Rubella mũi 1'),
('LSTC0015', 'TRE00001', 'DPT',   4, '2023-02-20', N'DPT mũi nhắc'),
('LSTC0016', 'TRE00001', 'JEV',   3, '2023-08-20', N'Viêm não Nhật Bản mũi 3'),

('LSTC0017', 'TRE00002', 'HBV',   0, '2019-11-28', N'Viêm gan B mũi sơ sinh'),
('LSTC0018', 'TRE00002', 'BCG',   1, '2019-11-28', N'BCG mũi 1'),
('LSTC0019', 'TRE00002', 'PENTA', 1, '2020-01-28', N'5 trong 1 mũi 1'),
('LSTC0020', 'TRE00002', 'OPV',   1, '2020-01-28', N'Bại liệt uống mũi 1'),
('LSTC0021', 'TRE00002', 'PENTA', 2, '2020-02-28', N'5 trong 1 mũi 2'),
('LSTC0022', 'TRE00002', 'OPV',   2, '2020-02-28', N'Bại liệt uống mũi 2'),
('LSTC0023', 'TRE00002', 'PENTA', 3, '2020-03-28', N'5 trong 1 mũi 3'),
('LSTC0024', 'TRE00002', 'OPV',   3, '2020-03-28', N'Bại liệt uống mũi 3'),
('LSTC0025', 'TRE00002', 'IPV',   1, '2020-04-28', N'Bại liệt tiêm mũi 1'),
('LSTC0026', 'TRE00002', 'MV',    1, '2020-08-28', N'Sởi mũi 1'),
('LSTC0027', 'TRE00002', 'MR',    1, '2021-05-28', N'Sởi - Rubella mũi 1'),
('LSTC0028', 'TRE00002', 'DPT',   4, '2021-05-28', N'DPT mũi nhắc'),

('LSTC0029', 'TRE00003', 'HBV',   0, '2022-05-10', N'Viêm gan B mũi sơ sinh'),
('LSTC0030', 'TRE00003', 'BCG',   1, '2022-05-10', N'BCG mũi 1'),
('LSTC0031', 'TRE00003', 'PENTA', 1, '2022-07-10', N'5 trong 1 mũi 1'),
('LSTC0032', 'TRE00003', 'OPV',   1, '2022-07-10', N'Bại liệt uống mũi 1'),
('LSTC0033', 'TRE00003', 'PENTA', 2, '2022-08-10', N'5 trong 1 mũi 2'),
('LSTC0034', 'TRE00003', 'OPV',   2, '2022-08-10', N'Bại liệt uống mũi 2'),

('LSTC0035', 'TRE00004', 'PENTA', 1, '2018-08-15', N'5 trong 1 mũi 1'),
('LSTC0036', 'TRE00004', 'OPV',   1, '2018-08-15', N'Bại liệt uống mũi 1'),
('LSTC0037', 'TRE00004', 'PENTA', 2, '2018-09-15', N'5 trong 1 mũi 2'),
('LSTC0038', 'TRE00004', 'OPV',   2, '2018-09-15', N'Bại liệt uống mũi 2'),
('LSTC0039', 'TRE00004', 'PENTA', 3, '2018-10-15', N'5 trong 1 mũi 3'),
('LSTC0040', 'TRE00004', 'OPV',   3, '2018-10-15', N'Bại liệt uống mũi 3'),
('LSTC0041', 'TRE00004', 'MV',    1, '2019-03-15', N'Sởi mũi 1'),

('LSTC0042', 'TRE00005', 'HBV',   0, '2021-07-30', N'Viêm gan B mũi sơ sinh'),
('LSTC0043', 'TRE00005', 'BCG',   1, '2021-07-30', N'BCG mũi 1'),
('LSTC0044', 'TRE00005', 'PENTA', 1, '2021-09-30', N'5 trong 1 mũi 1'),
('LSTC0045', 'TRE00005', 'OPV',   1, '2021-09-30', N'Bại liệt uống mũi 1'),

('LSTC0046', 'TRE00006', 'PENTA', 1, '2021-01-15', N'5 trong 1 mũi 1'),
('LSTC0047', 'TRE00006', 'OPV',   1, '2021-01-15', N'Bại liệt uống mũi 1'),
('LSTC0048', 'TRE00006', 'PENTA', 2, '2021-02-15', N'5 trong 1 mũi 2'),
('LSTC0049', 'TRE00006', 'OPV',   2, '2021-02-15', N'Bại liệt uống mũi 2'),
('LSTC0050', 'TRE00006', 'PENTA', 3, '2021-03-15', N'5 trong 1 mũi 3'),
('LSTC0051', 'TRE00006', 'OPV',   3, '2021-03-15', N'Bại liệt uống mũi 3'),

('LSTC0052', 'TRE00007', 'MV',    1, '2020-06-25', N'Sởi mũi 1'),
('LSTC0053', 'TRE00007', 'MR',    1, '2021-03-25', N'Sởi - Rubella mũi 1'),
('LSTC0054', 'TRE00007', 'DPT',   4, '2021-03-25', N'DPT mũi nhắc');

INSERT INTO HOSONHANNUOI (MaHSNhanNuoi, MaYeuCauNhan, MaTre, MaCanBo, NgayLap, NgayDuyet, TrangThai, GhiChu)
VALUES
('HSNN0001', 'YCNN0002', 'TRE00002', 'ND000003', '2026-03-16', NULL, N'Đang lập', N'Đang hoàn thiện hồ sơ ghép trẻ phù hợp'),
('HSNN0002', 'YCNN0004', 'TRE00006', 'ND000003', '2026-03-20', NULL, N'Đang lập', N'Đang hoàn thiện hồ sơ ghép trẻ phù hợp');
GO
USE QuanLyTTBT;
GO
-- SDT nên duy nhất vì thường dùng làm tài khoản đăng nhập.
IF NOT EXISTS (
    SELECT 1
    FROM sys.key_constraints
    WHERE name = 'UQ_NGUOIDUNG_SDT'
      AND parent_object_id = OBJECT_ID('dbo.NGUOIDUNG')
)
BEGIN
    IF NOT EXISTS (
        SELECT SDT
        FROM dbo.NGUOIDUNG
        GROUP BY SDT
        HAVING COUNT(*) > 1
    )
    BEGIN
        ALTER TABLE dbo.NGUOIDUNG
        ADD CONSTRAINT UQ_NGUOIDUNG_SDT UNIQUE (SDT);
    END
END;
GO

/* ============================================================
   2. INDEX PHỤC VỤ TRUY VẤN TỪ API
   ============================================================ */

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_NGUOIDUNG_SDT' AND object_id = OBJECT_ID('dbo.NGUOIDUNG'))
    CREATE INDEX IX_NGUOIDUNG_SDT ON dbo.NGUOIDUNG(SDT);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_NGUOIDUNG_TrangThaiTK' AND object_id = OBJECT_ID('dbo.NGUOIDUNG'))
    CREATE INDEX IX_NGUOIDUNG_TrangThaiTK ON dbo.NGUOIDUNG(TrangThaiTK);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_YCGT_TrangThai_NgayTao' AND object_id = OBJECT_ID('dbo.YEUCAUGUITRE'))
    CREATE INDEX IX_YCGT_TrangThai_NgayTao ON dbo.YEUCAUGUITRE(TrangThaiYC, NgayTao DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_YCGT_MaNguoiGui' AND object_id = OBJECT_ID('dbo.YEUCAUGUITRE'))
    CREATE INDEX IX_YCGT_MaNguoiGui ON dbo.YEUCAUGUITRE(MaNguoiGui);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_YCNN_TrangThai_NgayTao' AND object_id = OBJECT_ID('dbo.YEUCAUNHANNUOI'))
    CREATE INDEX IX_YCNN_TrangThai_NgayTao ON dbo.YEUCAUNHANNUOI(TrangThai, NgayTao DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_YCNN_MaNguoiNhan' AND object_id = OBJECT_ID('dbo.YEUCAUNHANNUOI'))
    CREATE INDEX IX_YCNN_MaNguoiNhan ON dbo.YEUCAUNHANNUOI(MaNguoiNhan);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_TRE_TrangThai' AND object_id = OBJECT_ID('dbo.TRE'))
    CREATE INDEX IX_TRE_TrangThai ON dbo.TRE(TrangThai);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_GTPL_YCGT' AND object_id = OBJECT_ID('dbo.GIAYTOPHAPLY'))
    CREATE INDEX IX_GTPL_YCGT ON dbo.GIAYTOPHAPLY(MaYeuCauGuiTre, TrangThai);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_GTPL_YCNN' AND object_id = OBJECT_ID('dbo.GIAYTOPHAPLY'))
    CREATE INDEX IX_GTPL_YCNN ON dbo.GIAYTOPHAPLY(MaYeuCauNhan, TrangThai);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_LSTC_MaTre' AND object_id = OBJECT_ID('dbo.LICHSUTIEMCHUNG'))
    CREATE INDEX IX_LSTC_MaTre ON dbo.LICHSUTIEMCHUNG(MaTre, NgayTiem DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_TDSK_MaTre' AND object_id = OBJECT_ID('dbo.THEODOISUCKHOE'))
    CREATE INDEX IX_TDSK_MaTre ON dbo.THEODOISUCKHOE(MaTre, NgayCapNhat DESC);
GO

/* ============================================================
   3. SEQUENCE TỰ SINH MÃ
   ============================================================ */

DECLARE @NextND INT;
SELECT @NextND = ISNULL(MAX(CAST(RIGHT(MaNguoiDung, 6) AS INT)), 0) + 1
FROM dbo.NGUOIDUNG
WHERE MaNguoiDung LIKE 'ND[0-9][0-9][0-9][0-9][0-9][0-9]';

IF NOT EXISTS (SELECT 1 FROM sys.sequences WHERE name = 'SEQ_NGUOIDUNG' AND schema_id = SCHEMA_ID('dbo'))
    BEGIN
    DECLARE @sql NVARCHAR(MAX);
    SET @sql = N'CREATE SEQUENCE dbo.SEQ_NGUOIDUNG AS INT START WITH '
             + CAST(@NextND AS NVARCHAR(20))
             + N' INCREMENT BY 1;';
    EXEC sp_executesql @sql;
END;
GO

DECLARE @NextTRE INT;
SELECT @NextTRE = ISNULL(MAX(CAST(RIGHT(MaTre, 5) AS INT)), 0) + 1
FROM dbo.TRE
WHERE MaTre LIKE 'TRE[0-9][0-9][0-9][0-9][0-9]';

IF NOT EXISTS (SELECT 1 FROM sys.sequences WHERE name = 'SEQ_TRE' AND schema_id = SCHEMA_ID('dbo'))
    BEGIN
    DECLARE @sql NVARCHAR(MAX);
    SET @sql = N'CREATE SEQUENCE dbo.SEQ_TRE AS INT START WITH '
             + CAST(@NextTRE AS NVARCHAR(20))
             + N' INCREMENT BY 1;';
    EXEC sp_executesql @sql;
END;
GO

DECLARE @NextYCGT INT;
SELECT @NextYCGT = ISNULL(MAX(CAST(RIGHT(MaYeuCauGuiTre, 4) AS INT)), 0) + 1
FROM dbo.YEUCAUGUITRE
WHERE MaYeuCauGuiTre LIKE 'YCGT[0-9][0-9][0-9][0-9]';

IF NOT EXISTS (SELECT 1 FROM sys.sequences WHERE name = 'SEQ_YCGT' AND schema_id = SCHEMA_ID('dbo'))
    BEGIN
    DECLARE @sql NVARCHAR(MAX);
    SET @sql = N'CREATE SEQUENCE dbo.SEQ_YCGT AS INT START WITH '
             + CAST(@NextYCGT AS NVARCHAR(20))
             + N' INCREMENT BY 1;';
    EXEC sp_executesql @sql;
END;
GO

DECLARE @NextTTTT INT;
SELECT @NextTTTT = ISNULL(MAX(CAST(RIGHT(MaThongTin, 4) AS INT)), 0) + 1
FROM dbo.THONGTINTRETAM
WHERE MaThongTin LIKE 'TTTT[0-9][0-9][0-9][0-9]';

IF NOT EXISTS (SELECT 1 FROM sys.sequences WHERE name = 'SEQ_TTTT' AND schema_id = SCHEMA_ID('dbo'))
    BEGIN
    DECLARE @sql NVARCHAR(MAX);
    SET @sql = N'CREATE SEQUENCE dbo.SEQ_TTTT AS INT START WITH '
             + CAST(@NextTTTT AS NVARCHAR(20))
             + N' INCREMENT BY 1;';
    EXEC sp_executesql @sql;
END;
GO

DECLARE @NextYCNN INT;
SELECT @NextYCNN = ISNULL(MAX(CAST(RIGHT(MaYeuCauNhan, 4) AS INT)), 0) + 1
FROM dbo.YEUCAUNHANNUOI
WHERE MaYeuCauNhan LIKE 'YCNN[0-9][0-9][0-9][0-9]';

IF NOT EXISTS (SELECT 1 FROM sys.sequences WHERE name = 'SEQ_YCNN' AND schema_id = SCHEMA_ID('dbo'))
    BEGIN
    DECLARE @sql NVARCHAR(MAX);
    SET @sql = N'CREATE SEQUENCE dbo.SEQ_YCNN AS INT START WITH '
             + CAST(@NextYCNN AS NVARCHAR(20))
             + N' INCREMENT BY 1;';
    EXEC sp_executesql @sql;
END;
GO
DECLARE @NextLHGM INT;

SELECT @NextLHGM = ISNULL(MAX(CAST(RIGHT(MaLichGap, 4) AS INT)), 0) + 1
FROM dbo.LICHHENGAPMATNHANNUOI
WHERE MaLichGap LIKE 'LHGM[0-9][0-9][0-9][0-9]';

IF NOT EXISTS (
    SELECT 1 
    FROM sys.sequences 
    WHERE name = 'SEQ_LHGM' 
      AND schema_id = SCHEMA_ID('dbo')
)
BEGIN
    DECLARE @sql NVARCHAR(MAX);

    SET @sql = N'CREATE SEQUENCE dbo.SEQ_LHGM AS INT START WITH '
             + CAST(@NextLHGM AS NVARCHAR(20))
             + N' INCREMENT BY 1;';

    EXEC sp_executesql @sql;
END;
GO
DECLARE @NextGT INT;
SELECT @NextGT = ISNULL(MAX(CAST(RIGHT(MaGiayTo, 6) AS INT)), 0) + 1
FROM dbo.GIAYTOPHAPLY
WHERE MaGiayTo LIKE 'GT[0-9][0-9][0-9][0-9][0-9][0-9]';

IF NOT EXISTS (SELECT 1 FROM sys.sequences WHERE name = 'SEQ_GIAYTO' AND schema_id = SCHEMA_ID('dbo'))
    BEGIN
    DECLARE @sql NVARCHAR(MAX);
    SET @sql = N'CREATE SEQUENCE dbo.SEQ_GIAYTO AS INT START WITH '
             + CAST(@NextGT AS NVARCHAR(20))
             + N' INCREMENT BY 1;';
    EXEC sp_executesql @sql;
END;
GO

DECLARE @NextLSTC INT;
SELECT @NextLSTC = ISNULL(MAX(CAST(RIGHT(MaLSTiemChung, 4) AS INT)), 0) + 1
FROM dbo.LICHSUTIEMCHUNG
WHERE MaLSTiemChung LIKE 'LSTC[0-9][0-9][0-9][0-9]';

IF NOT EXISTS (SELECT 1 FROM sys.sequences WHERE name = 'SEQ_LSTC' AND schema_id = SCHEMA_ID('dbo'))
    BEGIN
    DECLARE @sql NVARCHAR(MAX);
    SET @sql = N'CREATE SEQUENCE dbo.SEQ_LSTC AS INT START WITH '
             + CAST(@NextLSTC AS NVARCHAR(20))
             + N' INCREMENT BY 1;';
    EXEC sp_executesql @sql;
END;
GO

DECLARE @NextTDSK INT;
SELECT @NextTDSK = ISNULL(MAX(CAST(RIGHT(MaTheoDoi, 4) AS INT)), 0) + 1
FROM dbo.THEODOISUCKHOE
WHERE MaTheoDoi LIKE 'TDSK[0-9][0-9][0-9][0-9]';

IF NOT EXISTS (SELECT 1 FROM sys.sequences WHERE name = 'SEQ_TDSK' AND schema_id = SCHEMA_ID('dbo'))
    BEGIN
    DECLARE @sql NVARCHAR(MAX);
    SET @sql = N'CREATE SEQUENCE dbo.SEQ_TDSK AS INT START WITH '
             + CAST(@NextTDSK AS NVARCHAR(20))
             + N' INCREMENT BY 1;';
    EXEC sp_executesql @sql;
END;
GO

DECLARE @NextHSTN INT;
SELECT @NextHSTN = ISNULL(MAX(CAST(RIGHT(MaHSTiepNhan, 4) AS INT)), 0) + 1
FROM dbo.HOSOTIEPNHANTRE
WHERE MaHSTiepNhan LIKE 'HSTN[0-9][0-9][0-9][0-9]';

IF NOT EXISTS (SELECT 1 FROM sys.sequences WHERE name = 'SEQ_HSTN' AND schema_id = SCHEMA_ID('dbo'))
    BEGIN
    DECLARE @sql NVARCHAR(MAX);
    SET @sql = N'CREATE SEQUENCE dbo.SEQ_HSTN AS INT START WITH '
             + CAST(@NextHSTN AS NVARCHAR(20))
             + N' INCREMENT BY 1;';
    EXEC sp_executesql @sql;
END;
GO

DECLARE @NextHSNN INT;
SELECT @NextHSNN = ISNULL(MAX(CAST(RIGHT(MaHSNhanNuoi, 4) AS INT)), 0) + 1
FROM dbo.HOSONHANNUOI
WHERE MaHSNhanNuoi LIKE 'HSNN[0-9][0-9][0-9][0-9]';

IF NOT EXISTS (SELECT 1 FROM sys.sequences WHERE name = 'SEQ_HSNN' AND schema_id = SCHEMA_ID('dbo'))
    BEGIN
    DECLARE @sql NVARCHAR(MAX);
    SET @sql = N'CREATE SEQUENCE dbo.SEQ_HSNN AS INT START WITH '
             + CAST(@NextHSNN AS NVARCHAR(20))
             + N' INCREMENT BY 1;';
    EXEC sp_executesql @sql;
END;
GO

/* ============================================================
   4. VIEW CHO API GET
   ============================================================ */

CREATE OR ALTER VIEW dbo.vw_NguoiDungVaiTro
AS
SELECT
    nd.MaNguoiDung,
    nd.SDT,
    nd.HoTen,
    nd.NgaySinh,
    nd.GioiTinh,
    nd.CCCD,
    nd.Email,
    nd.MaXaPhuong,
    px.TenPhuongXa,
    tp.TenTinhTP,
    nd.DiaChiCuThe,
    nd.NgayTao,
    nd.TrangThaiTK,
    vt.MaVaiTro,
    vt.TenVaiTro
FROM dbo.NGUOIDUNG nd
LEFT JOIN dbo.PHUONG_XA px ON nd.MaXaPhuong = px.MaPhuongXa
LEFT JOIN dbo.TINH_TP tp ON px.MaTinhTP = tp.MaTinhTP
LEFT JOIN dbo.NGUOIDUNG_VAITRO ndvt ON nd.MaNguoiDung = ndvt.MaNguoiDung
LEFT JOIN dbo.VAITRO vt ON ndvt.MaVaiTro = vt.MaVaiTro;
GO

CREATE OR ALTER VIEW dbo.vw_DanhSachYeuCauGuiTre
AS
SELECT
    yc.MaYeuCauGuiTre,
    yc.MaNguoiGui,
    nd.HoTen AS TenNguoiGui,
    nd.SDT AS SDTNguoiGui,
    yc.MaLoaiNguoiGui,
    l.TenLoaiNguoiGui,
    l.BatBuocGiayTo,
    yc.QuanHeVoiTre,
    yc.LyDoGui,
    yc.NgayTao,
    yc.NgayCapNhat,
    yc.TrangThaiYC,
    yc.GhiChu,
    ttt.MaThongTin,
    ttt.TenTre,
    ttt.NgaySinh AS NgaySinhTre,
    ttt.GioiTinh AS GioiTinhTre,
    ttt.DanToc,
    hstn.MaHSTiepNhan,
    hstn.MaTre,
    hstn.TrangThai AS TrangThaiHoSoTiepNhan,
    (SELECT COUNT(*) FROM dbo.GIAYTOPHAPLY gt WHERE gt.MaYeuCauGuiTre = yc.MaYeuCauGuiTre) AS SoGiayTo,
    (SELECT COUNT(*) FROM dbo.GIAYTOPHAPLY gt WHERE gt.MaYeuCauGuiTre = yc.MaYeuCauGuiTre AND gt.TrangThai = N'Hợp lệ') AS SoGiayToHopLe
FROM dbo.YEUCAUGUITRE yc
JOIN dbo.NGUOIDUNG nd ON yc.MaNguoiGui = nd.MaNguoiDung
JOIN dbo.LOAINGUOIGUITRE l ON yc.MaLoaiNguoiGui = l.MaLoaiNguoiGui
LEFT JOIN dbo.THONGTINTRETAM ttt ON yc.MaYeuCauGuiTre = ttt.MaYeuCauGuiTre
LEFT JOIN dbo.HOSOTIEPNHANTRE hstn ON yc.MaYeuCauGuiTre = hstn.MaYeuCauGuiTre;
GO

CREATE OR ALTER VIEW dbo.vw_GiayToPhapLy
AS
SELECT
    gt.MaGiayTo,
    gt.TenGiayTo,
    gt.LoaiGiayTo,
    gt.DuongDanFile,
    gt.TrangThai,
    gt.MaYeuCauGuiTre,
    gt.MaYeuCauNhan,
    gt.NgayCapNhat
FROM dbo.GIAYTOPHAPLY gt;
GO

CREATE OR ALTER VIEW dbo.vw_DanhSachTre
AS
SELECT
    t.MaTre,
    t.HoTen,
    t.NgaySinh,
    t.GioiTinh,
    t.DanToc,
    t.TrangThai,
    t.NgayTiepNhan,
    t.NgayNhanNuoi,
    t.HinhAnh,
    t.MaPhuongXa,
    px.TenPhuongXa,
    tp.TenTinhTP,
    t.DiaChiCuThe,
    t.NgayCapNhat,
    nd.HoTen AS TenNguoiCapNhat
FROM dbo.TRE t
LEFT JOIN dbo.PHUONG_XA px ON t.MaPhuongXa = px.MaPhuongXa
LEFT JOIN dbo.TINH_TP tp ON px.MaTinhTP = tp.MaTinhTP
LEFT JOIN dbo.NGUOIDUNG nd ON t.MaNguoiCapNhat = nd.MaNguoiDung;
GO

CREATE OR ALTER VIEW dbo.vw_ChiTietTre
AS
SELECT
    t.MaTre,
    t.HoTen,
    t.NgaySinh,
    t.GioiTinh,
    t.MaPhuongXa,
    px.TenPhuongXa,
    tp.TenTinhTP,
    t.DiaChiCuThe,
    t.DanToc,
    t.TinhCach,
    t.SoThich,
    t.DacDiemNhanDang,
    t.TrangThai,
    t.NgayTiepNhan,
    t.NgayCapNhat,
    t.NgayNhanNuoi,
    t.GhiChu,
    t.MaNguoiCapNhat,
    nd.HoTen AS TenNguoiCapNhat,
    t.HinhAnh
FROM dbo.TRE t
LEFT JOIN dbo.PHUONG_XA px ON t.MaPhuongXa = px.MaPhuongXa
LEFT JOIN dbo.TINH_TP tp ON px.MaTinhTP = tp.MaTinhTP
LEFT JOIN dbo.NGUOIDUNG nd ON t.MaNguoiCapNhat = nd.MaNguoiDung;
GO

CREATE OR ALTER VIEW dbo.vw_LichSuTiemChungTre
AS
SELECT
    ls.MaLSTiemChung,
    ls.MaTre,
    t.HoTen AS TenTre,
    ls.MaVacxin,
    vx.TenVacxin,
    vx.PhongBenh,
    ls.MuiSo,
    ls.NgayTiem,
    ls.GhiChu
FROM dbo.LICHSUTIEMCHUNG ls
JOIN dbo.TRE t ON ls.MaTre = t.MaTre
JOIN dbo.VACXIN vx ON ls.MaVacxin = vx.MaVacxin;
GO

CREATE OR ALTER VIEW dbo.vw_TheoDoiSucKhoeTre
AS
SELECT
    td.MaTheoDoi,
    td.MaTre,
    t.HoTen AS TenTre,
    td.MaNguoiCapNhat,
    nd.HoTen AS TenNguoiCapNhat,
    td.NgayCapNhat,
    td.CanNang,
    td.ChieuCao,
    td.NhipTim,
    td.NhomMau,
    td.NhietDo,
    td.KetLuan,
    td.TinhTrangChiTiet
FROM dbo.THEODOISUCKHOE td
JOIN dbo.TRE t ON td.MaTre = t.MaTre
LEFT JOIN dbo.NGUOIDUNG nd ON td.MaNguoiCapNhat = nd.MaNguoiDung;
GO

CREATE OR ALTER VIEW dbo.vw_DanhSachYeuCauNhanNuoi
AS
SELECT
    yc.MaYeuCauNhan,
    yc.MaNguoiNhan,
    nd.HoTen AS TenNguoiNhan,
    nd.SDT AS SDTNguoiNhan,
    yc.LyDoNhanNuoi,
    yc.MongMuonVeTre,
    yc.ThuNhapHangThang,
    yc.NgheNghiep,
    yc.NgayTao,
    yc.NgayCapNhat,
    yc.TrangThai,
    yc.NguoiDuyet,
    nd2.HoTen AS TenNguoiDuyet,
    (SELECT COUNT(*) FROM dbo.GIAYTOPHAPLY gt WHERE gt.MaYeuCauNhan = yc.MaYeuCauNhan) AS SoGiayTo,
    (SELECT COUNT(*) FROM dbo.GIAYTOPHAPLY gt WHERE gt.MaYeuCauNhan = yc.MaYeuCauNhan AND gt.TrangThai = N'Hợp lệ') AS SoGiayToHopLe
FROM dbo.YEUCAUNHANNUOI yc
JOIN dbo.NGUOIDUNG nd ON yc.MaNguoiNhan = nd.MaNguoiDung
LEFT JOIN dbo.NGUOIDUNG nd2 ON yc.NguoiDuyet = nd2.MaNguoiDung;
GO

CREATE OR ALTER VIEW dbo.vw_DanhSachHoSoTiepNhanTre
AS
SELECT
    hs.MaHSTiepNhan,
    hs.MaYeuCauGuiTre,
    hs.MaTre,
    t.HoTen AS TenTreChinhThuc,
    hs.MaCanBoTiepNhan,
    nd.HoTen AS TenCanBoTiepNhan,
    hs.NgayTiepNhan,
    hs.TrangThai,
    hs.NgayDuyet,
    hs.GhiChu
FROM dbo.HOSOTIEPNHANTRE hs
LEFT JOIN dbo.TRE t ON hs.MaTre = t.MaTre
LEFT JOIN dbo.NGUOIDUNG nd ON hs.MaCanBoTiepNhan = nd.MaNguoiDung;
GO

CREATE OR ALTER VIEW dbo.vw_DanhSachHoSoNhanNuoi
AS
SELECT
    hs.MaHSNhanNuoi,
    hs.MaYeuCauNhan,
    hs.MaTre,
    t.HoTen AS TenTre,
    hs.MaCanBo,
    nd.HoTen AS TenCanBo,
    hs.NgayLap,
    hs.NgayDuyet,
    hs.TrangThai,
    hs.GhiChu
FROM dbo.HOSONHANNUOI hs
JOIN dbo.TRE t ON hs.MaTre = t.MaTre
JOIN dbo.NGUOIDUNG nd ON hs.MaCanBo = nd.MaNguoiDung;
GO

/* ============================================================
   5. STORED PROCEDURE CHO API
   ============================================================ */
CREATE OR ALTER PROCEDURE dbo.sp_DangKyNguoiDung
    @SDT VARCHAR(15),
    @MatKhau VARCHAR(255),
    @HoTen NVARCHAR(100),
    @NgaySinh DATE = NULL,
    @GioiTinh NVARCHAR(5),
    @CCCD CHAR(12) = NULL,
    @Email VARCHAR(254) = NULL,
    @MaXaPhuong CHAR(6) = NULL,
    @DiaChiCuThe NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF EXISTS (SELECT 1 FROM dbo.NGUOIDUNG WHERE SDT = @SDT)
    BEGIN
        RAISERROR(N'Số điện thoại đã tồn tại.', 16, 1);
        RETURN;
    END;

    IF @Email IS NOT NULL AND EXISTS (SELECT 1 FROM dbo.NGUOIDUNG WHERE Email = @Email)
    BEGIN
        RAISERROR(N'Email đã tồn tại.', 16, 1);
        RETURN;
    END;

    IF @CCCD IS NOT NULL AND EXISTS (SELECT 1 FROM dbo.NGUOIDUNG WHERE CCCD = @CCCD)
    BEGIN
        RAISERROR(N'CCCD đã tồn tại.', 16, 1);
        RETURN;
    END;

    DECLARE @MaNguoiDung CHAR(8);
    SET @MaNguoiDung = 'ND' + RIGHT('000000' + CAST(NEXT VALUE FOR dbo.SEQ_NGUOIDUNG AS VARCHAR(6)), 6);

    BEGIN TRY
        BEGIN TRAN;

        INSERT INTO dbo.NGUOIDUNG
        (
            MaNguoiDung, SDT, MatKhau, HoTen, NgaySinh, GioiTinh,
            CCCD, Email, MaXaPhuong, DiaChiCuThe, NgayTao, TrangThaiTK
        )
        VALUES
        (
            @MaNguoiDung, @SDT, @MatKhau, @HoTen, @NgaySinh, @GioiTinh,
            @CCCD, @Email, @MaXaPhuong, @DiaChiCuThe, GETDATE(), 1
        );

        INSERT INTO dbo.NGUOIDUNG_VAITRO (MaNguoiDung, MaVaiTro)
        VALUES
        (@MaNguoiDung, 'NGGT'),
        (@MaNguoiDung, 'NGNN');

        COMMIT TRAN;

        SELECT @MaNguoiDung AS MaNguoiDung, N'Đăng ký thành công' AS ThongBao;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_LayNguoiDungTheoTaiKhoan
    @TaiKhoan VARCHAR(254)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        nd.MaNguoiDung,
        nd.SDT,
        nd.Email,
        nd.MatKhau,
        nd.HoTen,
        nd.TrangThaiTK
    FROM dbo.NGUOIDUNG nd
    WHERE nd.SDT = @TaiKhoan
       OR nd.Email = @TaiKhoan;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_LayVaiTroNguoiDung
    @MaNguoiDung CHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        vt.MaVaiTro,
        vt.TenVaiTro
    FROM dbo.NGUOIDUNG_VAITRO ndvt
    JOIN dbo.VAITRO vt ON ndvt.MaVaiTro = vt.MaVaiTro
    WHERE ndvt.MaNguoiDung = @MaNguoiDung;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_KhoaMoTaiKhoan
    @MaNguoiDung CHAR(8),
    @TrangThaiTK BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.NGUOIDUNG
    SET TrangThaiTK = @TrangThaiTK
    WHERE MaNguoiDung = @MaNguoiDung;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR(N'Người dùng không tồn tại.', 16, 1);
        RETURN;
    END;

    SELECT @MaNguoiDung AS MaNguoiDung, @TrangThaiTK AS TrangThaiTK;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_TaoYeuCauGuiTre
    @MaNguoiGui CHAR(8),
    @MaLoaiNguoiGui CHAR(4),
    @QuanHeVoiTre NVARCHAR(50),
    @LyDoGui NVARCHAR(200),
    @TenTre NVARCHAR(100),
    @NgaySinh DATE = NULL,
    @GioiTinh NVARCHAR(5),
    @DanToc NVARCHAR(30) = NULL,
    @GhiChu NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.NGUOIDUNG WHERE MaNguoiDung = @MaNguoiGui)
    BEGIN
        RAISERROR(N'Người gửi không tồn tại.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.LOAINGUOIGUITRE WHERE MaLoaiNguoiGui = @MaLoaiNguoiGui)
    BEGIN
        RAISERROR(N'Loại người gửi không hợp lệ.', 16, 1);
        RETURN;
    END;

    DECLARE @MaYeuCauGuiTre CHAR(8);
    DECLARE @MaThongTin CHAR(8);

    SET @MaYeuCauGuiTre = 'YCGT' + RIGHT('0000' + CAST(NEXT VALUE FOR dbo.SEQ_YCGT AS VARCHAR(4)), 4);
    SET @MaThongTin = 'TTTT' + RIGHT('0000' + CAST(NEXT VALUE FOR dbo.SEQ_TTTT AS VARCHAR(4)), 4);

    BEGIN TRY
        BEGIN TRAN;

        INSERT INTO dbo.YEUCAUGUITRE
        (
            MaYeuCauGuiTre, MaNguoiGui, MaLoaiNguoiGui,
            QuanHeVoiTre, LyDoGui, NgayTao, NgayCapNhat,
            TrangThaiYC, GhiChu
        )
        VALUES
        (
            @MaYeuCauGuiTre, @MaNguoiGui, @MaLoaiNguoiGui,
            @QuanHeVoiTre, @LyDoGui, SYSDATETIME(), NULL,
            N'Chờ xử lý', @GhiChu
        );

        INSERT INTO dbo.THONGTINTRETAM
        (
            MaThongTin, MaYeuCauGuiTre, TenTre, NgaySinh, GioiTinh, DanToc
        )
        VALUES
        (
            @MaThongTin, @MaYeuCauGuiTre, @TenTre, @NgaySinh, @GioiTinh, @DanToc
        );

        COMMIT TRAN;

        SELECT
            @MaYeuCauGuiTre AS MaYeuCauGuiTre,
            @MaThongTin AS MaThongTin,
            N'Tạo yêu cầu gửi trẻ thành công' AS ThongBao;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        THROW;
    END CATCH
END;
GO
CREATE OR ALTER PROCEDURE dbo.sp_ThemGiayToPhapLy
    @TenGiayTo NVARCHAR(150),
    @LoaiGiayTo NVARCHAR(50),
    @DuongDanFile NVARCHAR(255) = NULL,
    @MaYeuCauGuiTre CHAR(8) = NULL,
    @MaYeuCauNhan CHAR(8) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF (
        (@MaYeuCauGuiTre IS NULL AND @MaYeuCauNhan IS NULL)
        OR
        (@MaYeuCauGuiTre IS NOT NULL AND @MaYeuCauNhan IS NOT NULL)
    )
    BEGIN
        RAISERROR(N'Giấy tờ phải thuộc đúng một loại yêu cầu.', 16, 1);
        RETURN;
    END;

    DECLARE @MaGiayTo CHAR(8);
    SET @MaGiayTo = 'GT' + RIGHT('000000' + CAST(NEXT VALUE FOR dbo.SEQ_GIAYTO AS VARCHAR(6)), 6);

    INSERT INTO dbo.GIAYTOPHAPLY
    (
        MaGiayTo, TenGiayTo, LoaiGiayTo, DuongDanFile,
        TrangThai, MaYeuCauGuiTre, MaYeuCauNhan, NgayCapNhat
    )
    VALUES
    (
        @MaGiayTo, @TenGiayTo, @LoaiGiayTo, @DuongDanFile,
        N'Chờ xác minh', @MaYeuCauGuiTre, @MaYeuCauNhan, SYSDATETIME()
    );

    SELECT @MaGiayTo AS MaGiayTo, N'Thêm giấy tờ thành công' AS ThongBao;
END;
GO
CREATE OR ALTER PROCEDURE dbo.sp_DuyetYeuCauGuiTre
    @MaYeuCauGuiTre CHAR(8),
    @MaCanBoTiepNhan CHAR(8),
    @GhiChu NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @MaTre CHAR(8);
    DECLARE @MaHSTiepNhan CHAR(8);
    DECLARE @TrangThaiYC NVARCHAR(20);
    DECLARE @BatBuocGiayTo BIT;
    DECLARE @SoGiayToHopLe INT;

    SELECT
        @TrangThaiYC = yc.TrangThaiYC,
        @BatBuocGiayTo = l.BatBuocGiayTo
    FROM dbo.YEUCAUGUITRE yc
    JOIN dbo.LOAINGUOIGUITRE l ON yc.MaLoaiNguoiGui = l.MaLoaiNguoiGui
    WHERE yc.MaYeuCauGuiTre = @MaYeuCauGuiTre;

    IF @TrangThaiYC IS NULL
    BEGIN
        RAISERROR(N'Yêu cầu gửi trẻ không tồn tại.', 16, 1);
        RETURN;
    END;

    IF @TrangThaiYC IN (N'Đã hủy', N'Từ chối')
    BEGIN
        RAISERROR(N'Không thể duyệt yêu cầu đã hủy hoặc đã từ chối.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.THONGTINTRETAM WHERE MaYeuCauGuiTre = @MaYeuCauGuiTre)
    BEGIN
        RAISERROR(N'Không có thông tin trẻ tạm để tiếp nhận.', 16, 1);
        RETURN;
    END;

    SELECT @SoGiayToHopLe = COUNT(*)
    FROM dbo.GIAYTOPHAPLY
    WHERE MaYeuCauGuiTre = @MaYeuCauGuiTre
      AND TrangThai = N'Hợp lệ';

    IF @BatBuocGiayTo = 1 AND ISNULL(@SoGiayToHopLe, 0) = 0
    BEGIN
        RAISERROR(N'Yêu cầu chưa có giấy tờ hợp lệ.', 16, 1);
        RETURN;
    END;

    BEGIN TRY
        BEGIN TRAN;

        SELECT @MaTre = MaTre
        FROM dbo.HOSOTIEPNHANTRE
        WHERE MaYeuCauGuiTre = @MaYeuCauGuiTre;

        IF @MaTre IS NULL
        BEGIN
            SET @MaTre = 'TRE' + RIGHT('00000' + CAST(NEXT VALUE FOR dbo.SEQ_TRE AS VARCHAR(5)), 5);

            INSERT INTO dbo.TRE
            (
                MaTre, HoTen, NgaySinh, GioiTinh, MaPhuongXa, DiaChiCuThe,
                DanToc, TinhCach, SoThich, DacDiemNhanDang,
                TrangThai, NgayTiepNhan, NgayCapNhat, NgayNhanNuoi,
                GhiChu, MaNguoiCapNhat, HinhAnh
            )
            SELECT
                @MaTre,
                TTT.TenTre,
                TTT.NgaySinh,
                TTT.GioiTinh,
                ND.MaXaPhuong,
                ND.DiaChiCuThe,
                TTT.DanToc,
                NULL,
                NULL,
                NULL,
                N'Đang chăm sóc',
                CAST(GETDATE() AS DATE),
                SYSDATETIME(),
                NULL,
                N'Tạo tự động từ yêu cầu gửi trẻ được duyệt',
                @MaCanBoTiepNhan,
                NULL
            FROM dbo.THONGTINTRETAM TTT
            JOIN dbo.YEUCAUGUITRE YCGT ON TTT.MaYeuCauGuiTre = YCGT.MaYeuCauGuiTre
            JOIN dbo.NGUOIDUNG ND ON YCGT.MaNguoiGui = ND.MaNguoiDung
            WHERE TTT.MaYeuCauGuiTre = @MaYeuCauGuiTre;
        END;

        IF EXISTS (SELECT 1 FROM dbo.HOSOTIEPNHANTRE WHERE MaYeuCauGuiTre = @MaYeuCauGuiTre)
        BEGIN
            UPDATE dbo.HOSOTIEPNHANTRE
            SET MaTre = @MaTre,
                MaCanBoTiepNhan = @MaCanBoTiepNhan,
                TrangThai = N'Đã duyệt',
                NgayDuyet = CAST(GETDATE() AS DATE),
                GhiChu = ISNULL(@GhiChu, GhiChu)
            WHERE MaYeuCauGuiTre = @MaYeuCauGuiTre;
        END
        ELSE
        BEGIN
            SET @MaHSTiepNhan = 'HSTN' + RIGHT('0000' + CAST(NEXT VALUE FOR dbo.SEQ_HSTN AS VARCHAR(4)), 4);

            INSERT INTO dbo.HOSOTIEPNHANTRE
            (
                MaHSTiepNhan, MaYeuCauGuiTre, MaTre, MaCanBoTiepNhan,
                NgayTiepNhan, TrangThai, NgayDuyet, GhiChu
            )
            VALUES
            (
                @MaHSTiepNhan, @MaYeuCauGuiTre, @MaTre, @MaCanBoTiepNhan,
                CAST(GETDATE() AS DATE), N'Đã duyệt', CAST(GETDATE() AS DATE), @GhiChu
            );
        END;

        UPDATE dbo.YEUCAUGUITRE
        SET TrangThaiYC = N'Đã tiếp nhận',
            NgayCapNhat = SYSDATETIME(),
            GhiChu = ISNULL(@GhiChu, GhiChu)
        WHERE MaYeuCauGuiTre = @MaYeuCauGuiTre;

        COMMIT TRAN;

        SELECT @MaTre AS MaTre, N'Duyệt yêu cầu gửi trẻ thành công' AS ThongBao;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_TuChoiYeuCauGuiTre
    @MaYeuCauGuiTre CHAR(8),
    @GhiChu NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.YEUCAUGUITRE
    SET TrangThaiYC = N'Từ chối',
        NgayCapNhat = SYSDATETIME(),
        GhiChu = ISNULL(@GhiChu, GhiChu)
    WHERE MaYeuCauGuiTre = @MaYeuCauGuiTre;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR(N'Yêu cầu gửi trẻ không tồn tại.', 16, 1);
        RETURN;
    END;

    UPDATE dbo.HOSOTIEPNHANTRE
    SET TrangThai = N'Từ chối',
        GhiChu = ISNULL(@GhiChu, GhiChu)
    WHERE MaYeuCauGuiTre = @MaYeuCauGuiTre;

    SELECT @MaYeuCauGuiTre AS MaYeuCauGuiTre, N'Từ chối yêu cầu gửi trẻ thành công' AS ThongBao;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_HuyYeuCauGuiTre
    @MaYeuCauGuiTre CHAR(8),
    @GhiChu NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.YEUCAUGUITRE
    SET TrangThaiYC = N'Đã hủy',
        NgayCapNhat = SYSDATETIME(),
        GhiChu = ISNULL(@GhiChu, GhiChu)
    WHERE MaYeuCauGuiTre = @MaYeuCauGuiTre
      AND TrangThaiYC IN (N'Chờ xử lý', N'Đang xem xét');

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR(N'Không thể hủy yêu cầu này hoặc yêu cầu không tồn tại.', 16, 1);
        RETURN;
    END;

    SELECT @MaYeuCauGuiTre AS MaYeuCauGuiTre, N'Hủy yêu cầu gửi trẻ thành công' AS ThongBao;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_TaoYeuCauNhanNuoi
    @MaNguoiNhan CHAR(8),
    @LyDoNhanNuoi NVARCHAR(200) = NULL,
    @MongMuonVeTre NVARCHAR(200) = NULL,
    @ThuNhapHangThang DECIMAL(12,2) = NULL,
    @NgheNghiep NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.NGUOIDUNG WHERE MaNguoiDung = @MaNguoiNhan)
    BEGIN
        RAISERROR(N'Người nhận nuôi không tồn tại.', 16, 1);
        RETURN;
    END;

    DECLARE @MaYeuCauNhan CHAR(8);
    SET @MaYeuCauNhan = 'YCNN' + RIGHT('0000' + CAST(NEXT VALUE FOR dbo.SEQ_YCNN AS VARCHAR(4)), 4);

    INSERT INTO dbo.YEUCAUNHANNUOI
    (
        MaYeuCauNhan, MaNguoiNhan, LyDoNhanNuoi, MongMuonVeTre,
        ThuNhapHangThang, NgheNghiep, NgayTao, NgayCapNhat,
        TrangThai, NguoiDuyet
    )
    VALUES
    (
        @MaYeuCauNhan, @MaNguoiNhan, @LyDoNhanNuoi, @MongMuonVeTre,
        @ThuNhapHangThang, @NgheNghiep, GETDATE(), NULL,
        N'Chờ xử lý', NULL
    );

    SELECT @MaYeuCauNhan AS MaYeuCauNhan, N'Tạo yêu cầu nhận nuôi thành công' AS ThongBao;
END;
GO
CREATE OR ALTER PROCEDURE dbo.sp_TaoLichGapMatNhanNuoi
    @MaYeuCauNhan CHAR(8),
    @MaTre CHAR(8),
    @MaCanBo CHAR(8),
    @NgayGapMat DATETIME,
    @ThoiGian DATETIME = NULL,
    @DiaDiem NVARCHAR(200) = NULL,
    @GhiChuCanBo NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.YEUCAUNHANNUOI WHERE MaYeuCauNhan = @MaYeuCauNhan)
    BEGIN
        RAISERROR(N'Yêu cầu nhận nuôi không tồn tại.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.TRE WHERE MaTre = @MaTre)
    BEGIN
        RAISERROR(N'Trẻ không tồn tại.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.NGUOIDUNG WHERE MaNguoiDung = @MaCanBo)
    BEGIN
        RAISERROR(N'Cán bộ không tồn tại.', 16, 1);
        RETURN;
    END;

    DECLARE @MaLichGap CHAR(8);

    SET @MaLichGap = 'LHGM' + RIGHT('0000' + CAST(NEXT VALUE FOR dbo.SEQ_LHGM AS VARCHAR(4)), 4);

    INSERT INTO dbo.LICHHENGAPMATNHANNUOI (
        MaLichGap,
        MaYeuCauNhan,
        MaTre,
        MaCanBo,
        NgayGapMat,
        ThoiGian,
        DiaDiem,
        TrangThai,
        KetQua,
        PhanHoiNguoiNhan,
        ThoiGianDeXuatMoi,
        GhiChuCanBo,
        NgayTao,
        NgayCapNhat
    )
    VALUES (
        @MaLichGap,
        @MaYeuCauNhan,
        @MaTre,
        @MaCanBo,
        @NgayGapMat,
        @ThoiGian,
        @DiaDiem,
        N'Chờ xác nhận',
        NULL,
        NULL,
        NULL,
        @GhiChuCanBo,
        GETDATE(),
        NULL
    );

    UPDATE dbo.YEUCAUNHANNUOI
    SET TrangThai = N'Chờ ghép trẻ',
        NgayCapNhat = GETDATE()
    WHERE MaYeuCauNhan = @MaYeuCauNhan;

    SELECT 
        @MaLichGap AS MaLichGap,
        N'Tạo lịch gặp mặt thành công' AS ThongBao;
END;
GO
CREATE OR ALTER PROCEDURE dbo.sp_TaoHoSoNhanNuoi
    @MaYeuCauNhan CHAR(8),
    @MaTre         CHAR(8),
    @GhiChu        NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- 1. Kiểm tra yêu cầu tồn tại
    IF NOT EXISTS (
        SELECT 1
        FROM dbo.YEUCAUNHANNUOI
        WHERE MaYeuCauNhan = @MaYeuCauNhan
    )
    BEGIN
        RAISERROR(N'Yêu cầu nhận nuôi không tồn tại.', 16, 1);
        RETURN;
    END;

    -- 2. Chỉ cho tạo hồ sơ khi yêu cầu đã được duyệt
    IF NOT EXISTS (
        SELECT 1
        FROM dbo.YEUCAUNHANNUOI
        WHERE MaYeuCauNhan = @MaYeuCauNhan
          AND TrangThai = N'Đã duyệt'
    )
    BEGIN
        RAISERROR(N'Yêu cầu nhận nuôi chưa được duyệt nên chưa thể tạo hồ sơ.', 16, 1);
        RETURN;
    END;

    -- 3. Mỗi yêu cầu nhận nuôi chỉ được tạo 1 hồ sơ
    IF EXISTS (
        SELECT 1
        FROM dbo.HOSONHANNUOI
        WHERE MaYeuCauNhan = @MaYeuCauNhan
    )
    BEGIN
        RAISERROR(N'Yêu cầu nhận nuôi này đã có hồ sơ.', 16, 1);
        RETURN;
    END;

    -- 4. Kiểm tra trẻ tồn tại
    IF NOT EXISTS (
        SELECT 1
        FROM dbo.TRE
        WHERE MaTre = @MaTre
    )
    BEGIN
        RAISERROR(N'Trẻ không tồn tại.', 16, 1);
        RETURN;
    END;

    -- 5. Chỉ cho tạo hồ sơ với trẻ đang chờ nhận nuôi
    IF NOT EXISTS (
        SELECT 1
        FROM dbo.TRE
        WHERE MaTre = @MaTre
          AND TrangThai = N'Chờ nhận nuôi'
    )
    BEGIN
        RAISERROR(N'Trẻ không ở trạng thái chờ nhận nuôi nên không thể tạo hồ sơ.', 16, 1);
        RETURN;
    END;

    -- 6. Không cho một trẻ nằm trong nhiều hồ sơ đang xử lý / đã hoàn tất
    IF EXISTS (
        SELECT 1
        FROM dbo.HOSONHANNUOI
        WHERE MaTre = @MaTre
          AND TrangThai IN (N'Đang lập', N'Chờ duyệt', N'Đã duyệt', N'Đã hoàn tất')
    )
    BEGIN
        RAISERROR(N'Trẻ này đã có trong một hồ sơ nhận nuôi khác.', 16, 1);
        RETURN;
    END;

    -- 7. Phải có lịch gặp mặt phù hợp trước khi tạo hồ sơ
    IF NOT EXISTS (
        SELECT 1
        FROM dbo.LICHHENGAPMATNHANNUOI
        WHERE MaYeuCauNhan = @MaYeuCauNhan
          AND MaTre = @MaTre
          AND TrangThai = N'Đã gặp mặt'
          AND KetQua = N'Phù hợp'
    )
    BEGIN
        RAISERROR(N'Chưa có kết quả gặp mặt phù hợp nên chưa thể tạo hồ sơ nhận nuôi.', 16, 1);
        RETURN;
    END;

    DECLARE @MaHSNhanNuoi CHAR(8);

    SET @MaHSNhanNuoi =
        'HSNN' + RIGHT('0000' + CAST(NEXT VALUE FOR dbo.SEQ_HSNN AS VARCHAR(4)), 4);

    BEGIN TRY
        BEGIN TRAN;

        INSERT INTO dbo.HOSONHANNUOI
        (
            MaHSNhanNuoi,
            MaYeuCauNhan,
            MaTre,
            MaCanBo,
            NgayLap,
            NgayDuyet,
            TrangThai,
            GhiChu
        )
        VALUES
        (
            @MaHSNhanNuoi,
            @MaYeuCauNhan,
            @MaTre,
            NULL,
            CAST(GETDATE() AS DATE),
            NULL,
            N'Chờ duyệt',
            @GhiChu
        );

        COMMIT TRAN;

        SELECT
            @MaHSNhanNuoi AS MaHSNhanNuoi,
            @MaYeuCauNhan AS MaYeuCauNhan,
            @MaTre AS MaTre,
            N'Chờ duyệt' AS TrangThai,
            N'Tạo hồ sơ nhận nuôi thành công. Hồ sơ đang chờ trưởng phòng duyệt.' AS ThongBao;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRAN;

        THROW;
    END CATCH
END;
go
CREATE OR ALTER PROCEDURE dbo.sp_DuyetHoSoNhanNuoi
    @MaHSNhanNuoi CHAR(8),
    @MaCanBoDuyet CHAR(8),
    @GhiChu NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.HOSONHANNUOI
        WHERE MaHSNhanNuoi = @MaHSNhanNuoi
    )
    BEGIN
        RAISERROR(N'Hồ sơ nhận nuôi không tồn tại.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.NGUOIDUNG
        WHERE MaNguoiDung = @MaCanBoDuyet
    )
    BEGIN
        RAISERROR(N'Cán bộ duyệt không tồn tại.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.HOSONHANNUOI
        WHERE MaHSNhanNuoi = @MaHSNhanNuoi
          AND TrangThai = N'Chờ duyệt'
    )
    BEGIN
        RAISERROR(N'Chỉ có thể duyệt hồ sơ đang ở trạng thái Chờ duyệt.', 16, 1);
        RETURN;
    END;

    BEGIN TRY
        BEGIN TRAN;

        UPDATE dbo.HOSONHANNUOI
        SET
            MaCanBo = @MaCanBoDuyet,
            TrangThai = N'Đã duyệt',
            NgayDuyet = CAST(GETDATE() AS DATE),
            GhiChu = ISNULL(@GhiChu, GhiChu)
        WHERE MaHSNhanNuoi = @MaHSNhanNuoi;

        COMMIT TRAN;

        SELECT
            @MaHSNhanNuoi AS MaHSNhanNuoi,
            @MaCanBoDuyet AS MaCanBoDuyet,
            N'Đã duyệt hồ sơ nhận nuôi thành công.' AS ThongBao;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRAN;

        THROW;
    END CATCH
END;
GO
CREATE OR ALTER PROCEDURE dbo.sp_HoanTatHoSoNhanNuoi
    @MaHSNhanNuoi CHAR(8),
    @GhiChu NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @MaTre CHAR(8);

    -- 1. Kiểm tra hồ sơ tồn tại và lấy mã trẻ
    SELECT @MaTre = MaTre
    FROM dbo.HOSONHANNUOI
    WHERE MaHSNhanNuoi = @MaHSNhanNuoi;

    IF @MaTre IS NULL
    BEGIN
        RAISERROR(N'Hồ sơ nhận nuôi không tồn tại.', 16, 1);
        RETURN;
    END;

    -- 2. Chỉ cho hoàn tất hồ sơ đã được trưởng phòng duyệt
    IF NOT EXISTS (
        SELECT 1
        FROM dbo.HOSONHANNUOI
        WHERE MaHSNhanNuoi = @MaHSNhanNuoi
          AND TrangThai = N'Đã duyệt'
    )
    BEGIN
        RAISERROR(N'Chỉ có thể hoàn tất hồ sơ đã được trưởng phòng duyệt.', 16, 1);
        RETURN;
    END;

    -- 3. Kiểm tra trẻ tồn tại
    IF NOT EXISTS (
        SELECT 1
        FROM dbo.TRE
        WHERE MaTre = @MaTre
    )
    BEGIN
        RAISERROR(N'Trẻ trong hồ sơ không tồn tại.', 16, 1);
        RETURN;
    END;

    BEGIN TRY
        BEGIN TRAN;

        -- 4. Cập nhật trạng thái hồ sơ
        UPDATE dbo.HOSONHANNUOI
        SET
            TrangThai = N'Đã hoàn tất',
            GhiChu = ISNULL(@GhiChu, GhiChu)
        WHERE MaHSNhanNuoi = @MaHSNhanNuoi;

        -- 5. Cập nhật trạng thái trẻ
        UPDATE dbo.TRE
        SET
            TrangThai = N'Đã nhận nuôi',
            NgayNhanNuoi = CAST(GETDATE() AS DATE),
            NgayCapNhat = SYSDATETIME(),
            GhiChu = ISNULL(@GhiChu, N'Trẻ đã hoàn tất hồ sơ nhận nuôi')
        WHERE MaTre = @MaTre;

        COMMIT TRAN;

        SELECT
            @MaHSNhanNuoi AS MaHSNhanNuoi,
            @MaTre AS MaTre,
            N'Hoàn tất hồ sơ nhận nuôi thành công.' AS ThongBao;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRAN;

        THROW;
    END CATCH
END;
GO
CREATE OR ALTER PROCEDURE dbo.sp_ThemTheoDoiSucKhoe
    @MaTre CHAR(8),
    @MaNguoiCapNhat CHAR(8) = NULL,
    @CanNang DECIMAL(5,2) = NULL,
    @ChieuCao DECIMAL(5,2) = NULL,
    @NhipTim SMALLINT = NULL,
    @NhomMau CHAR(3) = NULL,
    @NhietDo DECIMAL(4,2) = NULL,
    @KetLuan NVARCHAR(100) = NULL,
    @TinhTrangChiTiet NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.TRE WHERE MaTre = @MaTre)
    BEGIN
        RAISERROR(N'Trẻ không tồn tại.', 16, 1);
        RETURN;
    END;

    DECLARE @MaTheoDoi CHAR(8);
    SET @MaTheoDoi = 'TDSK' + RIGHT('0000' + CAST(NEXT VALUE FOR dbo.SEQ_TDSK AS VARCHAR(4)), 4);

    INSERT INTO dbo.THEODOISUCKHOE
    (
        MaTheoDoi, MaTre, MaNguoiCapNhat, NgayCapNhat,
        CanNang, ChieuCao, NhipTim, NhomMau, NhietDo,
        KetLuan, TinhTrangChiTiet
    )
    VALUES
    (
        @MaTheoDoi, @MaTre, @MaNguoiCapNhat, GETDATE(),
        @CanNang, @ChieuCao, @NhipTim, @NhomMau, @NhietDo,
        @KetLuan, @TinhTrangChiTiet
    );

    SELECT @MaTheoDoi AS MaTheoDoi, N'Thêm theo dõi sức khỏe thành công' AS ThongBao;
END;
GO
CREATE OR ALTER PROCEDURE dbo.sp_ThemLichSuTiemChung
    @MaTre CHAR(8),
    @MaVacxin CHAR(5),
    @MuiSo INT,
    @NgayTiem DATE,
    @GhiChu NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.TRE WHERE MaTre = @MaTre)
    BEGIN
        RAISERROR(N'Trẻ không tồn tại.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.VACXIN WHERE MaVacxin = @MaVacxin)
    BEGIN
        RAISERROR(N'Vắc xin không tồn tại.', 16, 1);
        RETURN;
    END;

    IF @MuiSo < 0
    BEGIN
        RAISERROR(N'Mũi tiêm không hợp lệ.', 16, 1);
        RETURN;
    END;

    IF EXISTS (
        SELECT 1
        FROM dbo.LICHSUTIEMCHUNG
        WHERE MaTre = @MaTre
          AND MaVacxin = @MaVacxin
          AND MuiSo = @MuiSo
    )
    BEGIN
        RAISERROR(N'Trẻ đã có lịch sử của vắc xin và mũi tiêm này.', 16, 1);
        RETURN;
    END;

    DECLARE @MaLSTiemChung CHAR(8);
    SET @MaLSTiemChung = 'LSTC' + RIGHT('0000' + CAST(NEXT VALUE FOR dbo.SEQ_LSTC AS VARCHAR(4)), 4);

    INSERT INTO dbo.LICHSUTIEMCHUNG
    (
        MaLSTiemChung, MaTre, MaVacxin, MuiSo, NgayTiem, GhiChu
    )
    VALUES
    (
        @MaLSTiemChung, @MaTre, @MaVacxin, @MuiSo, @NgayTiem, @GhiChu
    );

    SELECT @MaLSTiemChung AS MaLSTiemChung, N'Thêm lịch sử tiêm chủng thành công' AS ThongBao;
END;
GO
CREATE OR ALTER PROCEDURE dbo.sp_CapNhatThongTinTre
    @MaTre CHAR(8),
    @TinhCach NVARCHAR(150) = NULL,
    @SoThich NVARCHAR(150) = NULL,
    @DacDiemNhanDang NVARCHAR(150) = NULL,
    @TrangThai NVARCHAR(20) = NULL,
    @GhiChu NVARCHAR(200) = NULL,
    @MaNguoiCapNhat CHAR(8) = NULL,
    @HinhAnh NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.TRE
    SET
        TinhCach = ISNULL(@TinhCach, TinhCach),
        SoThich = ISNULL(@SoThich, SoThich),
        DacDiemNhanDang = ISNULL(@DacDiemNhanDang, DacDiemNhanDang),
        TrangThai = ISNULL(@TrangThai, TrangThai),
        GhiChu = ISNULL(@GhiChu, GhiChu),
        MaNguoiCapNhat = ISNULL(@MaNguoiCapNhat, MaNguoiCapNhat),
        HinhAnh = ISNULL(@HinhAnh, HinhAnh),
        NgayCapNhat = SYSDATETIME()
    WHERE MaTre = @MaTre;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR(N'Trẻ không tồn tại.', 16, 1);
        RETURN;
    END;

    SELECT @MaTre AS MaTre, N'Cập nhật thông tin trẻ thành công' AS ThongBao;
END;
GO

/* ============================================================
   6. TEST NHANH SAU KHI CHẠY FILE
   ============================================================ */

SELECT
    name AS TenSequence,
    current_value AS GiaTriHienTai
FROM sys.sequences
WHERE schema_id = SCHEMA_ID('dbo')
ORDER BY name;

SELECT TOP 20 *
FROM dbo.vw_DanhSachYeuCauGuiTre
ORDER BY NgayTao DESC;

SELECT TOP 20 *
FROM dbo.vw_DanhSachTre
ORDER BY NgayTiepNhan DESC;

SELECT *
FROM dbo.vw_LichSuTiemChungTre
WHERE MaTre = 'TRE00001'
ORDER BY NgayTiem, MaVacxin, MuiSo;
/* ============================================================
   GỢI Ý MAP API
   ============================================================

   POST  /api/auth/register
       -> EXEC dbo.sp_DangKyNguoiDung

   POST  /api/auth/login
       -> EXEC dbo.sp_LayNguoiDungTheoTaiKhoan
       -> API tự so sánh mật khẩu/hash và tạo JWT

   GET   /api/child-requests
       -> SELECT * FROM dbo.vw_DanhSachYeuCauGuiTre

   POST  /api/child-requests
       -> EXEC dbo.sp_TaoYeuCauGuiTre

   POST  /api/documents
       -> EXEC dbo.sp_ThemGiayToPhapLy

   PATCH /api/documents/:id/status
       -> EXEC dbo.sp_CapNhatTrangThaiGiayTo

   PATCH /api/child-requests/:id/approve
       -> EXEC dbo.sp_DuyetYeuCauGuiTre

   PATCH /api/child-requests/:id/reject
       -> EXEC dbo.sp_TuChoiYeuCauGuiTre

   GET   /api/children
       -> SELECT * FROM dbo.vw_DanhSachTre

   GET   /api/children/:id/vaccines
       -> SELECT * FROM dbo.vw_LichSuTiemChungTre WHERE MaTre = @id

   POST  /api/children/:id/vaccines
       -> EXEC dbo.sp_ThemLichSuTiemChung

   POST  /api/children/:id/health
       -> EXEC dbo.sp_ThemTheoDoiSucKhoe

   POST  /api/adoption-requests
       -> EXEC dbo.sp_TaoYeuCauNhanNuoi

   POST  /api/adoption-profiles
       -> EXEC dbo.sp_TaoHoSoNhanNuoi

   PATCH /api/adoption-profiles/:id/approve
       -> EXEC dbo.sp_DuyetHoSoNhanNuoi

   PATCH /api/adoption-profiles/:id/complete
       -> EXEC dbo.sp_HoanTatHoSoNhanNuoi
*/