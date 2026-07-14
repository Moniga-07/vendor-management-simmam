import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, X, QrCode, Download, Printer, CheckCircle2, FlipHorizontal } from 'lucide-react'
import Webcam from 'react-webcam'
import { ROUTES } from '@/constants/routes'
import { vendorService } from '@/services/vendorService'
import { PageHeader } from '@/components/shared/EmptyState'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import { QRCodeSVG } from 'qrcode.react'

export default function RegisterVendorPage() {
  const navigate = useNavigate()
  const { success, error } = useToast()
  
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registeredVendorId, setRegisteredVendorId] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    company: '',
    stall_number: '',
    vehicle_number: '',
  })
  
  // Webcam state
  const webcamRef = useRef<Webcam>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user')

  const handleCapture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      setCapturedImage(imageSrc)
      setIsCameraActive(false)
    }
  }, [webcamRef])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!capturedImage) {
      error('Missing Photo', 'Please capture a photo.')
      return
    }

    setIsSubmitting(true)
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('mobile', formData.mobile)
      data.append('company', formData.company)
      data.append('stall_number', formData.stall_number)
      data.append('vehicle_number', formData.vehicle_number)
      
      data.append('photoDataUrl', capturedImage) // Backend will decode this base64

      const newVendor = await vendorService.create(data)
      
      success('Vendor Registered Successfully', `Vendor ID: ${newVendor.vendor_id}`)
      setRegisteredVendorId(newVendor.vendor_id)
      setStep(2) // Move to Success/QR generation step
    } catch (err: any) {
      error('Registration Failed', err.message || 'An error occurred during registration.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Print QR Code
  const printQR = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const svg = document.getElementById('vendor-qr-code')
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${registeredVendorId}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
            .qr-container { padding: 40px; border: 2px solid #000; border-radius: 16px; text-align: center; }
            h1 { margin-bottom: 20px; font-size: 24px; }
            svg { width: 300px; height: 300px; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>Vendor ID: ${registeredVendorId}</h1>
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

  // Download QR Code
  const downloadQR = () => {
    const svg = document.getElementById('vendor-qr-code')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `QR_${registeredVendorId}.png`
      downloadLink.href = `${pngFile}`
      downloadLink.click()
    }
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Register Vendor" 
        subtitle="Add a new vendor and capture their live image"
        onBack={() => navigate(ROUTES.VENDORS)}
      />

      <div className="bg-simmam-elevated border border-simmam-gold-border rounded-simmam-xl p-6 md:p-8">
        
        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Left Column: Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-display font-semibold text-simmam-gold border-b border-simmam-gold-border/50 pb-2">
                  Vendor Details
                </h3>
                
                <Input
                  label="Vendor Name *"
                  placeholder="Full Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                />
                <Input
                  label="Mobile Number *"
                  placeholder="e.g. 9876543210"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData(p => ({ ...p, mobile: e.target.value }))}
                />
                <Input
                  label="Company Name"
                  placeholder="Optional"
                  value={formData.company}
                  onChange={(e) => setFormData(p => ({ ...p, company: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Stall Number *"
                    required
                    value={formData.stall_number}
                    onChange={(e) => setFormData(p => ({ ...p, stall_number: e.target.value }))}
                  />
                  <Input
                    label="Vehicle Number *"
                    required
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData(p => ({ ...p, vehicle_number: e.target.value }))}
                  />
                </div>
              </div>

              {/* Right Column: Live Photo */}
              <div className="space-y-4">
                <h3 className="text-lg font-display font-semibold text-simmam-gold border-b border-simmam-gold-border/50 pb-2">
                  Live Photo Verification
                </h3>

                <div className="aspect-square w-full max-w-sm mx-auto bg-simmam-bg rounded-xl border-2 border-dashed border-simmam-gold-border overflow-hidden relative flex items-center justify-center">
                  
                  {!isCameraActive && !capturedImage && (
                    <div className="text-center p-6 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-simmam-gold/10 flex items-center justify-center mb-4">
                        <Camera className="text-simmam-gold w-8 h-8" />
                      </div>
                      <p className="text-sm text-simmam-text-secondary mb-4">Live photo required for ID</p>
                      <Button variant="outline" type="button" onClick={() => setIsCameraActive(true)}>
                        Start Camera
                      </Button>
                    </div>
                  )}

                  {isCameraActive && (
                    <>
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: cameraFacingMode }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <button 
                          type="button" 
                          onClick={() => setCameraFacingMode(p => p === 'user' ? 'environment' : 'user')}
                          className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors shadow-lg backdrop-blur-sm"
                          title="Flip Camera"
                        >
                          <FlipHorizontal size={18} />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-0 w-full flex justify-center gap-3">
                        <Button variant="primary" type="button" onClick={handleCapture}>
                          Capture Photo
                        </Button>
                        <Button variant="ghost" type="button" className="bg-black/50 text-white hover:bg-black/70" onClick={() => setIsCameraActive(false)}>
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}

                  {capturedImage && !isCameraActive && (
                    <>
                      <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2">
                        <button 
                          type="button" 
                          onClick={() => setCapturedImage(null)}
                          className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-0 w-full flex justify-center">
                        <Button variant="secondary" type="button" onClick={() => { setCapturedImage(null); setIsCameraActive(true); }}>
                          Retake Photo
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-simmam-gold-border/50">
              <Button type="button" variant="ghost" onClick={() => navigate(ROUTES.VENDORS)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Complete Registration
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: QR Generated */}
        {step === 2 && registeredVendorId && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            
            <div>
              <h2 className="text-2xl font-display font-bold text-simmam-text-primary">Registration Successful!</h2>
              <p className="text-simmam-text-muted mt-2">The vendor has been registered and their ID card is ready.</p>
            </div>

            <div className="bg-simmam-bg p-8 rounded-2xl border border-simmam-gold-border inline-block shadow-gold-sm">
              <QRCodeSVG
                id="vendor-qr-code"
                value={registeredVendorId}
                size={220}
                level="H"
                includeMargin={true}
                fgColor="#000000"
                bgColor="#FFFFFF"
              />
              <p className="font-display font-bold text-xl tracking-widest text-simmam-text-primary mt-4">
                {registeredVendorId}
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" leftIcon={<Download size={16} />} onClick={downloadQR}>
                Download QR
              </Button>
              <Button variant="primary" leftIcon={<Printer size={16} />} onClick={printQR}>
                Print ID Card
              </Button>
            </div>

            <div className="pt-8">
              <Button variant="ghost" onClick={() => navigate(ROUTES.VENDORS)}>
                Return to Vendors
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
