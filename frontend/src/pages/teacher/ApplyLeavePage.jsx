import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FileText, Upload, X, AlertCircle, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import leaveService from '../../services/leaveService'
import { formatDate } from '../../utils/dateUtils'

const LEAVE_TYPES = [
  { value: 'casual', label: 'Casual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'emergency', label: 'Emergency Leave' },
  { value: 'personal', label: 'Personal Leave' },
  { value: 'annual', label: 'Annual Leave' },
]

const STATUS_COLORS = {
  pending: 'badge-late',
  approved: 'badge-present',
  rejected: 'badge-absent',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
}

const STATUS_ICONS = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
}

export default function ApplyLeavePage() {
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    leave_type: '',
    start_date: today,
    end_date: today,
    reason: '',
  })
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [myLeaves, setMyLeaves] = useState([])
  const [leavesLoading, setLeavesLoading] = useState(true)
  const fileRef = useRef()

  const loadLeaves = useCallback(async () => {
    setLeavesLoading(true)
    try {
      const res = await leaveService.getMy()
      const data = res.data?.data
      if (Array.isArray(data)) setMyLeaves(data)
      else if (data?.leaves) setMyLeaves(data.leaves)
      else if (data?.records) setMyLeaves(data.records)
      else setMyLeaves([])
    } catch (err) {
      console.error('Load leaves error:', err)
    } finally {
      setLeavesLoading(false)
    }
  }, [])

  useEffect(() => { loadLeaves() }, [loadLeaves])

  const calcDays = (start, end) => {
    if (!start || !end) return 0
    const s = new Date(start)
    const e = new Date(end)
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1
    return diff > 0 ? diff : 0
  }

  const totalDays = calcDays(form.start_date, form.end_date)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => {
      const updated = { ...prev, [name]: value }
      // Auto-fix end_date if before start_date
      if (name === 'start_date' && value > prev.end_date) updated.end_date = value
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.leave_type) { toast.error('Please select a leave type'); return }
    if (!form.reason.trim()) { toast.error('Please provide a reason'); return }
    if (totalDays <= 0) { toast.error('End date must be on or after start date'); return }

    setSubmitting(true)
    try {
      const payload = new FormData()
      payload.append('leave_type', form.leave_type)
      payload.append('start_date', form.start_date)
      payload.append('end_date', form.end_date)
      payload.append('total_days', totalDays)
      payload.append('reason', form.reason)
      if (file) payload.append('document', file)

      await leaveService.apply(payload)
      toast.success('Leave application submitted!')
      setForm({ leave_type: '', start_date: today, end_date: today, reason: '' })
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      await loadLeaves()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit leave'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this leave request?')) return
    try {
      await leaveService.cancel(id)
      toast.success('Leave request cancelled')
      await loadLeaves()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Apply for Leave</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Submit a leave request for admin approval</p>
      </div>

      {/* Application Form */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" /> Leave Application
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              name="leave_type"
              value={form.leave_type}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">— Select Leave Type —</option>
              {LEAVE_TYPES.map(lt => (
                <option key={lt.value} value={lt.value}>{lt.label}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                min={today}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                min={form.start_date || today}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Days
              </label>
              <div className="form-input bg-gray-50 dark:bg-gray-700 text-blue-600 font-semibold">
                {totalDays} day{totalDays !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows={4}
              className="form-input resize-none"
              placeholder="Describe the reason for your leave..."
              required
            />
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supporting Document <span className="text-gray-400">(optional)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileRef}
                onChange={e => setFile(e.target.files[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                id="doc-upload"
              />
              <label
                htmlFor="doc-upload"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm text-gray-600 dark:text-gray-400"
              >
                <Upload className="w-4 h-4" /> Choose File
              </label>
              {file && (
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="max-w-[200px] truncate">{file.name}</span>
                  <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }}>
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-60">
              {submitting ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Submitting…</>
              ) : (
                <><FileText className="w-4 h-4" /> Submit Application</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* My Leave History */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-500" /> My Leave Requests
        </h2>

        {leavesLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : myLeaves.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No leave requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Admin Remarks</th>
                  <th>Applied</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map((leave) => {
                  const StatusIcon = STATUS_ICONS[leave.status]
                  return (
                    <tr key={leave.id}>
                      <td className="font-medium capitalize">{leave.leave_type?.replace('_', ' ')}</td>
                      <td>{formatDate(leave.start_date, 'dd MMM yyyy')}</td>
                      <td>{formatDate(leave.end_date, 'dd MMM yyyy')}</td>
                      <td className="text-center font-semibold text-blue-600">{leave.total_days}</td>
                      <td>
                        <span className={`badge flex items-center gap-1 w-fit ${STATUS_COLORS[leave.status] || ''}`}>
                          {StatusIcon && <StatusIcon className="w-3 h-3" />}
                          {leave.status}
                        </span>
                      </td>
                      <td className="text-gray-500 dark:text-gray-400 text-xs max-w-[150px] truncate">
                        {leave.admin_remarks || '—'}
                      </td>
                      <td className="text-gray-500 text-xs">{formatDate(leave.created_at, 'dd MMM yyyy')}</td>
                      <td>
                        {leave.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(leave.id)}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
