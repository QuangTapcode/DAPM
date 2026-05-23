import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import authApi from '../../api/authApi';
import ProfileForm from '../../components/profile/ProfileForm';
import { isSenderProfileComplete } from '../../utils/profileComplete';

export default function SenderProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, updateUser } = useAuth();

  const handleSave = async (payload) => {
    const bePayload = {
      HoTen: payload.fullName,
      SDT: payload.phone,
      CCCD: payload.nationalId,
      GioiTinh: payload.gender,
      NgaySinh: payload.dateOfBirth || null,
      DiaChiCuThe: payload.addressDetail,
      MaXaPhuong: payload.maXaPhuong || user?.maXaPhuong || null,
    };

    const updated = await authApi.updateProfile(user.id, bePayload);

    const nextUser = { ...user, ...updated };
    updateUser(updated || bePayload);

    if (isSenderProfileComplete(nextUser)) {
      const from = location.state?.from;
      navigate(from || '/gui-tre/tao-yeu-cau', { replace: true });
    }
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