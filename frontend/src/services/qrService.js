import api from './api'

const qrService = {
  generate: () => api.post('/qr/generate'),
  getActive: () => api.get('/qr/active'),
  verify: (token) => api.post('/qr/verify', { token }),
}

export default qrService
