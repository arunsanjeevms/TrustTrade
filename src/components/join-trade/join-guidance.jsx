import { Info } from 'lucide-react'

export default function JoinGuidance() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 text-indigo-300" />
        <p>
          Ask your partner for their User ID or a secure invite link. Example ID format:
          <span className="ml-1 font-semibold text-foreground">u_trader007</span>
        </p>
      </div>
    </div>
  )
}
