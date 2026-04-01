import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog } from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload } from 'lucide-react'

const MotionDiv = motion.div

export default function DisputeModal({ open, setOpen, onSubmit }) {
  const [reason, setReason] = useState('')
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const handleFile = (e) => {
    setFiles([...files, ...Array.from(e.target.files)])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setOpen(false)
      onSubmit({ reason, files })
    }, 1200)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <div className="bg-slate-950 rounded-2xl p-8 w-full max-w-lg border border-white/10 shadow-xl">
              <h2 className="font-semibold text-lg text-white mb-2">Raise Dispute</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Reason</label>
                  <Textarea value={reason} onChange={(e) => setReason(e.target.value)} required minLength={8} />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Evidence (optional)</label>
                  <label className="flex items-center gap-2 cursor-pointer border border-dashed border-indigo-400/40 rounded-xl p-3 hover:bg-indigo-400/10 transition">
                    <Upload className="h-5 w-5 text-indigo-300" />
                    <span>Upload files</span>
                    <input type="file" multiple className="hidden" onChange={handleFile} />
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {files.map((file, i) => (
                      <span key={i} className="text-xs bg-slate-800 rounded px-2 py-1 text-slate-200">{file.name}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
                  <Button type="submit" disabled={submitting || !reason.trim()}>Submit</Button>
                </div>
              </form>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
