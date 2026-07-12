import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Download, Printer, User, FileText, Image as ImageIcon } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { vendorService } from '@/services/vendorService'
import type { Vendor } from '@/types'
import { PageHeader } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { QRCodeSVG } from 'qrcode.react'

export default function VendorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVendor = async () => {
      if (!id) return
      try {
        const data = await vendorService.getById(id)
        setVendor(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load vendor details')
      } finally {
        setIsLoading(false)
      }
    }
    fetchVendor()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <Spinner size="lg" className="text-simmam-gold" />
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <p className="text-red-500 font-medium">{error || 'Vendor not found'}</p>
        <Button variant="outline" onClick={() => navigate(ROUTES.VENDORS)}>
          Back to Vendors
        </Button>
      </div>
    )
  }

  // Print QR Code
  const printQR = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const svg = document.getElementById('vendor-qr-code')
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${vendor.vendor_id}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
            .qr-container { padding: 40px; border: 2px solid #000; border-radius: 16px; text-align: center; }
            h1 { margin-bottom: 20px; font-size: 24px; }
            svg { width: 300px; height: 300px; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>Vendor ID: ${vendor.vendor_id}</h1>
            ${svg?.outerHTML}
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(ROUTES.VENDORS)}
          className="p-2 rounded-full bg-simmam-elevated border border-simmam-gold-border hover:bg-simmam-gold/10 hover:text-simmam-gold transition-colors text-simmam-text-secondary"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-simmam-text-primary">Vendor Profile</h1>
          <p className="text-simmam-text-muted text-sm">{vendor.vendor_id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" leftIcon={<Printer size={16} />} onClick={printQR}>
            Print ID
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Col: Photo & ID */}
        <div className="space-y-6">
          <div className="bg-simmam-elevated border border-simmam-gold-border rounded-simmam-xl p-6 flex flex-col items-center text-center shadow-gold-sm">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-simmam-gold mb-4 bg-simmam-bg">
              {vendor.photo ? (
                <img src={vendor.photo} alt={vendor.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-simmam-text-muted">
                  <User size={40} />
                </div>
              )}
            </div>
            <h2 className="text-xl font-display font-bold text-simmam-text-primary">{vendor.name}</h2>
            <p className="text-simmam-text-muted mb-4">{vendor.company || 'Independent'}</p>
            
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
              vendor.status === 'INSIDE' 
                ? 'bg-green-500/10 text-green-500 border-green-500/30' 
                : 'bg-red-500/10 text-red-500 border-red-500/30'
            }`}>
              {vendor.status}
            </div>

            <div className="mt-8 bg-simmam-bg p-4 rounded-xl border border-simmam-gold-border">
              <QRCodeSVG
                id="vendor-qr-code"
                value={vendor.vendor_id}
                size={160}
                level="H"
                includeMargin={true}
                fgColor="#000000"
                bgColor="#FFFFFF"
                className="mx-auto"
              />
              <p className="font-mono font-bold text-simmam-gold tracking-widest mt-3">
                {vendor.vendor_id}
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Details & Documents */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-simmam-elevated border border-simmam-gold-border rounded-simmam-xl p-6 md:p-8">
            <h3 className="text-lg font-display font-semibold text-simmam-gold mb-6 border-b border-simmam-gold-border/50 pb-2">
              Registration Details
            </h3>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-simmam-text-muted uppercase tracking-wider mb-1">Mobile Number</p>
                <p className="font-medium text-simmam-text-primary">{vendor.mobile}</p>
              </div>
              <div>
                <p className="text-xs text-simmam-text-muted uppercase tracking-wider mb-1">Vehicle Number</p>
                <p className="font-medium text-simmam-text-primary">{vendor.vehicle_number}</p>
              </div>
              <div>
                <p className="text-xs text-simmam-text-muted uppercase tracking-wider mb-1">Stall Number</p>
                <p className="font-medium text-simmam-text-primary">{vendor.stall_number}</p>
              </div>
              <div>
                <p className="text-xs text-simmam-text-muted uppercase tracking-wider mb-1">Total Entries</p>
                <p className="font-medium text-simmam-text-primary">{vendor.entry_count}</p>
              </div>
              <div>
                <p className="text-xs text-simmam-text-muted uppercase tracking-wider mb-1">Registration Date</p>
                <p className="text-sm text-simmam-text-secondary">
                  {new Date(vendor.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
