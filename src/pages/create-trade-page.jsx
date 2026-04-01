import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCheck, CircleCheckBig, FileText } from 'lucide-react'
import AnimatedPage from '@/components/animated-page'
import FormField from '@/components/forms/form-field'
import ImageUploadField from '@/components/forms/image-upload-field'
import StepIndicator from '@/components/forms/step-indicator'
import PageHeader from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const MotionDiv = motion.div

const steps = [
  { id: 'product', title: 'Product Info' },
  { id: 'pricing', title: 'Pricing & Shipping' },
  { id: 'review', title: 'Review & Confirm' },
]

const initialForm = {
  productName: '',
  description: '',
  price: '',
  shippingMethod: '',
  images: [],
}

const stepFields = {
  1: ['productName', 'description', 'images'],
  2: ['price', 'shippingMethod'],
}

const shippingOptions = [
  'Standard Shipping (3-5 days)',
  'Express Courier (1-2 days)',
  'Insured Overnight',
  'Local Pickup',
]

function formatPriceInput(rawValue) {
  const cleaned = rawValue.replace(/[^\d.]/g, '').replace(/(\..*?)\..*/g, '$1')

  if (!cleaned) {
    return ''
  }

  const hasDecimal = cleaned.includes('.')
  const [wholePart = '', decimalPart = ''] = cleaned.split('.')
  const normalizedWhole = wholePart.replace(/^0+(?=\d)/, '') || '0'
  const withCommas = Number(normalizedWhole).toLocaleString('en-US')

  return hasDecimal ? `${withCommas}.${decimalPart.slice(0, 2)}` : withCommas
}

function parsePrice(value) {
  const numeric = Number(value.replace(/,/g, ''))
  return Number.isFinite(numeric) ? numeric : 0
}

function validateForm(form) {
  const nextErrors = {}

  if (!form.productName.trim() || form.productName.trim().length < 3) {
    nextErrors.productName = 'Product name should be at least 3 characters.'
  }

  if (!form.description.trim() || form.description.trim().length < 20) {
    nextErrors.description = 'Description should be at least 20 characters.'
  }

  if (!form.images.length) {
    nextErrors.images = 'Upload at least one product image.'
  }

  if (parsePrice(form.price) <= 0) {
    nextErrors.price = 'Enter a valid price greater than 0.'
  }

  if (!form.shippingMethod) {
    nextErrors.shippingMethod = 'Select a shipping method.'
  }

  return nextErrors
}

