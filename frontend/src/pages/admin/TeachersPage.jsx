import React, { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit2, Trash2, RefreshCw, Eye, X, Loader2, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import teacherService from '../../services/teacherService'
import { formatDate } from '../../utils/formatUtils'

const DEPARTMENTS = ['Science','Mathematics','English','Social Science','ICT']

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('')
  const [modal, setModal] = useState(null) // 'add' | 'edit' | 'view' | 'password'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const limit = 12

  const loadTeachers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await teacherService.getAll({ page, limit, search, department: dept })
      setTeachers(res.data.data || [])
      setTotal(res.data.pagination?.total || 0)
    } catch { toast.error('Failed to load teachers') }
    finally { setLoading(false) }
  }, [page, search, dept])

  useEffect(() => { loadTeachers() }, [loadTeachers])

  const openAdd = () => { setForm({}); setSelected(null); setModal('add') }
  const openEdit = (t) => { setForm({ ...t, ...t.user }); setSelected(t); setModal('edit') }
  const openView = (t) => { setSelected(t); setModal('view') }
  const openPwd = (t) => { setSelected(t); setForm({ password: '' }); setModal('password') }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'add') {
        await teacherService.create(form)
        toast.success('Teacher added successfully')
      } else if (modal === 'edit') {
        await teacherService.update(selected.id, form)
        toast.success('Teacher updated successfully')
      } else if (modal === 'password') {
        await teacherService.resetPassword(selected.id, form.password)
        toast.success('Password reset successfully')
      }
      setModal(null)
      loadTeachers()
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (t) => {
    if (!window.confirm(`Deactivate teacher ${t.full_name}?`)) return
    try {
      await teacherService.delete(t.id)
      toast.success('Teacher deactivated')
      loadTeachers()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{total} teachers registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="form-input pl-9 py-2" placeholder="Search by name or ID..." />
        </div>
        <select value={dept} onChange={e => { setDept(e.target.value); setPage(1) }} className="form-input py-2 w-44">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>Teacher</th><th>ID</th><th>Email</th><th>Department</th><th>Subject</th><th>Joined</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" /></td></tr>
              ) : teachers.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-16 text-gray-400">No teachers found</td></tr>
              ) : teachers.map(t => (
                <tr key={t.id}>
                  <td data-label="Teacher">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {t.full_name?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{t.full_name}</div>
                        <div className="text-xs text-gray-500">{t.phone || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="ID" className="font-mono text-xs text-gray-600 dark:text-gray-400">{t.teacher_id}</td>
                  <td data-label="Email" className="text-xs text-gray-600 dark:text-gray-400">{t.user?.email}</td>
                  <td data-label="Dept" className="text-sm">{t.department || '—'}</td>
                  <td data-label="Subject" className="text-sm">{t.subject || '—'}</td>
                  <td data-label="Joined" className="text-xs text-gray-500">{t.joining_date ? formatDate(t.joining_date) : '—'}</td>
                  <td data-label="Status">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.user?.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {t.user?.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="flex gap-1">
                      <button onClick={() => openView(t)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => openPwd(t)} className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20" title="Reset Password"><KeyRound className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(t)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Deactivate"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
            <span className="text-xs text-gray-500">Page {page} of {totalPages} ({total} total)</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded-lg text-sm glass-card disabled:opacity-40">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded-lg text-sm glass-card disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card p-6 w-full max-w-lg animate-fade-in-up my-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{modal === 'add' ? 'Add New Teacher' : 'Edit Teacher'}</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Full Name *</label>
                  <input required value={form.full_name || ''} onChange={e => setForm({...form, full_name: e.target.value})} className="form-input" placeholder="Full name" />
                </div>
                {modal === 'add' && <>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Email *</label>
                    <input required type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} className="form-input" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Password *</label>
                    <input required type="password" value={form.password || ''} onChange={e => setForm({...form, password: e.target.value})} className="form-input" />
                  </div>
                </>}
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Phone</label>
                  <input value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} className="form-input" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Department</label>
                  <select value={form.department || ''} onChange={e => setForm({...form, department: e.target.value})} className="form-input">
                    <option value="">Select...</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Subject</label>
                  <input value={form.subject || ''} onChange={e => setForm({...form, subject: e.target.value})} className="form-input" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Designation</label>
                  <input value={form.designation || ''} onChange={e => setForm({...form, designation: e.target.value})} className="form-input" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Joining Date</label>
                  <input type="date" value={form.joining_date || ''} onChange={e => setForm({...form, joining_date: e.target.value})} className="form-input" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2 text-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}{modal === 'add' ? 'Add Teacher' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {modal === 'password' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-sm animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reset Password</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Reset password for <strong>{selected?.full_name}</strong></p>
            <form onSubmit={handleSave} className="space-y-4">
              <input required type="password" minLength={6} value={form.password || ''} onChange={e => setForm({...form, password: e.target.value})}
                className="form-input" placeholder="New password (min 6 chars)" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-sm animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Teacher Profile</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="text-center mb-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                {selected.full_name?.[0]}
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{selected.full_name}</div>
              <div className="text-sm text-blue-600 font-mono">{selected.teacher_id}</div>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Email', selected.user?.email],
                ['Phone', selected.phone || '—'],
                ['Department', selected.department || '—'],
                ['Subject', selected.subject || '—'],
                ['Designation', selected.designation || '—'],
                ['Joining Date', selected.joining_date ? formatDate(selected.joining_date) : '—'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{label}</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right max-w-[180px]">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
