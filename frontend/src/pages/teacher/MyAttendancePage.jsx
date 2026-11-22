import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import attendanceService from '../../services/attendanceService'
import { formatDate, formatTime, calculateWorkingHours, getMonthRange } from '../../utils/dateUtils'

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
  present: 'bg-green-50 dark:bg-green-900/10',
  late: 'bg-yellow-50 dark:bg-yellow-900/10',
  absent: 'bg-red-50 dark:bg-red-900/10',
  on_leave: 'bg-purple-50 dark:bg-purple-900/10',
  holiday: 'bg-blue-50 dark:bg-blue-900/10',
}

export default function MyAttendancePage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)

  const monthName = new Date(year, month - 1, 1).toLocaleString('en', { month: 'long' })

  const loadAttendance = useCallback(async () => {
    setLoading(true)
    try {
      const { start, end } = getMonthRange(year, month)
      const [attRes, summaryRes] = await Promise.all([
        attendanceService.getMyAttendance({ start_date: start, end_date: end, limit: 100 }),
        attendanceService.getMySummary({ month, year }),
      ])
      const data = attRes.data?.data
      if (Array.isArray(data)) setRecords(data)
      else if (data?.records) setRecords(data.records)
      else setRecords([])

      const s = summaryRes.data?.data || summaryRes.data || {}
      setSummary(s.monthly || s)
    } catch (err) {
      console.error('MyAttendance load error:', err)
      toast.error('Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => { loadAttendance() }, [loadAttendance])

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const totalPresent = (summary.present || 0) + (summary.late || 0)
  const total = records.length || 1
  const pct = Math.round((totalPresent / total) * 100)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Attendance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your monthly attendance records</p>
        </div>
      </div>

      {/* Month Selector */}
      <div className="glass-card p-4 flex items-center gap-3 w-fit">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <span className="text-base font-semibold text-gray-900 dark:text-white min-w-[140px] text-center">
          {monthName} {year}
        </span>
        <button
          onClick={nextMonth}
          disabled={year === now.getFullYear() && month === now.getMonth() + 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-40"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Present', value: summary.present || 0, color: 'text-green-600' },
          { label: 'Late', value: summary.late || 0, color: 'text-yellow-600' },
          { label: 'Absent', value: summary.absent || 0, color: 'text-red-600' },
          { label: 'On Leave', value: summary.on_leave || 0, color: 'text-purple-600' },
          { label: 'Half Day', value: summary.half_day || 0, color: 'text-blue-600' },
          { label: 'Rate', value: `${pct}%`, color: 'text-indigo-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-3 text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Attendance Bar */}
      <div className="glass-card p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-300">Attendance Rate for {monthName} {year}</span>
          <span className="font-semibold text-blue-600">{pct}%</span>
        </div>
        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Attendance Record — {monthName} {year}
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No records found for {monthName} {year}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, i) => (
                  <tr key={rec.id || i} className={STATUS_ROW[rec.status] || ''}>
                    <td className="text-gray-400">{i + 1}</td>
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
        )}
      </div>
    </div>
  )
}
