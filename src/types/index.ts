// ─────────────────────────────────────────────
// SIMMAM Vendor Portal — Domain Types (New Arch)
// ─────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
}

export interface LoginCredentials {
  email: string
  password?: string
}

export type VendorStatus = 'INSIDE' | 'OUTSIDE'

export interface Vendor {
  id: string
  vendor_id: string          // VEN0001
  name: string
  mobile: string
  company: string
  stall_number: string
  vehicle_number: string
  photo: string              // URL
  status: VendorStatus
  entry_count: number
  created_at: string
}

export type LogAction = 'ENTRY' | 'EXIT'

export interface EntryLog {
  id: string
  vendor_id: string
  action: LogAction
  time: string
  coordinator: string
  vendor?: Vendor // When joined
}

export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}

export interface DashboardStats {
  totalVendors: number
  insideVendors: number
  outsideVendors: number
  totalEntriesToday: number
  totalExitsToday: number
}
