import api from './api'

const settingsService = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  uploadLogo: (formData) => api.post('/settings/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHolidays: () => api.get('/settings/holidays'),
  addHoliday: (data) => api.post('/settings/holidays', data),
  deleteHoliday: (id) => api.delete(`/settings/holidays/${id}`),
  getDashboardStats: () => api.get('/settings/dashboard-stats'),
}

export default settingsService
