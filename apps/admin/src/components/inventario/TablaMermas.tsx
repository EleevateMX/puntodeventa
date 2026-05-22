import React from 'react'
import type { Merma, Insumo, Almacen } from '../../hooks/useInventario'

const TIPO_CONFIG: Record<Merma['tipo'], { label: string; clase: string }> = {
  vencimiento: { label: '📅 Vencimiento', clase: 'bg-red-100 text-red-700' },
  accidente:   { label: '💥 Accidente',   clase: 'bg-orange-100 text-orange-700' },
  calidad:     { label: '🔍 Calidad',     clase: 'bg-yellow-100 text-yellow-700' },
  otro:        { label: '📌 Otro',        clase: 'bg-gray-100 text-gray-600' },
}

interface Props {
  mermas: Merma[]
  insumos: Insumo[]
  almacenes: Almacen[]
}

export function TablaMermas({ mermas, insumos, almacenes }: Props) {
  const totalCosto = mermas.reduce((sum, m) => {
    const insumo = insumos.find((i) => i.id === m.insumo_id)
    return sum + m.cantidad * (insumo?.costo_unitario ?? 0)
  }, 0)

  return (
    <div>
      {/* Summary */}
      <div className="flex gap-4 mb-4">
        <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100 flex items-center gap-3">
          <span className="text-2xl">🗑️</span>
          <div>
            <p className="text-xs text-gray-500">Total mermas registradas</p>
            <p className="text-xl font-bold text-gray-900">{mermas.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100 flex items-center gap-3">
          <span className="text-2xl">💸</span>
          <div>
            <p className="text-xs text-gray-500">Costo total de mermas</p>
            <p className="text-xl font-bold text-red-600">${totalCosto.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Fecha</th>
              <th className="px-5 py-3 font-medium">Insumo</th>
              <th className="px-5 py-3 font-medium">Almacén</th>
              <th className="px-5 py-3 font-medium text-right">Cantidad</th>
              <th className="px-5 py-3 font-medium text-right">Costo</th>
              <th className="px-5 py-3 font-medium">Tipo</th>
              <th className="px-5 py-3 font-medium">Notas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mermas.map((m) => {
              const insumo = insumos.find((i) => i.id === m.insumo_id)
              const almacen = almacenes.find((a) => a.id === m.almacen_id)
              const costo = m.cantidad * (insumo?.costo_unitario ?? 0)
              const cfg = TIPO_CONFIG[m.tipo]
              return (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(m.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                    {' '}
                    {new Date(m.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">{insumo?.nombre ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{almacen?.nombre ?? '—'}</td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-900">
                    {m.cantidad.toFixed(1)} <span className="text-gray-400 text-xs font-normal">{insumo?.unidad}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-red-600 font-medium">${costo.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.clase}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{m.notas ?? <span className="text-gray-300">—</span>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {mermas.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>Sin mermas registradas</p>
          </div>
        )}
      </div>
    </div>
  )
}
