import api from './api'

const attendanceService = {
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),

  // Teacher
  getMyAttendance: (params) => api.get('/attendance/my', { params }),
  getMySummary: (params) => api.get('/attendance/my-summary', { params }),

  // Admin dashboard aliases
  getSummary: () => api.get('/attendance/summary'),
  getToday: (params) => api.get('/attendance/today', { params }),

  // Admin attendance list
  getAll: (params) => api.get('/attendance', { params }),
  updateAttendance: (id, data) => api.put(`/attendance/${id}`, data),
  addManual: (data) => api.post('/attendance/manual', data),
}

export default attendanceService
