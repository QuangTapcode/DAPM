# API Layer — BTXH Frontend

Tất cả các file trong thư mục này giao tiếp trực tiếp với **Backend ASP.NET Core** tại `http://localhost:8080/api`.

## Cấu trúc

| File | Endpoint BE | Mô tả |
|---|---|---|
| `axiosClient.js` | — | Axios instance dùng chung: tự gắn Bearer token, unwrap `ApiResponse<T>` |
| `authApi.js` | `/auth/*` | Đăng nhập, đăng ký, lấy profile, đổi mật khẩu, refresh token |
| `childApi.js` | `/children/*` | CRUD trẻ, lịch sử tiêm chủng, theo dõi sức khoẻ, upload giấy tờ |
| `adoptionApi.js` | `/adoptions/*` | CRUD yêu cầu nhận nuôi, duyệt/từ chối, upload giấy tờ |
| `receptionApi.js` | `/receptions/*` | CRUD yêu cầu gửi trẻ, duyệt/từ chối, upload giấy tờ |
| `adminApi.js` | `/users`, `/stats`, `/lookups`, `/roles` | Quản lý người dùng, thống kê, danh mục tra cứu |
| `receptionProfileApi.js` | `/reception-profiles/*` | Hồ sơ tiếp nhận |

## Cách dùng

```js
import authApi from './authApi';
import childApi from './childApi';

// Đăng nhập — trả { token, user }
const { token, user } = await authApi.login({ email, password });

// Lấy danh sách trẻ
const data = await childApi.getAll({ page: 1, limit: 10 });
```

## Format response

BE luôn trả `{ success, message, data }`. `axiosClient` tự unwrap `data` nên các API module nhận thẳng payload:

```json
// BE trả:
{ "success": true, "message": "OK", "data": { "token": "...", "user": { ... } } }

// Sau khi axiosClient unwrap, login() nhận:
{ "token": "...", "user": { ... } }
```

## Lưu ý

- Phải đảm bảo BE đang chạy ở `http://localhost:8080` trước khi khởi động FE
- Token JWT lưu tại `localStorage.token` — xoá tự động khi nhận 401
- Upload file dùng `multipart/form-data` (axiosClient tự điều chỉnh Content-Type)
