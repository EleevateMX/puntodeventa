import React, { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import type { Merma, Insumo, Almacen, Lote } from '../../hooks/useInventario'

interface Props {
  open: boolean
  onClose: () => void
  onGuardar: (data: Omit<Merma, 'id' | 'created_at'>) => void
  insumos: Insumo[]
  almacenes: Almacen[]
  lotes: Lote[]
}

const TIPOS: { value: Merma['tipo']; label: string; icon: string }[] = [
  { value: 'vencimiento', label: 'Vencimiento', icon: '📅' },
  { value: 'accidente', label: 'Accidente', icon: '💥' },
  { value: 'calidad', label: 'Calidad', icon: '🔍' },
  { value: 'otro', label: 'Otro', icon: '📌' },
]

export function ModalMerma({ open, onClose, onGuardar, insumos, almacenes, lotes }: Props) {
  const [form, setForm] = useState({ insumo_id: '', almacen_id: '', lote_id: '', cantidad: 0, tipo: 'accidente' as Merma['tipo'], notas: '' })
  const [errores, setErrores] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    setForm({ insumo_id: '', almacen_id: '', lote_id: '', cantidad: 0, tipo: 'accidente', notas: '' })
    setErrores({})
  }, [open])

  const lotesDisponibles = lotes.filter(
    (l) => (!form.insumo_id || l.insumo_id === form.insumo_id) && (!form.almacen_id || l.almacen_id === form.almacen_id),
  )

  function validar() {
    const e: Record<string, string> = {}
    if (!form.insumo_id) e.insumo_id = 'Requerido'
    if (!form.almacen_id) e.almacen_id = 'Requerido'
    if (form.cantidad <= 0) e.cantidad = 'Debe ser > 0'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return
    onGuardar({
      insumo_id: form.insumo_id,
      almacen_id: form.almacen_id,
      lote_id: form.lote_id || null,
      cantidad: form.cantidad,
      tipo: form.tipo,
      notas: form.notas || null,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Registrar merma">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">Insumo *</label>
            <select value={form.insumo_id} onChange={(e) => setForm((f) => ({ ...f, insumo_id: e.target.value, lote_id: '' }))} className="w-full border border-sa-green-ink/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40 bg-white">
              <option value="">Selecciona</option>
              {insumos.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
            </select>
            {errores.insumo_id && <p className="text-sa-strawberry text-xs mt-1">{errores.insumo_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">Almacén *</label>
            <select value={form.almacen_id} onChange={(e) => setForm((f) => ({ ...f, almacen_id: e.target.value }))} className="w-full border border-sa-green-ink/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40 bg-white">
              <option value="">Selecciona</option>
              {almacenes.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
            {errores.almacen_id && <p className="text-sa-strawberry text-xs mt-1">{errores.almacen_id}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">Cantidad *</label>
            <input type="number" min={0.01} step={0.01} value={form.cantidad || ''} onChange={(e) => setForm((f) => ({ ...f, cantidad: parseFloat(e.target.value) || 0 }))} placeholder="0" className="w-full border border-sa-green-ink/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40" />
            {errores.cantidad && <p className="text-sa-strawberry text-xs mt-1">{errores.cantidad}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">Lote (opcional)</label>
            <select value={form.lote_id} onChange={(e) => setForm((f) => ({ ...f, lote_id: e.target.value }))} className="w-full border border-sa-green-ink/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40 bg-white disabled:opacity-50" disabled={lotesDisponibles.length === 0}>
              <option value="">Sin lote</option>
              {lotesDisponibles.map((l) => <option key={l.id} value={l.id}>{l.numero_lote ?? `Lote ${l.id.slice(-4)}`}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-sa-green-ink/80 mb-2">Tipo de merma</label>
          <div className="grid grid-cols-4 gap-2">
            {TIPOS.map((t) => (
              <button key={t.value} type="button" onClick={() => setForm((f) => ({ ...f, tipo: t.value }))} className={`flex flex-col items-center py-3 rounded-xl border-2 text-xs font-medium transition-colors ${form.tipo === t.value ? 'border-sa-green bg-sa-cream-soft text-sa-green-deep' : 'border-sa-green-ink/10 text-sa-green-ink/70 hover:border-sa-green-ink/15'}`}>
                <span className="text-lg mb-1">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">Notas</label>
          <textarea value={form.notas} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} placeholder="Descripción de la merma..." rows={2} className="w-full border border-sa-green-ink/15 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sa-green/40" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-sa-green-ink/15 text-sa-green-ink/80 py-2.5 rounded-xl font-medium text-sm hover:bg-sa-cream-paper">Cancelar</button>
          <button type="submit" className="flex-1 bg-sa-strawberry text-white py-2.5 rounded-xl font-medium text-sm hover:opacity-90">Registrar merma</button>
        </div>
      </form>
    </Modal>
  )
}
