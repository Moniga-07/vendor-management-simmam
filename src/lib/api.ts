import axios from 'axios'

// Configure API client to point to the Express backend dynamically so mobile testing works
const backendUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`

export const api = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add an interceptor to inject the token if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('simmam_auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
