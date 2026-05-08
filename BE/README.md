# QLTTBTXH API — Backend

Backend ASP.NET Core 8 Web API cho **Hệ thống Quản lý Thông tin Trẻ Bảo trợ Xã hội** (DAPM Nhóm 33).

> Tech stack: **.NET 8 Web API · EF Core 8 (Code First, Fluent API) · SQL Server · JWT Bearer · Swashbuckle (Swagger UI) · BCrypt**

---

## 1. Yêu cầu môi trường

| Thành phần | Phiên bản |
|---|---|
| .NET SDK | **8.0** trở lên |
| SQL Server | 2019 / 2022 / Express / LocalDB đều được |
| Visual Studio | 2022 (Community trở lên) hoặc VS Code + C# Dev Kit |

Kiểm tra nhanh:

```bash
dotnet --version     # >= 8.0.x
sqlcmd -?            # hoặc mở SSMS
```

---

## 2. Chuẩn bị database

1. Mở **SQL Server Management Studio** (hoặc Azure Data Studio).
2. Mở file SQL gốc của dự án (`SQLQuery1.sql`).
3. Chạy **toàn bộ script** — nó sẽ tạo database `QuanLyTTBT`, toàn bộ 19 bảng, các sequence sinh mã (`SEQ_NGUOIDUNG`, `SEQ_TRE`, …), stored procedure (`sp_DuyetYeuCauGuiTre`, …), view và seed dữ liệu mẫu.
4. Các tài khoản seed dùng mật khẩu `123456` (plain‑text) — `PasswordService` đã hỗ trợ đăng nhập cả plain‑text (cho dữ liệu cũ) lẫn BCrypt (cho user mới). Lần đầu đổi mật khẩu nó sẽ tự chuyển sang BCrypt.

**Các tài khoản sẵn có (mật khẩu `123456`):**

| Email | Vai trò |
|---|---|
| admin@ttbt.vn | Quản trị viên (ADMI) |
| tiepnhan@ttbt.vn | Cán bộ tiếp nhận (QLNT) |
| nhannuoi@ttbt.vn | Cán bộ nhận nuôi & Trưởng phòng (QLNN, TPQL) |
| nguoigui1@gmail.com, nguoigui2@gmail.com | Người gửi & nhận nuôi (NGGT, NGNN) |
| nguoinhan1@gmail.com | Người gửi & nhận nuôi (NGGT, NGNN) |

---

## 3. Cấu hình connection string

Mở `QLTTBTXH.API/appsettings.json`:

```jsonc
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(local);Database=QuanLyTTBT;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "THAY_BANG_KHOA_BI_MAT_DAI_TOI_THIEU_32_KY_TU_cho_HMAC_SHA256",
    "Issuer": "QLTTBTXH.API",
    "Audience": "QLTTBTXH.FE",
    "ExpiresInHours": 24
  },
  "Cors": {
    "AllowedOrigins": [ "http://localhost:5173", "http://localhost:3000" ]
  }
}
```

- Nếu bạn dùng SQL Server Express: `Server=.\\SQLEXPRESS;…`
- Nếu dùng LocalDB: `Server=(localdb)\\MSSQLLocalDB;…`
- Nếu SQL Auth: `Server=…;Database=QuanLyTTBT;User Id=sa;Password=yourpass;TrustServerCertificate=True;`

---

## 4. Chạy project

### 4.1. Trong Visual Studio 2022

1. Double‑click `BE/QLTTBTXH.sln`.
2. Chuột phải `QLTTBTXH.API` → **Set as Startup Project**.
3. Chọn profile **http** (port 8080) hoặc **QLTTBTXH.API** trong dropdown.
4. Bấm **F5** (hoặc Ctrl+F5).
5. Trình duyệt tự mở `http://localhost:8080/swagger`.

### 4.2. Bằng dotnet CLI

```bash
cd BE/QLTTBTXH.API
dotnet restore
dotnet build
dotnet run
```

Swagger UI: **http://localhost:8080/swagger**
Root `/` sẽ redirect vào `/swagger`.

---

## 5. Cách xài Swagger UI (JWT)

1. Vào **`POST /api/auth/login`** → body:
   ```json
   { "email": "admin@ttbt.vn", "password": "123456" }
   ```
2. Response trả về `data.token` dạng `eyJhbGciOi...`.
3. Nhấn nút **Authorize** (ổ khoá góc phải Swagger) → dán `eyJhbGciOi...` (KHÔNG cần tiền tố `Bearer`) → **Authorize**.
4. Giờ mọi endpoint `[Authorize]` đều gọi được.

---

## 6. Danh sách endpoint (khớp FE)

Tất cả response đều đóng gói:

```json
{ "success": true, "message": "...", "data": <payload> }
```

