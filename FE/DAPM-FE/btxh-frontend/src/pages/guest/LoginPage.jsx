import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_REDIRECT } from '../../utils/constants';
import Button from '../../components/common/Button';
import logoImg from '../../assets/favicon.svg';
import hide_yey from '../../assets/hide.png';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data);
      navigate(ROLE_REDIRECT[user.role] || '/');
    } catch (err) {
      const errorMessage =
        err?.message || err?.error || err?.data?.message || 'Sai tài khoản hoặc mật khẩu';

      setError('root', {
        message: errorMessage,
      });
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#EEF4FC] px-4 py-12">
      {/* Ambient brand depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60rem 40rem at 15% -10%, rgba(41,121,255,0.10), transparent 60%), radial-gradient(50rem 36rem at 110% 110%, rgba(13,71,161,0.08), transparent 55%)',
        }}
      />

      <div className="relative w-full max-w-[460px] rounded-[22px] border border-[#E2EAF4] bg-white px-7 py-9 shadow-[0_16px_40px_rgba(16,42,90,0.14)] sm:px-9">
        <div className="mb-7 flex flex-col items-center text-center">
          <img src={logoImg} alt="Logo trung tâm bảo trợ xã hội" className="h-14 w-14 object-contain" />
          <h1 className="mt-4 text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-[#1A2B4B]">
            Chào mừng trở lại
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-[#5C728A]">
            Đăng nhập để tiếp tục sử dụng hệ thống.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-[#1A2B4B]">
              Email hoặc số điện thoại
            </label>

            <div className="flex h-12 items-center gap-2.5 rounded-xl border border-[#E2EAF4] bg-white px-3.5 transition focus-within:border-[#0D47A1] focus-within:ring-2 focus-within:ring-[#0D47A1]/12">
              <svg className="h-5 w-5 shrink-0 text-[#94A8BF]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.5 5.75A1.75 1.75 0 0 1 4.25 4h11.5A1.75 1.75 0 0 1 17.5 5.75v8.5A1.75 1.75 0 0 1 15.75 16H4.25A1.75 1.75 0 0 1 2.5 14.25v-8.5Zm1.75-.25a.25.25 0 0 0-.25.25v.215l6 3.75 6-3.75V5.75a.25.25 0 0 0-.25-.25H4.25Zm11.75 2.228-5.603 3.502a.75.75 0 0 1-.794 0L4 7.728v6.522c0 .138.112.25.25.25h11.5a.25.25 0 0 0 .25-.25V7.728Z" />
              </svg>

              <input
                id="login-email"
                type="text"
                placeholder="Nhập email hoặc số điện thoại"
                {...register('email', { required: 'Vui lòng nhập email hoặc số điện thoại' })}
                className="h-full w-full bg-transparent text-[15px] text-[#26364A] outline-none placeholder:text-[#9AACBF]"
              />
            </div>

            {errors.email && (
              <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="login-password" className="block text-sm font-semibold text-[#1A2B4B]">
                Mật khẩu
              </label>

              <button
                type="button"
                className="text-[13px] font-semibold text-[#0D47A1] hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>

            <div className="flex h-12 items-center gap-2.5 rounded-xl border border-[#E2EAF4] bg-white px-3.5 transition focus-within:border-[#0D47A1] focus-within:ring-2 focus-within:ring-[#0D47A1]/12">
              <svg className="h-5 w-5 shrink-0 text-[#94A8BF]" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 1.75A4.25 4.25 0 0 0 5.75 6v1.25H5A2.25 2.25 0 0 0 2.75 9.5v5A2.25 2.25 0 0 0 5 16.75h10A2.25 2.25 0 0 0 17.25 14.5v-5A2.25 2.25 0 0 0 15 7.25h-.75V6A4.25 4.25 0 0 0 10 1.75Zm2.75 5.5V6a2.75 2.75 0 1 0-5.5 0v1.25h5.5Z"
                  clipRule="evenodd"
                />
              </svg>

              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu của bạn"
                {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
                className="h-full w-full bg-transparent text-[15px] text-[#26364A] outline-none placeholder:text-[#9AACBF]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="shrink-0 text-[#94A8BF] transition hover:text-[#5C728A]"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 4.5c-4.09 0-7.205 2.677-8.34 5.192a.75.75 0 0 0 0 .616C2.795 12.823 5.91 15.5 10 15.5c4.09 0 7.205-2.677 8.34-5.192a.75.75 0 0 0 0-.616C17.205 7.177 14.09 4.5 10 4.5Zm0 9.5a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5Z" />
                    <path d="M10 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                  </svg>
                ) : (
                  <img src={hide_yey} alt="" className="h-5 w-5 object-contain" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <input
              id="remember"
              type="checkbox"
              {...register('remember')}
              className="h-4 w-4 rounded border border-[#cbd5e1] text-[#0D47A1] focus:ring-[#0D47A1]"
            />
            <label htmlFor="remember" className="text-sm text-[#5C728A]">
              Ghi nhớ đăng nhập trong 30 ngày
            </label>
          </div>

          {errors.root && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">
              {errors.root.message}
            </div>
          )}

          <Button
            type="submit"
            loading={isSubmitting}
            variant="primary"
            fullWidth
            className="h-12 rounded-xl text-[16px]"
          >
            Đăng nhập
          </Button>
        </form>

        <div className="my-7 h-px w-full bg-[#EEF3FB]" />

        <p className="text-center text-[15px] text-[#5C728A]">
          Chưa có tài khoản?{' '}
          <Link to="/dang-ky" className="font-bold text-[#0D47A1] transition hover:opacity-80">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
