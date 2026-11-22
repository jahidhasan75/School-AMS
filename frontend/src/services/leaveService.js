import api from './api'

const leaveService = {
  apply: (data) => api.post('/leaves', data),
  getMy: (params) => api.get('/leaves/my', { params }),
  getAll: (params) => api.get('/leaves', { params }),
  getById: (id) => api.get(`/leaves/${id}`),
  approve: (id, remarks) => api.put(`/leaves/${id}/approve`, { remarks }),
  reject: (id, remarks) => api.put(`/leaves/${id}/reject`, { remarks }),
  cancel: (id) => api.delete(`/leaves/${id}`),
  uploadDocument: (id, formData) => api.post(`/leaves/${id}/document`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

export default leaveService
