import { AlertTriangle, CirclePlus, PackageCheck, QrCode, UserPlus2, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import ActivityTimeline from '@/components/dashboard/activity-timeline'
import DashboardStatCard from '@/components/dashboard/dashboard-stat-card'
import PriorityTradesPanel from '@/components/dashboard/priority-trades-panel'
import AnimatedPage from '@/components/animated-page'
import PageHeader from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { useTradesData } from '@/hooks/use-trades-data'

const stats = [
  {
    id: 'active-trades',
    title: 'Active Trades',
    value: '24',
    trendValue: 12.4,
    trendLabel: 'vs last 7 days',
    icon: CirclePlus,
  },
  {
    id: 'escrow-volume',
    title: 'Escrow Volume',
    value: '$183,420',
    trendValue: 8.4,
    trendLabel: 'vs last month',
    icon: Wallet,
  },
  {
    id: 'success-rate',
    title: 'Success Rate',
    value: '98.7%',
    trendValue: 0.9,
    trendLabel: 'quality trend',
    icon: PackageCheck,
  },
  {
    id: 'pending-actions',
    title: 'Pending Actions',
    value: '7',
    trendValue: -5.2,
    trendLabel: 'needs immediate follow-up',
    icon: AlertTriangle,
    highlight: true,
  },
]

const recentActivity = [
  {
    id: 'timeline-1',
    title: 'Buyer joined',
    detail: 'u_ryan009 entered trade room TRD-4821 and passed initial verification.',
    timestamp: '2 min ago',
    icon: UserPlus2,
  },
  {
    id: 'timeline-2',
    title: 'Payment deposited',
    detail: 'Escrow received $2,580.00 for the MacBook Pro transaction.',
    timestamp: '9 min ago',
    icon: Wallet,
  },
  {
    id: 'timeline-3',
    title: 'Shipment uploaded',
    detail: 'Tracking proof and package images were submitted for Sony FX30 Kit.',
    timestamp: '21 min ago',
    icon: PackageCheck,
  },
]

export default function DashboardPage() {
  const { trades } = useTradesData()
  const priorityTrades = trades.filter((trade) => trade.status === 'HOLD' || trade.status === 'SHIPPED').slice(0, 4)

  return (
    <AnimatedPage className="space-y-7">
      <PageHeader
        title="Welcome back, Ari"
        subtitle="Your trading overview with escrow performance, active timelines, and urgent trades in one premium workspace."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/create-trade">
                <CirclePlus className="h-4 w-4" />
                Create Trade
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/join-trade">
                <UserPlus2 className="h-4 w-4" />
                Join Trade
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/qr-scan">
                <QrCode className="h-4 w-4" />
                Scan QR
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <DashboardStatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            trendValue={stat.trendValue}
            trendLabel={stat.trendLabel}
            icon={stat.icon}
            highlight={Boolean(stat.highlight)}
            delay={index * 0.05}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <ActivityTimeline activities={recentActivity} />
        <PriorityTradesPanel trades={priorityTrades} />
      </div>
    </AnimatedPage>
  )
}
