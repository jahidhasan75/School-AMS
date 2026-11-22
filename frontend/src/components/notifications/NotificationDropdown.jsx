import React, { useEffect, useState, useRef } from 'react'
import { Bell, Check, CheckCheck, X, Info, Calendar, AlertCircle, Megaphone } from 'lucide-react'
import notificationService from '../../services/notificationService'
import { formatDateTime } from '../../utils/dateUtils'
import toast from 'react-hot-toast'

const typeIcons = {
  attendance: <Calendar className="w-4 h-4 text-green-500" />,
  leave: <Info className="w-4 h-4 text-blue-500" />,
  correction: <AlertCircle className="w-4 h-4 text-orange-500" />,
  announcement: <Megaphone className="w-4 h-4 text-purple-500" />,
}

export default function NotificationDropdown({ onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await notificationService.getAll({ limit: 15 })
      const list = res.data.data || []
      setNotifications(list)
      const unread = list.filter(n => !n.is_read).length
      onUnreadCountChange?.(unread)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Close on outside click
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      const unread = notifications.filter(n => !n.is_read && n.id !== id).length
      onUnreadCountChange?.(unread)
    } catch { toast.error('Failed to mark as read') }
  }

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      onUnreadCountChange?.(0)
      toast.success('All notifications marked as read')
    } catch { toast.error('Failed to mark all read') }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div ref={ref} className="absolute right-0 top-full mt-2 w-80 glass-card shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{unreadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAll} title="Mark all read"
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 font-medium">
              <CheckCheck className="w-3.5 h-3.5" /> All
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto custom-scroll">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No notifications</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id}
              className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700/30 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!n.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
              <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {typeIcons[n.type] || <Bell className="w-4 h-4 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${n.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{n.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
              </div>
              {!n.is_read && (
                <button onClick={() => handleMarkRead(n.id)} title="Mark as read"
                  className="flex-shrink-0 p-1 rounded text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700/50 text-center">
          <span className="text-xs text-gray-400">{notifications.length} notifications</span>
        </div>
      )}
    </div>
  )
}
