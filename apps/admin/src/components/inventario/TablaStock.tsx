import React, { useState } from 'react'
import type { Insumo, StockItem, Almacen } from '../../hooks/useInventario'

interface Props {
  insumos: Insumo[]
  stock: StockItem[]
  almacenes: Almacen[]
  onAjustar: (insumoId: string, almacenId: string, cantidad: number) => void
}

export function TablaStock({ insumos, stock, almacenes, onAjustar }: Props) {
  const [editando, setEditando] = useState<{ insumoId: string; almacenId: string; valor: string } | null>(null)
  const [filtroAlerta, setFiltroAlerta] = useState(false)

  function getStock(insumoId: string, almacenId: string) {
    return stock.find((s) => s.insumo_id === insumoId && s.almacen_id === almacenId)
  }

  function confirmarAjuste() {
    if (!editando) return
    const cantidad = parseFloat(editando.valor)
    if (!isNaN(cantidad) && cantidad >= 0) {
      onAjustar(editando.insumoId, editando.almacenId, cantidad)
    }
    setEditando(null)
  }

  const insumosFiltrados = filtroAlerta
    ? insumos.filter((i) =>
        stock.some((s) => s.insumo_id === i.id && s.stock_actual <= s.stock_minimo),
      )
    : insumos

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setFiltroAlerta(false)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!filtroAlerta ? 'bg-sa-green-ink text-white' : 'bg-white text-sa-green-ink/70 border border-sa-green-ink/10'}`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltroAlerta(true)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${filtroAlerta ? 'bg-sa-banana text-white' : 'bg-white text-sa-green-ink/70 border border-sa-green-ink/10'}`}
        >
          ⚠ Solo alertas
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${filtroAlerta ? 'bg-sa-coffee text-sa-cream' : 'bg-sa-banana/30 text-sa-coffee'}`}>
            {stock.filter((s) => s.stock_actual <= s.stock_minimo).length}
          </span>
        </button>
      </div>

      <div className="bg-white rounded-sa shadow-sa-sm border border-sa-green-ink/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sa-green-ink/5 text-left text-xs text-sa-green-ink/60 uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Insumo</th>
              <th className="px-5 py-3 font-medium">Unidad</th>
              {almacenes.map((a) => (
                <th key={a.id} className="px-5 py-3 font-medium text-center">
                  <div>{a.nombre}</div>
                  <div className="text-sa-green-ink/40 normal-case font-normal capitalize">{a.tipo}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sa-green-ink/5">
            {insumosFiltrados.map((insumo) => (
              <tr key={insumo.id} className="hover:bg-sa-cream-paper transition-colors">
                <td className="px-5 py-3 font-medium text-sa-green-ink">{insumo.nombre}</td>
                <td className="px-5 py-3 text-sa-green-ink/60 text-xs">{insumo.unidad}</td>
                {almacenes.map((a) => {
                  const s = getStock(insumo.id, a.id)
                  const isEditing = editando?.insumoId === insumo.id && editando?.almacenId === a.id
                  const alerta = s && s.stock_actual <= s.stock_minimo
                  return (
                    <td key={a.id} className="px-5 py-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min={0}
                            step={0.1}
                            value={editando.valor}
                            onChange={(e) => setEditando((prev) => prev ? { ...prev, valor: e.target.value } : null)}
                            onKeyDown={(e) => { if (e.key === 'Enter') confirmarAjuste(); if (e.key === 'Escape') setEditando(null) }}
                            className="w-20 border border-sa-green rounded-lg px-2 py-1 text-center text-sm focus:outline-none"
                            autoFocus
                          />
                          <button onClick={confirmarAjuste} className="text-sa-mint hover:text-sa-green-deep text-lg">✓</button>
                          <button onClick={() => setEditando(null)} className="text-sa-green-ink/40 hover:text-sa-green-ink/70">✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => s && setEditando({ insumoId: insumo.id, almacenId: a.id, valor: String(s.stock_actual) })}
                          className={`group relative inline-flex flex-col items-center px-3 py-1.5 rounded-xl hover:bg-sa-cream-soft transition-colors ${alerta ? 'bg-sa-strawberry/10' : ''}`}
                        >
                          {s ? (
                            <>
                              <span className={`font-bold text-base ${alerta ? 'text-sa-strawberry' : 'text-sa-green-ink'}`}>
                                {s.stock_actual.toFixed(1)}
                              </span>
                              <span className="text-sa-green-ink/40 text-xs">mín {s.stock_minimo}</span>
                              {alerta && <span className="text-sa-coffee text-xs">⚠</span>}
                            </>
                          ) : (
                            <span className="text-sa-green-ink/25">—</span>
                          )}
                        </button>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-sa-green-ink/40 mt-2">Haz clic en cualquier cantidad para editarla directamente.</p>
    </div>
  )
}
