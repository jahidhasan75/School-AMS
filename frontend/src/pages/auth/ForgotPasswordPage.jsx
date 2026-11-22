import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import authService from '../../services/authService'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { toast.error('Please enter your email'); return }
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
      toast.success('Reset instructions sent (check console in dev mode)')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-[#0B1224] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your email to receive reset instructions</p>
        </div>
        {sent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✉️</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">Reset instructions sent! Check your email (or dev console).</p>
            <Link to="/login" className="btn-primary inline-block py-2.5 px-6">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="form-input" placeholder="Enter your email" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
            </button>
            <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mt-2">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
