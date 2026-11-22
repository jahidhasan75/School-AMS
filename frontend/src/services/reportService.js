import api from './api'

const reportService = {
  getDaily: (params) => api.get('/reports/daily', { params }),
  getWeekly: (params) => api.get('/reports/weekly', { params }),
  getMonthly: (params) => api.get('/reports/monthly', { params }),
  getYearly: (params) => api.get('/reports/yearly', { params }),
  getIndividual: (params) => api.get('/reports/individual', { params }),
  getDepartment: (params) => api.get('/reports/department', { params }),
  exportPDF: (params) => api.get('/reports/export/pdf', { params, responseType: 'blob' }),
  exportExcel: (params) => api.get('/reports/export/excel', { params, responseType: 'blob' }),
}

export default reportService
