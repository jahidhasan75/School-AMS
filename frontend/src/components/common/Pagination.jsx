import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function Pagination({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange, total }) {
  const pages = []
  const delta = 2
  const left = currentPage - delta
  const right = currentPage + delta + 1

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i < right)) {
      pages.push(i)
    }
  }

  // Add ellipsis
  const pagesWithEllipsis = []
  let prev = null
  for (const page of pages) {
    if (prev && page - prev > 1) {
      pagesWithEllipsis.push('...')
    }
    pagesWithEllipsis.push(page)
    prev = page
  }

  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, total)

  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/10">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>Showing {startItem}–{endItem} of {total}</span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="ml-2 border border-gray-200 dark:border-white/20 rounded-lg px-2 py-1 text-xs bg-white dark:bg-[#151F35] text-gray-700 dark:text-gray-300"
          >
            {[10, 20, 50, 100].map(s => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        {pagesWithEllipsis.map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 py-1 text-gray-400 text-sm">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-all
                ${currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400'
                }
              `}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  )
}

export default Pagination
