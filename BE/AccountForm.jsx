import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { Button } from '../../components/common';
import PageHeader from '../../components/common/PageHeader';

export default function AccountForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            Roles: []
        }
    });

    useEffect(() => {
        // 1. Lấy danh sách vai trò thực tế từ Backend
        const fetchRoles = async () => {
            try {
                const res = await adminApi.getRoles();
                setRoles(res || []);
            } catch (err) {
                console.error('Không thể lấy danh sách vai trò', err);
            }
        };

        // 2. Nếu là sửa, lấy thông tin user hiện tại
        const fetchUser = async () => {
            if (!isEdit) return;
            setLoading(true);
            try {
                const user = await adminApi.getUserById(id);
                // Ánh xạ dữ liệu từ API (CamelCase) sang form (PascalCase theo Backend DTO)
                reset({
                    HoTen: user.hoTen || user.fullName,
                    Email: user.email,
                    SDT: user.sdt || user.phone,
                    // Backend thường trả về mảng Roles hoặc chuỗi mã vai trò
                    Roles: Array.isArray(user.roles) ? user.roles[0]?.maVaiTro : user.roles
                });
            } catch (err) {
                alert('Không tìm thấy tài khoản');
                navigate('/admin/accounts');
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
        fetchUser();
    }, [id, isEdit, reset, navigate]);

    const onSubmit = async (data) => {
        try {
            // Chuẩn bị payload khớp với DTO của Backend
            const payload = {
                HoTen: data.HoTen,
                Email: data.Email,
                SDT: data.SDT,
                // Chuyển giá trị select đơn thành mảng Roles như Backend mong đợi
                Roles: Array.isArray(data.Roles) ? data.Roles : [data.Roles]
            };

            if (isEdit) {
                await adminApi.updateUser(id, payload);
                alert('Cập nhật thông tin và phân quyền thành công!');
            } else {
                // Nếu tạo mới thì cần gửi cả Password
                await adminApi.createUser({ ...payload, Password: data.Password });
                alert('Tạo tài khoản thành công!');
            }
            navigate('/admin/accounts');
        } catch (error) {
            alert(error.message || 'Có lỗi xảy ra khi lưu dữ liệu');
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

    const inputStyle = "w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all";

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <PageHeader
                title={isEdit ? 'Phân quyền & Chỉnh sửa' : 'Thêm tài khoản mới'}
                breadcrumbs={[
                    { label: 'Admin', to: '/admin' },
                    { label: 'Tài khoản', to: '/admin/accounts' },
                    { label: isEdit ? 'Cập nhật' : 'Thêm mới' }
                ]}
            />

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-xl rounded-2xl p-8 space-y-6 mt-6 border border-gray-100">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                    <input {...register('HoTen', { required: 'Vui lòng nhập họ tên' })} className={inputStyle} placeholder="Nguyễn Văn A" />
                    {errors.HoTen && <p className="text-red-500 text-xs mt-1">{errors.HoTen.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Tài khoản)</label>
                        <input type="email" {...register('Email', { required: 'Vui lòng nhập email' })} className={inputStyle} placeholder="email@example.com" />
                        {errors.Email && <p className="text-red-500 text-xs mt-1">{errors.Email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                        <input {...register('SDT')} className={inputStyle} placeholder="0905xxxxxx" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-blue-800 mb-2">Vai trò hệ thống (Phân quyền)</label>
                    <select {...register('Roles', { required: 'Vui lòng chọn ít nhất một vai trò' })} className={`${inputStyle} bg-blue-50 border-blue-200 font-medium`}>
                        <option value="">-- Chọn quyền hạn --</option>
                        {roles.map((r) => (
                            <option key={r.maVaiTro} value={r.maVaiTro}>{r.tenVaiTro} ({r.maVaiTro})</option>
                        ))}
                    </select>
                    {errors.Roles && <p className="text-red-500 text-xs mt-1">{errors.Roles.message}</p>}
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Hủy bỏ</Button>
                    <Button type="submit" loading={isSubmitting}>{isEdit ? 'Cập nhật & Phân quyền' : 'Tạo tài khoản'}</Button>
                </div>
            </form>
        </div>
    );
}