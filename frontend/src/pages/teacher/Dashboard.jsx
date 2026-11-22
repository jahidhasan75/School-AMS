import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle, XCircle, Clock, MapPin, QrCode,
  Calendar, TrendingUp, AlertCircle, Wifi, WifiOff,
  LogIn, LogOut, User, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import attendanceService from '../../services/attendanceService'
import { formatDate, formatTime, getGreeting, calculateWorkingHours } from '../../utils/dateUtils'

const STATUS_COLORS = {
  present: 'badge-present',
  late: 'badge-late',
  absent: 'badge-absent',
  on_leave: 'badge-on_leave',
  half_day: 'badge-half_day',
  holiday: 'badge-holiday',
}

function LiveClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const h = now.getHours() % 12 || 12
  const m = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM'
  return (
    <div className="text-center">
      <div className="text-5xl font-bold text-white tracking-widest font-mono">
        {h}:{m}:{s}
      </div>
      <div className="text-indigo-200 text-sm mt-1">{ampm}</div>
    </div>
  )
}

function GPSBadge({ status }) {
  if (status === 'loading') return (
    <span className="flex items-center gap-1 text-xs text-yellow-400"><Wifi className="w-3 h-3 animate-pulse" /> Locating…</span>
  )
  if (status === 'ok') return (
    <span className="flex items-center gap-1 text-xs text-green-400"><MapPin className="w-3 h-3" /> Location ready</span>
  )
  if (status === 'denied') return (
    <span className="flex items-center gap-1 text-xs text-red-400"><WifiOff className="w-3 h-3" /> GPS denied</span>
  )
  return <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin className="w-3 h-3" /> GPS optional</span>
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-card p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

export default function TeacherDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [todayRecord, setTodayRecord] = useState(null)
  const [summary, setSummary] = useState(null)
  const [recentAttendance, setRecentAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [gpsStatus, setGpsStatus] = useState('idle') // idle | loading | ok | denied
  const [coords, setCoords] = useState(null)

  const today = new Date()
  const greeting = getGreeting()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [summaryRes, attendanceRes] = await Promise.all([
        attendanceService.getMySummary(),
        attendanceService.getMyAttendance({ limit: 7, page: 1 }),
      ])
      setSummary(summaryRes.data?.data || summaryRes.data)
      const att = attendanceRes.data?.data
      if (Array.isArray(att)) {
        setRecentAttendance(att)
        // Find today record
        const todayStr = today.toISOString().split('T')[0]
        const tr = att.find(r => r.date === todayStr || r.date?.startsWith(todayStr))
        setTodayRecord(tr || null)
      } else if (att?.records) {
        setRecentAttendance(att.records)
        const todayStr = today.toISOString().split('T')[0]
        const tr = att.records.find(r => r.date === todayStr || r.date?.startsWith(todayStr))
        setTodayRecord(tr || null)
      }
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const requestGPS = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setGpsStatus('denied')
        resolve(null)
        return
      }
      setGpsStatus('loading')
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
          setCoords(c)
          setGpsStatus('ok')
          resolve(c)
        },
        (err) => {
          console.warn('GPS error:', err)
          setGpsStatus('denied')
          resolve(null) // GPS is optional
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      const location = await requestGPS()
      const payload = {}
      if (location) {
        payload.latitude = location.latitude
        payload.longitude = location.longitude
      }
      await attendanceService.checkIn(payload)
      toast.success('✅ Check-In successful!')
      await loadData()
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-In failed'
      toast.error(msg)
    } finally {
      setCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    setCheckingOut(true)
    try {
      const location = coords || await requestGPS()
      const payload = {}
      if (location) {
        payload.latitude = location.latitude
        payload.longitude = location.longitude
      }
      await attendanceService.checkOut(payload)
      toast.success('✅ Check-Out successful!')
      await loadData()
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-Out failed'
      toast.error(msg)
    } finally {
      setCheckingOut(false)
    }
  }

  const isCheckedIn = !!todayRecord?.check_in
  const isCheckedOut = !!todayRecord?.check_out
  const todayStatus = todayRecord?.status || null

  const monthSummary = summary?.monthly || summary || {}
  const totalDays = (monthSummary.present || 0) + (monthSummary.late || 0) + (monthSummary.absent || 0) + (monthSummary.on_leave || 0)
  const workingDays = totalDays || 1
  const presentDays = (monthSummary.present || 0) + (monthSummary.late || 0)
  const attendancePct = Math.round((presentDays / workingDays) * 100)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting}, {user?.full_name?.split(' ')[0] || 'Teacher'}! 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {formatDate(today, 'EEEE, dd MMM yyyy')}
          </p>
        </div>
        <button
          onClick={() => navigate('/teacher/attendance')}
          className="btn-secondary text-sm flex items-center gap-1 self-start"
        >
          View Full Attendance <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle} label="Present This Month" value={monthSummary.present || 0} color="bg-green-500" />
        <StatCard icon={Clock} label="Late This Month" value={monthSummary.late || 0} color="bg-yellow-500" />
        <StatCard icon={XCircle} label="Absent This Month" value={monthSummary.absent || 0} color="bg-red-500" />
        <StatCard icon={Calendar} label="On Leave" value={monthSummary.on_leave || 0} color="bg-purple-500" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Check-In Card */}
        <div className="lg:col-span-3 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-semibold text-lg">Today's Attendance</h2>
              <GPSBadge status={gpsStatus} />
            </div>
            {todayStatus && (
              <span className={`badge ${STATUS_COLORS[todayStatus] || 'badge-present'} capitalize`}>
                {todayStatus.replace('_', ' ')}
              </span>
            )}
          </div>

          <LiveClock />

          {/* Check-in / Check-out info */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-indigo-200 text-xs mb-1">Check-In</p>
              <p className="text-white font-semibold text-sm">
                {todayRecord?.check_in ? formatTime(todayRecord.check_in) : '—'}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-indigo-200 text-xs mb-1">Check-Out</p>
              <p className="text-white font-semibold text-sm">
                {todayRecord?.check_out ? formatTime(todayRecord.check_out) : '—'}
              </p>
            </div>
          </div>

          {/* Working hours */}
          {isCheckedIn && (
            <div className="mt-3 bg-white/10 rounded-xl p-3 text-center">
              <p className="text-indigo-200 text-xs mb-1">Working Hours</p>
              <p className="text-white font-semibold text-sm">
                {todayRecord?.check_in && todayRecord?.check_out
                  ? calculateWorkingHours(todayRecord.check_in, todayRecord.check_out)
                  : isCheckedIn ? 'In progress…' : '—'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={handleCheckIn}
              disabled={isCheckedIn || checkingIn}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all text-sm
                ${isCheckedIn
                  ? 'bg-green-500/30 text-green-300 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-400 text-white active:scale-95 shadow-lg'
                }`}
            >
              <LogIn className="w-4 h-4" />
              {checkingIn ? 'Checking In…' : isCheckedIn ? 'Checked In ✓' : 'Check In'}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!isCheckedIn || isCheckedOut || checkingOut}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all text-sm
                ${!isCheckedIn || isCheckedOut
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-400 text-white active:scale-95 shadow-lg'
                }`}
            >
              <LogOut className="w-4 h-4" />
              {checkingOut ? 'Checking Out…' : isCheckedOut ? 'Checked Out ✓' : 'Check Out'}
            </button>
          </div>

          {/* QR Option */}
          <div className="mt-3 border-t border-white/10 pt-3">
            <button
              onClick={() => toast.info('Use the Admin QR page to scan QR attendance')}
              className="w-full flex items-center justify-center gap-2 text-indigo-200 hover:text-white text-sm transition-colors py-1"
            >
              <QrCode className="w-4 h-4" /> QR Code Attendance
            </button>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="lg:col-span-2 glass-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Monthly Overview</h2>
          </div>

          {/* Attendance % bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Attendance Rate</span>
              <span className="font-semibold text-blue-600">{attendancePct}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${attendancePct}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {[
              { label: 'Present', value: monthSummary.present || 0, color: 'bg-green-500' },
              { label: 'Late', value: monthSummary.late || 0, color: 'bg-yellow-500' },
              { label: 'Absent', value: monthSummary.absent || 0, color: 'bg-red-500' },
              { label: 'On Leave', value: monthSummary.on_leave || 0, color: 'bg-purple-500' },
              { label: 'Half Day', value: monthSummary.half_day || 0, color: 'bg-blue-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
            <button
              onClick={() => navigate('/teacher/history')}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              View Full History →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Attendance Table */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" /> Recent Attendance
          </h2>
          <button
            onClick={() => navigate('/teacher/attendance')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All →
          </button>
        </div>

        {recentAttendance.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No attendance records yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.slice(0, 7).map((rec, i) => (
                  <tr key={rec.id || i}>
                    <td className="font-medium">{formatDate(rec.date, 'dd MMM yyyy')}</td>
                    <td className="text-gray-500 dark:text-gray-400">{formatDate(rec.date, 'EEE')}</td>
                    <td>{rec.check_in ? formatTime(rec.check_in) : <span className="text-gray-400">—</span>}</td>
                    <td>{rec.check_out ? formatTime(rec.check_out) : <span className="text-gray-400">—</span>}</td>
                    <td>{calculateWorkingHours(rec.check_in, rec.check_out)}</td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[rec.status] || ''}`}>
                        {rec.status?.replace('_', ' ') || '—'}
                      </span>
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
