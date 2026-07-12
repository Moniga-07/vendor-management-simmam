import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ArrowLeft, Search } from 'lucide-react'
import { scanService } from '@/services/scanService'
import { PageHeader } from '@/components/shared/EmptyState'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useDebounce } from '@/hooks/useDebounce'
import type { EntryLog } from '@/types'

export default function EntryHistoryPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['entry-logs', { page, limit, search: debouncedSearch }],
    queryFn: () => scanService.getLogs({ search: debouncedSearch }, page, limit),
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader 
        title="Entry Logs" 
        subtitle="Complete history of vendor entries and exits." 
      />

      <Card className="p-4 bg-simmam-elevated border border-simmam-gold-border rounded-simmam-xl">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Search by Coordinator or Action..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search size={16} />}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" className="text-simmam-gold" />
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">Failed to load logs.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-simmam-gold-border/50 text-xs text-simmam-text-muted uppercase tracking-wider">
                  <th className="p-4 font-medium">Time</th>
                  <th className="p-4 font-medium">Vendor</th>
                  <th className="p-4 font-medium">Action</th>
                  <th className="p-4 font-medium">Coordinator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-simmam-gold-border/30">
                {data?.data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-simmam-text-muted">
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  data?.data.map((log: EntryLog) => (
                    <tr key={log.id} className="hover:bg-simmam-elevated/50 transition-colors">
                      <td className="p-4 text-sm text-simmam-text-secondary whitespace-nowrap">
                        <div className="font-medium text-simmam-text-primary">
                          {new Date(log.time).toLocaleDateString()}
                        </div>
                        <div className="text-xs">
                          {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-simmam-text-primary">{log.vendor?.name || 'Unknown Vendor'}</p>
                        <p className="text-xs text-simmam-text-muted">
                          {log.vendor?.vendor_id} {log.vendor?.company ? `• ${log.vendor.company}` : ''}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          log.action === 'ENTRY' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {log.action === 'ENTRY' ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                          {log.action}
                        </span>
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
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-simmam-gold-border/50">
            <span className="text-sm text-simmam-text-muted">
              Showing page {data.page} of {data.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
