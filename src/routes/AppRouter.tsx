import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { AppLayout } from '@/layouts/AppLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { Spinner } from '@/components/ui/Spinner'

// ─────────────────────────────────────────────
// Lazy-loaded Pages (Code Splitting)
// ─────────────────────────────────────────────

const LoginPage         = lazy(() => import('@/features/auth/pages/LoginPage'))
const DashboardPage     = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const ScannerEntryPage  = lazy(() => import('@/features/scanner/pages/ScannerEntryPage'))
const ScannerExitPage   = lazy(() => import('@/features/scanner/pages/ScannerExitPage'))
const VendorListPage    = lazy(() => import('@/features/vendors/pages/VendorListPage'))
const RegisterVendorPage = lazy(() => import('@/features/vendors/pages/RegisterVendorPage'))
const VendorDetailPage  = lazy(() => import('@/features/vendors/pages/VendorDetailPage'))
const EntryHistoryPage  = lazy(() => import('@/features/reports/pages/EntryHistoryPage'))
const ReportsPage       = lazy(() => import('@/features/reports/pages/ReportsPage'))
const SettingsPage      = lazy(() => import('@/features/settings/pages/SettingsPage'))

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center py-20 min-h-screen bg-simmam-bg">
      <Spinner size="lg" className="text-simmam-gold" />
    </div>
  )
}

// ─────────────────────────────────────────────
// App Router
// ─────────────────────────────────────────────

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="scan/entry" element={<ScannerEntryPage />} />
            <Route path="scan/exit" element={<ScannerExitPage />} />
            <Route path="vendors" element={<VendorListPage />} />
            <Route path="vendors/register" element={<RegisterVendorPage />} />
            <Route path="vendors/:id" element={<VendorDetailPage />} />
            <Route path="vendors/:id/edit" element={<RegisterVendorPage />} />
            <Route path="history" element={<EntryHistoryPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Any unknown URL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
