import {
  LayoutDashboard,
  PlusSquare,
  UserRoundPlus,
  ShieldCheck,
  Rows4,
  QrCode,
  UserCircle2,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/create-trade', label: 'Create Trade', icon: PlusSquare },
  { to: '/join-trade', label: 'Join Trade', icon: UserRoundPlus },
  { to: '/trade-room', label: 'Trade Room', icon: ShieldCheck },
  { to: '/my-trades', label: 'My Trades', icon: Rows4 },
  { to: '/qr-scan', label: 'QR Scan', icon: QrCode },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
]

export default function AppSidebar({ className, onNavigate }) {
  return (
    <aside
      className={cn(
        'h-full w-full border-r border-white/10 bg-slate-950/70 px-4 py-6 backdrop-blur-2xl',
        className,
      )}
    >
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient ring-1 ring-indigo-400/50 shadow-glow">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-heading text-lg font-bold text-white">Trust Trade</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Secure Escrow</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out',
                  isActive
                    ? 'bg-brand-gradient text-white shadow-glow'
                    : 'text-slate-300 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all duration-300 ease-in-out hover:-translate-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">Protection Rate</p>
        <p className="mt-2 text-2xl font-bold text-white">99.94%</p>
        <p className="mt-1 text-xs text-slate-300">Escrow-backed settlements this month.</p>
      </div>
    </aside>
  )
}
