import React from 'react'
import type { Promocion, TipoPromocion } from '../../hooks/usePromociones'

interface Props {
  promociones: Promocion[]
  onEditar: (p: Promocion) => void
  onBorrar: (id: string) => void
  onToggle: (id: string) => void
}

const TIPO_LABEL: Record<TipoPromocion, { label: string; color: string }> = {
  descuento_porcentaje: { label: '% Desc.', color: 'bg-sa-mint/20 text-sa-green-deep' },
  descuento_monto:      { label: 'Monto fijo', color: 'bg-sa-banana/20 text-sa-green-deep' },
  combo:                { label: 'Combo', color: 'bg-sa-mango/20 text-sa-green-deep' },
  segunda_unidad:       { label: '2ª unidad', color: 'bg-sa-blueberry/20 text-sa-blueberry' },
  regalo:               { label: 'Regalo', color: 'bg-sa-strawberry/20 text-sa-strawberry' },
}

function valorDisplay(p: Promocion): string {
  if (p.tipo === 'regalo') return '🎁'
  if (p.tipo === 'descuento_porcentaje' || p.tipo === 'segunda_unidad') return `${p.valor}%`
  return `$${p.valor.toFixed(0)}`
}

function vigenciaDisplay(p: Promocion): string {
  const partes: string[] = []
  if (p.fecha_inicio || p.fecha_fin) {
    const desde = p.fecha_inicio ?? '∞'
    const hasta = p.fecha_fin ?? '∞'
    partes.push(`${desde} → ${hasta}`)
  }
  if (p.horas_inicio && p.horas_fin) {
    partes.push(`${p.horas_inicio}–${p.horas_fin}`)
  }
  return partes.length ? partes.join('  ·  ') : 'Sin restricción'
}

function estaVencida(p: Promocion): boolean {
  if (!p.fecha_fin) return false
  const fin = new Date(p.fecha_fin)
  fin.setHours(23, 59, 59, 999)
  return new Date() > fin
}

export function TablaPromociones({ promociones, onEditar, onBorrar, onToggle }: Props) {
  if (promociones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-sa-green-ink/40">
        <span className="text-6xl mb-4">🎟️</span>
        <p className="font-display text-2xl">Sin promociones aquí</p>
        <p className="font-mono text-sm mt-2 uppercase tracking-wide">
          Crea una para empezar
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-sa-green-ink/10">
            <th className="text-left font-mono text-xs uppercase tracking-wider text-sa-green-ink/50 pb-3 pr-4">
              Nombre
            </th>
            <th className="text-left font-mono text-xs uppercase tracking-wider text-sa-green-ink/50 pb-3 pr-4">
              Tipo
            </th>
            <th className="text-right font-mono text-xs uppercase tracking-wider text-sa-green-ink/50 pb-3 pr-4">
              Valor
            </th>
            <th className="text-left font-mono text-xs uppercase tracking-wider text-sa-green-ink/50 pb-3 pr-4">
              Código
            </th>
            <th className="text-left font-mono text-xs uppercase tracking-wider text-sa-green-ink/50 pb-3 pr-4">
              Vigencia
            </th>
            <th className="text-center font-mono text-xs uppercase tracking-wider text-sa-green-ink/50 pb-3 pr-4">
              Estado
            </th>
            <th className="pb-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-sa-green-ink/6">
          {promociones.map((p) => {
            const vencida = estaVencida(p)
            const tipoMeta = TIPO_LABEL[p.tipo]
            return (
              <tr
                key={p.id}
                className={`group transition-colors hover:bg-sa-cream-soft ${
                  !p.activa || vencida ? 'opacity-50' : ''
                }`}
              >
                {/* Nombre */}
                <td className="py-4 pr-4">
                  <p className="font-semibold text-sa-green-ink">{p.nombre}</p>
                  {p.descripcion && (
                    <p className="text-xs text-sa-green-ink/50 mt-0.5 line-clamp-1">
                      {p.descripcion}
                    </p>
                  )}
                </td>

                {/* Tipo */}
                <td className="py-4 pr-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tipoMeta.color}`}
                  >
                    {tipoMeta.label}
                  </span>
                </td>

                {/* Valor */}
                <td className="py-4 pr-4 text-right font-mono text-lg font-medium text-sa-green-deep">
                  {valorDisplay(p)}
                </td>

                {/* Código */}
                <td className="py-4 pr-4">
                  {p.codigo ? (
                    <span className="font-mono text-xs bg-sa-green-ink/8 border border-sa-green-ink/15 px-2 py-1 rounded tracking-widest">
                      {p.codigo}
                    </span>
                  ) : (
                    <span className="text-sa-green-ink/30 text-xs font-mono">auto</span>
                  )}
                </td>

                {/* Vigencia */}
                <td className="py-4 pr-4">
                  <p className="text-xs text-sa-green-ink/60 font-mono">
                    {vigenciaDisplay(p)}
                    {vencida && (
                      <span className="ml-2 text-sa-strawberry font-medium">vencida</span>
                    )}
                  </p>
                </td>

                {/* Estado toggle */}
                <td className="py-4 pr-4 text-center">
                  <button
                    onClick={() => onToggle(p.id)}
                    className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors ${
                      p.activa && !vencida ? 'bg-sa-green' : 'bg-sa-green-ink/20'
                    }`}
                    title={p.activa ? 'Pausar' : 'Activar'}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        p.activa && !vencida ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </td>

                {/* Acciones */}
                <td className="py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditar(p)}
                      className="p-2 rounded-sa hover:bg-sa-green-ink/8 text-sa-green-ink/60 hover:text-sa-green-deep transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onBorrar(p.id)}
                      className="p-2 rounded-sa hover:bg-sa-strawberry/10 text-sa-green-ink/40 hover:text-sa-strawberry transition-colors"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
