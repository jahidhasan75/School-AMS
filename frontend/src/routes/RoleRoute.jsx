import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function RoleRoute({ children, role }) {
  const { role: userRole } = useAuth()

  if (userRole !== role) {
    if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (userRole === 'teacher') return <Navigate to="/teacher/dashboard" replace />
    return <Navigate to="/login" replace />
  }

  return children
}

export default RoleRoute