Mọi endpoint `[Authorize]` yêu cầu header `Authorization: Bearer <token>`.

### 6.1 Auth — `/api/auth` (khớp `authApi.js`)

| Method | Path | Auth | FE call |
|---|---|---|---|
| POST | `/api/auth/login` | Anonymous | `authApi.login()` |
| POST | `/api/auth/register` | Anonymous | `authApi.register()` |
| POST | `/api/auth/logout` | Authenticated | `authApi.logout()` |
| POST | `/api/auth/refresh` | Authenticated | `authApi.refreshToken()` |
| GET | `/api/auth/profile` | Authenticated | `authApi.getProfile()` |
| POST | `/api/auth/change-password` | Authenticated | (bonus) |

### 6.2 Users — `/api/users` (khớp `adminApi.js`)

| Method | Path | Auth | FE call |
|---|---|---|---|
| GET | `/api/users?page&limit&search&role` | Admin, Trưởng phòng | `adminApi.getUsers()` |
| GET | `/api/users/{id}` | Admin, Trưởng phòng | `adminApi.getUserById()` |
| POST | `/api/users` | Admin | `adminApi.createUser()` |
| PUT | `/api/users/{id}` | Admin | `adminApi.updateUser()` |
| DELETE | `/api/users/{id}` | Admin | `adminApi.deleteUser()` |
| PATCH | `/api/users/{id}/status` | Admin | (bonus — khoá/mở TK) |

### 6.3 Children — `/api/children` (khớp `childApi.js`)

| Method | Path | Auth | FE call |
|---|---|---|---|
| GET | `/api/children?page&limit&status&search` | Authenticated | `childApi.getAll()` |
| GET | `/api/children/{id}` | Authenticated | `childApi.getById()` |
| POST | `/api/children` | Admin, Tiếp nhận, Trưởng phòng | `childApi.create()` |
| PUT | `/api/children/{id}` | Admin, Tiếp nhận, Nhận nuôi, Trưởng phòng | `childApi.update()` |
| DELETE | `/api/children/{id}` | Admin, Trưởng phòng | `childApi.delete()` |
| GET | `/api/children/{id}/vaccinations` | Authenticated | — |
| GET | `/api/children/{id}/health` | Authenticated | — |

### 6.4 Receptions — `/api/receptions` (khớp `receptionApi.js`)

| Method | Path | Auth | FE call |
|---|---|---|---|
| GET | `/api/receptions?page&limit&status&senderId` | Authenticated | `receptionApi.getAll()` |
| GET | `/api/receptions/{id}` | Authenticated | `receptionApi.getById()` |
| POST | `/api/receptions` | Người gửi, Tiếp nhận, Trưởng phòng, Admin | `receptionApi.create()` |
| PUT | `/api/receptions/{id}` | Người gửi, Tiếp nhận, Trưởng phòng, Admin | `receptionApi.update()` |
| POST | `/api/receptions/{id}/approve` | Tiếp nhận, Trưởng phòng, Admin | `receptionApi.approve()` |
| POST | `/api/receptions/{id}/reject` | Tiếp nhận, Trưởng phòng, Admin | `receptionApi.reject()` |

> `POST /approve` thực thi đầy đủ logic `sp_DuyetYeuCauGuiTre`: tạo bản ghi `TRE` từ `THONGTINTRETAM`, tạo/ cập nhật `HOSOTIEPNHANTRE`, đổi trạng thái yêu cầu sang `"Đã tiếp nhận"`.

### 6.5 Adoptions — `/api/adoptions` (khớp `adoptionApi.js`)

| Method | Path | Auth | FE call |
|---|---|---|---|
| GET | `/api/adoptions?page&limit&status&adopterId` | Authenticated | `adoptionApi.getAll()` |
| GET | `/api/adoptions/{id}` | Authenticated | `adoptionApi.getById()` |
| POST | `/api/adoptions` | Người nhận nuôi, Nhận nuôi, Trưởng phòng, Admin | `adoptionApi.create()` |
| PUT | `/api/adoptions/{id}` | Người nhận nuôi, Nhận nuôi, Trưởng phòng, Admin | `adoptionApi.update()` |
| POST | `/api/adoptions/{id}/approve` | Nhận nuôi, Trưởng phòng, Admin | `adoptionApi.approve()` |
| POST | `/api/adoptions/{id}/reject` | Nhận nuôi, Trưởng phòng, Admin | `adoptionApi.reject()` |

### 6.6 Stats — `/api/stats` (khớp `adminApi.getStats`)

| Method | Path | Auth |
|---|---|---|
| GET | `/api/stats` | Authenticated |
| GET | `/api/stats/children-by-status` | Authenticated |
| GET | `/api/stats/requests-by-month` | Authenticated |

