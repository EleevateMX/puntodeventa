import React, { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import type { CategoriaConCocina, CategoriaInput } from '../../hooks/useMenu'
import type { Database } from '@pos/supabase'

type Cocina = Database['public']['Tables']['cocinas']['Row']

interface Props {
  open: boolean
  onClose: () => void
  onGuardar: (input: CategoriaInput) => Promise<unknown>
  categoria: CategoriaConCocina | null
  cocinas: Cocina[]
}

const VACIO: CategoriaInput = { nombre: '', cocina_id: '', activa: true }

export function ModalCategoria({ open, onClose, onGuardar, categoria, cocinas }: Props) {
  const [form, setForm] = useState<CategoriaInput>(VACIO)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState<Partial<Record<keyof CategoriaInput, string>>>({})

  useEffect(() => {
    if (!open) return
    if (categoria) {
      setForm({
        nombre: categoria.nombre,
        cocina_id: categoria.cocina_id,
        activa: categoria.activa,
      })
    } else {
      setForm(VACIO)
    }
    setErrores({})
  }, [open, categoria])

  function set<K extends keyof CategoriaInput>(key: K, value: CategoriaInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrores((prev) => ({ ...prev, [key]: undefined }))
  }

  function validar(): boolean {
    const e: typeof errores = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.cocina_id) e.cocina_id = 'Selecciona una cocina'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return
    setGuardando(true)
    try {
      await onGuardar(form)
      onClose()
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={categoria ? 'Editar categoría' : 'Nueva categoría'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">
            Nombre <span className="text-sa-strawberry">*</span>
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Ej. Platillos fuertes"
            className="w-full border border-sa-green-ink/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
          />
          {errores.nombre && <p className="text-sa-strawberry text-xs mt-1">{errores.nombre}</p>}
        </div>

        {/* Cocina */}
        <div>
          <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">
            Cocina <span className="text-sa-strawberry">*</span>
          </label>
          <div className="flex gap-3">
            {cocinas.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => set('cocina_id', c.id)}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                  form.cocina_id === c.id
                    ? 'border-sa-green bg-sa-cream-soft text-sa-green-deep'
                    : 'border-sa-green-ink/10 text-sa-green-ink/70 hover:border-sa-green-ink/15'
                }`}
              >
                {c.slug === 'alimentos' ? '🍽️' : '🥤'} {c.nombre}
              </button>
            ))}
          </div>
          {errores.cocina_id && (
            <p className="text-sa-strawberry text-xs mt-1">{errores.cocina_id}</p>
          )}
        </div>

        {/* Activa */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => set('activa', !form.activa)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              form.activa ? 'bg-sa-green' : 'bg-sa-green-ink/15'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.activa ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
          <span className="text-sm font-medium text-sa-green-ink/80">Categoría activa</span>
        </label>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-sa-green-ink/15 text-sa-green-ink/80 py-2.5 rounded-xl font-medium text-sm hover:bg-sa-cream-paper"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="flex-1 bg-sa-green disabled:opacity-50 text-sa-cream py-2.5 rounded-xl font-medium text-sm hover:bg-sa-green-deep"
          >
            {guardando ? 'Guardando...' : categoria ? 'Actualizar' : 'Crear categoría'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
