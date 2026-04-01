import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import FormError from '@/components/auth/form-error'
import { cn } from '@/lib/utils'

export default function InputField({
  id,
  label,
  icon: Icon,
  error,
  className,
  inputClassName,
  ...props
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id} className="text-sm text-slate-300">
        {label}
      </Label>
      <div className="group/input relative">
        {Icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 z-[2] flex items-center text-slate-500 transition-colors duration-300 group-focus-within/input:text-indigo-300">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <Input
          id={id}
          className={cn(
            'auth-input-control relative z-[1] h-12 rounded-2xl border-white/10 bg-slate-950/50 text-slate-100 placeholder:text-slate-500 transition-transform duration-200 group-focus-within/input:scale-[1.01] focus-visible:border-indigo-300/35 focus-visible:ring-2 focus-visible:ring-indigo-500/40',
            Icon && 'pl-10',
            inputClassName,
          )}
          {...props}
        />
        <span className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent transition-all duration-300 group-focus-within/input:border-indigo-300/35 group-focus-within/input:shadow-[0_0_0_1px_rgba(99,102,241,0.3),0_0_20px_rgba(99,102,241,0.2)]" />
      </div>
      <FormError message={error} />
    </div>
  )
}
