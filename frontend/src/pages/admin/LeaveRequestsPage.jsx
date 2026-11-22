import React, { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, ChevronDown, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import leaveService from '../../services/leaveService'
import { formatDate } from '../../utils/formatUtils'

const TABS = ['pending','approved','rejected']

const LeaveTypeBadge = ({ type }) => {
  const colors = { casual:'bg-blue-100 text-blue-700', sick:'bg-red-100 text-red-700', emergency:'bg-orange-100 text-orange-700', personal:'bg-purple-100 text-purple-700', annual:'bg-green-100 text-green-700' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colors[type] || 'bg-gray-100 text-gray-700'} dark:bg-opacity-20`}>{type}</span>
}

export default function LeaveRequestsPage() {
  const [tab, setTab] = useState('pending')
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [remarks, setRemarks] = useState('')
  const [saving, setSaving] = useState(false)

  const loadLeaves = useCallback(async () => {
    setLoading(true)
    try {
      const res = await leaveService.getAll({ status: tab })
      setLeaves(res.data.data || [])
    } catch { toast.error('Failed to load leave requests') }
    finally { setLoading(false) }
  }, [tab])

  useEffect(() => { loadLeaves() }, [loadLeaves])

  const handleAction = async (action) => {
    setSaving(true)
    try {
      if (action === 'approve') await leaveService.approve(selected.id, remarks)
      else await leaveService.reject(selected.id, remarks)
      toast.success(`Leave ${action}d successfully`)
      setModal(null)
      setRemarks('')
      loadLeaves()
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed') }
    finally { setSaving(false) }
  }

  const counts = { pending: leaves.filter(l => l.status === 'pending').length }

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Requests</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Review and manage teacher leave applications</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass-card p-1 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setLeaves([]) }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${tab === t ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {t}
            {t === 'pending' && tab !== 'pending' && leaves.length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">{leaves.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>Teacher</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Applied</th>
              {tab !== 'pending' && <th>Remarks</th>}
              {tab === 'pending' && <th>Actions</th>}
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" /></td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-16 text-gray-400">No {tab} leave requests</td></tr>
              ) : leaves.map(l => (
                <tr key={l.id}>
                  <td data-label="Teacher" className="font-medium text-gray-900 dark:text-white text-sm">{l.teacher?.full_name}</td>
                  <td data-label="Type"><LeaveTypeBadge type={l.leave_type} /></td>
                  <td data-label="From" className="text-sm">{formatDate(l.start_date)}</td>
                  <td data-label="To" className="text-sm">{formatDate(l.end_date)}</td>
                  <td data-label="Days" className="font-semibold text-center">{l.total_days}</td>
                  <td data-label="Reason" className="text-xs text-gray-600 dark:text-gray-400 max-w-[160px] truncate">{l.reason}</td>
                  <td data-label="Applied" className="text-xs text-gray-500">{formatDate(l.created_at)}</td>
                  {tab !== 'pending' && (
                    <td data-label="Remarks" className="text-xs text-gray-600 dark:text-gray-400">{l.admin_remarks || '—'}</td>
                  )}
                  {tab === 'pending' && (
                    <td data-label="Actions">
                      <div className="flex gap-2">
                        <button onClick={() => { setSelected(l); setModal('approve') }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => { setSelected(l); setModal('reject') }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve/Reject Modal */}
      {modal && selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{modal} Leave Request</h3>
              <button onClick={() => { setModal(null); setRemarks('') }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="glass-card p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Teacher</span><span className="font-medium text-gray-900 dark:text-white">{selected.teacher?.full_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Type</span><LeaveTypeBadge type={selected.leave_type} /></div>
              <div className="flex justify-between"><span className="text-gray-500">Period</span><span className="font-medium text-gray-900 dark:text-white">{formatDate(selected.start_date)} – {formatDate(selected.end_date)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Days</span><span className="font-semibold text-gray-900 dark:text-white">{selected.total_days} days</span></div>
              <div><span className="text-gray-500">Reason:</span><p className="mt-1 text-gray-700 dark:text-gray-300">{selected.reason}</p></div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1.5">Admin Remarks {modal === 'reject' ? '*' : '(optional)'}</label>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="form-input h-24 resize-none"
                placeholder={modal === 'approve' ? 'e.g. Approved. Enjoy your leave.' : 'Reason for rejection...'} required={modal === 'reject'} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setModal(null); setRemarks('') }} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={() => handleAction(modal)} disabled={saving || (modal === 'reject' && !remarks)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 ${modal === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50`}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (modal === 'approve' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />)}
                {modal === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
