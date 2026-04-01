import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Wallet2, Lock, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

export default function WalletCard({ balance, locked, released }) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet2 className="h-5 w-5 text-indigo-300" /> Escrow Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Available</span>
            <span className="font-semibold text-white">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Locked</span>
            <span className="font-semibold text-yellow-300">${locked.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Released</span>
            <span className="font-semibold text-emerald-300">${released.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
