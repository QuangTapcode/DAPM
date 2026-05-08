# CLAUDE.md — DAPM-FE (Hệ thống Quản lý Chăm sóc Trẻ em)

## Tổng quan dự án

Đây là frontend cho hệ thống quản lý bảo trợ xã hội — tiếp nhận và cho nhận nuôi trẻ em.  
Dự án được phát triển theo nhóm, mỗi thành viên phụ trách một nhóm trang theo vai trò.  
Toàn bộ nội dung UI và tài liệu bằng **tiếng Việt**.

Thư mục làm việc chính: `btxh-frontend/`

---

## Lệnh thường dùng

```bash
# Chạy từ thư mục btxh-frontend/
npm run dev       # Dev server tại localhost:5173
npm run build     # Build production → dist/
npm run lint      # Kiểm tra ESLint
npm run preview   # Preview bản build
```

---

## Tech Stack

| Thành phần | Thư viện/Phiên bản |
|---|---|
| Framework | React 19.2.4 |
| Build tool | Vite 8.0.4 |
| Routing | react-router-dom 7.14 |
| HTTP | axios 1.15 (interceptor tự động gắn token) |
| Forms | react-hook-form 7.72.1 |
| Charts | recharts 3.8.1 |
| UI | @headlessui/react 2.2.10 |
| Styling | Tailwind CSS 4.2.2 |
| Linting | ESLint 9.39.4 |

---

## Cấu trúc thư mục

```
btxh-frontend/src/
├── api/                    # Axios clients theo domain
│   ├── axiosClient.js     # Instance dùng chung, tự gắn Bearer token
│   ├── authApi.js
│   ├── childApi.js
│   ├── adoptionApi.js
│   ├── adminApi.js
│   └── receptionApi.js
├── components/
│   ├── common/            # UI dùng chung — export qua index.js
│   │   ├── Button.jsx     # Variants: primary, accent, secondary, outline, danger, success, ghost
│   │   ├── Badge.jsx      # Status badge với color mapping
│   │   ├── Modal.jsx, Table.jsx, Pagination.jsx
│   │   ├── FormField.jsx, FileUpload.jsx
│   │   ├── PageHeader.jsx, SectionCard.jsx
│   │   └── Navbar.jsx, Sidebar.jsx, Footer.jsx
│   └── layout/
│       ├── GuestLayout.jsx
│       ├── UserLayout.jsx
│       └── AdminLayout.jsx
├── context/
│   ├── AuthContext.jsx    # Auth state + mock accounts cho dev
│   └── NotificationContext.jsx
├── hooks/
│   ├── useAuth.js         # Hook cho AuthContext
│   └── useFetch.js        # Data fetching (loading, error, refetch)
├── pages/                 # Trang phân theo vai trò
│   ├── guest/             # Trang công khai
│   ├── sender/            # Người gửi trẻ
│   ├── adopter/           # Người nhận nuôi
│   ├── staff-reception/   # Nhân viên tiếp nhận
│   ├── staff-adoption/    # Nhân viên cho nhận nuôi
│   ├── manager/           # Quản lý phòng ban
│   └── admin/             # Quản trị viên
├── routes/
│   └── AppRouter.jsx      # Route guards + layout nesting
└── utils/
    ├── constants.js       # ROLES, REQUEST_STATUS, labels/colors
    ├── formatDate.js
    └── validators.js
```

---

## Quy ước code

### Import components chung
```jsx
// Dùng barrel export — KHÔNG import trực tiếp từng file
import { Button, Badge, Modal, Table } from '@/components/common';
```

### API calls
```js
// Dùng axiosClient — token đã được gắn tự động qua interceptor
import axiosClient from './axiosClient';

export const getChildList = () => axiosClient.get('/children');
export const createChild = (data) => axiosClient.post('/children', data);
```

### Naming
- Component files: `PascalCase.jsx`
- Hook files: `camelCase.js` với prefix `use`
- Util files: `camelCase.js`
- Route paths: tiếng Việt không dấu, dạng kebab-case (vd: `/gui-tre`, `/nhan-nuoi`)

### Styling
- Dùng Tailwind utility classes, không viết CSS riêng trừ khi bắt buộc
- Màu chính: `#1d4ed8` (primary blue), `#f97316` (accent orange)
- Dùng `SectionCard` để bọc các section, `PageHeader` cho tiêu đề trang

---

## Hệ thống phân quyền

```js
// utils/constants.js
export const ROLES = {
  GUEST: 'guest',
  SENDER: 'sender',
  ADOPTER: 'adopter',
  STAFF_RECEPTION: 'staff-reception',
  STAFF_ADOPTION: 'staff-adoption',
  MANAGER: 'manager',
  ADMIN: 'admin',
};
```

Route guards nằm trong `AppRouter.jsx` — layout được chọn tự động theo role.

---

## Mock accounts (dev)

Được định nghĩa trong `AuthContext.jsx`. Password mặc định: `123456`

| Role | Username |
|---|---|
| sender / adopter | nguoigui1@gmail.com |
| staff-reception | tiepnhan@ttbt.vn |
| staff-adoption / manager | nhannuoi@ttbt.vn |
| admin | admin@ttbt.vn |

Auth dùng `localStorage` key: `mock_user` (dev), `token` (production).

---

## Biến môi trường

```env
VITE_API_URL=http://localhost:8080/api   # Mặc định nếu không có .env
```

---

## Nguyên tắc làm việc

- **Không sửa code của thành viên khác** — mỗi người phụ trách một nhóm trang riêng (xem `project-structure.md`)
- **Dùng lại component từ `common/`** trước khi tạo component mới
- **Thêm status/constant mới vào `utils/constants.js`**, không hardcode trong component
- **Không dùng mock data trong production** — kiểm tra `VITE_API_URL` trước khi deploy
- **Scaffolds mẫu** nằm trong file `scaffolds.jsx` ở root — tham khảo khi tạo page mới
