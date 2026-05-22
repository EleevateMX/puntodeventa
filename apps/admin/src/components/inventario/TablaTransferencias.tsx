import React from 'react'
import type { Transferencia, Insumo, Almacen } from '../../hooks/useInventario'

const ESTADO_CONFIG: Record<Transferencia['estado'], { label: string; clase: string }> = {
  pendiente: { label: 'Pendiente', clase: 'bg-yellow-100 text-yellow-700' },
  enviada:   { label: 'Enviada',   clase: 'bg-blue-100 text-blue-700' },
  recibida:  { label: 'Recibida',  clase: 'bg-green-100 text-green-700' },
  cancelada: { label: 'Cancelada', clase: 'bg-gray-100 text-gray-500' },
}

interface Props {
  transferencias: Transferencia[]
  insumos: Insumo[]
  almacenes: Almacen[]
  onCambiarEstado: (id: string, estado: Transferencia['estado']) => void
}

export function TablaTransferencias({ transferencias, insumos, almacenes, onCambiarEstado }: Props) {
  function getNombreAlmacen(id: string) {
    return almacenes.find((a) => a.id === id)?.nombre ?? '—'
  }
  function getNombreInsumo(id: string) {
    return insumos.find((i) => i.id === id)?.nombre ?? '—'
  }

  return (
    <div className="space-y-3">
      {transferencias.map((t) => {
        const cfg = ESTADO_CONFIG[t.estado]
        return (
          <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-gray-900 text-sm">
                    {getNombreAlmacen(t.origen_id)}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {getNombreAlmacen(t.destino_id)}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.clase}`}>
                    {cfg.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {t.items.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-lg text-xs text-gray-700 border border-gray-100">
                      <span className="font-medium">{getNombreInsumo(item.insumo_id)}</span>
                      <span className="text-gray-400">×{item.cantidad}</span>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{new Date(t.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  {t.notas && <span>· {t.notas}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                {t.estado === 'pendiente' && (
                  <>
                    <button
                      onClick={() => onCambiarEstado(t.id, 'enviada')}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 text-blue-600"
                    >
                      Marcar enviada
                    </button>
                    <button
                      onClick={() => onCambiarEstado(t.id, 'cancelada')}
                      className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                {t.estado === 'enviada' && (
                  <button
                    onClick={() => onCambiarEstado(t.id, 'recibida')}
                    className="px-3 py-1.5 text-xs font-medium bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 text-green-600"
                  >
                    Confirmar recepción
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
      {transferencias.length === 0 && (
        <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
          Sin transferencias registradas
        </div>
      )}
    </div>
  )
}
