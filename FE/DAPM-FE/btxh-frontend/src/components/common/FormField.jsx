/**
 * FormField — BTXH Design System
 *
 * Wrapper nhất quán cho label + input/select/textarea + thông báo lỗi.
 * Dùng kết hợp với react-hook-form:
 *
 * @example
 * <FormField label="Họ tên" required error={errors.fullName?.message}>
 *   <input {...register('fullName')} className={inputClass} />
 * </FormField>
 */
export function FormField({ label, required, error, hint, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500 flex items-center gap-1">
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>}
    </div>
  );
}

/**
 * Shared class strings for form inputs
 * Import và dùng trực tiếp: className={inputCls}
 */
export const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 ' +
  'bg-white placeholder-gray-400 ' +
  'focus:outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/15 ' +
  'disabled:bg-gray-50 disabled:text-gray-400 ' +
  'transition';

export const selectCls = inputCls + ' appearance-none cursor-pointer';

export const textareaCls = inputCls + ' resize-none';
