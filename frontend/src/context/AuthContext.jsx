import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('school-ams-token')
    const storedUser = localStorage.getItem('school-ams-user')
    const storedRole = localStorage.getItem('school-ams-role')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      setRole(storedRole)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password, selectedRole) => {
    const res = await authService.login(email, password, selectedRole)
    const { token: t, user: u, role: r } = res.data.data
    setToken(t)
    setUser(u)
    setRole(r)
    localStorage.setItem('school-ams-token', t)
    localStorage.setItem('school-ams-user', JSON.stringify(u))
    localStorage.setItem('school-ams-role', r)
    return { role: r }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setRole(null)
    localStorage.removeItem('school-ams-token')
    localStorage.removeItem('school-ams-user')
    localStorage.removeItem('school-ams-role')
    toast.success('Logged out successfully')
    window.location.href = '/login'
  }, [])

  const isAdmin = () => role === 'admin'
  const isTeacher = () => role === 'teacher'

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, logout, isAdmin, isTeacher }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export default AuthContext
