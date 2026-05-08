import { useRef } from 'react';

/**
 * FileUpload — BTXH Design System
 *
 * Drag-and-drop / click để chọn file.
 * Hiển thị danh sách file đã chọn.
 */
export default function FileUpload({
  label,
  required,
  accept,
  multiple = false,
  onChange,
  files = [],
  hint,
  error,
}) {
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    onChange(multiple ? dropped : [dropped[0]]);
  };

  const handleChange = (e) => {
    onChange(Array.from(e.target.files));
    e.target.value = '';        // allow re-selecting same file
  };

  const removeFile = (idx) => {
    onChange(files.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer
          hover:border-[#1d4ed8] hover:bg-blue-50/40 transition-colors focus:outline-none focus:border-[#1d4ed8]"
      >
        <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-sm text-gray-500">
          <span className="text-[#1d4ed8] font-medium">Nhấn để chọn file</span> hoặc kéo thả vào đây
        </p>
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        {accept && <p className="text-xs text-gray-400 mt-0.5">Hỗ trợ: {accept}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li key={i}
              className="flex items-center justify-between gap-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-4 h-4 text-[#1d4ed8] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M4 4a2 2 0 0 1 2-2h4.586A2 2 0 0 1 12 2.586L15.414 6A2 2 0 0 1 16 7.414V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z"
                    clipRule="evenodd" />
                </svg>
                <span className="truncate text-gray-700">{f.name}</span>
                <span className="text-gray-400 text-xs flex-shrink-0">({(f.size / 1024).toFixed(0)} KB)</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-red-500 flex items-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>}
    </div>
  );
}
