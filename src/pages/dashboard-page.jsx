import { AlertTriangle, CirclePlus, PackageCheck, QrCode, UserPlus2, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import ActivityTimeline from '@/components/dashboard/activity-timeline'
import DashboardStatCard from '@/components/dashboard/dashboard-stat-card'
import PriorityTradesPanel from '@/components/dashboard/priority-trades-panel'
import AnimatedPage from '@/components/animated-page'
import PageHeader from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { useTradesData } from '@/hooks/use-trades-data'
import { getAuthUser } from '@/lib/auth-storage'

export default function DashboardPage() {
  const { trades } = useTradesData()
  const authUser = getAuthUser()

  const priorityTrades = trades.filter((trade) => ['HOLD', 'SHIPPED', 'DISPUTED'].includes(trade.status)).slice(0, 4)
  const activeTradesCount = trades.filter(t => !['COMPLETED', 'CANCELLED'].includes(t.status)).length
  const escrowVolume = trades.reduce((acc, t) => acc + (t.escrowStatus === 'LOCKED' ? t.amount : 0), 0)
  
  const completed = trades.filter(t => t.status === 'COMPLETED').length
  const cancelled = trades.filter(t => t.status === 'CANCELLED').length
  const successRate = (completed + cancelled) === 0 ? 100 : Math.round((completed / (completed + cancelled)) * 100)

  const stats = [
    {
      id: 'active-trades',
      title: 'Active Trades',
      value: activeTradesCount.toString(),
      trendValue: 12.4, // Static trend for demo purposes
      trendLabel: 'vs last 7 days',
      icon: CirclePlus,
    },
    {
      id: 'escrow-volume',
      title: 'Escrow Volume',
      value: `$${escrowVolume.toLocaleString()}`,
      trendValue: 8.4,
      trendLabel: 'vs last month',
      icon: Wallet,
    },
    {
      id: 'success-rate',
      title: 'Success Rate',
      value: `${successRate}%`,
      trendValue: 0.9,
      trendLabel: 'quality trend',
      icon: PackageCheck,
    },
    {
      id: 'pending-actions',
      title: 'Pending Actions',
      value: priorityTrades.length.toString(),
      trendValue: -5.2,
      trendLabel: 'needs immediate follow-up',
      icon: AlertTriangle,
      highlight: true,
    },
  ]

  const recentActivity = trades
    .flatMap((t) => (t.activities || []).map(a => ({ ...a, tradeId: t.publicId || t.id })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((activity, i) => {
      const timeDiff = Math.floor((new Date().getTime() - new Date(activity.createdAt).getTime()) / 60000)
      return {
        id: `activity-${activity.id || i}`,
        title: activity.type === 'STATUS_CHANGE' ? 'Status Updated' : activity.type === 'MESSAGE' ? 'New Message' : activity.type,
        detail: `[${activity.tradeId}] ${activity.message}`,
        timestamp: timeDiff < 60 ? `${timeDiff} min ago` : `${Math.floor(timeDiff / 60)}h ago`,
        icon: activity.type === 'STATUS_CHANGE' ? PackageCheck : activity.type === 'ESCROW_UPDATE' ? Wallet : UserPlus2,
      }
    })

  // Fallback if no activity
  if (recentActivity.length === 0) {
    recentActivity.push({
      id: 'timeline-empty',
      title: 'No recent activity',
      detail: 'Your activity timeline will populate once trades have updates.',
      timestamp: 'Just now',
      icon: CirclePlus,
    })
  }

  return (
    <AnimatedPage className="space-y-7">
      <PageHeader
        title={`Welcome back, ${authUser?.fullName || 'Trader'}`}
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
