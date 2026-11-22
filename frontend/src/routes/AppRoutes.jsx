import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import LoadingSpinner from '../components/common/LoadingSpinner'

// Public pages
const LandingPage = lazy(() => import('../pages/public/LandingPage'))
const FeaturesPage = lazy(() => import('../pages/public/FeaturesPage'))
const ContactPage = lazy(() => import('../pages/public/ContactPage'))

// Auth pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'))

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'))
const AdminAttendancePage = lazy(() => import('../pages/admin/AttendancePage'))
const AdminTeachersPage = lazy(() => import('../pages/admin/TeachersPage'))
const AdminLeaveRequestsPage = lazy(() => import('../pages/admin/LeaveRequestsPage'))
const AdminReportsPage = lazy(() => import('../pages/admin/ReportsPage'))
const AdminQRPage = lazy(() => import('../pages/admin/QRAttendancePage'))
const AdminNotificationsPage = lazy(() => import('../pages/admin/NotificationsPage'))
const AdminSettingsPage = lazy(() => import('../pages/admin/SettingsPage'))

// Teacher pages
const TeacherDashboard = lazy(() => import('../pages/teacher/Dashboard'))
const TeacherAttendancePage = lazy(() => import('../pages/teacher/MyAttendancePage'))
const TeacherApplyLeavePage = lazy(() => import('../pages/teacher/ApplyLeavePage'))
const TeacherHistoryPage = lazy(() => import('../pages/teacher/AttendanceHistoryPage'))
const TeacherProfilePage = lazy(() => import('../pages/teacher/ProfilePage'))

// Layouts
import AdminLayout from '../components/layout/AdminLayout'
import TeacherLayout from '../components/layout/TeacherLayout'

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-[#0B1224]">
      <LoadingSpinner size="lg" />
    </div>
  }>
    {children}
  </Suspense>
)

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<SuspenseWrapper><LandingPage /></SuspenseWrapper>} />
        <Route path="/features" element={<SuspenseWrapper><FeaturesPage /></SuspenseWrapper>} />
        <Route path="/contact" element={<SuspenseWrapper><ContactPage /></SuspenseWrapper>} />

        {/* Auth */}
        <Route path="/login" element={<SuspenseWrapper><LoginPage /></SuspenseWrapper>} />
        <Route path="/forgot-password" element={<SuspenseWrapper><ForgotPasswordPage /></SuspenseWrapper>} />
        <Route path="/reset-password" element={<SuspenseWrapper><ResetPasswordPage /></SuspenseWrapper>} />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <RoleRoute role="admin">
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuspenseWrapper><AdminDashboard /></SuspenseWrapper>} />
          <Route path="attendance" element={<SuspenseWrapper><AdminAttendancePage /></SuspenseWrapper>} />
          <Route path="teachers" element={<SuspenseWrapper><AdminTeachersPage /></SuspenseWrapper>} />
          <Route path="leaves" element={<SuspenseWrapper><AdminLeaveRequestsPage /></SuspenseWrapper>} />
          <Route path="reports" element={<SuspenseWrapper><AdminReportsPage /></SuspenseWrapper>} />
          <Route path="qr" element={<SuspenseWrapper><AdminQRPage /></SuspenseWrapper>} />
          <Route path="notifications" element={<SuspenseWrapper><AdminNotificationsPage /></SuspenseWrapper>} />
          <Route path="settings" element={<SuspenseWrapper><AdminSettingsPage /></SuspenseWrapper>} />
        </Route>

        {/* Teacher */}
        <Route path="/teacher" element={
          <ProtectedRoute>
            <RoleRoute role="teacher">
              <TeacherLayout />
            </RoleRoute>
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuspenseWrapper><TeacherDashboard /></SuspenseWrapper>} />
          <Route path="attendance" element={<SuspenseWrapper><TeacherAttendancePage /></SuspenseWrapper>} />
          <Route path="apply-leave" element={<SuspenseWrapper><TeacherApplyLeavePage /></SuspenseWrapper>} />
          <Route path="history" element={<SuspenseWrapper><TeacherHistoryPage /></SuspenseWrapper>} />
          <Route path="profile" element={<SuspenseWrapper><TeacherProfilePage /></SuspenseWrapper>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
