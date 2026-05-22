import React, { useState } from 'react'
import type { Lote, Insumo, Almacen } from '../../hooks/useInventario'

interface Props {
  lotes: Lote[]
  insumos: Insumo[]
  almacenes: Almacen[]
  onEliminar: (id: string) => void
}

type Filtro = 'todos' | 'por_vencer' | 'vencidos'

export function TablaLotes({ lotes, insumos, almacenes, onEliminar }: Props) {
  const [filtro, setFiltro] = useState<Filtro>('todos')

  const hoy = new Date()

  function estadoLote(fechaVenc: string | null): 'vigente' | 'por_vencer' | 'vencido' | 'sin_fecha' {
    if (!fechaVenc) return 'sin_fecha'
    const fecha = new Date(fechaVenc)
    const dias = (fecha.getTime() - hoy.getTime()) / 86400000
    if (dias < 0) return 'vencido'
    if (dias <= 7) return 'por_vencer'
    return 'vigente'
  }

  function diasRestantes(fechaVenc: string): number {
    return Math.ceil((new Date(fechaVenc).getTime() - hoy.getTime()) / 86400000)
  }

  const ESTADO_CONFIG = {
    vigente: { clase: 'bg-sa-mint/30 text-sa-green-deep', label: 'Vigente' },
    por_vencer: { clase: 'bg-sa-banana/30 text-sa-coffee', label: 'Por vencer' },
    vencido: { clase: 'bg-sa-strawberry/15 text-sa-strawberry', label: 'Vencido' },
    sin_fecha: { clase: 'bg-sa-cream-warm text-sa-green-ink/60', label: 'Sin fecha' },
  }

  const lotesFiltrados = lotes.filter((l) => {
    if (filtro === 'todos') return true
    const estado = estadoLote(l.fecha_vencimiento)
    if (filtro === 'por_vencer') return estado === 'por_vencer'
    if (filtro === 'vencidos') return estado === 'vencido'
    return true
  }).sort((a, b) => {
    if (!a.fecha_vencimiento) return 1
    if (!b.fecha_vencimiento) return -1
    return new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime()
  })

  const vencidosCount = lotes.filter((l) => estadoLote(l.fecha_vencimiento) === 'vencido').length
  const porVencerCount = lotes.filter((l) => estadoLote(l.fecha_vencimiento) === 'por_vencer').length

  return (
    <div>
      {/* Alerts summary */}
      {(vencidosCount > 0 || porVencerCount > 0) && (
        <div className="flex gap-3 mb-4">
          {vencidosCount > 0 && (
            <div className="flex items-center gap-2 bg-sa-strawberry/10 border border-sa-strawberry/30 rounded-xl px-4 py-2.5">
              <span className="text-sa-strawberry text-lg">⚠️</span>
              <div>
                <p className="text-sa-strawberry font-semibold text-sm">{vencidosCount} lote{vencidosCount > 1 ? 's' : ''} vencido{vencidosCount > 1 ? 's' : ''}</p>
                <p className="text-sa-strawberry text-xs">Requieren atención inmediata</p>
              </div>
            </div>
          )}
          {porVencerCount > 0 && (
            <div className="flex items-center gap-2 bg-sa-banana/20 border border-sa-banana/40 rounded-xl px-4 py-2.5">
              <span className="text-sa-coffee/70 text-lg">⏰</span>
              <div>
                <p className="text-sa-coffee font-semibold text-sm">{porVencerCount} lote{porVencerCount > 1 ? 's' : ''} por vencer</p>
                <p className="text-sa-coffee/70 text-xs">Vencen en 7 días o menos</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {([
          { key: 'todos', label: 'Todos', count: lotes.length },
          { key: 'por_vencer', label: '⏰ Por vencer', count: porVencerCount },
          { key: 'vencidos', label: '⚠ Vencidos', count: vencidosCount },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filtro === f.key ? 'bg-sa-green-ink text-white' : 'bg-white text-sa-green-ink/70 border border-sa-green-ink/10 hover:border-sa-green-ink/15'
            }`}
          >
            {f.label}
            {f.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filtro === f.key ? 'bg-white/20 text-white' : 'bg-sa-cream-warm text-sa-green-ink/70'}`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-sa shadow-sa-sm border border-sa-green-ink/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sa-green-ink/5 text-left text-xs text-sa-green-ink/60 uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Insumo</th>
              <th className="px-5 py-3 font-medium">Lote</th>
              <th className="px-5 py-3 font-medium">Almacén</th>
              <th className="px-5 py-3 font-medium text-right">Cantidad</th>
              <th className="px-5 py-3 font-medium text-right">Costo unit.</th>
              <th className="px-5 py-3 font-medium text-center">Vencimiento</th>
              <th className="px-5 py-3 font-medium text-center">Estado</th>
              <th className="px-5 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sa-green-ink/5">
            {lotesFiltrados.map((lote) => {
              const insumo = insumos.find((i) => i.id === lote.insumo_id)
              const almacen = almacenes.find((a) => a.id === lote.almacen_id)
              const estado = estadoLote(lote.fecha_vencimiento)
              const cfg = ESTADO_CONFIG[estado]
              const diasR = lote.fecha_vencimiento ? diasRestantes(lote.fecha_vencimiento) : null
              return (
                <tr key={lote.id} className={`hover:bg-sa-cream-paper transition-colors ${estado === 'vencido' ? 'bg-sa-strawberry/10/30' : ''}`}>
                  <td className="px-5 py-3 font-medium text-sa-green-ink">{insumo?.nombre ?? '—'}</td>
                  <td className="px-5 py-3 text-sa-green-ink/60 font-mono text-xs">{lote.numero_lote ?? <span className="text-sa-green-ink/25 italic">sin lote</span>}</td>
                  <td className="px-5 py-3 text-sa-green-ink/70 text-xs">{almacen?.nombre ?? '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="font-semibold text-sa-green-ink">{lote.cantidad_actual.toFixed(1)}</span>
                    <span className="text-sa-green-ink/40 text-xs ml-1">{insumo?.unidad}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-sa-green-ink/70">
                    {lote.costo_unitario ? `$${lote.costo_unitario.toFixed(2)}` : <span className="text-sa-green-ink/25">—</span>}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {lote.fecha_vencimiento ? (
                      <div>
                        <p className={`text-xs font-medium ${estado === 'vencido' ? 'text-sa-strawberry' : estado === 'por_vencer' ? 'text-sa-coffee' : 'text-sa-green-ink/80'}`}>
                          {new Date(lote.fecha_vencimiento).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        {diasR !== null && (
                          <p className={`text-xs ${diasR < 0 ? 'text-sa-strawberry' : 'text-sa-green-ink/40'}`}>
                            {diasR < 0 ? `Hace ${Math.abs(diasR)} días` : diasR === 0 ? 'Hoy' : `En ${diasR} días`}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sa-green-ink/25 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.clase}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => onEliminar(lote.id)}
                      className="px-3 py-1.5 text-xs font-medium border border-sa-strawberry/30 rounded-lg hover:bg-sa-strawberry/10 text-sa-strawberry"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {lotesFiltrados.length === 0 && (
          <div className="text-center py-12 text-sa-green-ink/40">
            <p>No hay lotes{filtro !== 'todos' ? ' con este filtro' : ''}</p>
          </div>
        )}
      </div>
    </div>
  )
}
