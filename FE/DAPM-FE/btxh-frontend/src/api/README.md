# Mock Data Setup for BTXH Frontend

## Tổng quan

Dự án này đã được cấu hình để sử dụng **mock data** thay vì API thật, giúp phát triển giao diện nhanh chóng mà không cần backend.

## Dữ liệu mẫu có sẵn

### 1. Trẻ em (MOCK_CHILDREN)
- 3 trẻ em mẫu với thông tin đầy đủ
- Các trạng thái: available, pending
- Có thông tin sức khỏe, giấy tờ

### 2. Đơn nhận nuôi (MOCK_ADOPTIONS)
- 3 đơn nhận nuôi với các trạng thái khác nhau
- pending, approved, missing_info

### 3. Đơn tiếp nhận (MOCK_RECEPTIONS)
- 3 đơn gửi trẻ với các trạng thái
- approved, pending, rejected

### 4. Người dùng (MOCK_USERS)
- 6 tài khoản với các vai trò khác nhau

### 5. Thống kê (MOCK_STATS)
- Số liệu tổng quan cho admin dashboard

## Cách sử dụng

1. **Chạy dự án**: `npm run dev`
2. **Đăng nhập**: Sử dụng tài khoản mẫu ở trên
3. **Test các tính năng**: Tất cả CRUD operations đều hoạt động với mock data

## Chuyển sang API thật

Khi backend sẵn sàng:

1. Cập nhật `src/api/axiosClient.js` với URL thật
2. Thay thế các API files (`authApi.js`, `childApi.js`, etc.) về axios calls
3. Xóa file `mockData.js`
4. Cập nhật các import statements

## Ví dụ API calls với mock data

```javascript
// Login
await authApi.login({ email: 'admin@btxh.vn', password: '123456' });

// Get children
await childApi.getAll({ page: 1, limit: 10 });

// Create adoption request
await adoptionApi.create({
  childId: 1,
  reason: 'Gia đình tôi có điều kiện tốt...'
});
```

## Lưu ý

- Mock data được lưu trong memory, không persist khi refresh trang
- Tất cả operations đều simulate delay 300ms để giống API thật
- Error handling được implement đầy đủ
- Pagination và filtering được hỗ trợ