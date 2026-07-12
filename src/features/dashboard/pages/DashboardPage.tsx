import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  UserPlus,
  Scan,
  FileBarChart2,
  QrCode,
  ArrowRightLeft,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { ROUTES } from '@/constants/routes'
import { vendorService } from '@/services/vendorService'
import { scanService } from '@/services/scanService'
import type { DashboardStats, EntryLog } from '@/types'
import { PageHeader } from '@/components/shared/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentLogs, setRecentLogs] = useState<EntryLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, logsData] = await Promise.all([
          vendorService.getDashboardStats(),
          scanService.getLogs({}, 1, 5) // Get latest 5 logs
        ])
        setStats(statsData)
        setRecentLogs(logsData.data)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" className="text-simmam-gold" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Vendors', value: stats?.totalVendors ?? 0, icon: Users, color: 'text-simmam-gold' },
    { label: 'Vendors Inside', value: stats?.insideVendors ?? 0, icon: ArrowRight, color: 'text-green-500' },
    { label: 'Vendors Outside', value: stats?.outsideVendors ?? 0, icon: ArrowLeft, color: 'text-red-500' },
    { label: 'Total Entries Today', value: stats?.totalEntriesToday ?? 0, icon: Scan, color: 'text-simmam-gold' },
    { label: 'Total Exits Today', value: stats?.totalExitsToday ?? 0, icon: QrCode, color: 'text-simmam-text-muted' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="SIMMAM 2026 · Vendor Verification Overview"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <stat.icon size={24} className={`${stat.color} mb-3`} />
                <p className="text-3xl font-display font-bold text-simmam-text-primary">
                  {stat.value}
                </p>
                <p className="text-xs text-simmam-text-muted mt-1 font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Link to={ROUTES.HISTORY}>
                <Button variant="ghost" size="sm" className="text-simmam-gold">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-simmam-gold-border/50 text-xs text-simmam-text-muted uppercase tracking-wider">
                    <th className="p-4 font-medium">Vendor</th>
                    <th className="p-4 font-medium">Action</th>
                    <th className="p-4 font-medium">Time</th>
                    <th className="p-4 font-medium">Coordinator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-simmam-gold-border/30">
                  {recentLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-simmam-text-muted">
                        No recent activity.
                      </td>
                    </tr>
                  ) : (
                    recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-simmam-elevated/50 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-simmam-text-primary">{log.vendor?.name || 'Unknown'}</p>
                          <p className="text-xs text-simmam-text-muted">{log.vendor?.vendor_id}</p>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            log.action === 'ENTRY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {log.action === 'ENTRY' ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-simmam-text-secondary">
                          {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 text-sm text-simmam-text-secondary">
                          {log.coordinator}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <div className="space-y-2 px-6 pb-6">
              <Link to={ROUTES.SCAN_ENTRY} className="block">
                <Button variant="primary" fullWidth leftIcon={<Scan size={15} />} className="justify-start">
                  Entry Scanner
                </Button>
              </Link>
              <Link to={ROUTES.SCAN_EXIT} className="block">
                <Button variant="outline" fullWidth leftIcon={<QrCode size={15} />} className="justify-start border-simmam-gold text-simmam-gold">
                  Exit Scanner
                </Button>
              </Link>
              <Link to={ROUTES.VENDOR_REGISTER} className="block mt-4">
                <Button variant="secondary" fullWidth leftIcon={<UserPlus size={15} />} className="justify-start">
                  Register Vendor
                </Button>
              </Link>
              <Link to={ROUTES.HISTORY} className="block">
                <Button variant="ghost" fullWidth leftIcon={<ArrowRightLeft size={15} />} className="justify-start">
                  View Entry Logs
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
