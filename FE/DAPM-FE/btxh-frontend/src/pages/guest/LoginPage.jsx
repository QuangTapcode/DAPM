import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_REDIRECT } from '../../utils/constants';
import Button from '../../components/common/Button';
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
      setError('root', {
        message: err?.message || 'Sai tài khoản hoặc mật khẩu',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[560px] rounded-[28px] bg-white px-8 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-10">
        <div className="mb-8">
          <h1 className="text-[44px] font-extrabold leading-tight tracking-[-0.02em] text-[#1f2937]">
            Chào mừng trở lại
          </h1>
          <p className="mt-3 text-[21px] leading-8 text-[#6b7280]">
            Vui lòng nhập thông tin đăng nhập.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="mb-3 block text-[16px] font-semibold text-[#6b7280]">
              Email
            </label>

            <div className="flex h-[68px] items-center gap-3 rounded-[16px] bg-[#f1f5f9] px-4">
              <svg
                className="h-5 w-5 shrink-0 text-[#6b7280]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.5 5.75A1.75 1.75 0 0 1 4.25 4h11.5A1.75 1.75 0 0 1 17.5 5.75v8.5A1.75 1.75 0 0 1 15.75 16H4.25A1.75 1.75 0 0 1 2.5 14.25v-8.5Zm1.75-.25a.25.25 0 0 0-.25.25v.215l6 3.75 6-3.75V5.75a.25.25 0 0 0-.25-.25H4.25Zm11.75 2.228-5.603 3.502a.75.75 0 0 1-.794 0L4 7.728v6.522c0 .138.112.25.25.25h11.5a.25.25 0 0 0 .25-.25V7.728Z" />
              </svg>

              <input
                type="email"
                placeholder="Nhập email của bạn"
                {...register('email', { required: 'Vui lòng nhập email' })}
                className="h-full w-full bg-transparent text-[18px] text-[#374151] outline-none placeholder:text-[#9ca3af]"
              />
            </div>

            {errors.email && (
              <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-[16px] font-semibold text-[#6b7280]">
                Mật khẩu
              </label>

              <button
                type="button"
                className="text-[15px] font-semibold text-[var(--c-primary)] hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>

            <div className="flex h-[68px] items-center gap-3 rounded-[16px] bg-[#f1f5f9] px-4">
              <svg
                className="h-5 w-5 shrink-0 text-[#6b7280]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1.75A4.25 4.25 0 0 0 5.75 6v1.25H5A2.25 2.25 0 0 0 2.75 9.5v5A2.25 2.25 0 0 0 5 16.75h10A2.25 2.25 0 0 0 17.25 14.5v-5A2.25 2.25 0 0 0 15 7.25h-.75V6A4.25 4.25 0 0 0 10 1.75Zm2.75 5.5V6a2.75 2.75 0 1 0-5.5 0v1.25h5.5Z"
                  clipRule="evenodd"
                />
              </svg>

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu của bạn"
                {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
                className="h-full w-full bg-transparent text-[18px] text-[#374151] outline-none placeholder:text-[#9ca3af]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="shrink-0 text-[#6b7280] hover:text-[#374151]"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 4.5c-4.09 0-7.205 2.677-8.34 5.192a.75.75 0 0 0 0 .616C2.795 12.823 5.91 15.5 10 15.5c4.09 0 7.205-2.677 8.34-5.192a.75.75 0 0 0 0-.616C17.205 7.177 14.09 4.5 10 4.5Zm0 9.5a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5Z" />
                    <path d="M10 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                  </svg>
                ) : (
                  <img
                    src={hide_yey}
                    alt="Ẩn mật khẩu"
                    className="h-5 w-5 object-contain"
                  />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              id="remember"
              type="checkbox"
              {...register('remember')}
              className="h-5 w-5 rounded border border-[#cbd5e1] text-[var(--c-primary)] focus:ring-[var(--c-primary)]"
            />
            <label htmlFor="remember" className="text-[17px] text-[#6b7280]">
              Ghi nhớ đăng nhập trong 30 ngày
            </label>
          </div>

          {errors.root && (
            <p className="text-sm text-red-500">{errors.root.message}</p>
          )}

          <Button
            type="submit"
            loading={isSubmitting}
            variant="primary"
            className="h-[64px] w-full rounded-[16px] text-[20px] font-bold shadow-[0_10px_20px_rgba(33,150,243,0.24)]"
          >
            Đăng nhập
          </Button>
        </form>

        <div className="my-10 h-px w-full bg-[#e5e7eb]" />

        <p className="text-center text-[18px] text-[#6b7280]">
          Chưa có tài khoản?{' '}
          <Link
            to="/dang-ky"
            className="font-bold text-[var(--c-primary)] transition hover:opacity-80"
          >
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}