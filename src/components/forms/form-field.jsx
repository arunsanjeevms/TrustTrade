import FieldHint from '@/components/forms/field-hint'
import { Label } from '@/components/ui/label'

export default function FormField({ label, htmlFor, hint, error, children, required = false }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={htmlFor} className="text-sm text-slate-200">
          {label}
          {required ? <span className="ml-1 text-danger">*</span> : null}
        </Label>
        <FieldHint hint={hint} />
      </div>

      {children}

      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  )
}
