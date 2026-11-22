import React, { useState, useEffect } from 'react'
import { Settings, School, Clock, MapPin, Shield, Sun, Moon, Monitor, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import settingsService from '../../services/settingsService'
import { useTheme } from '../../context/ThemeContext'

const TABS = [
  { id: 'school', label: 'School Info', icon: School },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'appearance', label: 'Appearance', icon: Sun },
  { id: 'security', label: 'Security', icon: Shield },
]

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function SettingsPage() {
  const [tab, setTab] = useState('school')
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' })
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    settingsService.getSettings().then(res => {
      setSettings(res.data.data)
      setLoading(false)
    }).catch(() => { toast.error('Failed to load settings'); setLoading(false) })
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await settingsService.updateSettings(settings)
      toast.success('Settings saved successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings')
    } finally { setSaving(false) }
  }

  const toggleWeekend = (day) => {
    const current = settings.weekend_days || []
    const updated = current.includes(day) ? current.filter(d => d !== day) : [...current, day]
    setSettings({ ...settings, weekend_days: updated })
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" /> Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure school attendance and system settings</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Tab nav */}
        <div className="glass-card p-2 h-fit lg:col-span-1">
          <nav className="space-y-1">
            {TABS.map(t => {
              const Icon = t.icon
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSave}>
            {/* School Info Tab */}
            {tab === 'school' && settings && (
              <div className="glass-card p-6 space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><School className="w-5 h-5 text-blue-600" /> School Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">School Name</label>
                    <input value={settings.school_name || ''} onChange={e => setSettings({...settings, school_name: e.target.value})} className="form-input" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Email</label>
                    <input type="email" value={settings.school_email || ''} onChange={e => setSettings({...settings, school_email: e.target.value})} className="form-input" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Phone</label>
                    <input value={settings.school_phone || ''} onChange={e => setSettings({...settings, school_phone: e.target.value})} className="form-input" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Address</label>
                    <textarea value={settings.school_address || ''} onChange={e => setSettings({...settings, school_address: e.target.value})} className="form-input h-20 resize-none" />
                  </div>
                </div>

                <h3 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2 mt-2"><MapPin className="w-4 h-4 text-blue-600" /> GPS Location</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Latitude</label>
                    <input type="number" step="0.000001" value={settings.latitude || ''} onChange={e => setSettings({...settings, latitude: e.target.value})} className="form-input" placeholder="23.8103" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Longitude</label>
                    <input type="number" step="0.000001" value={settings.longitude || ''} onChange={e => setSettings({...settings, longitude: e.target.value})} className="form-input" placeholder="90.4125" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Allowed Radius (m)</label>
                    <input type="number" value={settings.allowed_radius_meters || 200} onChange={e => setSettings({...settings, allowed_radius_meters: e.target.value})} className="form-input" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable GPS Attendance</label>
                  <button type="button" onClick={() => setSettings({...settings, gps_attendance_enabled: !settings.gps_attendance_enabled})}
                    className={`w-12 h-6 rounded-full transition-colors ${settings.gps_attendance_enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${settings.gps_attendance_enabled ? 'translate-x-6' : 'translate-x-0'}`}></span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable QR Attendance</label>
                  <button type="button" onClick={() => setSettings({...settings, qr_attendance_enabled: !settings.qr_attendance_enabled})}
                    className={`w-12 h-6 rounded-full transition-colors ${settings.qr_attendance_enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${settings.qr_attendance_enabled ? 'translate-x-6' : 'translate-x-0'}`}></span>
                  </button>
                </div>

                <button type="submit" disabled={saving} className="btn-primary py-2.5 px-6 flex items-center gap-2 mt-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            )}

            {/* Attendance Tab */}
            {tab === 'attendance' && settings && (
              <div className="glass-card p-6 space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Clock className="w-5 h-5 text-blue-600" /> Attendance Settings</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Office Start Time</label>
                    <input type="time" value={settings.office_start_time?.slice(0,5) || '09:00'} onChange={e => setSettings({...settings, office_start_time: e.target.value})} className="form-input" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Office End Time</label>
                    <input type="time" value={settings.office_end_time?.slice(0,5) || '17:00'} onChange={e => setSettings({...settings, office_end_time: e.target.value})} className="form-input" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Grace Period (minutes)</label>
                    <input type="number" min="0" value={settings.grace_period_minutes || 15} onChange={e => setSettings({...settings, grace_period_minutes: e.target.value})} className="form-input" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Min Working Hours</label>
                    <input type="number" step="0.5" min="1" value={settings.min_working_hours || 7} onChange={e => setSettings({...settings, min_working_hours: e.target.value})} className="form-input" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-2">Weekend / Off Days</label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map(day => (
                      <button key={day} type="button" onClick={() => toggleWeekend(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${(settings.weekend_days || []).includes(day) ? 'bg-blue-600 text-white' : 'glass-card text-gray-600 dark:text-gray-400'}`}>
                        {day.slice(0,3)}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={saving} className="btn-primary py-2.5 px-6 flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
                </button>
              </div>
            )}

            {/* Appearance Tab */}
            {tab === 'appearance' && (
              <div className="glass-card p-6 space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Sun className="w-5 h-5 text-blue-600" /> Appearance</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose how School AMS looks on your device.</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { id: 'light', icon: Sun, label: 'Light Mode' },
                    { id: 'dark', icon: Moon, label: 'Dark Mode' },
                    { id: 'system', icon: Monitor, label: 'System Default' },
                  ].map(opt => {
                    const Icon = opt.icon
                    const active = theme === opt.id
                    return (
                      <button key={opt.id} type="button" onClick={() => { if (theme !== opt.id) toggleTheme() }}
                        className={`p-5 rounded-2xl border-2 transition-all text-center ${active ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 glass-card'}`}>
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                        <p className={`text-sm font-medium ${active ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>{opt.label}</p>
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-400">Theme preference is saved automatically to your browser.</p>
              </div>
            )}

            {/* Security Tab */}
            {tab === 'security' && (
              <div className="glass-card p-6 space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600" /> Security</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Current Password</label>
                    <input type="password" value={pwdForm.current} onChange={e => setPwdForm({...pwdForm, current: e.target.value})} className="form-input" placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">New Password</label>
                    <input type="password" value={pwdForm.newPwd} onChange={e => setPwdForm({...pwdForm, newPwd: e.target.value})} className="form-input" placeholder="Min 6 characters" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Confirm New Password</label>
                    <input type="password" value={pwdForm.confirm} onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})} className="form-input" placeholder="Re-enter new password" />
                  </div>
                  <button type="button" onClick={() => toast.success('Password change functionality — connect to authService.changePassword()')}
                    className="btn-primary py-2.5 px-6 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Update Password
                  </button>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700/50">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">System Information</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      ['JWT Token Expiry', '8 hours'],
                      ['Password Hashing', 'bcrypt (12 rounds)'],
                      ['Rate Limiting', '100 req/15min (auth: 20)'],
                      ['CORS', 'Restricted to frontend origin'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700/30">
                        <span className="text-gray-500 dark:text-gray-400">{k}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
