import React, { useState, useEffect, useCallback, useRef } from 'react'
import { User, Camera, Mail, Phone, Building, BookOpen, Briefcase, Calendar, Lock, Eye, EyeOff, Edit3, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import authService from '../../services/authService'
import teacherService from '../../services/teacherService'
import { formatDate } from '../../utils/dateUtils'
import { getInitials } from '../../utils/formatUtils'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-blue-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, login } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    department: '',
    subject: '',
    designation: '',
  })

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [savingPw, setSavingPw] = useState(false)

  const photoRef = useRef()

  const loadProfile = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authService.me()
      const data = res.data?.data || res.data
      setProfile(data)
      const t = data?.profile || data?.Teacher || data
      setEditForm({
        full_name: t?.full_name || data?.full_name || '',
        phone: t?.phone || data?.phone || '',
        department: t?.department || data?.department || '',
        subject: t?.subject || data?.subject || '',
        designation: t?.designation || data?.designation || '',
      })
    } catch (err) {
      console.error('Profile load error:', err)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProfile() }, [loadProfile])

  const teacher = profile?.profile || profile?.Teacher || profile
  const displayName = profile?.full_name || teacher?.full_name || user?.full_name || 'Teacher'
  const avatarUrl = teacher?.profile_image
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${teacher.profile_image}`
    : null

  const handleEditChange = (e) => setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const id = profile?.Teacher?.id || profile?.id
      if (!id) throw new Error('Teacher ID not found')
      await teacherService.update(id, editForm)
      toast.success('Profile updated successfully!')
      setEditing(false)
      await loadProfile()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return }
    setUploadingPhoto(true)
    try {
      const fd = new FormData()
      fd.append('photo', file)
      await teacherService.uploadPhoto(fd)
      toast.success('Profile photo updated!')
      await loadProfile()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Photo upload failed')
    } finally {
      setUploadingPhoto(false)
      if (photoRef.current) photoRef.current.value = ''
    }
  }

  const handleChangePw = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match'); return
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return
    }
    setSavingPw(true)
    try {
      await authService.changePassword(pwForm.currentPassword, pwForm.newPassword)
      toast.success('Password changed successfully!')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSavingPw(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">View and update your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="glass-card p-6 flex flex-col items-center text-center gap-4">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-900"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-4 ring-blue-100 dark:ring-blue-900">
                <span className="text-white text-3xl font-bold">{getInitials(displayName)}</span>
              </div>
            )}
            <button
              onClick={() => photoRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
              title="Change photo"
            >
              {uploadingPhoto
                ? <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />
                : <Camera className="w-4 h-4" />
              }
            </button>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{displayName}</h2>
            <p className="text-sm text-blue-600 font-medium">{teacher?.teacher_id || profile?.teacher_id || 'N/A'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {teacher?.designation || 'Teacher'}
            </p>
          </div>

          <div className="w-full pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</div>
            <div className="text-sm text-gray-900 dark:text-white font-medium break-all">
              {profile?.email || '—'}
            </div>
          </div>

          <div className="w-full">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Role</div>
            <span className="badge badge-present capitalize">{profile?.role || 'teacher'}</span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> Personal Information
            </h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-secondary text-sm flex items-center gap-1">
                <Edit3 className="w-4 h-4" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleSaveProfile} disabled={saving} className="btn-primary text-sm flex items-center gap-1">
                  {saving ? <div className="animate-spin rounded-full h-3 w-3 border-b border-white" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              {[
                { name: 'full_name', label: 'Full Name', icon: User },
                { name: 'phone', label: 'Phone Number', icon: Phone },
                { name: 'department', label: 'Department', icon: Building },
                { name: 'subject', label: 'Subject', icon: BookOpen },
                { name: 'designation', label: 'Designation', icon: Briefcase },
              ].map(({ name, label, icon: Icon }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name={name}
                      value={editForm[name]}
                      onChange={handleEditChange}
                      className="form-input pl-10"
                      placeholder={label}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <InfoRow icon={User} label="Full Name" value={teacher?.full_name || profile?.full_name} />
              <InfoRow icon={Mail} label="Email Address" value={profile?.email} />
              <InfoRow icon={Phone} label="Phone Number" value={teacher?.phone} />
              <InfoRow icon={Building} label="Department" value={teacher?.department} />
              <InfoRow icon={BookOpen} label="Subject" value={teacher?.subject} />
              <InfoRow icon={Briefcase} label="Designation" value={teacher?.designation} />
              <InfoRow icon={Calendar} label="Joining Date" value={teacher?.joining_date ? formatDate(teacher.joining_date, 'dd MMM yyyy') : null} />
              <InfoRow icon={User} label="Teacher ID" value={teacher?.teacher_id} />
            </div>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <Lock className="w-5 h-5 text-purple-500" /> Change Password
        </h2>

        <form onSubmit={handleChangePw} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
            { key: 'newPassword', label: 'New Password', placeholder: 'Enter new password' },
            { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Confirm new password' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPw[key.replace('Password', '').replace('confirm', 'confirm')] ? 'text' : 'password'}
                  value={pwForm[key]}
                  onChange={e => setPwForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="form-input pl-10 pr-10"
                  placeholder={placeholder}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(prev => ({ ...prev, [key]: !prev[key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          <div className="md:col-span-3 flex justify-end">
            <button type="submit" disabled={savingPw} className="btn-primary flex items-center gap-2">
              {savingPw ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Lock className="w-4 h-4" />}
              {savingPw ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
