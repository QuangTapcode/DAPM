# Cấu Trúc Dự Án React - Hệ Thống QLTT Bảo Trợ Xã Hội Trẻ Em Mồ Côi

## 🏗️ Cấu Trúc Thư Mục

```
src/
├── api/                        # Tất cả API calls (axios)
│   ├── authApi.js
│   ├── childApi.js
│   ├── adoptionApi.js
│   ├── receptionApi.js
│   └── adminApi.js
│
├── assets/                     # Hình ảnh, icon tĩnh
│
├── components/                 # UI Components dùng chung (KHÔNG ai sở hữu riêng)
│   ├── common/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   ├── Badge.jsx           # Trạng thái (Đang chờ, Đã duyệt, Từ chối...)
│   │   ├── FileUpload.jsx
│   │   ├── Pagination.jsx
│   │   └── NotFound.jsx
│   └── layout/
│       ├── GuestLayout.jsx     # Layout cho khách vãng lai
│       ├── UserLayout.jsx      # Layout cho user đã đăng nhập
│       └── AdminLayout.jsx     # Layout cho admin
│
├── context/
│   ├── AuthContext.jsx         # Quản lý auth state toàn cục
│   └── NotificationContext.jsx
│
├── hooks/
│   ├── useAuth.js
│   └── useFetch.js
│
├── pages/                      # ← PHÂN CHIA THEO NGƯỜI LÀM (xem bên dưới)
│   ├── guest/
│   ├── sender/
│   ├── adopter/
│   ├── staff-reception/
│   ├── staff-adoption/
│   ├── manager/
│   └── admin/
│
├── routes/
│   └── AppRouter.jsx           # Route guard theo role
│
├── utils/
│   ├── constants.js            # ROLES, STATUS constants
│   ├── formatDate.js
│   └── validators.js
│
├── App.jsx
└── main.jsx
```

---

## 👥 PHÂN CHIA CHO 4 NGƯỜI

> **Nguyên tắc:** Mỗi người sở hữu thư mục `pages/` riêng. Không ai được sửa thư mục của người khác. Components dùng chung đặt trong `components/common/` - cần thảo luận nhóm trước khi thêm.

---

### 👤 Người 1 — Auth + Guest + Admin

**Thư mục sở hữu:**
- `src/pages/guest/`
- `src/pages/admin/`
- `src/context/AuthContext.jsx`
- `src/routes/AppRouter.jsx`
- `src/api/authApi.js`, `src/api/adminApi.js`

**Pages cần làm:**

```
pages/guest/
├── HomePage.jsx            # Trang chủ, thông tin trung tâm
├── GuidePage.jsx           # Hướng dẫn gửi trẻ / nhận nuôi
├── LoginPage.jsx           # Đăng nhập chung
└── RegisterPage.jsx        # Đăng ký tài khoản

pages/admin/
├── DashboardAdmin.jsx      # Tổng quan admin
├── AccountList.jsx         # Danh sách tài khoản
├── AccountForm.jsx         # Thêm/sửa tài khoản
└── RoleManagement.jsx      # Phân quyền
```

**Trách nhiệm thêm:**
- Cài đặt `react-router-dom`, cấu hình route
- `AuthContext` (lưu token, role, user info)
- Route guard: redirect đúng dashboard theo role sau login

---

### 👤 Người 2 — Người Gửi Trẻ + Người Nhận Nuôi

**Thư mục sở hữu:**
- `src/pages/sender/`
- `src/pages/adopter/`
- `src/api/receptionApi.js` (phần tạo yêu cầu)
- `src/api/adoptionApi.js` (phần tạo yêu cầu)

**Pages cần làm:**

```
pages/sender/
├── SenderDashboard.jsx         # Trang chính sau login
├── CreateChildRequest.jsx      # Tạo yêu cầu gửi trẻ (form nhiều bước)
├── UpdateChildRequest.jsx      # Cập nhật yêu cầu
├── RequestStatus.jsx           # Xem trạng thái yêu cầu
├── SentChildInfo.jsx           # Xem thông tin trẻ đã gửi
└── SenderProfile.jsx           # Thông tin cá nhân

pages/adopter/
├── AdopterDashboard.jsx        # Trang chính
├── ChildrenList.jsx            # Danh sách trẻ có thể nhận nuôi
├── ChildDetail.jsx             # Xem chi tiết thông tin trẻ
├── CreateAdoptionRequest.jsx   # Tạo yêu cầu nhận nuôi + upload giấy tờ
├── UpdateAdoptionRequest.jsx   # Cập nhật yêu cầu
├── AdoptionStatus.jsx          # Xem trạng thái yêu cầu
└── AdopterProfile.jsx          # Thông tin cá nhân
```

---

### 👤 Người 3 — Cán Bộ Tiếp Nhận Trẻ