### 6.7 Các endpoint phụ (BE đã cover đầy đủ theo Word doc)

| Nhóm | Route | Ghi chú |
|---|---|---|
| Hồ sơ tiếp nhận | `/api/reception-profiles` | CRUD |
| Hồ sơ nhận nuôi | `/api/adoption-profiles` | CRUD + approve (chuyển `TRE.TrangThai = "Đã nhận nuôi"`) |
| Lịch hẹn gặp mặt | `/api/adoption-meetings` | CRUD lịch hẹn gặp mặt nhận nuôi |
| Giấy tờ pháp lý | `/api/documents` | CRUD + `/upload` (multipart) + `/{id}/verify` |
| Sức khoẻ | `/api/health-records` | CRUD theo dõi sức khoẻ |
| Tiêm chủng | `/api/vaccinations` | CRUD lịch sử tiêm chủng |
| Danh mục | `/api/lookups/*` | Tỉnh/TP, Phường/Xã, Vắc xin, enum trạng thái — **AllowAnonymous** |
| Vai trò | `/api/roles` + `/permissions` | Admin, Trưởng phòng |

---

## 7. Kết nối FE (DAPM-FE)

FE hiện đang dùng **mock data** (`src/api/mockData.js`). Để kết nối với BE thật, làm **2 bước**:

### Bước 1 — sửa `src/api/axiosClient.js` để unwrap `ApiResponse`

```js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  // BE luôn trả { success, message, data } -> unwrap data
  (response) => response.data?.data ?? response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    const payload = error.response?.data;
    return Promise.reject(new Error(payload?.message || error.message));
  }
);

export default axiosClient;
```

### Bước 2 — thay 5 file API trong `src/api/` bằng bản real (xem mục `FE-REAL-API/` trong folder BE này — copy đè lên FE).

File tham khảo sẵn ở `BE/FE-REAL-API/`:

```
authApi.js       -> src/api/authApi.js
childApi.js      -> src/api/childApi.js
adoptionApi.js   -> src/api/adoptionApi.js
receptionApi.js  -> src/api/receptionApi.js
adminApi.js      -> src/api/adminApi.js
```

Sau đó:

```bash
cd FE/DAPM-FE/btxh-frontend
npm install
npm run dev           # mở http://localhost:5173
```

Đảm bảo BE đang chạy ở `http://localhost:8080` trước khi mở FE.

---

## 8. Cấu trúc project

```
BE/
├─ QLTTBTXH.sln
├─ README.md                            # file này
├─ FE-REAL-API/                         # bản FE api đã refactor (copy sang src/api)
│   ├─ axiosClient.js
│   ├─ authApi.js
│   ├─ childApi.js
│   ├─ adoptionApi.js
│   ├─ receptionApi.js
│   └─ adminApi.js
└─ QLTTBTXH.API/
    ├─ Program.cs                       # startup: JWT + CORS + Swagger + pipeline
    ├─ appsettings.json
    ├─ Properties/launchSettings.json   # port 8080, launchUrl=swagger
    ├─ QLTTBTXH.API.csproj
    ├─ Data/
    │   └─ QuanLyTTBTContext.cs         # DbContext (Fluent API, composite keys)
    ├─ Models/Entities/                 # 18 entities (TRE, NGUOIDUNG, YEUCAUGUITRE...)
    ├─ DTOs/
    │   ├─ Common/                      # ApiResponse, PagedResult, QueryParams
    │   ├─ Auth/                        # LoginDto, RegisterDto, AuthResponseDto...
    │   ├─ NguoiDung/, Tre/, YeuCau*/, HoSo*/, GiayTo/, ...
    │   └─ DanhMuc/
    ├─ Services/
    │   ├─ IJwtService.cs · JwtService.cs
    │   ├─ IPasswordService.cs · PasswordService.cs (BCrypt + plain fallback)
    │   ├─ ICodeGenerator.cs · CodeGenerator.cs    (sinh mã ND/TRE/YCGT/...)
    │   └─ Roles.cs                                (ADMI/QLNT/QLNN/NGGT/NGNN/TPQL)
    └─ Controllers/
        ├─ AuthController.cs
        ├─ NguoiDungController.cs                  -> /api/users
        ├─ TreController.cs                        -> /api/children
        ├─ YeuCauGuiTreController.cs               -> /api/receptions
        ├─ YeuCauNhanNuoiController.cs             -> /api/adoptions
        ├─ HoSoTiepNhanController.cs               -> /api/reception-profiles
        ├─ HoSoNhanNuoiController.cs               -> /api/adoption-profiles
        ├─ GiayToController.cs                     -> /api/documents
        ├─ TheoDoiSucKhoeController.cs             -> /api/health-records
        ├─ LichSuTiemChungController.cs            -> /api/vaccinations
        ├─ DanhMucController.cs                    -> /api/lookups
        ├─ VaiTroController.cs                     -> /api/roles
        └─ DashboardController.cs                  -> /api/stats
```

