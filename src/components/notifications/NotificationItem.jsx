import { Mail, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const iconByType = {
  trade: <RefreshCw className="h-5 w-5 text-indigo-400" />,
  message: <Mail className="h-5 w-5 text-emerald-400" />,
  alert: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
}

const styleByType = {
  trade: 'border-indigo-400/20',
  message: 'border-emerald-400/20',
  alert: 'border-yellow-400/20',
}

export default function NotificationItem({ notification, onMarkRead }) {
  return (
    <div className={cn('flex items-center gap-3 p-4 bg-transparent hover:bg-white/5 transition-all border-l-4', styleByType[notification.type])}>
      {iconByType[notification.type]}
      <div className="flex-1">
        <div className="font-medium text-slate-100 text-sm">{notification.title}</div>
        <div className="text-xs text-slate-400">{notification.body}</div>
        <div className="text-xs text-slate-500 mt-1">{notification.time}</div>
      </div>
      {!notification.read && (
        <Button size="icon" variant="ghost" onClick={() => onMarkRead(notification.id)} title="Mark as read">
          <span className="sr-only">Mark as read</span>
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </Button>
      )}
    </div>
  )
}
