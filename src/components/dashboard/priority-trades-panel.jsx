import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import StatusBadge from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const MotionDiv = motion.div

const toCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)

export default function PriorityTradesPanel({ trades }) {
  return (
    <Card interactive={false} className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">Priority Trades</CardTitle>
        <CardDescription>Trades currently requiring your attention.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {trades.map((trade, index) => (
          <MotionDiv
            key={trade.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut', delay: index * 0.06 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all duration-300 ease-in-out hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">{trade.product}</p>
                <p className="text-xs text-muted-foreground">{trade.id}</p>
              </div>
              <StatusBadge status={trade.status} />
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold text-white">{toCurrency(trade.amount)}</span>
            </div>
          </MotionDiv>
        ))}

        <Button asChild variant="secondary" className="w-full">
          <Link to="/my-trades">Open All Priority Trades</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
