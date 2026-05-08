import { useAuth } from '../../hooks/useAuth';
import ProfileForm from '../../components/profile/ProfileForm';
import authApi from '../../api/authApi';

export default function SenderProfile() {
  const { user } = useAuth();

  const handleSave = async (payload) => {
    await authApi.updateProfile({
      FullName: payload.fullName,
      SDT: payload.phone,
      CCCD: payload.nationalId,
      GioiTinh: payload.gender,
      NgaySinh: payload.dateOfBirth || null,
      DiaChiCuThe: payload.addressDetail || '',
    });
  };

  return (
    <ProfileForm
      user={user}
      formId="sender-profile-form"
      title="Thông tin cá nhân"
      description="Cập nhật thông tin chính xác để trung tâm thuận tiện liên hệ và xử lý hồ sơ gửi trẻ."
      onSave={handleSave}
    />
  );
}