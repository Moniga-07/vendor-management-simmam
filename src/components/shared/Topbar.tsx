import { Menu, Scan, QrCode } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

// ─────────────────────────────────────────────
// Topbar (Mobile menu toggle + Global actions)
// ─────────────────────────────────────────────

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 h-16 bg-simmam-bg/80 backdrop-blur-md border-b border-simmam-gold-border px-4 sm:px-6 flex items-center justify-between">
      {/* Left: mobile menu */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-simmam text-simmam-text-secondary hover:text-simmam-text-primary hover:bg-simmam-elevated transition-colors lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Mobile branding */}
        <div className="lg:hidden flex items-center gap-2">
          <p className="font-display font-bold text-simmam-text-primary text-sm uppercase tracking-widest">
            SIMMAM
          </p>
        </div>
      </div>

      {/* Right: quick actions */}
      <div className="flex items-center gap-3">
        <Link to={ROUTES.SCAN_ENTRY}>
          <Button variant="primary" size="sm" leftIcon={<Scan size={14} />}>
            <span className="hidden sm:inline">Entry Scan</span>
            <span className="sm:hidden">Entry</span>
          </Button>
        </Link>
        <Link to={ROUTES.SCAN_EXIT}>
          <Button variant="outline" size="sm" leftIcon={<QrCode size={14} />}>
            <span className="hidden sm:inline">Exit Scan</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}
