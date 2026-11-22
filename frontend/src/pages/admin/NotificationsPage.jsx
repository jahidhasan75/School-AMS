import React, { useState, useEffect, useCallback } from 'react'
import { Bell, CheckCheck, Filter, Megaphone, Loader2, Info, Calendar, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import notificationService from '../../services/notificationService'
import { formatDateTime } from '../../utils/dateUtils'

const typeIcons = {
  attendance: { icon: Calendar, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  leave: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  correction: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  announcement: { icon: Megaphone, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('')
  const limit = 20

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit }
      if (filter) params.type = filter
      const res = await notificationService.getAll(params)
      setNotifications(res.data.data || [])
      setTotal(res.data.pagination?.total || 0)
    } catch { toast.error('Failed to load notifications') }
    finally { setLoading(false) }
  }, [page, filter])

  useEffect(() => { loadNotifications() }, [loadNotifications])

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch { toast.error('Failed') }
  }

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      toast.success('All notifications marked as read')
    } catch { toast.error('Failed') }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" /> Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'} · {total} total
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} className="glass-card px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2 transition-colors">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><Filter className="w-4 h-4" /> Filter:</span>
        {['', 'attendance', 'leave', 'correction', 'announcement'].map(t => (
          <button key={t} onClick={() => { setFilter(t); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === t ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30'}`}>
            {t || 'All'}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center">
            <Bell className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No notifications found</p>
            <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/30">
            {notifications.map(n => {
              const typeInfo = typeIcons[n.type] || typeIcons.announcement
              const Icon = typeInfo.icon
              return (
                <div key={n.id}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!n.is_read ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}>
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeInfo.bg}`}>
                    <Icon className={`w-5 h-5 ${typeInfo.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${n.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{n.title}</p>
                      {!n.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-gray-400">{formatDateTime(n.created_at)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${typeInfo.bg} ${typeInfo.color}`}>{n.type}</span>
                    </div>
                  </div>

                  {/* Mark read button */}
                  {!n.is_read && (
                    <button onClick={() => handleMarkRead(n.id)}
                      className="flex-shrink-0 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium whitespace-nowrap py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      Mark read
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

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
    </div>
  )
}