export default function CreateTradePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submittedTrade, setSubmittedTrade] = useState(null)
  const imagesRef = useRef([])

  useEffect(() => {
    imagesRef.current = form.images
  }, [form.images])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview))
    }
  }, [])

  const clearStepErrors = (fields) => {
    setErrors((current) => {
      const next = { ...current }
      fields.forEach((field) => {
        delete next[field]
      })
      return next
    })
  }

  const validateStep = (step) => {
    const nextErrors = validateForm(form)
    const fields = stepFields[step] || []

    const scopedErrors = fields.reduce((acc, field) => {
      if (nextErrors[field]) {
        acc[field] = nextErrors[field]
      }
      return acc
    }, {})

    setErrors((current) => {
      const next = { ...current }

      fields.forEach((field) => {
        delete next[field]
      })

      return { ...next, ...scopedErrors }
    })

    return Object.keys(scopedErrors).length === 0
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleAddFiles = (files) => {
    const prepared = files
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(16).slice(2, 8)}`,
        name: file.name,
        file,
        preview: URL.createObjectURL(file),
      }))

    setForm((current) => ({
      ...current,
      images: [...current.images, ...prepared].slice(0, 8),
    }))

    setErrors((current) => ({ ...current, images: undefined }))
  }

  const handleRemoveImage = (id) => {
    setForm((current) => {
      const target = current.images.find((image) => image.id === id)
      if (target) {
        URL.revokeObjectURL(target.preview)
      }

      return {
        ...current,
        images: current.images.filter((image) => image.id !== id),
      }
    })
  }

  const onNext = () => {
    if (!validateStep(currentStep)) {
      return
    }

    setDirection(1)
    setCurrentStep((current) => Math.min(current + 1, steps.length))
  }

  const onBack = () => {
    clearStepErrors(stepFields[currentStep] || [])
    setDirection(-1)
    setCurrentStep((current) => Math.max(current - 1, 1))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    const allErrors = validateForm(form)
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      setDirection(-1)
      setCurrentStep(Object.keys(allErrors).some((key) => stepFields[1].includes(key)) ? 1 : 2)
      return
    }

    setSubmittedTrade({
      ...form,
      price: parsePrice(form.price).toFixed(2),
      id: `TRD-${Math.floor(1000 + Math.random() * 9000)}`,
    })

    form.images.forEach((image) => URL.revokeObjectURL(image.preview))
    setForm(initialForm)
    setErrors({})
    setDirection(-1)
    setCurrentStep(1)
  }

  return (
    <AnimatedPage>
      <PageHeader
        title="Create Trade"
        subtitle="Follow the guided flow to create a secure trade room with all key details in place."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="h-4 w-4" />
                Escrow Terms
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Escrow Terms Overview</DialogTitle>
                <DialogDescription>
                  Trust Trade holds buyer funds until shipment is verified and delivery is accepted.
                </DialogDescription>
              </DialogHeader>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>Funds remain locked during HOLD and SHIPPED stages.</li>
                <li>Seller uploads tracking or proof before release.</li>
                <li>Buyer confirms product condition before completion.</li>
              </ul>
              <DialogFooter>
                <Button type="button">Understood</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mx-auto w-full max-w-4xl">
        <Card interactive={false} className="rounded-2xl">
          <CardHeader className="space-y-4">
            <CardTitle>Create Trade Wizard</CardTitle>
            <CardDescription>Complete each step to publish your trade room with confidence.</CardDescription>
            <StepIndicator steps={steps} currentStep={currentStep} />
          </CardHeader>

          <CardContent>
            <form className="space-y-7" onSubmit={onSubmit}>
              <AnimatePresence custom={direction} mode="wait">
                <MotionDiv
                  key={currentStep}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 28 : -28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -28 : 28 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-5"
                >
                  {currentStep === 1 ? (
                    <>
                      <FormField
                        label="Product name"
                        htmlFor="productName"
                        required
                        hint="Use a clear title buyers instantly recognize."
                        error={errors.productName}
                      >
                        <Input
                          id="productName"
                          placeholder="e.g. MacBook Pro 16 M3"
                          value={form.productName}
                          onChange={(event) => updateField('productName', event.target.value)}
                        />
                      </FormField>

                      <FormField
                        label="Description"
                        htmlFor="description"
                        required
                        hint="Include condition, age, and what is included in the package."
                        error={errors.description}
                      >
                        <Textarea
                          id="description"
                          placeholder="Describe product condition, accessories, and warranty details."
                          value={form.description}
                          onChange={(event) => updateField('description', event.target.value)}
                        />
                      </FormField>

                      <FormField
                        label="Product images"
                        htmlFor="images"
                        required
                        hint="Add front, side, and proof-of-condition photos to boost trust."
                      >
                        <ImageUploadField
                          images={form.images}
                          onAddFiles={handleAddFiles}
                          onRemoveImage={handleRemoveImage}
                          error={errors.images}
                        />
                      </FormField>
                    </>
                  ) : null}

                  {currentStep === 2 ? (
                    <>
                      <FormField
                        label="Price (USD)"
                        htmlFor="price"
                        required
                        hint="Use fair market pricing to increase completion speed."
                        error={errors.price}
                      >
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            $
                          </span>
                          <Input
                            id="price"
                            inputMode="decimal"
                            placeholder="1,200.00"
                            className="pl-7"
                            value={form.price}
                            onChange={(event) => updateField('price', formatPriceInput(event.target.value))}
                          />
                        </div>
                      </FormField>

                      <FormField
                        label="Shipping method"
                        htmlFor="shippingMethod"
                        required
                        hint="Choose the method that matches risk and item value."
                        error={errors.shippingMethod}
                      >
                        <select
                          id="shippingMethod"
                          value={form.shippingMethod}
                          onChange={(event) => updateField('shippingMethod', event.target.value)}
                          className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="" disabled>
                            Select shipping method
                          </option>
                          {shippingOptions.map((option) => (
                            <option key={option} value={option} className="bg-slate-900 text-slate-100">
                              {option}
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </>
                  ) : null}

                  {currentStep === 3 ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Product</p>
                        <p className="mt-1 text-base font-semibold text-foreground">{form.productName || 'Not provided'}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{form.description || 'No description yet.'}</p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Price</p>
                          <p className="mt-1 text-lg font-semibold text-foreground">
                            {form.price ? `$${form.price}` : 'Not set'}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Shipping</p>
                          <p className="mt-1 text-lg font-semibold text-foreground">
                            {form.shippingMethod || 'Not selected'}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Images</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          {form.images.map((image) => (
                            <img
                              key={image.id}
                              src={image.preview}
                              alt={image.name}
                              className="h-24 w-full rounded-2xl border border-white/10 object-cover"
                            />
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-primary/30 bg-primary/15 p-3 text-sm text-indigo-100">
                        Confirm details before publishing. This action opens a live trade room for participants.
                      </div>
                    </div>
                  ) : null}
                </MotionDiv>
              </AnimatePresence>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <Button type="button" variant="secondary" onClick={onBack} disabled={currentStep === 1}>
                  Back
                </Button>

                {currentStep < 3 ? (
                  <Button type="button" onClick={onNext}>
                    Continue to Step {currentStep + 1}
                  </Button>
                ) : (
                  <Button type="submit">
                    <CheckCheck className="h-4 w-4" />
                    Confirm & Create Trade
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {submittedTrade ? (
          <MotionDiv
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="mt-4 rounded-2xl border border-success/35 bg-success/20 p-4"
          >
            <div className="mb-2 flex items-center gap-2 text-success-foreground">
              <CircleCheckBig className="h-4 w-4" />
              Trade Created
            </div>
            <p className="text-sm text-success-foreground/90">
              {submittedTrade.id} is now ready for participant invites and escrow setup.
            </p>
          </MotionDiv>
        ) : null}
      </div>
    </AnimatedPage>
  )
}
