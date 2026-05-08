import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ProfileForm from '../../components/profile/ProfileForm';
import { isSenderProfileComplete } from '../../utils/profileComplete';

export default function SenderProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, updateUser } = useAuth();

  const handleSave = async (payload) => {
    console.log('Update sender profile:', payload);

    // Sau này thay bằng API thật:
    // const updatedUser = await senderApi.updateProfile(user.id, payload);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const nextUser = {
      ...user,
      ...payload,
    };

    updateUser(payload);

    if (isSenderProfileComplete(nextUser)) {
      const from = location.state?.from;

      navigate(from || '/gui-tre/tao-yeu-cau', {
        replace: true,
      });
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