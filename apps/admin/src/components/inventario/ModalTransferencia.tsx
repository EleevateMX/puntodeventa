import React, { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import type { Insumo, Almacen, TransferenciaItem } from '../../hooks/useInventario'

interface Props {
  open: boolean
  onClose: () => void
  onGuardar: (origenId: string, destinoId: string, items: TransferenciaItem[], notas: string) => void
  insumos: Insumo[]
  almacenes: Almacen[]
}

export function ModalTransferencia({ open, onClose, onGuardar, insumos, almacenes }: Props) {
  const [origenId, setOrigenId] = useState('')
  const [destinoId, setDestinoId] = useState('')
  const [items, setItems] = useState<TransferenciaItem[]>([{ insumo_id: '', cantidad: 0 }])
  const [notas, setNotas] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    setOrigenId('')
    setDestinoId('')
    setItems([{ insumo_id: '', cantidad: 0 }])
    setNotas('')
    setErrores({})
  }, [open])

  function addItem() {
    setItems((prev) => [...prev, { insumo_id: '', cantidad: 0 }])
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function setItem(idx: number, key: keyof TransferenciaItem, value: string | number) {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [key]: value } : item))
  }

  function validar() {
    const e: Record<string, string> = {}
    if (!origenId) e.origen = 'Requerido'
    if (!destinoId) e.destino = 'Requerido'
    if (origenId && destinoId && origenId === destinoId) e.destino = 'Debe ser diferente al origen'
    const validItems = items.filter((i) => i.insumo_id && i.cantidad > 0)
    if (validItems.length === 0) e.items = 'Agrega al menos un insumo con cantidad'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return
    const validItems = items.filter((i) => i.insumo_id && i.cantidad > 0)
    onGuardar(origenId, destinoId, validItems, notas)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva transferencia">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">Origen *</label>
            <select value={origenId} onChange={(e) => setOrigenId(e.target.value)} className="w-full border border-sa-green-ink/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40 bg-white">
              <option value="">Selecciona</option>
              {almacenes.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
            {errores.origen && <p className="text-sa-strawberry text-xs mt-1">{errores.origen}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">Destino *</label>
            <select value={destinoId} onChange={(e) => setDestinoId(e.target.value)} className="w-full border border-sa-green-ink/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40 bg-white">
              <option value="">Selecciona</option>
              {almacenes.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
            {errores.destino && <p className="text-sa-strawberry text-xs mt-1">{errores.destino}</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-sa-green-ink/80">Insumos a transferir *</label>
            <button type="button" onClick={addItem} className="text-xs text-sa-green-deep hover:text-sa-green-deep font-medium">+ Agregar línea</button>
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={item.insumo_id}
                  onChange={(e) => setItem(idx, 'insumo_id', e.target.value)}
                  className="flex-1 border border-sa-green-ink/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40 bg-white"
                >
                  <option value="">Insumo</option>
                  {insumos.map((i) => <option key={i.id} value={i.id}>{i.nombre} ({i.unidad})</option>)}
                </select>
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={item.cantidad || ''}
                  onChange={(e) => setItem(idx, 'cantidad', parseFloat(e.target.value) || 0)}
                  placeholder="Cant."
                  className="w-24 border border-sa-green-ink/15 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-sa-green/40"
                />
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)} className="text-sa-green-ink/40 hover:text-sa-strawberry text-lg leading-none">×</button>
                )}
              </div>
            ))}
          </div>
          {errores.items && <p className="text-sa-strawberry text-xs mt-1">{errores.items}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">Notas</label>
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Motivo o descripción..." rows={2} className="w-full border border-sa-green-ink/15 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sa-green/40" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-sa-green-ink/15 text-sa-green-ink/80 py-2.5 rounded-xl font-medium text-sm hover:bg-sa-cream-paper">Cancelar</button>
          <button type="submit" className="flex-1 bg-sa-green text-sa-cream py-2.5 rounded-xl font-medium text-sm hover:bg-sa-green-deep">Crear transferencia</button>
        </div>
      </form>
    </Modal>
  )
}
