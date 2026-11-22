import api from './api'

const authService = {
  login: (email, password, role) =>
    api.post('/auth/login', { email, password, role }),

  logout: () =>
    api.post('/auth/logout'),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token, password) =>
    api.post('/auth/reset-password', { token, password }),

  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),

  me: () =>
    api.get('/auth/me'),
}

export default authService
