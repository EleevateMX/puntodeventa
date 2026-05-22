import React from 'react'
import type { Merma, Insumo, Almacen } from '../../hooks/useInventario'

const TIPO_CONFIG: Record<Merma['tipo'], { label: string; clase: string }> = {
  vencimiento: { label: '📅 Vencimiento', clase: 'bg-sa-strawberry/15 text-sa-strawberry' },
  accidente:   { label: '💥 Accidente',   clase: 'bg-sa-cream-warm text-sa-green-deep' },
  calidad:     { label: '🔍 Calidad',     clase: 'bg-sa-banana/30 text-sa-coffee' },
  otro:        { label: '📌 Otro',        clase: 'bg-sa-cream-warm text-sa-green-ink/70' },
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
        <div className="bg-white rounded-sa px-5 py-3 shadow-sa-sm border border-sa-green-ink/5 flex items-center gap-3">
          <span className="text-2xl">🗑️</span>
          <div>
            <p className="text-xs text-sa-green-ink/60">Total mermas registradas</p>
            <p className="text-xl font-bold text-sa-green-ink">{mermas.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-sa px-5 py-3 shadow-sa-sm border border-sa-green-ink/5 flex items-center gap-3">
          <span className="text-2xl">💸</span>
          <div>
            <p className="text-xs text-sa-green-ink/60">Costo total de mermas</p>
            <p className="text-xl font-bold text-sa-strawberry">${totalCosto.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-sa shadow-sa-sm border border-sa-green-ink/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sa-green-ink/5 text-left text-xs text-sa-green-ink/60 uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Fecha</th>
              <th className="px-5 py-3 font-medium">Insumo</th>
              <th className="px-5 py-3 font-medium">Almacén</th>
              <th className="px-5 py-3 font-medium text-right">Cantidad</th>
              <th className="px-5 py-3 font-medium text-right">Costo</th>
              <th className="px-5 py-3 font-medium">Tipo</th>
              <th className="px-5 py-3 font-medium">Notas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sa-green-ink/5">
            {mermas.map((m) => {
              const insumo = insumos.find((i) => i.id === m.insumo_id)
              const almacen = almacenes.find((a) => a.id === m.almacen_id)
              const costo = m.cantidad * (insumo?.costo_unitario ?? 0)
              const cfg = TIPO_CONFIG[m.tipo]
              return (
                <tr key={m.id} className="hover:bg-sa-cream-paper transition-colors">
                  <td className="px-5 py-3 text-sa-green-ink/60 text-xs whitespace-nowrap">
                    {new Date(m.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                    {' '}
                    {new Date(m.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-3 font-medium text-sa-green-ink">{insumo?.nombre ?? '—'}</td>
                  <td className="px-5 py-3 text-sa-green-ink/60 text-xs">{almacen?.nombre ?? '—'}</td>
                  <td className="px-5 py-3 text-right font-semibold text-sa-green-ink">
                    {m.cantidad.toFixed(1)} <span className="text-sa-green-ink/40 text-xs font-normal">{insumo?.unidad}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-sa-strawberry font-medium">${costo.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.clase}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sa-green-ink/60 text-xs">{m.notas ?? <span className="text-sa-green-ink/25">—</span>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {mermas.length === 0 && (
          <div className="text-center py-12 text-sa-green-ink/40">
            <p>Sin mermas registradas</p>
          </div>
        )}
      </div>
    </div>
  )
}
