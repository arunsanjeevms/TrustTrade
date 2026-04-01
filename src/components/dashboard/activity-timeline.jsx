import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const MotionDiv = motion.div

export default function ActivityTimeline({ activities }) {
  return (
    <Card interactive={false} className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">Recent Activity</CardTitle>
        <CardDescription>Live timeline of key trade events.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="relative pl-7">
          <div className="absolute left-[11px] top-1 h-[calc(100%-1rem)] w-px bg-white/10" />

          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = activity.icon

              return (
                <MotionDiv
                  key={activity.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut', delay: index * 0.06 }}
                  className="relative"
                >
                  <span className="absolute -left-7 top-4 grid h-6 w-6 place-items-center rounded-2xl border border-white/10 bg-brand-gradient text-white shadow-glow">
                    <Icon className="h-3.5 w-3.5" />
                  </span>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all duration-300 ease-in-out hover:-translate-y-0.5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{activity.title}</p>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{activity.detail}</p>
                  </div>
                </MotionDiv>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
