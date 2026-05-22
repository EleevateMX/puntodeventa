import React, { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import type { Lote, Insumo, Almacen } from '../../hooks/useInventario'

interface Props {
  open: boolean
  onClose: () => void
  onGuardar: (data: Omit<Lote, 'id'>) => void
  insumos: Insumo[]
  almacenes: Almacen[]
}

export function ModalLote({ open, onClose, onGuardar, insumos, almacenes }: Props) {
  const [form, setForm] = useState({
    insumo_id: '',
    almacen_id: '',
    numero_lote: '',
    cantidad_inicial: 0,
    cantidad_actual: 0,
    costo_unitario: 0,
    fecha_vencimiento: '',
  })
  const [errores, setErrores] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    setForm({ insumo_id: '', almacen_id: '', numero_lote: '', cantidad_inicial: 0, cantidad_actual: 0, costo_unitario: 0, fecha_vencimiento: '' })
    setErrores({})
  }, [open])

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    if (key === 'cantidad_inicial') setForm((f) => ({ ...f, cantidad_inicial: value as number, cantidad_actual: value as number }))
    setErrores((e) => ({ ...e, [key]: '' }))
  }

  function validar() {
    const e: Record<string, string> = {}
    if (!form.insumo_id) e.insumo_id = 'Requerido'
    if (!form.almacen_id) e.almacen_id = 'Requerido'
    if (form.cantidad_inicial <= 0) e.cantidad_inicial = 'Debe ser > 0'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return
    onGuardar({
      insumo_id: form.insumo_id,
      almacen_id: form.almacen_id,
      numero_lote: form.numero_lote || null,
      cantidad_inicial: form.cantidad_inicial,
      cantidad_actual: form.cantidad_inicial,
      costo_unitario: form.costo_unitario || null,
      fecha_vencimiento: form.fecha_vencimiento || null,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Registrar lote">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insumo *</label>
            <select value={form.insumo_id} onChange={(e) => set('insumo_id', e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
              <option value="">Selecciona</option>
              {insumos.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
            </select>
            {errores.insumo_id && <p className="text-red-500 text-xs mt-1">{errores.insumo_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Almacén *</label>
            <select value={form.almacen_id} onChange={(e) => set('almacen_id', e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
              <option value="">Selecciona</option>
              {almacenes.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
            {errores.almacen_id && <p className="text-red-500 text-xs mt-1">{errores.almacen_id}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de lote</label>
            <input type="text" value={form.numero_lote} onChange={(e) => set('numero_lote', e.target.value)} placeholder="Ej. L-2024-001" className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha vencimiento</label>
            <input type="date" value={form.fecha_vencimiento} onChange={(e) => set('fecha_vencimiento', e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
            <input type="number" min={0} step={0.1} value={form.cantidad_inicial || ''} onChange={(e) => { const v = parseFloat(e.target.value) || 0; setForm((f) => ({ ...f, cantidad_inicial: v, cantidad_actual: v })) }} placeholder="0" className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            {errores.cantidad_inicial && <p className="text-red-500 text-xs mt-1">{errores.cantidad_inicial}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Costo unitario</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input type="number" min={0} step={0.01} value={form.costo_unitario || ''} onChange={(e) => set('costo_unitario', parseFloat(e.target.value) || 0)} placeholder="0.00" className="w-full border border-gray-300 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50">Cancelar</button>
          <button type="submit" className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-orange-600">Registrar lote</button>
        </div>
      </form>
    </Modal>
  )
}
