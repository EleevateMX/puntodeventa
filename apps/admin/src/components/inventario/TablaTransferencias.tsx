import React from 'react'
import type { Transferencia, Insumo, Almacen } from '../../hooks/useInventario'

const ESTADO_CONFIG: Record<Transferencia['estado'], { label: string; clase: string }> = {
  pendiente: { label: 'Pendiente', clase: 'bg-sa-banana/30 text-sa-coffee' },
  enviada:   { label: 'Enviada',   clase: 'bg-sa-blueberry/15 text-sa-blueberry' },
  recibida:  { label: 'Recibida',  clase: 'bg-sa-mint/30 text-sa-green-deep' },
  cancelada: { label: 'Cancelada', clase: 'bg-sa-cream-warm text-sa-green-ink/60' },
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
          <div key={t.id} className="bg-white rounded-sa shadow-sa-sm border border-sa-green-ink/5 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-sa-green-ink text-sm">
                    {getNombreAlmacen(t.origen_id)}
                  </span>
                  <span className="text-sa-green-ink/40">→</span>
                  <span className="font-semibold text-sa-green-ink text-sm">
                    {getNombreAlmacen(t.destino_id)}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.clase}`}>
                    {cfg.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {t.items.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-sa-cream-paper rounded-lg text-xs text-sa-green-ink/80 border border-sa-green-ink/5">
                      <span className="font-medium">{getNombreInsumo(item.insumo_id)}</span>
                      <span className="text-sa-green-ink/40">×{item.cantidad}</span>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-sa-green-ink/40">
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
                      className="px-3 py-1.5 text-xs font-medium bg-sa-blueberry/10 border border-sa-blueberry/30 rounded-lg hover:bg-sa-blueberry/15 text-sa-blueberry"
                    >
                      Marcar enviada
                    </button>
                    <button
                      onClick={() => onCambiarEstado(t.id, 'cancelada')}
                      className="px-3 py-1.5 text-xs font-medium border border-sa-green-ink/10 rounded-lg hover:bg-sa-cream-paper text-sa-green-ink/60"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                {t.estado === 'enviada' && (
                  <button
                    onClick={() => onCambiarEstado(t.id, 'recibida')}
                    className="px-3 py-1.5 text-xs font-medium bg-sa-mint/15 border border-sa-mint/40 rounded-lg hover:bg-sa-mint/30 text-sa-green-deep"
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
        <div className="text-center py-12 text-sa-green-ink/40 bg-white rounded-sa border border-sa-green-ink/5">
          Sin transferencias registradas
        </div>
      )}
    </div>
  )
}
