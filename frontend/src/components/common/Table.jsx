import React from 'react'
import LoadingSpinner from './LoadingSpinner'

function Table({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found',
  className = ''
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-white/10">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`
                  py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap
                  ${col.className || ''}
                `}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center text-gray-400 dark:text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-sm">{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="border-b border-gray-50 dark:border-white/5 hover:bg-blue-50/50 dark:hover:bg-white/5 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3 px-4 text-gray-700 dark:text-gray-300 ${col.cellClass || ''}`}
                  >
                    {col.render ? col.render(row[col.key], row, rowIndex) : (row[col.key] ?? 'N/A')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
