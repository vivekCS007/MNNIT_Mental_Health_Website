import axios from 'axios'
import { API_BASE_URL, STORAGE_KEYS } from '../constants/index'
import { getLocalStorage, removeLocalStorage } from '../utils/index'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getLocalStorage(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      removeLocalStorage(STORAGE_KEYS.TOKEN)
      removeLocalStorage(STORAGE_KEYS.USER)
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (userType, userId, password) =>
    apiClient.post('/auth/login', { userType, userId, password }),
  forgotPassword: (email) =>
    apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) =>
    apiClient.post('/auth/reset-password', { token, password }),
  changePassword: (currentPassword, newPassword) =>
    apiClient.post('/auth/change-password', { currentPassword, newPassword }),
  logout: () =>
    apiClient.post('/auth/logout'),
  refreshToken: () =>
    apiClient.post('/auth/refresh-token')
}

// Booker API (shared by student / faculty / staff)
// The backend can route these to a generic appointments endpoint later.
// For now it mirrors the student endpoints so the existing dashboard works.
export const bookerAPI = {
  getProfile: () =>
    apiClient.get('/appointments/profile'),
  getCounsellors: () =>
    apiClient.get('/appointments/counsellors'),
  getAvailability: (counsellorId) =>
    apiClient.get(`/appointments/availability`, { params: { counsellorId } }),
  bookAppointment: (data) =>
    apiClient.post('/appointments', data),
  getAppointments: () =>
    apiClient.get('/appointments'),
  getAppointmentById: (id) =>
    apiClient.get(`/appointments/${id}`),
  cancelAppointment: (id) =>
    apiClient.put(`/appointments/${id}/cancel`)
}

// Student API
export const studentAPI = {
  getProfile: () =>
    apiClient.get('/student/profile'),
  updateProfile: (data) =>
    apiClient.put('/student/profile', data),
  bookAppointment: (data) =>
    apiClient.post('/student/appointments', data),
  getAppointments: () =>
    apiClient.get('/student/appointments'),
  getAppointmentById: (id) =>
    apiClient.get(`/student/appointments/${id}`),
  cancelAppointment: (id) =>
    apiClient.put(`/student/appointments/${id}/cancel`)
}

// Counsellor API
export const counsellorAPI = {
  getProfile: () =>
    apiClient.get('/counsellor/profile'),
  updateProfile: (data) =>
    apiClient.put('/counsellor/profile', data),
  getPendingRequests: () =>
    apiClient.get('/counsellor/appointments/pending'),
  getSolvedRequests: () =>
    apiClient.get('/counsellor/appointments/solved'),
  getAppointmentById: (id) =>
    apiClient.get(`/counsellor/appointments/${id}`),
  updateAppointment: (id, data) =>
    apiClient.put(`/counsellor/appointments/${id}`, data),
  confirmBooking: (id, data) =>
    apiClient.post(`/counsellor/appointments/${id}/confirm`, data),
  getBookerHistory: (bookerId) =>
    apiClient.get(`/counsellor/bookers/${bookerId}/history`),
  updateStatus: (id, status) =>
    apiClient.put(`/counsellor/appointments/${id}/status`, { status }),
  savePrescription: (id, data) =>
    apiClient.put(`/counsellor/appointments/${id}/prescription`, data)
}

// Administrator API
export const adminAPI = {
  getAllRequests: (filters = {}) =>
    apiClient.get('/admin/appointments', { params: filters }),
  getRequestById: (id) =>
    apiClient.get(`/admin/appointments/${id}`),
  searchByRegNo: (regNo) =>
    apiClient.get('/admin/appointments/search', { params: { regNo } }),
  getStatistics: () =>
    apiClient.get('/admin/statistics'),
  getAnalytics: (userType = 'all') =>
    apiClient.get('/admin/analytics', { params: { userType } }),
  exportData: (format = 'csv') =>
    apiClient.get(`/admin/export?format=${format}`, { responseType: 'blob' }),
  getCounsellors: () =>
    apiClient.get('/admin/counsellors'),
  createCounsellor: (data) =>
    apiClient.post('/admin/counsellors', data),
  getSchedules: (id) =>
    apiClient.get(`/admin/counsellors/${id}/schedules`),
  addSchedule: (id, data) =>
    apiClient.post(`/admin/counsellors/${id}/schedules`, data),
  deleteSchedule: (id, scheduleId) =>
    apiClient.delete(`/admin/counsellors/${id}/schedules/${scheduleId}`),
  blockSlot: (id, data) =>
    apiClient.post(`/admin/counsellors/${id}/block-slot`, data),
  importStudents: (formData) =>
    apiClient.post('/admin/students/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  downloadStudentTemplate: () =>
    apiClient.get('/admin/students/template', { responseType: 'blob' }),
}

// Dean API
export const deanAPI = {
  getDashboardAnalytics: (userType = 'all') =>
    apiClient.get('/dean/analytics', { params: { userType } }),
  getRequestStats: () =>
    apiClient.get('/dean/statistics'),
  getTrends: (period = 'month') =>
    apiClient.get(`/dean/trends?period=${period}`),
  generateReport: (startDate, endDate) =>
    apiClient.get('/dean/report', { params: { startDate, endDate } }),
  getAllAppointments: () =>
    apiClient.get('/dean/appointments'),
  exportData: (format = 'csv') =>
    apiClient.get(`/dean/export?format=${format}`, { responseType: 'blob' })
}

// Public API
export const publicAPI = {
  getServices: () =>
    apiClient.get('/public/services'),
  getTeamMembers: () =>
    apiClient.get('/public/team'),
  getEmergencyContacts: () =>
    apiClient.get('/public/emergency-contacts'),
  getResources: () =>
    apiClient.get('/public/resources')
}

export default apiClient
