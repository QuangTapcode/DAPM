import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ProfileForm from '../../components/profile/ProfileForm';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { isAdopterProfileComplete } from '../../utils/profileComplete';

export default function AdopterProfile() {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const requiredProfile = searchParams.get('required') === '1';
  const profileComplete = isAdopterProfileComplete(user);

  const showRequiredMessage = requiredProfile && !profileComplete;

  const requiredMessage =
    location.state?.message ||
    'Bạn cần hoàn thiện thông tin cá nhân trước khi sử dụng chức năng nhận nuôi.';

  useEffect(() => {
    if (requiredProfile && profileComplete) {
      navigate('/nhan-nuoi/ho-so', { replace: true });
    }
  }, [requiredProfile, profileComplete, navigate]);

  const handleSave = async (payload) => {
    console.log('PAYLOAD PROFILE:', payload);

    await new Promise((resolve) => setTimeout(resolve, 600));

    updateUser(payload);

    navigate('/nhan-nuoi/tao-don', { replace: true });
  };

  return (
    <div className="w-full bg-[#f6f8fc] min-h-screen">
      <div className="max-w-[1500px] mx-auto px-3 lg:px-4 py-8">
        {showRequiredMessage && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
            <p className="text-sm font-bold text-amber-800">
              Yêu cầu hoàn thiện hồ sơ cá nhân
            </p>
            <p className="mt-1 text-sm leading-6 text-amber-700">
              {requiredMessage}
            </p>
          </div>
        )}

        <ProfileForm
          user={user}
          formId="adopter-profile-form"
          title="Thông tin cá nhân"
          description="Cập nhật thông tin chính xác để chúng tôi có thể hỗ trợ tốt nhất trong quá trình nhận nuôi và chăm sóc trẻ."
          onSave={handleSave}
        />
      </div>
    </div>
  );
}