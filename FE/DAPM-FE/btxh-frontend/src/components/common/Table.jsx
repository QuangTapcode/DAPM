/**
 * Table — BTXH Design System
 *
 * @param {Array}   columns  — [{ key, title, render?, width?, align? }]
 * @param {Array}   data     — array of row objects
 * @param {boolean} loading
 * @param {string}  emptyText
 * @param {string}  [className]
 */
export default function Table({
  columns,
  data,
  loading,
  emptyText = 'Không có dữ liệu',
  className = '',
}) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white ${className}`}>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <svg className="animate-spin w-5 h-5 text-[#1d4ed8]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span className="text-sm">Đang tải dữ liệu...</span>
                </div>
              </td>
            </tr>
          ) : !data?.length ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0H4" />
                  </svg>
                  <span className="text-sm">{emptyText}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                className="hover:bg-blue-50/40 transition-colors group"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-gray-700 ${
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''
                    }`}
                  >
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
