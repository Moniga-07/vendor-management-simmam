import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  QrCode,
  Users,
  FileBarChart2,
  Scan,
  X,
  Shield,
  LogOut,
  User,
  ArrowRightLeft,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/hooks/useAuth'

// ─────────────────────────────────────────────
// Sidebar Navigation
// ─────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Entry Scanner', to: '/scan/entry', icon: Scan },
  { label: 'Exit Scanner', to: '/scan/exit', icon: QrCode },
  { label: 'Vendors',   to: '/vendors',   icon: Users },
  { label: 'Entry Logs', to: '/history',  icon: ArrowRightLeft },
  { label: 'Reports',   to: '/reports',   icon: FileBarChart2 },
]

function SimmamLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 shrink-0">
        <div className="w-10 h-10 rounded-lg bg-simmam-gold flex items-center justify-center shadow-gold">
          <Shield size={22} className="text-simmam-bg" />
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-simmam-red rounded-full border-2 border-simmam-bg" />
      </div>
      <div>
        <p className="font-display font-bold text-simmam-text-primary text-base uppercase tracking-widest leading-none">
          SIMMAM
        </p>
        <p className="font-body text-2xs text-simmam-text-muted uppercase tracking-wider mt-0.5">
          Vendor Portal
        </p>
      </div>
    </div>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-simmam-gold-border">
        <SimmamLogo />
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-simmam-sm text-simmam-text-muted hover:text-simmam-text-primary hover:bg-simmam-elevated transition-colors lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 p-3 space-y-0.5 overflow-y-auto"
        aria-label="Main navigation"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-simmam',
                'font-body text-sm font-medium transition-all duration-150',
                'group focus:outline-none focus:ring-2 focus:ring-simmam-gold/40',
                isActive
                  ? 'bg-simmam-gold text-simmam-bg shadow-gold-sm'
                  : 'text-simmam-text-secondary hover:bg-simmam-elevated hover:text-simmam-text-primary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={17}
                  className={cn(
                    'shrink-0 transition-transform duration-150',
                    isActive
                      ? 'text-simmam-bg'
                      : 'text-simmam-text-muted group-hover:text-simmam-gold group-hover:scale-110'
                  )}
                />
                <span className="flex-1">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-simmam-gold-border/50">
        <div className="flex items-center gap-3 p-2 rounded-simmam hover:bg-simmam-elevated transition-colors">
          <div className="w-8 h-8 rounded-full bg-simmam-gold/10 border border-simmam-gold/30 flex items-center justify-center text-simmam-gold shrink-0">
            <User size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-simmam-text-primary truncate">
              {user?.email || 'Coordinator'}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-simmam-text-muted hover:text-simmam-red transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 shrink-0 h-[100dvh] bg-simmam-bg border-r border-simmam-gold-border sticky top-0">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
        {isOpen && (
          <motion.aside
            key="sidebar-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 z-50 h-[100dvh] w-72 bg-simmam-bg border-r border-simmam-gold-border lg:hidden"
          >
            <SidebarContent onClose={onClose} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
