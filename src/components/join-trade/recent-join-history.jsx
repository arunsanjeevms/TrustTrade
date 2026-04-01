import { Clock3, History } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const statusVariant = {
  accepted: 'success',
  pending: 'warning',
  rejected: 'danger',
}

export default function RecentJoinHistory({ items }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-indigo-300" />
          <p className="text-sm font-semibold text-foreground">Recent Join History</p>
        </div>
        <p className="text-xs text-muted-foreground">Last 5 requests</p>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{item.userId}</p>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock3 className="h-3 w-3" />
                {item.time}
              </div>
            </div>

            <Badge variant={statusVariant[item.status] || 'secondary'} className="capitalize">
              {item.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
