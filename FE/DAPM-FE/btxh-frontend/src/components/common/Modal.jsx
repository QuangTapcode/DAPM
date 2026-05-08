import { useEffect } from 'react';

/**
 * Modal — BTXH Design System
 *
 * @param {boolean}   isOpen
 * @param {Function}  onClose
 * @param {string}    title
 * @param {'sm'|'md'|'lg'|'xl'} [size]
 * @param {boolean}   [closable]  — hiện nút X (default true)
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closable = true,
  footer,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape' && closable) onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, closable]);

  if (!isOpen) return null;

  const WIDTH = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-full' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closable ? onClose : undefined}
      />

      {/* Dialog */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full mx-auto ${WIDTH[size] ?? WIDTH.md} flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          {closable && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

        {/* Footer slot */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
