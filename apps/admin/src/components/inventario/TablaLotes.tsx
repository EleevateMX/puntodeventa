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
    vigente: { clase: 'bg-green-100 text-green-700', label: 'Vigente' },
    por_vencer: { clase: 'bg-yellow-100 text-yellow-700', label: 'Por vencer' },
    vencido: { clase: 'bg-red-100 text-red-700', label: 'Vencido' },
    sin_fecha: { clase: 'bg-gray-100 text-gray-500', label: 'Sin fecha' },
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
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              <span className="text-red-500 text-lg">⚠️</span>
              <div>
                <p className="text-red-700 font-semibold text-sm">{vencidosCount} lote{vencidosCount > 1 ? 's' : ''} vencido{vencidosCount > 1 ? 's' : ''}</p>
                <p className="text-red-500 text-xs">Requieren atención inmediata</p>
              </div>
            </div>
          )}
          {porVencerCount > 0 && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5">
              <span className="text-yellow-500 text-lg">⏰</span>
              <div>
                <p className="text-yellow-700 font-semibold text-sm">{porVencerCount} lote{porVencerCount > 1 ? 's' : ''} por vencer</p>
                <p className="text-yellow-500 text-xs">Vencen en 7 días o menos</p>
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
              filtro === f.key ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.label}
            {f.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filtro === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
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
          <tbody className="divide-y divide-gray-50">
            {lotesFiltrados.map((lote) => {
              const insumo = insumos.find((i) => i.id === lote.insumo_id)
              const almacen = almacenes.find((a) => a.id === lote.almacen_id)
              const estado = estadoLote(lote.fecha_vencimiento)
              const cfg = ESTADO_CONFIG[estado]
              const diasR = lote.fecha_vencimiento ? diasRestantes(lote.fecha_vencimiento) : null
              return (
                <tr key={lote.id} className={`hover:bg-gray-50 transition-colors ${estado === 'vencido' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-5 py-3 font-medium text-gray-900">{insumo?.nombre ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{lote.numero_lote ?? <span className="text-gray-300 italic">sin lote</span>}</td>
                  <td className="px-5 py-3 text-gray-600 text-xs">{almacen?.nombre ?? '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="font-semibold text-gray-900">{lote.cantidad_actual.toFixed(1)}</span>
                    <span className="text-gray-400 text-xs ml-1">{insumo?.unidad}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-600">
                    {lote.costo_unitario ? `$${lote.costo_unitario.toFixed(2)}` : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {lote.fecha_vencimiento ? (
                      <div>
                        <p className={`text-xs font-medium ${estado === 'vencido' ? 'text-red-600' : estado === 'por_vencer' ? 'text-yellow-600' : 'text-gray-700'}`}>
                          {new Date(lote.fecha_vencimiento).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        {diasR !== null && (
                          <p className={`text-xs ${diasR < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                            {diasR < 0 ? `Hace ${Math.abs(diasR)} días` : diasR === 0 ? 'Hoy' : `En ${diasR} días`}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
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
                      className="px-3 py-1.5 text-xs font-medium border border-red-200 rounded-lg hover:bg-red-50 text-red-600"
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
          <div className="text-center py-12 text-gray-400">
            <p>No hay lotes{filtro !== 'todos' ? ' con este filtro' : ''}</p>
          </div>
        )}
      </div>
    </div>
  )
}
