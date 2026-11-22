import React, { useEffect, useState, useCallback } from 'react'
import { Users, UserCheck, Clock, UserX, TrendingUp, Calendar, RefreshCw } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import toast from 'react-hot-toast'
import attendanceService from '../../services/attendanceService'
import reportService from '../../services/reportService'
import { formatDate, formatTime } from '../../utils/formatUtils'

const COLORS = { present: '#16A34A', late: '#F59E0B', absent: '#EF4444', on_leave: '#3B82F6', half_day: '#7C3AED' }

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className={`glass-card p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform duration-200`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg}`}>
      <Icon className={`w-7 h-7 ${color}`} />
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  </div>
)

const StatusBadge = ({ status }) => {
  const cls = {
    present: 'badge-present', late: 'badge-late', absent: 'badge-absent',
    on_leave: 'badge-on_leave', half_day: 'badge-half_day', holiday: 'badge-holiday', early_leave: 'badge-early_leave'
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${cls[status] || 'bg-gray-100 text-gray-600'}`}>
      {status?.replace('_', ' ') || 'Unknown'}
    </span>
  )
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [todayAttendance, setTodayAttendance] = useState([])
  const [weeklyData, setWeeklyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [sumRes, todayRes] = await Promise.all([
        attendanceService.getSummary(),
        attendanceService.getToday()
      ])
      setSummary(sumRes.data.data)
      setTodayAttendance(todayRes.data.data?.slice(0, 10) || [])
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const pieData = summary ? [
    { name: 'Present', value: summary.present || 0, color: COLORS.present },
    { name: 'Late', value: summary.late || 0, color: COLORS.late },
    { name: 'Absent', value: summary.absent || 0, color: COLORS.absent },
    { name: 'On Leave', value: summary.on_leave || 0, color: COLORS.on_leave },
  ].filter(d => d.value > 0) : []

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' })

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </span>
          </div>
          <button onClick={loadData} className="glass-card p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <RefreshCw className={`w-4 h-4 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Teachers" value={summary?.total_teachers} icon={Users} color="text-blue-600" bg="bg-blue-100 dark:bg-blue-900/40" />
        <StatCard label="Present Today" value={summary?.present} icon={UserCheck} color="text-green-600" bg="bg-green-100 dark:bg-green-900/40" />
        <StatCard label="Late Today" value={summary?.late} icon={Clock} color="text-orange-600" bg="bg-orange-100 dark:bg-orange-900/40" />
        <StatCard label="Absent Today" value={summary?.absent} icon={UserX} color="text-red-600" bg="bg-red-100 dark:bg-red-900/40" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Doughnut */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Today's Attendance</h2>
          {pieData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No attendance data for today</div>
          )}
        </div>

        {/* Attendance rate */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Attendance Overview</h2>
          {summary ? (
            <div className="space-y-5 pt-4">
              {[
                { label: 'Present', value: summary.present || 0, total: summary.total_teachers || 1, color: 'bg-green-500' },
                { label: 'Late', value: summary.late || 0, total: summary.total_teachers || 1, color: 'bg-orange-500' },
                { label: 'Absent', value: summary.absent || 0, total: summary.total_teachers || 1, color: 'bg-red-500' },
                { label: 'On Leave', value: summary.on_leave || 0, total: summary.total_teachers || 1, color: 'bg-blue-500' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{item.value} ({item.total > 0 ? Math.round(item.value / item.total * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-700`}
                      style={{ width: `${item.total > 0 ? Math.round(item.value / item.total * 100) : 0}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
          )}
        </div>
      </div>

      {/* Today's Attendance Table */}
      <div className="glass-card">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" /> Today's Attendance
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">Showing top 10</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>Teacher</th><th>ID</th><th>Check-In</th><th>Check-Out</th><th>Status</th>
            </tr></thead>
            <tbody>
              {todayAttendance.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-gray-400">No attendance records for today</td></tr>
              ) : todayAttendance.map((r, i) => (
                <tr key={i}>
                  <td data-label="Teacher" className="font-medium text-gray-900 dark:text-white">{r.full_name || r.teacher?.full_name || 'N/A'}</td>
                  <td data-label="ID" className="text-gray-500 dark:text-gray-400 font-mono text-xs">{r.teacher_code || r.teacher?.teacher_id || '—'}</td>
                  <td data-label="Check-In">{r.attendance?.check_in_time ? formatTime(r.attendance.check_in_time) : '—'}</td>
                  <td data-label="Check-Out">{r.attendance?.check_out_time ? formatTime(r.attendance.check_out_time) : '—'}</td>
                  <td data-label="Status"><StatusBadge status={r.attendance?.status || 'absent'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
