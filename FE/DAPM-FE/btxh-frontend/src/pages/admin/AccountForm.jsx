import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import Button from '../../components/common/Button';

// BE role codes — phải khớp với Roles.cs bên BE
const ROLE_OPTIONS = [
  { value: 'ADMI', label: 'Admin' },
  { value: 'TPQL', label: 'Trưởng phòng' },
  { value: 'QLNT', label: 'Cán bộ tiếp nhận' },
  { value: 'QLNN', label: 'Cán bộ nhận nuôi' },
  { value: 'NGGT', label: 'Người gửi trẻ' },
  { value: 'NGNN', label: 'Người nhận nuôi' },
];

export default function AccountForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { password: '123456', gioiTinh: 'Nam' },
  });

  useEffect(() => {
    if (!isEdit) return;
    adminApi.getUserById(id).then((u) => {
      // BE trả về camelCase: hoTen/fullName, sDT/phone, email, roles (array)
      reset({
        hoTen: u.hoTen || u.fullName || '',
        sdt: u.sDT || u.phone || '',
        email: u.email || '',
        role: (u.roles || [])[0] || '',
      });
    }).catch(console.error);
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    // Gửi PascalCase theo đúng UpdateNguoiDungDto / CreateNguoiDungDto của BE
    const payload = {
      HoTen: data.hoTen,
      SDT: data.sdt,
      Email: data.email,
      GioiTinh: data.gioiTinh || 'Nam',
      Roles: data.role ? [data.role] : undefined,
      ...(!isEdit && { Password: data.password }),
    };

    try {
      if (isEdit) {
        await adminApi.updateUser(id, payload);
      } else {
        await adminApi.createUser(payload);
      }
      navigate('/admin/accounts');
    } catch (err) {
      alert('Lỗi: ' + (err?.message || 'Không thể lưu tài khoản'));
    }
  };

  const fieldClass = 'w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';
  const errClass = 'text-red-500 text-xs mt-1';

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        {isEdit ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
          <input {...register('hoTen', { required: 'Bắt buộc' })} className={fieldClass} />
          {errors.hoTen && <p className={errClass}>{errors.hoTen.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" {...register('email')} className={fieldClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input {...register('sdt', { required: 'Bắt buộc' })} className={fieldClass} placeholder="0xxxxxxxxx" />
          {errors.sdt && <p className={errClass}>{errors.sdt.message}</p>}
        </div>

        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu <span className="text-gray-400 font-normal">(mặc định 123456)</span>
            </label>
            <input
              type="text"
              {...register('password', { required: 'Bắt buộc', minLength: { value: 6, message: 'Tối thiểu 6 ký tự' } })}
              className={fieldClass}
            />
            {errors.password && <p className={errClass}>{errors.password.message}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
          <select {...register('gioiTinh')} className={fieldClass}>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
          <select {...register('role', { required: 'Bắt buộc' })} className={fieldClass}>
            <option value="">-- Chọn vai trò --</option>
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.role && <p className={errClass}>{errors.role.message}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isSubmitting}>{isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Hủy</Button>
        </div>
      </form>
    </div>
  );
}
