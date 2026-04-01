import { ImagePlus, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ImageUploadField({ images, onAddFiles, onRemoveImage, error }) {
  const handleChange = (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) {
      return
    }

    onAddFiles(files)
    event.target.value = ''
  }

  return (
    <div className="space-y-3">
      <label className="group flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-8 text-center transition-all duration-300 ease-in-out hover:border-indigo-300/60 hover:bg-white/10">
        <input
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={handleChange}
        />

        <div className="space-y-2">
          <div className="mx-auto grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-brand-gradient text-white">
            <Upload className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium text-foreground">Upload product images</p>
          <p className="text-xs text-muted-foreground">PNG/JPG up to 8MB each. Add multiple angles for trust.</p>
        </div>
      </label>

      {images.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div key={image.id} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img src={image.preview} alt={image.name} className="h-28 w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-2">
                <p className="truncate text-xs text-slate-200">{image.name}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onRemoveImage(image.id)}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Remove image</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
          <ImagePlus className="h-3.5 w-3.5" />
          No images added yet.
        </div>
      )}

      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  )
}
