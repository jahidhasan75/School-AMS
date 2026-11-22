import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Users, FileText, BarChart2,
  QrCode, Bell, Settings, LogOut, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getInitials } from '../../utils/formatUtils'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/attendance', label: 'Attendance', icon: Calendar },
  { to: '/admin/teachers', label: 'Teachers', icon: Users },
  { to: '/admin/leaves', label: 'Leave Requests', icon: FileText },
  { to: '/admin/reports', label: 'Reports', icon: BarChart2 },
  { to: '/admin/qr', label: 'QR Attendance', icon: QrCode },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth()

  const NavItem = ({ to, label, icon: Icon }) => (
    <NavLink
      to={to}
      onClick={onMobileClose}
      className={({ isActive }) =>
        `sidebar-nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
      }
      title={collapsed ? label : ''}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  )

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        {!collapsed && (
          <div>
            <span className="text-white font-bold text-base tracking-wide">School AMS</span>
            <p className="text-blue-200 text-xs">Admin Portal</p>
          </div>
        )}
        {/* Mobile close */}
        <button onClick={onMobileClose} className="ml-auto lg:hidden text-white/70 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Admin Info + Logout */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {getInitials(user?.name || user?.full_name || 'Admin')}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name || user?.full_name || 'Administrator'}</p>
              <p className="text-blue-200 text-xs">Administrator</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={`sidebar-nav-item w-full text-red-300 hover:text-red-200 hover:bg-red-500/20 ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col
          bg-gradient-to-b from-blue-900 to-blue-950
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-16' : 'w-64'}
          relative flex-shrink-0 h-screen sticky top-0
        `}
      >
        {sidebarContent}
        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 bg-blue-800 border border-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="relative w-64 bg-gradient-to-b from-blue-900 to-blue-950 h-full flex flex-col z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}

export default AdminSidebar
