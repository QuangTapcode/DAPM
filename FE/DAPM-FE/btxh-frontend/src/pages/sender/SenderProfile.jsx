import { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import ProfileForm from '../../components/profile/ProfileForm';
import { isSenderProfileComplete } from '../../utils/profileComplete';
import authApi from '../../api/authApi';
import lookupApi from '../../api/lookupApi';

export default function SenderProfile() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [profile, setProfile] = useState(null);
  const [tinhTpOptions, setTinhTpOptions] = useState([]);
  const [phuongXaOptions, setPhuongXaOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const requiredProfile = searchParams.get('required') === '1';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, tinhTpRes, phuongXaRes] = await Promise.all([
          authApi.getProfile(),
          lookupApi.getTinhTp(),
          lookupApi.getPhuongXa(),
        ]);

        if (profileRes.success) {
          setProfile(profileRes.data);
        }

        if (tinhTpRes.success) {
          setTinhTpOptions(tinhTpRes.data);
        }

        if (phuongXaRes.success) {
          setPhuongXaOptions(phuongXaRes.data);
        }
      } catch (error) {
        console.error('Lỗi load sender profile:', error);
        alert(error?.message || 'Không thể tải thông tin cá nhân');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const currentPhuongXa = useMemo(() => {
    if (!profile?.maPhuongXa) return null;

    return phuongXaOptions.find(
      (item) => item.maPhuongXa === profile.maPhuongXa
    );
  }, [profile, phuongXaOptions]);

  const profileWithAddress = useMemo(() => {
    if (!profile) return null;

    return {
      ...profile,
      maTinhTP: profile.maTinhTP || currentPhuongXa?.maTinhTP || '',
      tenPhuongXa: profile.tenPhuongXa || currentPhuongXa?.tenPhuongXa || '',
      tenTinhTP: profile.tenTinhTP || '',
    };
  }, [profile, currentPhuongXa]);

  const profileComplete = isSenderProfileComplete(profileWithAddress);
  const showRequiredMessage = requiredProfile && !profileComplete;

  const requiredMessage =
    location.state?.message ||
    'Bạn cần hoàn thiện thông tin cá nhân trước khi sử dụng chức năng gửi trẻ.';

  const handleSave = async (payload) => {
    try {
      const res = await authApi.updateProfile(payload);

      if (res.success) {
        setProfile(res.data);
        alert('Cập nhật thông tin thành công');
      }
    } catch (error) {
      console.error('Lỗi cập nhật profile:', error);
      alert(error?.message || 'Cập nhật thông tin thất bại');
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[#f6f8fc] min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

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
          user={profileWithAddress}
          formId="sender-profile-form"
          title="Thông tin cá nhân"
          description="Cập nhật thông tin chính xác để trung tâm thuận tiện liên hệ và xử lý hồ sơ gửi trẻ."
          onSave={handleSave}
          provinceOptions={tinhTpOptions}
          wardOptions={phuongXaOptions}
        />
      </div>
    </div>
  );
}