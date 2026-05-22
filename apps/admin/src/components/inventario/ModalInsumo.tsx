import React, { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import type { Insumo } from '../../hooks/useInventario'

const UNIDADES = ['kg', 'litro', 'pieza', 'gramo', 'mililitro', 'caja', 'bolsa', 'paquete']

interface Props {
  open: boolean
  onClose: () => void
  insumo: Insumo | null
  onGuardar: (data: Omit<Insumo, 'id'>) => void
}

const VACIO = { nombre: '', unidad: 'kg', costo_unitario: 0 }

export function ModalInsumo({ open, onClose, insumo, onGuardar }: Props) {
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState<Partial<Record<string, string>>>({})

  useEffect(() => {
    if (!open) return
    setForm(insumo ? { nombre: insumo.nombre, unidad: insumo.unidad, costo_unitario: insumo.costo_unitario } : VACIO)
    setErrores({})
  }, [open, insumo])

  function validar() {
    const e: typeof errores = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (form.costo_unitario < 0) e.costo_unitario = 'Debe ser ≥ 0'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return
    onGuardar(form)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={insumo ? 'Editar insumo' : 'Nuevo insumo'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">
            Nombre <span className="text-sa-strawberry">*</span>
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            placeholder="Ej. Pollo"
            className="w-full border border-sa-green-ink/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
          />
          {errores.nombre && <p className="text-sa-strawberry text-xs mt-1">{errores.nombre}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">Unidad de medida</label>
          <div className="flex flex-wrap gap-2">
            {UNIDADES.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setForm((f) => ({ ...f, unidad: u }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  form.unidad === u
                    ? 'border-sa-green bg-sa-cream-soft text-sa-green-deep'
                    : 'border-sa-green-ink/10 text-sa-green-ink/70 hover:border-sa-green-ink/15'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">Costo unitario (MXN)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sa-green-ink/40 text-sm">$</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.costo_unitario || ''}
              onChange={(e) => setForm((f) => ({ ...f, costo_unitario: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              className="w-full border border-sa-green-ink/15 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
            />
          </div>
          {errores.costo_unitario && <p className="text-sa-strawberry text-xs mt-1">{errores.costo_unitario}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-sa-green-ink/15 text-sa-green-ink/80 py-2.5 rounded-xl font-medium text-sm hover:bg-sa-cream-paper">
            Cancelar
          </button>
          <button type="submit" className="flex-1 bg-sa-green text-sa-cream py-2.5 rounded-xl font-medium text-sm hover:bg-sa-green-deep">
            {insumo ? 'Actualizar' : 'Crear insumo'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
