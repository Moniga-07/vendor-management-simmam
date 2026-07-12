import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Eye, Edit, Trash2, ShieldCheck, QrCode } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { vendorService } from '@/services/vendorService'
import { PageHeader } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useDebounce } from '@/hooks/useDebounce'
import type { Vendor } from '@/types'

export default function VendorListPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'INSIDE' | 'OUTSIDE'>('all')
  const [page, setPage] = useState(1)
  const limit = 10

  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['vendors', { page, limit, search: debouncedSearch, status: statusFilter }],
    queryFn: () => vendorService.list({ search: debouncedSearch, status: statusFilter }, page, limit),
  })

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vendor? This cannot be undone.')) {
      try {
        await vendorService.delete(id)
        refetch()
      } catch (err: any) {
        alert(err.message || 'Failed to delete vendor')
      }
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Management"
        subtitle="Manage registered vendors, view their status, and generate IDs."
        actions={
          <Link to={ROUTES.VENDOR_REGISTER}>
            <Button leftIcon={<Plus size={16} />}>Register Vendor</Button>
          </Link>
        }
      />

      <div className="bg-simmam-elevated border border-simmam-gold-border rounded-simmam-xl p-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Search by name, ID, mobile..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search size={16} />}
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              variant={statusFilter === 'all' ? 'primary' : 'outline'} 
              size="sm" 
              onClick={() => { setStatusFilter('all'); setPage(1); }}
            >
              All
            </Button>
            <Button 
              variant={statusFilter === 'INSIDE' ? 'primary' : 'outline'} 
              size="sm" 
              onClick={() => { setStatusFilter('INSIDE'); setPage(1); }}
            >
              Inside
            </Button>
            <Button 
              variant={statusFilter === 'OUTSIDE' ? 'primary' : 'outline'} 
              size="sm" 
              onClick={() => { setStatusFilter('OUTSIDE'); setPage(1); }}
            >
              Outside
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size="lg" className="text-simmam-gold" />
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-red-500">Failed to load vendors.</div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-simmam-gold-border/50 text-xs text-simmam-text-muted uppercase tracking-wider">
                    <th className="p-4 font-medium">Photo</th>
                    <th className="p-4 font-medium">Vendor</th>
                    <th className="p-4 font-medium">Company</th>
                    <th className="p-4 font-medium">Mobile</th>
                    <th className="p-4 font-medium">Vehicle</th>
                    <th className="p-4 font-medium text-center">Status</th>
                    <th className="p-4 font-medium text-center">Entries</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-simmam-gold-border/30">
                  {data?.data.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-simmam-text-muted">
                        No vendors found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    data?.data.map((vendor: Vendor) => (
                      <tr key={vendor.id} className="hover:bg-simmam-bg/30 transition-colors">
                        <td className="p-4">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-simmam-gold-border bg-simmam-bg shrink-0">
                            {vendor.photo ? (
                              <img src={vendor.photo} alt={vendor.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-simmam-text-muted text-xs">No Pic</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-simmam-text-primary">{vendor.name}</p>
                          <p className="text-xs text-simmam-gold font-mono">{vendor.vendor_id}</p>
                        </td>
                        <td className="p-4 text-sm text-simmam-text-secondary">{vendor.company || '-'}</td>
                        <td className="p-4 text-sm text-simmam-text-secondary">{vendor.mobile}</td>
                        <td className="p-4 text-sm text-simmam-text-secondary">{vendor.vehicle_number}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            vendor.status === 'INSIDE' 
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            {vendor.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="font-mono text-sm bg-simmam-bg px-2 py-1 rounded-md border border-simmam-gold-border">
                            {vendor.entry_count}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={ROUTES.VENDOR_DETAIL(vendor.id)}>
                              <button className="p-1.5 text-simmam-text-muted hover:text-simmam-gold transition-colors" title="View Details">
                                <Eye size={16} />
                              </button>
                            </Link>
                            <button 
                              className="p-1.5 text-simmam-text-muted hover:text-red-500 transition-colors" 
                              title="Delete Vendor"
                              onClick={() => handleDelete(vendor.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
