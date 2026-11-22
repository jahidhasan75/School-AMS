import React, { useState, useEffect, useCallback } from 'react'
import { QrCode, RefreshCw, Shield, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import qrService from '../../services/qrService'

export default function QRAttendancePage() {
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  const loadActiveQR = useCallback(async () => {
    setLoading(true)
    try {
      const res = await qrService.getActive()
      setQrData(res.data.data)
    } catch (err) {
      if (err.response?.status !== 404) toast.error('Failed to load QR')
      setQrData(null)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadActiveQR() }, [loadActiveQR])

  useEffect(() => {
    if (!qrData?.expires_at) return
    const calc = () => {
      const diff = Math.max(0, Math.floor((new Date(qrData.expires_at) - new Date()) / 1000))
      setTimeLeft(diff)
    }
    calc()
    const timer = setInterval(calc, 1000)
    return () => clearInterval(timer)
  }, [qrData])

  const generateQR = async () => {
    setGenerating(true)
    try {
      const res = await qrService.generate()
      setQrData(res.data.data)
      toast.success('New QR code generated (valid for 5 minutes)')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate QR')
    } finally { setGenerating(false) }
  }

  const isExpired = timeLeft === 0 && qrData
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Attendance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Generate time-limited QR codes for teacher attendance</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* QR Display */}
        <div className="glass-card p-8 flex flex-col items-center">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold mb-4">
              <QrCode className="w-3.5 h-3.5" /> QR Attendance System
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Attendance QR</h2>
          </div>

          {loading ? (
            <div className="w-64 h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : qrData && !isExpired ? (
            <div className="relative">
              <div className="p-4 bg-white rounded-2xl shadow-xl">
                <QRCodeSVG
                  value={JSON.stringify({ token: qrData.token, type: 'school-ams-attendance' })}
                  size={220}
                  level="H"
                  includeMargin={true}
                />
              </div>
              {/* Countdown */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`} remaining
              </div>
            </div>
          ) : (
            <div className="w-64 h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl">
              <QrCode className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-400 text-center px-4">{isExpired ? 'QR code expired. Generate a new one.' : 'No active QR. Generate one below.'}</p>
            </div>
          )}

          <button onClick={generateQR} disabled={generating}
            className="btn-primary mt-10 flex items-center gap-2 py-3 px-6">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {generating ? 'Generating...' : 'Generate New QR'}
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-5">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" /> Security Features
            </h3>
            <ul className="space-y-3">
              {[
                'Each QR code expires in 5 minutes',
                'Tokens are unique UUIDs — cannot be reused',
                'Old QR sessions are deactivated on new generation',
                'Backend validates token on every scan',
                'GPS verification can be combined with QR',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" /> Teacher Instructions
            </h3>
            <ol className="space-y-3">
              {[
                'Open School AMS on your mobile browser',
                'Go to My Attendance → QR Scan',
                'Allow camera permission when prompted',
                'Point camera at the QR code on the screen',
                'Wait for verification confirmation',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          {qrData && (
            <div className="glass-card p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-semibold ${isExpired ? 'text-red-600' : 'text-green-600'}`}>{isExpired ? 'Expired' : 'Active'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Token</span>
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{qrData.token?.substring(0,16)}...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
