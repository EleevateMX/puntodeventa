import React, { useState } from 'react'
import type { Insumo, StockItem, Almacen } from '../../hooks/useInventario'

interface Props {
  insumos: Insumo[]
  stock: StockItem[]
  almacenes: Almacen[]
  onEditar: (i: Insumo) => void
  onEliminar: (i: Insumo) => void
}

export function TablaInsumos({ insumos, stock, almacenes, onEditar, onEliminar }: Props) {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = insumos.filter((i) =>
    i.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  )

  function stockTotal(insumoId: string) {
    return stock
      .filter((s) => s.insumo_id === insumoId)
      .reduce((sum, s) => sum + s.stock_actual, 0)
  }

  function stockMinTotal(insumoId: string) {
    return stock
      .filter((s) => s.insumo_id === insumoId)
      .reduce((sum, s) => sum + s.stock_minimo, 0)
  }

  function estadoStock(insumoId: string): 'ok' | 'alerta' | 'agotado' {
    const total = stockTotal(insumoId)
    const min = stockMinTotal(insumoId)
    if (total === 0) return 'agotado'
    if (total <= min) return 'alerta'
    return 'ok'
  }

  const ESTADO_BADGE: Record<string, string> = {
    ok: 'bg-sa-mint/30 text-sa-green-deep',
    alerta: 'bg-sa-banana/30 text-sa-coffee',
    agotado: 'bg-sa-strawberry/15 text-sa-strawberry',
  }
  const ESTADO_LABEL: Record<string, string> = {
    ok: '● OK',
    alerta: '⚠ Alerta',
    agotado: '✕ Agotado',
  }

  return (
    <div>
      <div className="mb-4">
        <div className="relative w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sa-green-ink/40 text-sm">🔍</span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar insumo..."
            className="w-full pl-8 pr-4 py-2 border border-sa-green-ink/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-sa shadow-sa-sm border border-sa-green-ink/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sa-green-ink/5 text-left text-xs text-sa-green-ink/60 uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Insumo</th>
              <th className="px-5 py-3 font-medium">Unidad</th>
              <th className="px-5 py-3 font-medium">Costo unitario</th>
              {almacenes.map((a) => (
                <th key={a.id} className="px-5 py-3 font-medium text-center">{a.nombre}</th>
              ))}
              <th className="px-5 py-3 font-medium text-center">Estado</th>
              <th className="px-5 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sa-green-ink/5">
            {filtrados.map((insumo) => {
              const estado = estadoStock(insumo.id)
              return (
                <tr key={insumo.id} className="hover:bg-sa-cream-paper transition-colors">
                  <td className="px-5 py-3 font-medium text-sa-green-ink">{insumo.nombre}</td>
                  <td className="px-5 py-3 text-sa-green-ink/60">{insumo.unidad}</td>
                  <td className="px-5 py-3 text-sa-green-ink/80">${insumo.costo_unitario.toFixed(2)}</td>
                  {almacenes.map((a) => {
                    const s = stock.find((x) => x.insumo_id === insumo.id && x.almacen_id === a.id)
                    const bajo = s && s.stock_actual <= s.stock_minimo
                    return (
                      <td key={a.id} className="px-5 py-3 text-center">
                        {s ? (
                          <span className={`font-semibold ${bajo ? 'text-sa-strawberry' : 'text-sa-green-ink'}`}>
                            {s.stock_actual.toFixed(1)}
                            <span className="text-sa-green-ink/40 text-xs ml-1">/{s.stock_minimo}</span>
                          </span>
                        ) : (
                          <span className="text-sa-green-ink/25">—</span>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[estado]}`}>
                      {ESTADO_LABEL[estado]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditar(insumo)}
                        className="px-3 py-1.5 text-xs font-medium border border-sa-green-ink/10 rounded-lg hover:bg-sa-cream-paper text-sa-green-ink/70"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onEliminar(insumo)}
                        className="px-3 py-1.5 text-xs font-medium border border-sa-strawberry/30 rounded-lg hover:bg-sa-strawberry/10 text-sa-strawberry"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtrados.length === 0 && (
          <div className="text-center py-12 text-sa-green-ink/40">
            <p>Sin resultados</p>
          </div>
        )}
      </div>
    </div>
  )
}
