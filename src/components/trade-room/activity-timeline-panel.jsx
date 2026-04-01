import { AnimatePresence, motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const MotionDiv = motion.div

function messageTone(sender) {
  const normalized = sender.toLowerCase()

  if (normalized === 'seller') {
    return {
      wrapper: 'items-end text-right',
      bubble: 'border-primary/30 bg-primary/15',
      label: 'text-indigo-200',
    }
  }

  if (normalized === 'buyer') {
    return {
      wrapper: 'items-start text-left',
      bubble: 'border-sky-400/30 bg-sky-500/10',
      label: 'text-sky-200',
    }
  }

  return {
    wrapper: 'items-center text-center',
    bubble: 'border-white/10 bg-white/5',
    label: 'text-muted-foreground',
  }
}

export default function ActivityTimelinePanel({ messages, live = true }) {
  return (
    <Card interactive={false} className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Room Activity</CardTitle>
            <CardDescription>Real-time timeline between buyer, seller, and system.</CardDescription>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-success/30 bg-success/15 px-3 py-1 text-xs font-semibold text-success-foreground">
            <span className={cn('h-2 w-2 rounded-full bg-success', live && 'animate-pulse')} />
            LIVE
          </div>
        </div>
      </CardHeader>

      <CardContent className="max-h-[560px] space-y-3 overflow-y-auto pr-2">
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const tone = messageTone(message.sender)

            return (
              <MotionDiv
                key={message.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className={cn('flex flex-col', tone.wrapper)}
              >
                <div className={cn('max-w-[86%] rounded-2xl border p-3', tone.bubble)}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    <span className={cn('font-semibold', tone.label)}>{message.sender}</span>
                    <span>{message.time}</span>
                  </div>
                  <p className="text-sm text-foreground">{message.body}</p>
                </div>
              </MotionDiv>
            )
          })}
        </AnimatePresence>

        {messages.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-white/10 bg-white/5 py-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              No activity yet.
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
