// ─────────────────────────────────────────────
// Application Routes
// ─────────────────────────────────────────────

export const ROUTES = {
  // Auth
  LOGIN: '/login',

  // Public Management Portal (Protected by Auth)
  DASHBOARD: '/',
  SCAN_ENTRY: '/scan/entry',
  SCAN_EXIT: '/scan/exit',
  VENDORS: '/vendors',
  VENDOR_REGISTER: '/vendors/register',
  VENDOR_EDIT: (id: string) => `/vendors/${id}/edit`,
  VENDOR_DETAIL: (id: string) => `/vendors/${id}`,
  HISTORY: '/history',
  REPORTS: '/reports',
  SETTINGS: '/settings',
} as const
