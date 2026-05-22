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
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!filtroAlerta ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltroAlerta(true)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${filtroAlerta ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
        >
          ⚠ Solo alertas
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${filtroAlerta ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-700'}`}>
            {stock.filter((s) => s.stock_actual <= s.stock_minimo).length}
          </span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Insumo</th>
              <th className="px-5 py-3 font-medium">Unidad</th>
              {almacenes.map((a) => (
                <th key={a.id} className="px-5 py-3 font-medium text-center">
                  <div>{a.nombre}</div>
                  <div className="text-gray-400 normal-case font-normal capitalize">{a.tipo}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {insumosFiltrados.map((insumo) => (
              <tr key={insumo.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-900">{insumo.nombre}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">{insumo.unidad}</td>
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
                            className="w-20 border border-orange-400 rounded-lg px-2 py-1 text-center text-sm focus:outline-none"
                            autoFocus
                          />
                          <button onClick={confirmarAjuste} className="text-green-500 hover:text-green-700 text-lg">✓</button>
                          <button onClick={() => setEditando(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => s && setEditando({ insumoId: insumo.id, almacenId: a.id, valor: String(s.stock_actual) })}
                          className={`group relative inline-flex flex-col items-center px-3 py-1.5 rounded-xl hover:bg-orange-50 transition-colors ${alerta ? 'bg-red-50' : ''}`}
                        >
                          {s ? (
                            <>
                              <span className={`font-bold text-base ${alerta ? 'text-red-600' : 'text-gray-900'}`}>
                                {s.stock_actual.toFixed(1)}
                              </span>
                              <span className="text-gray-400 text-xs">mín {s.stock_minimo}</span>
                              {alerta && <span className="text-yellow-500 text-xs">⚠</span>}
                            </>
                          ) : (
                            <span className="text-gray-300">—</span>
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
      <p className="text-xs text-gray-400 mt-2">Haz clic en cualquier cantidad para editarla directamente.</p>
    </div>
  )
}