---

## 9. Troubleshooting

| Lỗi | Cách xử lý |
|---|---|
| `A connection was successfully established with the server, but then an error occurred during the login` | Kiểm tra `TrustServerCertificate=True;` trong connection string |
| `Cannot open database "QuanLyTTBT"` | Chạy lại `SQLQuery1.sql` để tạo DB |
| `IDX10720: Unable to decode the header ... 'Key size must be at least 256 bits'` | `Jwt:Key` phải ít nhất **32 ký tự** |
| FE gọi BE bị CORS | Đảm bảo origin FE có trong `Cors:AllowedOrigins` của `appsettings.json` |
| 401 khi gọi endpoint trong Swagger | Bấm **Authorize** và dán token, không kèm tiền tố `Bearer` |
| File upload 413 | Kiểm tra `FormOptions.MultipartBodyLengthLimit` hoặc giới hạn reverse proxy |

---

## 10. Logic nghiệp vụ quan trọng đã cài đặt

- **Sinh mã tự động** (`Services/CodeGenerator.cs`): `ND######`, `TRE#####`, `YCGT####`, `YCNN####`, `HSTN#####`, `HSNN#####`, `GTPL#####`, `TTTT#####`, `LSTC####`, `TDSK####` — map 1:1 với các function `fn_TaoMa*` trong SQL.
- **Duyệt yêu cầu gửi trẻ** (`YeuCauGuiTreController.Approve`) — thay thế `sp_DuyetYeuCauGuiTre`:
  1. Validate yêu cầu đang ở trạng thái `"Chờ xử lý"` / `"Đang xem xét"`.
  2. Lấy `THONGTINTRETAM` gắn với yêu cầu → tạo bản ghi `TRE` mới (mã `TRE#####`).
  3. Insert / update `HOSOTIEPNHANTRE` cho trẻ vừa tạo.
  4. Cập nhật `YEUCAUGUITRE.TrangThaiYC = "Đã tiếp nhận"`, ghi người duyệt + thời điểm.
  5. Toàn bộ trong một transaction của `DbContext`.
- **Duyệt yêu cầu nhận nuôi**: đổi `YEUCAUNHANNUOI.TrangThai = "Đã duyệt"`, đồng bộ `HOSONHANNUOI` (nếu approve hồ sơ thì `TRE.TrangThai = "Đã nhận nuôi"`).
- **Xác minh giấy tờ** (`GiayToController.Verify`): cập nhật trạng thái (`Hợp lệ` / `Không hợp lệ` / `Cần bổ sung` / `Hết hạn`) + người xác minh + ngày.
- **Phân quyền theo vai trò**: dùng `[Authorize(Roles = Roles.ADMIN + "," + Roles.TRUONG_PHONG)]` trên từng action — token JWT được cấp với claim `ClaimTypes.Role` đúng theo `NGUOIDUNG_VAITRO`.

---

## 11. Checklist tính năng theo Word doc (DAPM_Nhom33_QLTTBTXH)

- [x] Đăng nhập / đăng ký / đổi mật khẩu / refresh token
- [x] Quản lý người dùng (Admin): CRUD + khoá/mở tài khoản + gán vai trò
- [x] Quản lý vai trò & quyền hạn
- [x] Quản lý thông tin trẻ: CRUD + xem chi tiết + lịch sử tiêm chủng + theo dõi sức khoẻ
- [x] Tiếp nhận trẻ: tạo yêu cầu gửi trẻ, bổ sung thông tin trẻ tạm, upload giấy tờ
- [x] Duyệt yêu cầu gửi trẻ (tự động tạo `TRE` + `HOSOTIEPNHANTRE`)
- [x] Nhận nuôi: tạo yêu cầu, duyệt, ghép trẻ (`HOSONHANNUOI`)
- [x] Quản lý giấy tờ pháp lý (upload + xác minh)
- [x] Danh mục: Tỉnh/TP, Phường/Xã, Vắc xin, trạng thái
- [x] Thống kê dashboard: tổng user, tổng trẻ theo trạng thái, yêu cầu theo tháng
- [x] Swagger UI + JWT Authorize button
- [x] CORS cho FE `http://localhost:5173`

---

Nếu có lỗi khi build/chạy, kiểm tra lần lượt: connection string → SQL đã chạy `SQLQuery1.sql` chưa → port 8080 có bị chiếm không → `Jwt:Key` đủ 32 ký tự chưa.
