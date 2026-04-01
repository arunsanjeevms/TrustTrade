import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Mail, AlertTriangle, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import NotificationItem from './NotificationItem'

const MotionDiv = motion.div

export default function NotificationDropdown({ notifications, unreadCount, onMarkRead, open, setOpen }) {
  const dropdownRef = useRef(null)
  return (
    <div className="relative">
      <Button variant="ghost" onClick={() => setOpen((v) => !v)} className="relative">
        <Bell className="h-6 w-6 text-indigo-300" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-emerald-500 text-white animate-pulse" variant="success">
            {unreadCount}
          </Badge>
        )}
      </Button>
      <AnimatePresence>
        {open && (
          <MotionDiv
            ref={dropdownRef}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="absolute right-0 z-40 mt-2 w-96 max-w-[96vw] rounded-2xl border border-white/10 bg-slate-950/95 shadow-xl ring-1 ring-indigo-400/10 backdrop-blur-xl"
          >
            <div className="p-4 pb-2 border-b border-white/10 flex items-center justify-between">
              <span className="font-semibold text-indigo-200">Notifications</span>
              <Button size="sm" variant="ghost" onClick={() => onMarkRead('all')}>Mark all as read</Button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-white/10">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <NotificationItem key={n.id} notification={n} onMarkRead={onMarkRead} />
                ))
              )}
            </div>
            <div className="p-3 border-t border-white/10 text-right">
              <Button size="sm" variant="secondary" className="gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  )
}
