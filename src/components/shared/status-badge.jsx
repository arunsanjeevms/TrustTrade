import { Badge } from '@/components/ui/badge'

const variantByStatus = {
  HOLD: 'warning',
  SHIPPED: 'shipped',
  DELIVERED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'danger',
}

export default function StatusBadge({ status, className }) {
  return (
    <Badge variant={variantByStatus[status] || 'secondary'} className={className}>
      {status}
    </Badge>
  )
}
