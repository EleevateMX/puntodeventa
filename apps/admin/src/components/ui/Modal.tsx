import React, { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: string
}

export function Modal({ open, onClose, title, children, width = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-sa-green-ink/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative bg-sa-cream-soft rounded-sa-lg shadow-sa w-full ${width} max-h-[90vh] flex flex-col border border-sa-green-ink/5`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-sa-green-ink/10">
          <h3 className="text-2xl font-display text-sa-green-ink">{title}</h3>
          <button
            onClick={onClose}
            className="text-sa-green-ink/50 hover:text-sa-green-ink transition-colors text-xl leading-none"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
