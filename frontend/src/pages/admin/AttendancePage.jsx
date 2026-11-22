import React, { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Download, Edit2, Eye, Plus, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import attendanceService from '../../services/attendanceService'
import { formatDate, formatTime, formatMinutes } from '../../utils/formatUtils'

const STATUS_OPTIONS = ['present','late','absent','half_day','on_leave','early_leave','holiday']

const StatusBadge = ({ status }) => {
  const cls = { present:'badge-present', late:'badge-late', absent:'badge-absent', on_leave:'badge-on_leave', half_day:'badge-half_day', holiday:'badge-holiday', early_leave:'badge-early_leave' }
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${cls[status] || 'bg-gray-100 text-gray-600'}`}>{status?.replace('_',' ')}</span>
}

export default function AttendancePage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [editModal, setEditModal] = useState(null)
  const [manualModal, setManualModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const limit = 15

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit, search, status, start_date: startDate, end_date: endDate }
      const res = await attendanceService.getAll(params)
      setRecords(res.data.data || [])
      setTotal(res.data.pagination?.total || 0)
    } catch { toast.error('Failed to load attendance') }
    finally { setLoading(false) }
  }, [page, search, status, startDate, endDate])

  useEffect(() => { loadData() }, [loadData])

  const handleEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await attendanceService.updateAttendance(editModal.id, {
        check_in_time: editModal.check_in_time,
        check_out_time: editModal.check_out_time,
        status: editModal.status,
        remarks: editModal.remarks,
        reason: editModal.reason
      })
      toast.success('Attendance updated')
      setEditModal(null)
      loadData()
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed') }
    finally { setSaving(false) }
  }

  const exportCSV = () => {
    const rows = [['Teacher','ID','Date','Check-In','Check-Out','Status','Working Hours']]
    records.forEach(r => rows.push([
      r.teacher?.full_name || '', r.teacher?.teacher_id || '',
      r.attendance_date, r.check_in_time || '', r.check_out_time || '',
      r.status, formatMinutes(r.working_minutes)
    ]))
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'attendance.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{total} total records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setManualModal(true)} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Manual Entry
          </button>
          <button onClick={exportCSV} className="glass-card text-sm py-2 px-4 flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="form-input pl-9 py-2" placeholder="Search teacher name or ID..." />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="form-input py-2 w-36">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input py-2 w-40" />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input py-2 w-40" />
        {(search || status || startDate || endDate) && (
          <button onClick={() => { setSearch(''); setStatus(''); setStartDate(''); setEndDate(''); setPage(1) }}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>Teacher</th><th>ID</th><th>Date</th><th>Check-In</th><th>Check-Out</th><th>Hours</th><th>Method</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-16 text-gray-400">No attendance records found</td></tr>
              ) : records.map(r => (
                <tr key={r.id}>
                  <td data-label="Teacher" className="font-medium text-gray-900 dark:text-white">{r.teacher?.full_name}</td>
                  <td data-label="ID" className="font-mono text-xs text-gray-500">{r.teacher?.teacher_id}</td>
                  <td data-label="Date">{formatDate(r.attendance_date)}</td>
                  <td data-label="Check-In">{r.check_in_time ? formatTime(r.check_in_time) : '—'}</td>
                  <td data-label="Check-Out">{r.check_out_time ? formatTime(r.check_out_time) : '—'}</td>
                  <td data-label="Hours">{formatMinutes(r.working_minutes)}</td>
                  <td data-label="Method" className="text-xs uppercase">{r.check_in_method || '—'}</td>
                  <td data-label="Status"><StatusBadge status={r.status} /></td>
                  <td data-label="Action">
                    <button onClick={() => setEditModal({ ...r })}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded-lg text-sm glass-card disabled:opacity-40 hover:bg-blue-50 dark:hover:bg-blue-900/20">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-lg text-sm glass-card disabled:opacity-40 hover:bg-blue-50 dark:hover:bg-blue-900/20">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Attendance</h3>
              <button onClick={() => setEditModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Check-In</label>
                  <input type="time" value={editModal.check_in_time || ''} onChange={e => setEditModal({...editModal, check_in_time: e.target.value})} className="form-input" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Check-Out</label>
                  <input type="time" value={editModal.check_out_time || ''} onChange={e => setEditModal({...editModal, check_out_time: e.target.value})} className="form-input" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Status</label>
                <select value={editModal.status} onChange={e => setEditModal({...editModal, status: e.target.value})} className="form-input">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Remarks</label>
                <textarea value={editModal.remarks || ''} onChange={e => setEditModal({...editModal, remarks: e.target.value})} className="form-input h-20 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Reason for Edit *</label>
                <input value={editModal.reason || ''} onChange={e => setEditModal({...editModal, reason: e.target.value})} className="form-input" placeholder="Required for audit log" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2 text-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
