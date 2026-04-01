import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const MotionDiv = motion.div

export default function DashboardStatCard({
  title,
  value,
  trendValue,
  trendLabel,
  icon,
  highlight = false,
  delay = 0,
}) {
  const isPositive = trendValue >= 0
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight
  const StatIcon = icon

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut', delay }}
      className="h-full"
    >
      <Card
        className={cn(
          'h-full',
          highlight &&
            'border-warning/40 bg-warning/15 shadow-[0_16px_38px_rgba(245,158,11,0.18)] hover:shadow-[0_20px_44px_rgba(245,158,11,0.28)]',
        )}
      >
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center justify-between text-muted-foreground">
            <span>{title}</span>
            <span className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <StatIcon className="h-4 w-4 text-indigo-300" />
            </span>
          </CardDescription>
          <CardTitle className="text-3xl font-bold text-white">{value}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isPositive ? 'success' : 'danger'} className="gap-1">
              <TrendIcon className="h-3 w-3" />
              {isPositive ? '+' : ''}
              {trendValue.toFixed(1)}%
            </Badge>
            <p className="text-xs text-muted-foreground">{trendLabel}</p>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  )
}
