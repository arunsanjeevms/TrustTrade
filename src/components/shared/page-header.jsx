import { cn } from '@/lib/utils'

export default function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="space-y-1">
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle max-w-2xl">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
