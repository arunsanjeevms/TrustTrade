import { CalendarDays, ShieldCheck, Truck, Wallet } from 'lucide-react'

const statusNotes = {
  HOLD: 'Escrow is active and awaiting shipment evidence.',
  SHIPPED: 'Package is in transit. Buyer confirmation pending.',
  DELIVERED: 'Delivery confirmed. Escrow release is near-ready.',
  COMPLETED: 'Trade settled successfully and archived.',
  CANCELLED: 'Trade was cancelled. No payout will be released.',
}

export default function TradeRowDetails({ trade, formattedAmount, formattedDate }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <Truck className="h-3.5 w-3.5" />
          Shipping
        </div>
        <p className="text-sm font-medium text-foreground">{trade.shipping}</p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <Wallet className="h-3.5 w-3.5" />
          Escrow Amount
        </div>
        <p className="text-sm font-medium text-foreground">{formattedAmount}</p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          Last Update
        </div>
        <p className="text-sm font-medium text-foreground">{formattedDate}</p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Workflow Note
        </div>
        <p className="text-sm font-medium text-foreground">{statusNotes[trade.status] || 'Workflow state pending.'}</p>
      </div>
    </div>
  )
}
