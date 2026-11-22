import React, { useState, useEffect, useCallback } from 'react'
import { History, ChevronLeft, ChevronRight, Filter, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import attendanceService from '../../services/attendanceService'
import { formatDate, formatTime, calculateWorkingHours, getMonthRange } from '../../utils/dateUtils'

const STATUS_OPTIONS = ['all', 'present', 'late', 'absent', 'on_leave', 'half_day', 'holiday']

const STATUS_COLORS = {
  present: 'badge-present',
  late: 'badge-late',
  absent: 'badge-absent',
  on_leave: 'badge-on_leave',
  half_day: 'badge-half_day',
  holiday: 'badge-holiday',
  early_leave: 'badge-early_leave',
}

const STATUS_ROW = {
  present: 'hover:bg-green-50 dark:hover:bg-green-900/10',
  late: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/10',
  absent: 'hover:bg-red-50 dark:hover:bg-red-900/10',
  on_leave: 'hover:bg-purple-50 dark:hover:bg-purple-900/10',
  holiday: 'hover:bg-blue-50 dark:hover:bg-blue-900/10',
}

const PAGE_SIZE = 15

export default function AttendanceHistoryPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const monthName = new Date(year, month - 1, 1).toLocaleString('en', { month: 'long' })

  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const { start, end } = getMonthRange(year, month)
      const params = { start_date: start, end_date: end, limit: 100 }
      if (statusFilter !== 'all') params.status = statusFilter

      const [attRes, summaryRes] = await Promise.all([
        attendanceService.getMyAttendance(params),
        attendanceService.getMySummary({ month, year }),
      ])

      const data = attRes.data?.data
      if (Array.isArray(data)) setRecords(data)
      else if (data?.records) setRecords(data.records)
      else setRecords([])

      const s = summaryRes.data?.data || summaryRes.data || {}
      setSummary(s.monthly || s)
      setPage(1)
    } catch (err) {
      console.error('History load error:', err)
      toast.error('Failed to load attendance history')
    } finally {
      setLoading(false)
    }
  }, [year, month, statusFilter])

  useEffect(() => { loadHistory() }, [loadHistory])

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const totalPages = Math.ceil(records.length / PAGE_SIZE)
  const paginatedRecords = records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalPresent = (summary.present || 0) + (summary.late || 0)
  const workingDays = records.filter(r => r.status !== 'holiday').length || 1
  const pct = Math.round((totalPresent / workingDays) * 100)

  const totalHours = records.reduce((acc, rec) => {
    if (!rec.check_in || !rec.check_out) return acc
    const [h1, m1] = rec.check_in.split(':').map(Number)
    const [h2, m2] = rec.check_out.split(':').map(Number)
    return acc + (h2 * 60 + m2 - h1 * 60 - m1)
  }, 0)
  const totalHoursStr = totalHours > 0 ? `${Math.floor(totalHours / 60)}h ${totalHours % 60}m` : '—'

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">View and filter your complete attendance records</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Month navigator */}
        <div className="glass-card p-2 flex items-center gap-2">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[130px] text-center">
            {monthName} {year}
          </span>
          <button
            onClick={nextMonth}
            disabled={year === now.getFullYear() && month === now.getMonth() + 1}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Status filter */}
        <div className="glass-card p-2 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Status' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Present', value: summary.present || 0, color: 'text-green-600' },
          { label: 'Late', value: summary.late || 0, color: 'text-yellow-600' },
          { label: 'Absent', value: summary.absent || 0, color: 'text-red-600' },
          { label: 'On Leave', value: summary.on_leave || 0, color: 'text-purple-600' },
          { label: 'Rate', value: `${pct}%`, color: 'text-indigo-600' },
          { label: 'Total Hours', value: totalHoursStr, color: 'text-blue-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-3 text-center">
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* History Table */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" /> Records
            <span className="text-sm text-gray-500 font-normal ml-1">({records.length} entries)</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No attendance records found</p>
            {statusFilter !== 'all' && (
              <button onClick={() => setStatusFilter('all')} className="mt-2 text-blue-500 text-sm hover:underline">
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Working Hours</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((rec, i) => (
                    <tr key={rec.id || i} className={`transition-colors ${STATUS_ROW[rec.status] || ''}`}>
                      <td className="text-gray-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="font-medium">{formatDate(rec.date, 'dd MMM yyyy')}</td>
                      <td className="text-gray-500 dark:text-gray-400">{formatDate(rec.date, 'EEE')}</td>
                      <td>{rec.check_in ? formatTime(rec.check_in) : <span className="text-gray-400">—</span>}</td>
                      <td>{rec.check_out ? formatTime(rec.check_out) : <span className="text-gray-400">—</span>}</td>
                      <td className="font-medium text-blue-600">{calculateWorkingHours(rec.check_in, rec.check_out)}</td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[rec.status] || ''}`}>
                          {rec.status?.replace(/_/g, ' ') || '—'}
                        </span>
                      </td>
                      <td className="text-gray-500 dark:text-gray-400 text-xs max-w-[150px] truncate">
                        {rec.remarks || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages} ({records.length} records)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
