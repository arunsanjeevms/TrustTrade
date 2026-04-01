import { Bell, BellDot, CircleCheckBig, Menu, PackageCheck, Search, SlidersHorizontal, User2, UserPlus2, Wallet } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import ThemeToggle from '@/components/shared/theme-toggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { usePreferences } from '@/hooks/use-preferences'

const pageMeta = {
  '/': { title: 'Dashboard', subtitle: 'Monitor active trades and escrow status.' },
  '/create-trade': { title: 'Create Trade', subtitle: 'Start a protected transaction in seconds.' },
  '/join-trade': { title: 'Join Trade', subtitle: 'Join an existing room with secure verification.' },
  '/trade-room': { title: 'Trade Room', subtitle: 'Coordinate fulfillment and escrow actions.' },
  '/my-trades': { title: 'My Trades', subtitle: 'Track every trade in one clean workspace.' },
  '/qr-scan': { title: 'QR Scan', subtitle: 'Verify identities and links using QR checks.' },
  '/profile': { title: 'Profile', subtitle: 'Manage account details and security preferences.' },
}

const notifications = [
  {
    id: 'notif-1',
    title: 'Buyer joined room',
    detail: 'u_ryan009 joined TRD-4821',
    timestamp: '2m ago',
    icon: UserPlus2,
    unread: true,
  },
  {
    id: 'notif-2',
    title: 'Payment deposited',
    detail: '$2,580 moved to escrow wallet',
    timestamp: '9m ago',
    icon: Wallet,
    unread: true,
  },
  {
    id: 'notif-3',
    title: 'Shipment proof uploaded',
    detail: 'Sony FX30 tracking has been verified',
    timestamp: '22m ago',
    icon: PackageCheck,
    unread: false,
  },
]

export default function AppHeader({ onOpenMenu }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { preferences, toggleTheme } = usePreferences()
  const current = pageMeta[location.pathname] || pageMeta['/']
  const isDark = preferences.theme === 'dark'

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMenu}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open navigation</span>
          </Button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{current.title}</p>
            <p className="hidden truncate text-xs text-slate-400 sm:block">{current.subtitle}</p>
          </div>
        </div>

        <div className="hidden flex-1 justify-center px-4 md:flex">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input className="pl-9" placeholder="Search trades, users, or rooms" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-warning shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[330px] p-2">
              <DropdownMenuLabel className="flex items-center justify-between px-2 py-2">
                <span className="flex items-center gap-2 text-foreground">
                  <BellDot className="h-4 w-4 text-indigo-300" />
                  Notifications
                </span>
                <span className="rounded-2xl border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                  2 new
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <div className="space-y-1 p-1">
                {notifications.map((item) => {
                  const Icon = item.icon

                  return (
                    <DropdownMenuItem key={item.id} className="items-start gap-3 rounded-2xl p-3">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5">
                        <Icon className="h-4 w-4 text-indigo-300" />
                      </span>

                      <span className="min-w-0 space-y-0.5">
                        <span className="block text-sm font-medium text-foreground">{item.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{item.detail}</span>
                        <span className="block text-[11px] text-muted-foreground">{item.timestamp}</span>
                      </span>

                      {item.unread ? <span className="mt-1 h-2 w-2 rounded-full bg-primary" /> : null}
                    </DropdownMenuItem>
                  )
                })}
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center gap-2 rounded-2xl py-2 text-primary">
                <CircleCheckBig className="h-4 w-4" />
                Mark all as read
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 gap-2 rounded-2xl px-2">
                <Avatar className="h-8 w-8 border border-white/10">
                  <AvatarFallback>TT</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm sm:inline">Ari Trader</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User2 className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme}>
                Switch to {isDark ? 'Light' : 'Dark'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/auth/login')}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
