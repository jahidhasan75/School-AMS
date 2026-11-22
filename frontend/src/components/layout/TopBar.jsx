import React, { useState, useEffect } from 'react'
import { Bell, Sun, Moon, Menu } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import { getInitials } from '../../utils/formatUtils'
import { format } from 'date-fns'
import NotificationDropdown from '../notifications/NotificationDropdown'

function TopBar({ onMobileMenuOpen }) {
  const { theme, toggleTheme } = useTheme()
  const { user, role } = useAuth()
  const [time, setTime] = useState(new Date())
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="sticky top-0 z-30 glass-card border-b border-white/30 dark:border-white/10 px-4 py-3 flex items-center justify-between gap-4 rounded-none">
      {/* Left: Mobile menu + Date/Time */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {format(time, 'EEEE, MMMM d, yyyy')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {format(time, 'hh:mm:ss aa')}
          </p>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark'
            ? <Sun className="w-5 h-5 text-yellow-400" />
            : <Moon className="w-5 h-5 text-gray-500" />
          }
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(v => !v)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-500 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <NotificationDropdown
              onClose={() => setShowNotifications(false)}
              onUnreadCountChange={setUnreadCount}
            />
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
            {getInitials(user?.full_name || user?.name || 'U')}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-tight">
              {user?.full_name || user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopBar
