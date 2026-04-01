import { AlertTriangle, CircleCheckBig, PackageCheck, Truck, Wallet } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const roleOptions = ['seller', 'buyer', 'system']

const actions = [
  {
    id: 'add-tracking',
    label: 'Add Tracking',
    icon: Truck,
    roles: ['seller'],
    isEnabled: ({ status, roomClosed }) => status === 'HOLD' && !roomClosed,
    helper: 'Seller submits shipping evidence and tracking.',
  },
  {
    id: 'confirm-delivery',
    label: 'Confirm Delivery',
    icon: PackageCheck,
    roles: ['buyer'],
    isEnabled: ({ status, roomClosed }) => status === 'SHIPPED' && !roomClosed,
    helper: 'Buyer confirms package arrival and condition.',
  },
  {
    id: 'release-escrow',
    label: 'Release Escrow',
    icon: Wallet,
    roles: ['system'],
    isEnabled: ({ status, roomClosed, disputeOpen }) =>
      status === 'DELIVERED' && !roomClosed && !disputeOpen,
    helper: 'Escrow engine finalizes payout to seller.',
  },
  {
    id: 'raise-dispute',
    label: 'Raise Dispute',
    icon: AlertTriangle,
    roles: ['seller', 'buyer'],
    isEnabled: ({ status, roomClosed, disputeOpen }) =>
      !roomClosed && !disputeOpen && status !== 'COMPLETED',
    helper: 'Escalate issue and pause completion flow.',
    variant: 'destructive',
  },
  {
    id: 'close-room',
    label: 'Close Room',
    icon: CircleCheckBig,
    roles: ['seller', 'buyer', 'system'],
    isEnabled: ({ status, roomClosed, disputeOpen }) => !roomClosed && (status === 'COMPLETED' || disputeOpen),
    helper: 'Close room once settlement or dispute resolution finishes.',
  },
]

export default function RoleActionsPanel({ role, setRole, status, disputeOpen, roomClosed, onAction }) {
  const context = { status, disputeOpen, roomClosed }

  return (
    <Card interactive={false} className="xl:sticky xl:top-24">
      <CardHeader>
        <CardTitle className="text-xl">Actions</CardTitle>
        <CardDescription>Role-based controls to move the trade forward.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={role} onValueChange={setRole}>
          <TabsList className="grid w-full grid-cols-3">
            {roleOptions.map((value) => (
              <TabsTrigger key={value} value={value} className="capitalize">
                {value}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          {actions.map((action) => {
            const Icon = action.icon
            const allowedRole = action.roles.includes(role)
            const enabled = allowedRole && action.isEnabled(context)

            let helperText = action.helper
            if (!allowedRole) {
              helperText = `Available for ${action.roles.join(', ')} role only.`
            } else if (!enabled) {
              helperText = 'Unavailable at current status.'
            }

            return (
              <div
                key={action.id}
                className={cn(
                  'rounded-2xl border p-3 transition-all duration-300 ease-in-out',
                  enabled ? 'border-white/10 bg-white/5' : 'border-white/10 bg-white/5 opacity-70',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-2xl border border-white/10 bg-white/5">
                      <Icon className="h-4 w-4 text-indigo-300" />
                    </span>
                    <p className="truncate text-sm font-semibold text-foreground">{action.label}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={action.variant || 'secondary'}
                    disabled={!enabled}
                    onClick={() => onAction(action.id)}
                  >
                    Run
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{helperText}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
