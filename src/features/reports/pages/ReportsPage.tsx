import { useState, useEffect } from 'react'
import { Download, FileText, FileSpreadsheet, Printer } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageHeader } from '@/components/shared/EmptyState'
import { vendorService } from '@/services/vendorService'
import { scanService } from '@/services/scanService'
import type { DashboardStats, Vendor, EntryLog } from '@/types'
import { exportVendorsCSV, exportVendorsExcel, exportVendorsPDF, exportLogsCSV } from '@/utils/exportHelpers'

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [logs, setLogs] = useState<EntryLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, vendorData, logData] = await Promise.all([
          vendorService.getDashboardStats(),
          vendorService.list({}, 1, 5000), // Fetch up to 5000 for export
          scanService.getLogs({}, 1, 5000)
        ])
        setStats(statsData)
        setVendors(vendorData.data)
        setLogs(logData.data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate and export vendor statistics and entry logs"
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Vendors', value: stats?.totalVendors, color: 'text-simmam-gold' },
          { label: 'Inside', value: stats?.insideVendors, color: 'text-green-500' },
          { label: 'Outside', value: stats?.outsideVendors, color: 'text-red-500' },
          { label: 'Total Entries', value: stats?.totalEntriesToday, color: 'text-simmam-text-primary' },
          { label: 'Total Exits', value: stats?.totalExitsToday, color: 'text-simmam-text-muted' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-simmam-elevated border border-simmam-gold-border rounded-simmam p-4 text-center">
            <p className="text-xs text-simmam-text-muted uppercase tracking-wider">{label}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-12 mx-auto mt-2" />
            ) : (
              <p className={`font-display font-bold text-3xl mt-1 ${color}`}>{value ?? 0}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Vendor Export */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-simmam-text-secondary">
              Export the complete vendor list including company, mobile, vehicle number, and current status.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download size={14} />}
                onClick={() => exportVendorsCSV(vendors)}
                disabled={isLoading || !vendors.length}
                className="flex-1"
              >
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileSpreadsheet size={14} />}
                onClick={() => exportVendorsExcel(vendors)}
                disabled={isLoading || !vendors.length}
                className="flex-1"
              >
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FileText size={14} />}
                onClick={() => exportVendorsPDF(vendors)}
                disabled={isLoading || !vendors.length}
                className="flex-1"
              >
                PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Export */}
        <Card>
          <CardHeader>
            <CardTitle>Entry Logs Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-simmam-text-secondary">
              Export all check-in and check-out activities recorded by the scanners.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Download size={14} />}
                onClick={() => exportLogsCSV(logs)}
                disabled={isLoading || !logs.length}
                className="w-full"
              >
                Export Logs to CSV
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Printer size={14} />}
                onClick={() => window.print()}
                disabled={isLoading}
                className="w-full"
              >
                Print Report Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
