# WORKFLOW CHUẨN - HỆ THỐNG QUẢN LÝ TRUNG TÂM BẢO TRỢ XÃ HỘI (BTXH)

> Tài liệu này mô tả toàn bộ luồng nghiệp vụ, trạng thái dữ liệu, phân quyền,
> và những phần chưa hoàn thiện của dự án.

---

## MỤC LỤC

1. [Kiến trúc tổng quan](#1-kiến-trúc-tổng-quan)
2. [Vai trò & Quyền hạn](#2-vai-trò--quyền-hạn)
3. [Luồng GỬI TRẺ (Yêu cầu tiếp nhận)](#3-luồng-gửi-trẻ)
4. [Luồng NHẬN NUÔI (Yêu cầu nhận nuôi)](#4-luồng-nhận-nuôi)
5. [Luồng QUẢN LÝ TRẺ & SỨC KHỎE](#5-luồng-quản-lý-trẻ--sức-khỏe)
6. [Luồng DUYỆT HỒ SƠ (Trưởng phòng)](#6-luồng-duyệt-hồ-sơ-trưởng-phòng)
7. [Luồng QUẢN TRỊ (Admin)](#7-luồng-quản-trị-admin)
8. [Trạng thái dữ liệu & Transition hợp lệ](#8-trạng-thái-dữ-liệu--transition-hợp-lệ)
9. [Mapping API ↔ FE Page](#9-mapping-api--fe-page)
10. [Danh sách LOGIC THIẾU / BUG](#10-danh-sách-logic-thiếu--bug)

---

## 1. KIẾN TRÚC TỔNG QUAN

```
FE (React + Vite)         BE (ASP.NET Core 8)        DB (SQL Server)
http://localhost:5173  →  http://localhost:8080/api  →  BTXH Database

Auth: JWT Bearer Token
Response envelope: { success, message, data }
Paged response:   { items, total, page, limit, totalPages }
```

### Quan hệ nghiệp vụ chính

```
NguoiDung (NGGT)
  └─[1:*]→ YeuCauGuiTre
               └─[1:1]→ ThongTinTreTam
               └─[1:*]→ GiayToPhapLy
               └─[1:1]→ HoSoTiepNhanTre ← tạo tự động khi approve
                            └─[FK]→ Tre ← tạo tự động khi approve
                                     └─[1:*]→ LichSuTiemChung
                                     └─[1:*]→ TheoDoiSucKhoe

NguoiDung (NGNN)
  └─[1:*]→ YeuCauNhanNuoi
               └─[1:*]→ GiayToPhapLy
               └─[1:*]→ LichHenGapMatNhanNuoi
               └─[1:*]→ HoSoNhanNuoi
                            └─[FK]→ Tre (cùng Tre từ HoSoTiepNhan)
```

---

## 2. VAI TRÒ & QUYỀN HẠN

| Role FE            | Mã BE | Tên        | Quyền chính                                                  |
|--------------------|-------|------------|--------------------------------------------------------------|
| `sender`           | NGGT  | Người gửi  | Tạo/xem YCGT của mình, upload giấy tờ                       |
| `adopter`          | NGNN  | Người nhận | Tạo/xem YCNN của mình, xem trạng thái, đặt lịch gặp         |
| `staff-reception`  | QLNT  | Cán bộ TN  | Xem/xử lý YCGT, tạo HSTN, quản lý trẻ, sức khỏe            |
| `staff-adoption`   | QLNN  | Cán bộ NN  | Xem/xử lý YCNN, tạo HSNN, ghép trẻ, lên lịch gặp           |
| `manager`          | TPQL  | Trưởng p.  | Phê duyệt/từ chối HSTN + HSNN, xem thống kê, lịch sử        |
| `admin`            | ADMI  | Admin      | Toàn quyền: quản lý user, phân quyền, xem mọi dữ liệu       |

### Route mặc định sau khi login

| Role               | Redirect đến                  |
|--------------------|-------------------------------|
| sender             | `/gui-tre/ho-so`              |
| adopter            | `/nhan-nuoi/ho-so`            |
| staff-reception    | `/can-bo-tiep-nhan/dashboard` |
| staff-adoption     | `/can-bo-nhan-nuoi/dashboard` |
| manager            | `/truong-phong/dashboard`     |
| admin              | `/admin/dashboard`            |

---

## 3. LUỒNG GỬI TRẺ

### 3.1 Sơ đồ tổng thể

```
[NGGT] Đăng ký/Đăng nhập
    ↓
[NGGT] Hoàn thiện hồ sơ cá nhân
    ↓ (gate: isSenderProfileComplete)
[NGGT] Tạo yêu cầu gửi trẻ + upload giấy tờ
    ↓ POST /receptions
    ↓
YeuCauGuiTre: "Chờ xử lý"
    ↓
[QLNT] Xem yêu cầu → xem xét → xác minh giấy tờ
    ↓ PATCH /documents/{id}/verify (giấy tờ: "Hợp lệ" / "Không hợp lệ")
    ↓
    ├─ Giấy tờ đủ, hợp lệ → [QLNT] Duyệt YCGT
    │       ↓ POST /receptions/{id}/approve
    │       ↓ AUTO: Tạo Tre + HoSoTiepNhanTre (status: "Đang xử lý")
    │       ↓
    │   YeuCauGuiTre: "Đã tiếp nhận"
    │       ↓
    │   [TPQL] Phê duyệt HoSoTiepNhanTre
    │       ↓ POST /reception-profiles/{id}/approve
    │       ↓ Tre.TrangThai → "Đang chăm sóc"
    │       ↓
    │   HoSoTiepNhanTre: "Đã duyệt"
    │
    └─ Từ chối → POST /receptions/{id}/reject
            ↓
        YeuCauGuiTre: "Từ chối"
```

### 3.2 FE Pages & API calls

| Bước | FE Page | API Call | BE Endpoint |
|------|---------|----------|-------------|
| Đăng ký | `RegisterPage` | `authApi.register()` | POST /auth/register |
| Hoàn thiện hồ sơ | `SenderProfile` | `authApi.updateProfile(id, payload)` | PUT /users/{id} |
| Tạo YCGT | `CreateChildRequest` | `receptionApi.create()` | POST /receptions |
| Upload giấy tờ | `CreateChildRequest` | `receptionApi.uploadDocument()` | POST /documents/upload |
| Xem trạng thái | `RequestStatus` | `receptionApi.getAll({senderId})` | GET /receptions |
| Cập nhật YCGT | `UpdateChildRequest` | `receptionApi.update(id, data)` | PUT /receptions/{id} |
| Xem danh sách YCGT | `ChildRequestList` | `receptionApi.getAll()` | GET /receptions |
| Xem chi tiết YCGT | `ChildRequestDetail` | `receptionApi.getById(id)` | GET /receptions/{id} |
| Tạo hồ sơ tiếp nhận | `CreateReceptionProfile` | `receptionProfileApi.create()` | POST /reception-profiles |
| Duyệt/từ chối YCGT | `ChildRequestDetail` | `receptionApi.approve/reject()` | POST /receptions/{id}/approve\|reject |
| Xem hồ sơ tiếp nhận | `ReceptionProfileList` | `receptionProfileApi.getAll()` | GET /reception-profiles |
| Xem chi tiết HSTN | `ReceptionProfileDetail` | `receptionProfileApi.getById(id)` | GET /reception-profiles/{id} |
| Duyệt/từ chối HSTN | `ProfileApproval` | `receptionProfileApi.approve/reject()` | POST /reception-profiles/{id}/approve\|reject |
| Xác minh giấy tờ | *(thiếu UI riêng)* | `documentApi.update()` | PATCH /documents/{id}/verify |

### 3.3 Giấy tờ bắt buộc khi gửi trẻ

| Loại người gửi | Giấy tờ bắt buộc                                          |
|----------------|-----------------------------------------------------------|
| CME (Cha/Mẹ)   | CCCD/CMND, Giấy khai sinh trẻ, Giấy xác nhận hoàn cảnh  |
| NTH (Người thân) | CCCD, Giấy xác nhận quan hệ, Giấy khai sinh trẻ        |
| CQDP (Cơ quan ĐP) | Công văn, Biên bản bàn giao                            |

---

## 4. LUỒNG NHẬN NUÔI

### 4.1 Sơ đồ tổng thể

```
[NGNN] Đăng ký/Đăng nhập
    ↓
[NGNN] Hoàn thiện hồ sơ cá nhân
    ↓ (gate: isAdopterProfileComplete)
[NGNN] Nộp đơn nhận nuôi + upload giấy tờ
    ↓ POST /adoptions/submit (multipart)
    ↓
[BE] Sơ bộ đánh giá (AssessContentOnly):
    ├─ Thu nhập < 6tr/tháng → "Từ chối sơ bộ" ❌
    ├─ Sức khỏe không đạt   → "Từ chối sơ bộ" ❌
    ├─ > 4 con đang nuôi    → "Từ chối sơ bộ" ❌
    └─ Đạt ─────────────────────────────────────────────────────┐
                                                                 ↓
YeuCauNhanNuoi: "Đang xác minh"
    ↓
[QLNN] Xác minh từng giấy tờ
    ↓ PATCH /documents/{id}/verify
    ↓ (khi TẤT CẢ giấy tờ = "Hợp lệ" → AUTO trigger)
    ↓
YeuCauNhanNuoi: "Chờ ghép trẻ"
    ↓
[QLNN] Bắt đầu ghép trẻ
    ↓ POST /adoptions/{id}/start-matching
    ↓
YeuCauNhanNuoi: "Ghép trẻ"
    ↓
[QLNN] Gợi ý trẻ phù hợp
    ↓ GET /adoptions/{id}/matching-children
    ↓
[QLNN] Lên lịch gặp mặt
    ↓ POST /meetings
    ↓
LichHenGapMat: "Chờ xác nhận"
    ↓
[NGNN] Xác nhận / Yêu cầu đổi lịch
    ↓ PUT /meetings/{id}
    ↓
LichHenGapMat: "Đã xác nhận" / "Yêu cầu đổi lịch"
    ↓
[QLNN] Thực hiện buổi gặp + đánh giá trẻ
    ↓ PUT /meetings/{id} (cập nhật KetQua, GhiChuCanBo)
    ↓
[QLNN] Tạo hồ sơ nhận nuôi
    ↓ POST /adoption-profiles
    ↓
HoSoNhanNuoi: "Chờ duyệt"
    ↓
[TPQL] Phê duyệt hồ sơ nhận nuôi
    ↓ POST /adoption-profiles/{id}/approve
    ↓ AUTO: Tre.TrangThai → "Đã nhận nuôi" + NgayNhanNuoi
    ↓
HoSoNhanNuoi: "Đã duyệt"
YeuCauNhanNuoi: "Đã duyệt"
```

### 4.2 FE Pages & API calls

| Bước | FE Page | API Call | BE Endpoint |
|------|---------|----------|-------------|
| Hoàn thiện hồ sơ | `AdopterProfile` | `authApi.updateProfile(id, payload)` | PUT /users/{id} |
| Nộp đơn YCNN | `CreateAdoptionRequest` | `adoptionApi.submit(formData)` | POST /adoptions/submit |
| Xem trạng thái | `AdoptionStatus` | `adoptionApi.getAll({adopterId})` | GET /adoptions |
| Xem YCNN (cán bộ) | `AdoptionRequestList` | `adoptionApi.getAll()` | GET /adoptions |
| Xem chi tiết YCNN | `AdoptionRequestDetail` | `adoptionApi.getById(id)` | GET /adoptions/{id} |
| Duyệt/từ chối YCNN | `AdoptionRequestDetail` | `adoptionApi.approve/reject()` | POST /adoptions/{id}/approve\|reject |
| Ghép trẻ | `AdoptionRequestDetail` | `adoptionApi.startMatching(id)` | POST /adoptions/{id}/start-matching |
| Gợi ý trẻ | *(thiếu UI riêng)* | `adoptionApi.getMatchingChildren(id)` | GET /adoptions/{id}/matching-children |
| **Lịch gặp mặt** | **⚠️ THIẾU TRANG** | `meetingApi.*` | /meetings |
| Tạo HSNN | `CreateAdoptionProfile` | `adoptionProfileApi.create()` | POST /adoption-profiles |
| Xem HSNN | `AdoptionProfileList` | `adoptionProfileApi.getAll()` | GET /adoption-profiles |
| Xem chi tiết HSNN | `AdoptionProfileDetail` | `adoptionProfileApi.getById(id)` | GET /adoption-profiles/{id} |
| Duyệt/từ chối HSNN | `ProfileApproval` | `adoptionProfileApi.approve/reject()` | POST /adoption-profiles/{id}/approve\|reject |

### 4.3 Điều kiện sơ bộ (BE AssessContentOnly)

| Tiêu chí | Giá trị tối thiểu | Xử lý nếu thiếu |
|----------|-------------------|-----------------|
| Thu nhập | ≥ 6,000,000 VNĐ/tháng | Từ chối sơ bộ |
| Sức khỏe | SucKhoeDatYeuCau = true | Từ chối sơ bộ |
| Số con đang nuôi | ≤ 4 | Từ chối sơ bộ |

### 4.4 Điểm ưu tiên (DiemUuTien)

| Tiêu chí | Điểm |
|----------|------|
| Người thân của trẻ | +5 |
| Thu nhập ≥ 30tr/tháng | +3 |
| Thu nhập ≥ 15tr/tháng | +2 |
| Thu nhập ≥ 6tr/tháng | +1 |
| Không có con đang nuôi | +2 |
| Có ≤ 2 con đang nuôi | +1 |

---

## 5. LUỒNG QUẢN LÝ TRẺ & SỨC KHỎE

### 5.1 Vòng đời của Tre

```
[Tự động tạo khi approve YCGT]
    ↓
Tre.TrangThai: "Chờ tiếp nhận"
    ↓ (HSTN approve)
"Đang chăm sóc"
    ↓ (khi YCNN bắt đầu ghép)
"Chờ nhận nuôi"
    ↓ (khi HSNN approve)
"Đã nhận nuôi"

Hoặc:
"Đang chăm sóc" → "Đã trả về gia đình" (nếu YCGT bị hủy sau tiếp nhận)
```

### 5.2 Quản lý sức khỏe

| Bước | FE Page | API | BE Endpoint |
|------|---------|-----|-------------|
| Danh sách sức khỏe | `ChildHealthList` | `axiosClient.get('/health-records')` | GET /health-records |
| Thêm/sửa sức khỏe | `ChildHealthForm` | `childApi` / `axiosClient` | POST/PUT /health-records |
| Tiêm chủng | `ChildHealthForm` | `axiosClient.get/post/put/delete` | GET/POST/PUT/DELETE /vaccinations |

### 5.3 Ghi chú

- Chỉ `staff-reception`, `staff-adoption`, `manager`, `admin` được sửa health records
- `staff-reception` quản lý sức khỏe + tiêm chủng hàng ngày
- Khi trẻ được nhận nuôi (`"Đã nhận nuôi"`), records sức khỏe vẫn còn trong hệ thống (lưu trữ)

---

## 6. LUỒNG DUYỆT HỒ SƠ (TRƯỞNG PHÒNG)

```
[TPQL] Xem danh sách hồ sơ chờ duyệt
    ↓ GET /reception-profiles?status=Chờ duyệt
    ↓ GET /adoption-profiles?status=Chờ duyệt
    ↓
[TPQL] Xem chi tiết hồ sơ
    ↓
    ├─ Phê duyệt:
    │   ├─ HSTN: POST /reception-profiles/{id}/approve → Tre status thay đổi
    │   └─ HSNN: POST /adoption-profiles/{id}/approve → Tre "Đã nhận nuôi"
    │
    └─ Từ chối:
        ├─ HSTN: POST /reception-profiles/{id}/reject
        └─ HSNN: POST /adoption-profiles/{id}/reject
```

### FE Pages

| FE Page | Mục đích |
|---------|----------|
| `ManagerDashboard` | Tổng quan + charts |
| `PendingProfileList` | Danh sách HSTN + HSNN chờ duyệt |
| `ProfileApproval` | Xem chi tiết + nút Duyệt/Từ chối |
| `ProfileHistory` | Lịch sử hồ sơ đã xử lý |
| `Statistics` | Biểu đồ thống kê |

---

## 7. LUỒNG QUẢN TRỊ (ADMIN)

```
[ADMIN] Quản lý tài khoản:
    GET/POST/PUT /users
    PATCH /users/{id}/status (khóa/mở khóa)

[ADMIN] Phân quyền:
    PUT /users/{id} với roles array

[ADMIN] Xem thống kê:
    GET /stats
    GET /stats/children-by-status
    GET /stats/requests-by-month
```

### FE Pages

| FE Page | Mục đích |
|---------|----------|
| `DashboardAdmin` | Thống kê + biểu đồ |
| `AccountList` | Danh sách user + khóa/mở khóa + phân quyền |
| `AccountForm` | Tạo/sửa tài khoản |
| `RoleManagement` | Phân quyền role cho từng user |

---

## 8. TRẠNG THÁI DỮ LIỆU & TRANSITION HỢP LỆ

### 8.1 YeuCauGuiTre

```
Chờ xử lý
    ├─→ Từ chối          [QLNT/TPQL/ADMIN] POST /receptions/{id}/reject
    ├─→ Đã tiếp nhận     [QLNT/TPQL/ADMIN] POST /receptions/{id}/approve (auto: tạo Tre + HSTN)
    └─→ Đã hủy           [NGGT/QLNT]       DELETE /receptions/{id}
```

⚠️ Transition "Chờ xử lý" → "Đang xem xét" CHƯA CÓ ENDPOINT

### 8.2 HoSoTiepNhanTre

```
Đang xử lý (auto-tạo khi YCGT approve)
    ├─→ Đã duyệt         [TPQL/ADMIN] POST /reception-profiles/{id}/approve
    └─→ Từ chối          [QLNT/TPQL/ADMIN] POST /reception-profiles/{id}/reject
```

⚠️ Transition "Đang xử lý" → "Chờ duyệt" CHƯA DÙNG (TPQL duyệt trực tiếp từ "Đang xử lý")

### 8.3 YeuCauNhanNuoi

```
[Submit]
    ↓ Sơ bộ fail
    └─→ Từ chối sơ bộ    [AUTO-BE]
    ↓ Sơ bộ pass
Đang xác minh
    ├─→ Chờ ghép trẻ     [AUTO-BE khi tất cả giấy tờ = Hợp lệ]
    │       ↓ POST /adoptions/{id}/start-matching
    │   Ghép trẻ
    │       ↓
    │   Đã duyệt         [QLNN/TPQL/ADMIN] POST /adoptions/{id}/approve
    │
    └─→ Từ chối          [QLNN/TPQL/ADMIN] POST /adoptions/{id}/reject
```

⚠️ Transition "Chờ xử lý" → "Đang xem xét" CHƯA CÓ ENDPOINT

### 8.4 HoSoNhanNuoi

```
Chờ duyệt (tạo bởi QLNN)
    ├─→ Đã duyệt         [TPQL/ADMIN] POST /adoption-profiles/{id}/approve (auto: Tre "Đã nhận nuôi")
    └─→ Từ chối          [QLNN/TPQL/ADMIN] POST /adoption-profiles/{id}/reject
```

### 8.5 GiayToPhapLy

```
Chờ xác minh (mặc định khi upload)
    ├─→ Hợp lệ           [QLNT/QLNN/TPQL/ADMIN] PATCH /documents/{id}/verify
    ├─→ Không hợp lệ     [QLNT/QLNN/TPQL/ADMIN] PATCH /documents/{id}/verify
    ├─→ Hết hạn          [QLNT/QLNN/TPQL/ADMIN] PATCH /documents/{id}/verify
    └─→ Cần bổ sung      [QLNT/QLNN/TPQL/ADMIN] PATCH /documents/{id}/verify
```

> Auto-trigger: Khi TẤT CẢ giấy tờ của YCNN = "Hợp lệ" → YCNN.TrangThai → "Chờ ghép trẻ"

### 8.6 LichHenGapMat

```
Chờ xác nhận (tạo bởi QLNN)
    ├─→ Đã xác nhận          [NGNN] PUT /meetings/{id}
    ├─→ Yêu cầu đổi lịch     [NGNN] PUT /meetings/{id}
    └─→ [Cancelled/Xóa]      DELETE /meetings/{id}
```

### 8.7 Tre

```
Chờ tiếp nhận (auto khi YCGT approve)
    ↓ HSTN approve
Đang chăm sóc
    ↓ YCNN start-matching chọn trẻ này
Chờ nhận nuôi
    ↓ HSNN approve
Đã nhận nuôi
```

---

## 9. MAPPING API ↔ FE PAGE

### Các endpoint BE chưa có FE gọi đến

| BE Endpoint | Mô tả | Tình trạng FE |
|-------------|-------|---------------|
| `GET /meetings` | Danh sách lịch gặp | ❌ Không có trang |
| `POST /meetings` | Tạo lịch gặp | ❌ Không có trang |
| `PUT /meetings/{id}` | Cập nhật lịch gặp | ❌ Không có trang |
| `DELETE /meetings/{id}` | Xóa lịch gặp | ❌ Không có trang |
| `GET /adoptions/{id}/matching-children` | Gợi ý trẻ ghép | ❌ Không có trang |
| `POST /adoptions/{id}/start-matching` | Bắt đầu ghép trẻ | ⚠️ Gọi trong AdoptionRequestDetail nhưng không có UI chọn trẻ |
| `PATCH /documents/{id}/verify` | Xác minh giấy tờ | ⚠️ Không có UI riêng (có thể embed trong detail pages) |
| `GET /stats/children-by-status` | Thống kê trẻ theo status | ⚠️ adminApi có nhưng không có page nào dùng |
| `GET /roles` | Danh sách vai trò | ⚠️ adminApi có nhưng không dùng để populate |
| `GET /auth/refresh` | Làm mới token | ⚠️ authApi có nhưng axiosClient không auto-refresh |

### Các FE page gọi API nhưng cần kiểm tra

| FE Page | Vấn đề |
|---------|--------|
| `RequestStatus` | Dùng sessionStorage → mất khi F5 |
| `AdoptionStatus` | Dùng sessionStorage → mất khi F5 |
| `CreateChildRequest` | Hardcode sender types, doc types |
| `CreateAdoptionRequest` | Hardcode marriage/housing/health options |

---

## 10. DANH SÁCH LOGIC THIẾU / BUG

### 🔴 CRITICAL - Ảnh hưởng nghiệp vụ chính

| # | File | Vấn đề | Hướng sửa |
|---|------|--------|-----------|
| 1 | **TOÀN BỘ FE** | Không có trang nào cho Lịch Hẹn Gặp Mặt (`meetingApi` định nghĩa nhưng không dùng) | Tạo: `MeetingList.jsx`, `MeetingForm.jsx`, `MeetingDetail.jsx` |
| 2 | **AdoptionRequestDetail** | Không có UI để chọn trẻ khi ghép (`matching-children`) — chỉ bấm start-matching | Thêm modal chọn trẻ từ `getMatchingChildren` |
| 3 | **RequestStatus, AdoptionStatus** | Dùng `sessionStorage` để lưu request snapshot → mất khi F5 hoặc đổi tab | Gọi API lấy lại dữ liệu thay vì phụ thuộc session |
| 4 | **BE CodeGenerator** | Không có lock → race condition khi 2 request tạo cùng lúc → trùng mã | Dùng `SELECT ... FOR UPDATE` hoặc DB sequence |
| 5 | **BE - Không kiểm tra ownership** | User A có thể xem YCGT/YCNN của user B nếu biết ID | Thêm kiểm tra `userId == resource.ownerId` trong controller |

### 🟠 HIGH - Ảnh hưởng tính đúng đắn

| # | File | Vấn đề | Hướng sửa |
|---|------|--------|-----------|
| 6 | **BE YeuCauGuiTreController** | Thiếu endpoint YCGT "Chờ xử lý" → "Đang xem xét" | Thêm `POST /{id}/start-review` |
| 7 | **BE YeuCauNhanNuoiController** | Thiếu endpoint YCNN "Chờ xử lý" → "Đang xem xét" | Thêm `POST /{id}/start-review` |
| 8 | **BE AssessContentOnly** | Không kiểm tra tuổi người nhận (nên ≥ 21) | Thêm validation tuổi |
| 9 | **BE AssessContentOnly** | Không kiểm tra tình trạng hôn nhân | Thêm điều kiện nếu cần |
| 10 | **BE HoSoTiepNhanController.Approve** | Không kiểm tra Tre trạng thái "Chờ tiếp nhận" trước approve → có thể approve nhiều lần | Thêm check `Tre.TrangThai == "Chờ tiếp nhận"` |
| 11 | **BE GiayToController.Verify** | Auto-trigger chuyển YCNN → "Chờ ghép trẻ" chỉ khi verify giấy tờ cuối cùng — nếu verify không đúng thứ tự có thể stuck | Test kỹ case verify out-of-order |
| 12 | **FE CreateChildRequest** | Hardcode `senderTypes`, `reasonLabels`, `docTypes` thay vì fetch từ `GET /lookups/*` | Thay bằng `useFetch(lookupApi.getLoaiNguoiGui)` |
| 13 | **FE CreateAdoptionRequest** | Hardcode marriage/housing/health options | Thêm lookup endpoint nếu cần, hoặc giữ constants có documented |
| 14 | **ChildHealthList** | Gọi `axiosClient.get('/health-records')` trực tiếp thay vì qua api file | Tạo `healthApi.js` hoặc thêm vào `childApi.js` |
| 15 | **ChildHealthForm** | Gọi trực tiếp `axiosClient` cho vaccinations | Tạo `vaccinationApi.js` |

### 🟡 MEDIUM - Clean code / Nhất quán

| # | File | Vấn đề | Hướng sửa |
|---|------|--------|-----------|
| 16 | **Nhiều trang** | Dùng `alert()` thay vì `NotificationContext` | Thay `alert()` bằng `notify.error()` / `notify.success()` |
| 17 | **axiosClient** | Không có auto token refresh khi token hết hạn — `authApi.refreshToken` có nhưng không dùng | Thêm interceptor: 401 → try refresh → retry |
| 18 | **BE ExpiredRequestCleanupService** | Không cleanup `HoSoTiepNhanTre` hết hạn | Thêm cleanup cho HSTN |
| 19 | **BE - File upload** | Không validate magic bytes (chỉ check extension) → upload file nguy hiểm | Thêm magic bytes validation |
| 20 | **statusHelpers.js** | `normalizeStatus()` không map đầy đủ tất cả status string từ BE | Align với BE status strings chính xác |
| 21 | **constants.js ROLES** | FE dùng `sender`, `adopter`, `staff-reception` — BE dùng `NGGT`, `NGNN`, `QLNT` | `getBackendRoleCode()` đã có, nhưng cần đưa vào 1 file utils chung |
| 22 | **Nhiều trang** | Silent error (catch không notify user) | Thêm error notification |
| 23 | **ProfileForm** | Truyền FE field names (`fullName`, `phone`), cần map sang BE (`HoTen`, `SDT`) trong mỗi page | Đã sửa cho Adopter, cần verify Sender |
| 24 | **DashboardAdmin** | `user?.fullName` nhưng BE trả `hoTen` | Sửa thành `user?.hoTen \|\| user?.fullName` |

### ⚪ LOW - Tối ưu / Nice-to-have

| # | Vấn đề | Hướng sửa |
|---|--------|-----------|
| 25 | Không có audit log (ai duyệt/từ chối lúc nào) | Thêm bảng `AuditLog` hoặc log vào file |
| 26 | Matching algorithm chỉ dựa tuổi/giới tính/quan hệ | Bổ sung thêm tiêu chí |
| 27 | `GET /stats/children-by-status` có trong adminApi nhưng không có trang nào dùng | Thêm vào DashboardAdmin hoặc Statistics |
| 28 | Không có pagination UI cho hầu hết list pages | Thêm `<Pagination>` component (đã có component) |
| 29 | Token refresh flow chưa có | Implement auto-refresh |
| 30 | Không có thông báo real-time (WebSocket/SSE) | Nice-to-have cho production |

---

## CHECKLIST TRƯỚC KHI DEMO / NỘP BÀI

### Backend
- [ ] Tất cả workflow transitions hoạt động đúng (test thủ công)
- [ ] Seed data đủ các vai trò để test
- [ ] CORS config đúng cho FE domain
- [ ] File upload thư mục `/uploads/` được tạo và có quyền ghi

### Frontend
- [ ] Login → redirect đúng theo role
- [ ] Complete profile gate hoạt động
- [ ] Tạo YCGT + upload giấy tờ → QLNT duyệt → TPQL duyệt HSTN
- [ ] Tạo YCNN + upload giấy tờ → QLNN xác minh → ghép trẻ → tạo HSNN → TPQL duyệt
- [ ] Admin tạo/sửa/khóa user + phân quyền
- [ ] Tất cả trang hiển thị đúng data từ BE (không còn fallback/demo)
- [ ] Trang meeting được tạo hoặc có plan xử lý
- [ ] sessionStorage dependency được xử lý (hoặc documented là known issue)

---

*Cập nhật lần cuối: 2026-05-25 | Branch: Quang-Quang*
