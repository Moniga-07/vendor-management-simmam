import { api } from '@/lib/api'
import type { AuthUser, LoginCredentials } from '@/types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser, session: any }> {
    const { data } = await api.post('/auth/login', credentials)
    // Save token for future requests
    if (data.session?.access_token) {
      localStorage.setItem('simmam_auth_token', data.session.access_token)
    }
    return data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
    localStorage.removeItem('simmam_auth_token')
  },

  // Mock checking session based on localStorage token existence
  // In a real app we'd validate the token with the backend
  async getSession() {
    const token = localStorage.getItem('simmam_auth_token')
    if (!token) return null
    return { access_token: token }
  }
}
