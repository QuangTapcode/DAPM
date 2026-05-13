# BTXH Frontend — Hệ thống Quản lý Trẻ Bảo trợ Xã hội

Frontend React cho **Hệ thống Quản lý Thông tin Trẻ Bảo trợ Xã hội** (DAPM Nhóm 33).

> Tech stack: **React 19 · Vite · React Router 7 · Axios · Tailwind CSS 4 · Recharts**

---

## 1. Yêu cầu

- Node.js **18** trở lên
- Backend đang chạy tại `http://localhost:8080` (xem `BE/README.md`)

---

## 2. Cài đặt & chạy

```bash
cd FE/DAPM-FE/btxh-frontend
npm install
npm run dev        # http://localhost:5173
```

Các lệnh khác:

```bash
npm run build      # Build production → dist/
npm run preview    # Preview bản build
npm run lint       # Kiểm tra ESLint
```

---

## 3. Biến môi trường

File `.env` (đã có sẵn trong repo):

```env
VITE_API_URL=http://localhost:8080/api
```

Thay đổi nếu BE chạy ở port khác.

---

## 4. Tài khoản đăng nhập (mật khẩu `123456`)

| Email | Vai trò |
|---|---|
| `admin@ttbt.vn` | Quản trị viên |
| `tiepnhan@ttbt.vn` | Cán bộ tiếp nhận |
| `nhannuoi@ttbt.vn` | Cán bộ nhận nuôi & Trưởng phòng |
| `nguoigui1@gmail.com` | Người gửi / Người nhận nuôi |
| `nguoigui2@gmail.com` | Người gửi / Người nhận nuôi |
| `nguoinhan1@gmail.com` | Người gửi / Người nhận nuôi |

> Tài khoản được tạo khi chạy `SQLQuery1.sql` trên SQL Server.

---

## 5. Cấu trúc thư mục

```
src/
├── api/                   # Axios clients theo domain
│   ├── axiosClient.js     # Instance dùng chung, tự unwrap ApiResponse + gắn Bearer token
│   ├── authApi.js         # /auth/*
│   ├── childApi.js        # /children/*
│   ├── adoptionApi.js     # /adoptions/*
│   ├── receptionApi.js    # /receptions/*
│   ├── adminApi.js        # /users, /stats, /lookups, /roles
│   └── receptionProfileApi.js
├── components/
│   ├── common/            # Button, Badge, Modal, Table, Pagination, FormField...
│   └── layout/            # GuestLayout, UserLayout, AdminLayout
├── context/
│   ├── AuthContext.jsx    # Login/logout/session với JWT thật
│   └── NotificationContext.jsx
├── hooks/
│   ├── useAuth.js
│   └── useFetch.js
├── pages/                 # Phân theo vai trò
│   ├── guest/
│   ├── sender/            # Người gửi trẻ
│   ├── adopter/           # Người nhận nuôi
│   ├── staff-reception/   # Nhân viên tiếp nhận
│   ├── staff-adoption/    # Nhân viên nhận nuôi
│   ├── manager/           # Trưởng phòng
│   └── admin/             # Quản trị viên
├── routes/
│   └── AppRouter.jsx      # Route guards + layout theo role
└── utils/
    ├── constants.js       # ROLES, REQUEST_STATUS, labels, colors
    ├── formatDate.js
    └── validators.js
```

---

## 6. Phân quyền theo vai trò

| Role key (FE) | Mã BE | Mô tả |
|---|---|---|
| `admin` | ADMI | Quản trị viên |
| `staff-reception` | QLNT | Cán bộ tiếp nhận |
| `staff-adoption` | QLNN | Cán bộ nhận nuôi |
| `manager` | TPQL | Trưởng phòng |
| `sender` | NGGT | Người gửi trẻ |
| `adopter` | NGNN | Người nhận nuôi |

---

## 7. Kết nối với Backend

- `axiosClient.js` tự động thêm `Authorization: Bearer <token>` vào mọi request
- Response BE đóng gói `{ success, message, data }` — axiosClient tự unwrap `data`
- Khi token hết hạn (401), tự động xoá token và redirect về `/login`
- Token lưu tại `localStorage.token`