**Thư mục sở hữu:**
- `src/pages/staff-reception/`
- `src/api/childApi.js`

**Pages cần làm:**

```
pages/staff-reception/
├── ReceptionDashboard.jsx      # Tổng quan, thống kê nhanh
├── ChildRequestList.jsx        # Danh sách yêu cầu gửi trẻ chờ xử lý
├── ChildRequestDetail.jsx      # Chi tiết hồ sơ gửi trẻ + xét duyệt
├── CreateReceptionProfile.jsx  # Lập hồ sơ tiếp nhận trẻ (sau khi duyệt)
├── ChildList.jsx               # Danh sách tất cả trẻ trong trung tâm
├── ChildForm.jsx               # Tạo / cập nhật thông tin trẻ
├── ChildHealthList.jsx         # Danh sách theo dõi sức khỏe
└── ChildHealthForm.jsx         # Tạo / cập nhật sức khỏe trẻ
```

---

### 👤 Người 4 — Cán Bộ Nhận Nuôi + Trưởng Phòng

**Thư mục sở hữu:**
- `src/pages/staff-adoption/`
- `src/pages/manager/`
- `src/api/adoptionApi.js` (phần xử lý, duyệt)

**Pages cần làm:**

```
pages/staff-adoption/
├── AdoptionDashboard.jsx       # Tổng quan
├── AdoptionRequestList.jsx     # Danh sách yêu cầu nhận nuôi
├── AdoptionRequestDetail.jsx   # Chi tiết yêu cầu + đánh giá điều kiện
├── CreateAdoptionProfile.jsx   # Lập hồ sơ nhận nuôi (sau đánh giá đạt)
├── AdoptionChildList.jsx       # Danh sách trẻ thuộc trung tâm (read-only)
└── AdoptionChildDetail.jsx     # Xem chi tiết trẻ (read-only)

pages/manager/
├── ManagerDashboard.jsx        # Tổng quan + số liệu nhanh
├── PendingProfileList.jsx      # Danh sách hồ sơ chờ duyệt (gửi + nhận nuôi)
├── ProfileApproval.jsx         # Xem chi tiết và xét duyệt hồ sơ
└── Statistics.jsx              # Thống kê hồ sơ trẻ (biểu đồ)
```

---

## 🔑 Constants & Types (file `utils/constants.js`)

```js
// Roles
export const ROLES = {
  ADMIN: 'admin',
  GUEST: 'guest',
  SENDER: 'sender',
  ADOPTER: 'adopter',
  STAFF_RECEPTION: 'staff_reception',
  STAFF_ADOPTION: 'staff_adoption',
  MANAGER: 'manager',
};

// Trạng thái yêu cầu
export const REQUEST_STATUS = {
  PENDING: 'pending',            // Đang chờ xử lý
  MISSING_INFO: 'missing_info',  // Thiếu thông tin
  INVALID: 'invalid',            // Không hợp lệ
  APPROVED: 'approved',          // Đã duyệt
  REJECTED: 'rejected',          // Từ chối
};
```

---

## 🌐 Route Map (`AppRouter.jsx`)

| Path | Component | Role |
|------|-----------|------|
| `/` | HomePage | Guest |
| `/huong-dan` | GuidePage | Guest |
| `/dang-nhap` | LoginPage | Guest |
| `/dang-ky` | RegisterPage | Guest |
| `/gui-tre/*` | Sender pages | SENDER |
| `/nhan-nuoi/*` | Adopter pages | ADOPTER |
| `/can-bo-tiep-nhan/*` | Staff Reception pages | STAFF_RECEPTION |
| `/can-bo-nhan-nuoi/*` | Staff Adoption pages | STAFF_ADOPTION |
| `/truong-phong/*` | Manager pages | MANAGER |
| `/admin/*` | Admin pages | ADMIN |

---

## 📦 Dependencies cần cài

```bash
npm create vite@latest btxh-frontend -- --template react
cd btxh-frontend
npm install
npm install react-router-dom axios
npm install react-hook-form         # Form validation
npm install recharts                # Biểu đồ thống kê (Manager)
npm install @headlessui/react       # Modal, Dropdown
npm install tailwindcss             # Styling
```

---

## 🤝 Quy ước làm việc nhóm

1. **Branch Git:** Mỗi người tạo branch riêng theo tên: `feature/person1-auth`, `feature/person2-sender`, v.v.
2. **Shared components:** Nếu cần thêm component vào `components/common/`, tạo PR và thông báo nhóm.
3. **API:** Mỗi người tự viết phần gọi API trong file `api/` tương ứng với trang mình làm.
4. **Không sửa:** `App.jsx`, `main.jsx`, `AuthContext.jsx` nếu không thông báo nhóm.
5. **Mock data:** Giai đoạn đầu dùng mock data trong từng page, sau khi có BE thì thay bằng API call.
