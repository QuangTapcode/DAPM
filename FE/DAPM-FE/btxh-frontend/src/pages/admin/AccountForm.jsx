import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import Button from '../../components/common/Button';
import { ROLES } from '../../utils/constants';

const ROLE_OPTIONS = [
  { value: ROLES.SENDER,          label: 'Người gửi trẻ' },
  { value: ROLES.ADOPTER,         label: 'Người nhận nuôi' },
  { value: ROLES.STAFF_RECEPTION, label: 'Cán bộ tiếp nhận' },
  { value: ROLES.STAFF_ADOPTION,  label: 'Cán bộ nhận nuôi' },
  { value: ROLES.MANAGER,         label: 'Trưởng phòng' },
  { value: ROLES.ADMIN,           label: 'Admin' },
];

export default function AccountForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (isEdit) {
      adminApi.getUserById(id).then(reset).catch(console.error);
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    if (isEdit) {
      await adminApi.updateUser(id, data);
    } else {
      await adminApi.createUser(data);
    }
    navigate('/admin/accounts');
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
          <input {...register('fullName', { required: 'Bắt buộc' })} className={fieldClass} />
          {errors.fullName && <p className={errClass}>{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" {...register('email', { required: 'Bắt buộc' })} className={fieldClass} />
          {errors.email && <p className={errClass}>{errors.email.message}</p>}
        </div>

        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input type="password" {...register('password', { required: 'Bắt buộc', minLength: { value: 6, message: 'Tối thiểu 6 ký tự' } })} className={fieldClass} />
            {errors.password && <p className={errClass}>{errors.password.message}</p>}
          </div>
        )}

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input {...register('phone')} className={fieldClass} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isSubmitting}>{isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Hủy</Button>
        </div>
      </form>
    </div>
  );
}
