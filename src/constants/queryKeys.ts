// ─────────────────────────────────────────────
// TanStack Query Keys
// ─────────────────────────────────────────────

export const QUERY_KEYS = {
  // Auth
  SESSION: ['session'] as const,
  PROFILE: (userId: string) => ['profile', userId] as const,

  // Vendors
  VENDORS: ['vendors'] as const,
  VENDORS_LIST: (filters: Record<string, unknown>) => ['vendors', 'list', filters] as const,
  VENDOR: (id: string) => ['vendors', id] as const,

  // Verification Logs
  VERIFICATION_LOGS: ['verification-logs'] as const,
  VERIFICATION_LOGS_LIST: (filters?: Record<string, unknown>) =>
    ['verification-logs', 'list', filters] as const,

  // Dashboard
  DASHBOARD_STATS: ['dashboard', 'stats'] as const,
  RECENT_ACTIVITY: ['dashboard', 'recent-activity'] as const,

  // Reports
  REPORTS: (filters: Record<string, unknown>) => ['reports', filters] as const,
} as const

export const ROLES = {
  SUPER_ADMIN: 'super_admin' as const,
  ADMIN: 'admin' as const,
  VOLUNTEER: 'volunteer' as const,
}

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  volunteer: 'Volunteer',
}

export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN]
