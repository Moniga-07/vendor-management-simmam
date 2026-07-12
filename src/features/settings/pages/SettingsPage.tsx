import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/EmptyState'
import { Settings, Info, Shield, QrCode } from 'lucide-react'

// ─────────────────────────────────────────────
// Settings Page — No auth required
// ─────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Settings"
        subtitle="System configuration and administration"
      />

      {/* System info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <Info size={16} className="text-simmam-text-muted" />
        </CardHeader>
        <div className="space-y-0">
          {[
            { label: 'Application',  value: 'SIMMAM Vendor Portal' },
            { label: 'Event',        value: 'SIMMAM 2026' },
            { label: 'Organizer',    value: 'SIMATS Engineering Culturals' },
            { label: 'Version',      value: '1.0.0' },
            { label: 'Access',       value: 'Hidden URL · /1925wch' },
            { label: 'QR Format',    value: 'SIMMAM-XXXXXXXX (8-char alphanumeric)' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-simmam-gold-border/30 last:border-0">
              <span className="text-sm text-simmam-text-muted">{label}</span>
              <span className="text-sm text-simmam-text-primary font-mono">{value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Access model */}
      <div className="bg-simmam-gold/5 border border-simmam-gold/20 rounded-simmam-lg p-5">
        <div className="flex items-start gap-3">
          <Shield size={16} className="text-simmam-gold mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-simmam-text-primary">Access Control</p>
            <p className="text-xs text-simmam-text-secondary mt-1 leading-relaxed">
              This portal is protected by an obscure URL. Only authorized staff with the URL
              <code className="mx-1 text-simmam-gold font-mono bg-simmam-gold/10 px-1 rounded">
                /1925wch
              </code>
              can access the admin portal. Do not share this URL publicly.
            </p>
          </div>
        </div>
      </div>

      {/* Supabase config */}
      <Card>
        <CardHeader>
          <CardTitle>Supabase Configuration</CardTitle>
          <Settings size={16} className="text-simmam-text-muted" />
        </CardHeader>
        <p className="text-xs text-simmam-text-secondary leading-relaxed">
          Configure the following in your{' '}
          <code className="text-simmam-gold font-mono">.env</code> file:
        </p>
        <div className="mt-3 bg-simmam-bg rounded-simmam border border-simmam-gold-border p-3 space-y-1 font-mono text-xs">
          <p className="text-simmam-text-muted"># Required environment variables</p>
          <p><span className="text-simmam-gold">VITE_SUPABASE_URL</span>=<span className="text-green-400">https://your-project.supabase.co</span></p>
          <p><span className="text-simmam-gold">VITE_SUPABASE_ANON_KEY</span>=<span className="text-green-400">your-anon-key-here</span></p>
        </div>
      </Card>
    </div>
  )
}
