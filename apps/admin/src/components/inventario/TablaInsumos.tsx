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
    ok: 'bg-green-100 text-green-700',
    alerta: 'bg-yellow-100 text-yellow-700',
    agotado: 'bg-red-100 text-red-700',
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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar insumo..."
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
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
          <tbody className="divide-y divide-gray-50">
            {filtrados.map((insumo) => {
              const estado = estadoStock(insumo.id)
              return (
                <tr key={insumo.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{insumo.nombre}</td>
                  <td className="px-5 py-3 text-gray-500">{insumo.unidad}</td>
                  <td className="px-5 py-3 text-gray-700">${insumo.costo_unitario.toFixed(2)}</td>
                  {almacenes.map((a) => {
                    const s = stock.find((x) => x.insumo_id === insumo.id && x.almacen_id === a.id)
                    const bajo = s && s.stock_actual <= s.stock_minimo
                    return (
                      <td key={a.id} className="px-5 py-3 text-center">
                        {s ? (
                          <span className={`font-semibold ${bajo ? 'text-red-600' : 'text-gray-900'}`}>
                            {s.stock_actual.toFixed(1)}
                            <span className="text-gray-400 text-xs ml-1">/{s.stock_minimo}</span>
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
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
                        className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onEliminar(insumo)}
                        className="px-3 py-1.5 text-xs font-medium border border-red-200 rounded-lg hover:bg-red-50 text-red-600"
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
          <div className="text-center py-12 text-gray-400">
            <p>Sin resultados</p>
          </div>
        )}
      </div>
    </div>
  )
}
