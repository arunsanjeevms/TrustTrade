import { useState } from 'react'
import { FileUp, Paperclip } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function toSizeLabel(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadDropzonePanel({ files, onFilesAdded }) {
  const [dragging, setDragging] = useState(false)

  const onDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    const next = Array.from(event.dataTransfer.files || [])
    if (next.length) {
      onFilesAdded(next)
    }
  }

  const onFileInput = (event) => {
    const next = Array.from(event.target.files || [])
    if (next.length) {
      onFilesAdded(next)
    }
    event.target.value = ''
  }

  return (
    <Card interactive={false}>
      <CardHeader>
        <CardTitle className="text-base">Verification Uploads</CardTitle>
        <CardDescription>Drag and drop invoice, label, or proof files.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <label
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-7 text-center transition-all duration-300 ease-in-out',
            dragging
              ? 'border-primary/60 bg-primary/20'
              : 'border-white/20 bg-white/5 hover:border-primary/40 hover:bg-white/10',
          )}
        >
          <input type="file" multiple className="sr-only" onChange={onFileInput} />
          <span className="mb-2 grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-brand-gradient text-white shadow-glow">
            <FileUp className="h-4 w-4" />
          </span>
          <p className="text-sm font-medium text-foreground">Drop files here or click to browse</p>
          <p className="mt-1 text-xs text-muted-foreground">Accepted: PDF, PNG, JPG, TXT, CSV</p>
        </label>

        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">Uploaded {file.uploadedAt}</p>
              </div>

              <div className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                {toSizeLabel(file.size)}
              </div>
            </div>
          ))}

          {files.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
              No uploaded files yet.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
