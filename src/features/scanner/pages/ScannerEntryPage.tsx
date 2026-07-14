import { useState, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanLine, RefreshCcw, CheckCircle2, AlertTriangle, User, Upload } from 'lucide-react'
import { scanService } from '@/services/scanService'
import { vendorService } from '@/services/vendorService'
import { useAuth } from '@/hooks/useAuth'
import type { Vendor } from '@/types'
import { PageHeader } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/hooks/useToast'

type ScannerState = 'idle' | 'scanning' | 'processing' | 'success' | 'error'

export default function ScannerEntryPage() {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  
  const [scannerState, setScannerState] = useState<ScannerState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [scannedVendor, setScannedVendor] = useState<Vendor | null>(null)
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null)

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader')
    setHtml5QrCode(scanner)
    return () => {
      if (scanner.isScanning) {
        scanner.stop().catch(console.error)
      }
    }
  }, [])

  const startScanner = async (facingMode: 'environment' | 'user' = 'environment') => {
    if (!html5QrCode) return
    try {
      setScannerState('scanning')
      await html5QrCode.start(
        { facingMode },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScan,
        undefined
      )
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to access camera.')
      setScannerState('error')
    }
  }

  const stopScanner = async () => {
    if (html5QrCode?.isScanning) {
      await html5QrCode.stop()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !html5QrCode) return
    try {
      setScannerState('processing')
      const decodedText = await html5QrCode.scanFile(file, true)
      await handleScan(decodedText)
    } catch (err) {
      console.error(err)
      setErrorMsg('No QR code found in the image.')
      setScannerState('error')
    }
    // reset input
    e.target.value = ''
  }

  const handleScan = async (decodedText: string) => {
    // Expecting VEN0001
    await stopScanner()
    setScannerState('processing')
    
    try {
      // First, fetch the vendor to display their details
      const vendorResult = await vendorService.list({ search: decodedText }, 1, 1)
      const vendor = vendorResult.data[0]
      
      if (!vendor || vendor.vendor_id !== decodedText) {
        throw new Error('Vendor not found for this QR code.')
      }

      setScannedVendor(vendor)

      if (vendor.status === 'INSIDE') {
        scanService.playErrorBeep()
        setErrorMsg('Vendor is already INSIDE. Cannot allow duplicate entry.')
        setScannerState('error')
        return
      }

      // If OUTSIDE, show the allow screen
      setScannerState('success')
    } catch (err: any) {
      scanService.playErrorBeep()
      scanService.vibrate([200, 100, 200])
      setErrorMsg(err.message || 'Invalid QR code.')
      setScannerState('error')
    }
  }

  const handleAllowEntry = async () => {
    if (!scannedVendor) return
    setIsSubmitting(true)
    try {
      const res = await scanService.processEntry(scannedVendor.vendor_id, user?.email || 'Coordinator')
      if (res.success) {
        scanService.playSuccessBeep()
        success('Entry Allowed', `${scannedVendor.name} has been marked as INSIDE.`)
        resetScanner()
      } else {
        throw new Error(res.error || 'Failed to process entry.')
      }
    } catch (err: any) {
      showError('Entry Failed', err.message)
      scanService.playErrorBeep()
    } finally {
      setIsSubmitting(false)
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetScanner = () => {
    setScannedVendor(null)
    setScannerState('idle')
    setErrorMsg('')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader 
        title="Entry Gate Scanner" 
        subtitle="Scan vendor QR codes to allow entry into the premises." 
      />

      <div className="bg-simmam-elevated border border-simmam-gold-border rounded-simmam-xl p-6 overflow-hidden">
        
        {/* Scanner View */}
        {scannerState === 'idle' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-simmam-gold/10 text-simmam-gold rounded-full flex items-center justify-center mx-auto mb-6 border border-simmam-gold/30">
              <ScanLine size={32} />
            </div>
            <h2 className="text-xl font-display font-bold text-simmam-text-primary mb-2">Ready to Scan</h2>
            <p className="text-simmam-text-muted mb-8">Point camera at the vendor's QR code or upload an image</p>
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
              <Button size="lg" variant="primary" onClick={() => startScanner('environment')} leftIcon={<ScanLine size={18} />}>
                Back Camera
              </Button>
              <Button size="lg" variant="outline" onClick={() => startScanner('user')} leftIcon={<ScanLine size={18} />}>
                Front Camera
              </Button>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                />
                <Button size="lg" variant="outline" leftIcon={<Upload size={18} />} type="button">
                  Upload Image
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Camera Feed */}
        <div className={`relative ${scannerState === 'scanning' ? 'block' : 'hidden'}`}>
          <div id="qr-reader" className="w-full rounded-xl overflow-hidden border-2 border-simmam-gold border-dashed" />
          <div className="absolute bottom-4 left-0 w-full flex justify-center">
            <Button variant="secondary" onClick={() => { stopScanner(); resetScanner(); }}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Processing */}
        {scannerState === 'processing' && (
          <div className="text-center py-12">
            <Spinner size="lg" className="text-simmam-gold mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-simmam-text-primary">Verifying...</h2>
            <p className="text-simmam-text-muted mt-2">Fetching vendor details</p>
          </div>
        )}

        {/* Error */}
        {scannerState === 'error' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-display font-bold text-simmam-text-primary mb-2">Access Denied</h2>
            <p className="text-red-400 mb-8 font-medium">{errorMsg}</p>
            <Button variant="secondary" onClick={resetScanner} leftIcon={<RefreshCcw size={16} />}>
              Scan Again
            </Button>
          </div>
        )}

        {/* Success / Allow Entry */}
        {scannerState === 'success' && scannedVendor && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden border-2 border-simmam-gold shadow-gold-sm bg-simmam-bg flex items-center justify-center">
                {scannedVendor.photo ? (
                  <img src={scannedVendor.photo} alt={scannedVendor.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-simmam-text-muted" />
                )}
              </div>
              
              <h2 className="text-2xl font-display font-bold text-simmam-text-primary">{scannedVendor.name}</h2>
              <p className="text-simmam-gold font-mono tracking-wider mt-1 mb-6 text-lg">{scannedVendor.vendor_id}</p>

              <div className="grid grid-cols-2 gap-4 text-left bg-simmam-bg/50 p-4 rounded-xl border border-simmam-gold-border mb-8">
                <div>
                  <p className="text-xs text-simmam-text-muted uppercase">Company</p>
                  <p className="font-medium text-simmam-text-primary">{scannedVendor.company || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-simmam-text-muted uppercase">Stall</p>
                  <p className="font-medium text-simmam-text-primary">{scannedVendor.stall_number}</p>
                </div>
                <div>
                  <p className="text-xs text-simmam-text-muted uppercase">Mobile</p>
                  <p className="font-medium text-simmam-text-primary">{scannedVendor.mobile}</p>
                </div>
                <div>
                  <p className="text-xs text-simmam-text-muted uppercase">Entries Today</p>
                  <p className="font-medium text-simmam-text-primary">{scannedVendor.entry_count}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="secondary" className="flex-1" onClick={resetScanner}>
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1" 
                  onClick={handleAllowEntry}
                  isLoading={isSubmitting}
                  leftIcon={<CheckCircle2 size={18} />}
                >
                  ALLOW ENTRY
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
