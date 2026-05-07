import { AlertTriangle, CheckCircle, ShieldAlert, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { resolveDispute } from '@/services/trades'

export default function DisputeResolutionPanel({ trade, onResolved }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleResolve = async (resolution) => {
    setLoading(true)
    setError('')
    try {
      await resolveDispute(trade.id, resolution)
      onResolved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resolve dispute')
      setLoading(false)
    }
  }

  return (
    <Card className="border-danger/40 bg-danger/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-danger-foreground">
          <ShieldAlert className="h-5 w-5" />
          Dispute Resolution Center
        </CardTitle>
        <CardDescription>
          A dispute has been raised for this trade. Please review all uploaded evidence in the Verification Vault and Activity Timeline.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-sm text-slate-200">
            As a moderator or system admin, you must decide the outcome of this dispute based on the provided evidence. 
            Once resolved, the escrow funds will be appropriately released or refunded, and the trade room will be permanently closed.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger-foreground">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button 
            variant="default" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={loading}
            onClick={() => handleResolve('SELLER')}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Resolve in favor of Seller (Release Escrow)
          </Button>

          <Button 
            variant="default" 
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={loading}
            onClick={() => handleResolve('BUYER')}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Resolve in favor of Buyer (Refund Escrow)
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
