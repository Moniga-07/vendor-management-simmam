import { api } from '@/lib/api'
import type { Vendor, PaginatedResult, DashboardStats } from '@/types'

// ─────────────────────────────────────────────
// Vendor Service (Axios -> Express)
// ─────────────────────────────────────────────

export const vendorService = {
  /** Get paginated vendors */
  async list(filters: any = {}, page = 1, limit = 20): Promise<PaginatedResult<Vendor>> {
    const { data } = await api.get('/vendors', {
      params: { ...filters, page, limit }
    })
    
    return {
      data: data.data,
      count: data.count,
      page: data.page,
      limit: data.limit,
      totalPages: Math.ceil(data.count / data.limit)
    }
  },

  /** Get single vendor by ID */
  async getById(id: string): Promise<Vendor> {
    const { data } = await api.get(`/vendors/${id}`)
    return data
  },

  /** Create vendor using FormData (for files and webcam image) */
  async create(formData: FormData): Promise<Vendor> {
    const { data } = await api.post('/vendors', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  },

  /** Delete vendor */
  async delete(id: string): Promise<void> {
    await api.delete(`/vendors/${id}`)
  },

  /** Dashboard statistics */
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await api.get('/vendors/stats/dashboard')
    return data
  },
}
