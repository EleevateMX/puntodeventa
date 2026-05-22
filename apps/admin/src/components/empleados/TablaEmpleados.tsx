import React, { useState } from 'react'
import type { Empleado, Rol } from '../../hooks/useEmpleados'

interface Props {
  empleados: Empleado[]
  onEditar: (e: Empleado) => void
  onEliminar: (e: Empleado) => void
  onToggleActivo: (id: string) => void
}

const ROL_LABEL: Record<Rol, string> = {
  admin:      'Admin',
  cajero:     'Cajero',
  cocinero:   'Cocinero',
  mesero:     'Mesero',
  supervisor: 'Supervisor',
}

const ROL_EMOJI: Record<Rol, string> = {
  admin:      '👑',
  cajero:     '💳',
  cocinero:   '🍳',
  mesero:     '🛎',
  supervisor: '🔑',
}

const ROL_COLOR: Record<Rol, string> = {
  admin:      'bg-sa-blueberry/15 text-sa-blueberry',
  cajero:     'bg-sa-mint/30 text-sa-green-ink',
  cocinero:   'bg-sa-mango/15 text-sa-mango',
  mesero:     'bg-sa-banana/30 text-sa-coffee',
  supervisor: 'bg-sa-green/15 text-sa-green-deep',
}

const ROLES_FILTRO: { value: Rol | ''; label: string }[] = [
  { value: '',          label: 'Todos' },
  { value: 'admin',      label: 'Admin' },
  { value: 'cajero',     label: 'Cajero' },
  { value: 'cocinero',   label: 'Cocinero' },
  { value: 'mesero',     label: 'Mesero' },
  { value: 'supervisor', label: 'Supervisor' },
]

export function TablaEmpleados({ empleados, onEditar, onEliminar, onToggleActivo }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState<Rol | ''>('')

  const filtrados = empleados.filter((e) => {
    const coincideNombre = e.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideRol = !filtroRol || e.rol === filtroRol
    return coincideNombre && coincideRol
  })

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {ROLES_FILTRO.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFiltroRol(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filtroRol === value
                  ? 'bg-sa-green-ink text-sa-cream'
                  : 'bg-white text-sa-green-ink/70 border border-sa-green-ink/15 hover:border-sa-green-ink/30'
              }`}
            >
              {value ? `${ROL_EMOJI[value as Rol]} ${label}` : label}
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sa-green-ink/50 text-sm">🔍</span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar empleado..."
            className="pl-8 pr-4 py-1.5 border border-sa-green-ink/15 rounded-sa text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40 bg-white w-52"
          />
        </div>
      </div>

      {/* Tabla */}
      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-sa-green-ink/50 gap-3">
          <span className="text-5xl">👥</span>
          <p className="text-base font-medium">
            {busqueda || filtroRol ? 'Sin resultados para los filtros aplicados' : 'No hay empleados aún'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-sa shadow-sa-sm border border-sa-green-ink/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sa-cream-soft border-b border-sa-green-ink/10 text-left text-sa-green-ink/60 font-mono text-xs uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Empleado</th>
                <th className="px-5 py-3 font-medium">Rol</th>
                <th className="px-5 py-3 font-medium text-center">PIN</th>
                <th className="px-5 py-3 font-medium text-center">Estado</th>
                <th className="px-5 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sa-green-ink/5">
              {filtrados.map((emp) => (
                <tr key={emp.id} className="hover:bg-sa-cream-soft/50 transition-colors">
                  {/* Nombre */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-sa-cream-warm flex items-center justify-center text-base font-semibold text-sa-green-ink/70 flex-shrink-0">
                        {emp.nombre.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sa-green-ink">{emp.nombre}</span>
                    </div>
                  </td>

                  {/* Rol */}
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ROL_COLOR[emp.rol]}`}>
                      {ROL_EMOJI[emp.rol]} {ROL_LABEL[emp.rol]}
                    </span>
                  </td>

                  {/* PIN */}
                  <td className="px-5 py-3 text-center">
                    <span className="font-mono text-base tracking-[0.3em] text-sa-green-ink/40 select-none">••••</span>
                  </td>

                  {/* Estado */}
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      emp.activo ? 'bg-sa-mint/30 text-sa-green-ink' : 'bg-sa-cream-warm text-sa-green-ink/60'
                    }`}>
                      {emp.activo ? '● Activo' : '○ Inactivo'}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditar(emp)}
                        className="px-3 py-1.5 text-xs font-medium border border-sa-green-ink/15 rounded-lg hover:bg-sa-cream-soft text-sa-green-ink"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onToggleActivo(emp.id)}
                        className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
                          emp.activo
                            ? 'border-sa-mango/30 text-sa-mango hover:bg-sa-mango/10'
                            : 'border-sa-mint/40 text-sa-green-deep hover:bg-sa-mint/15'
                        }`}
                      >
                        {emp.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => onEliminar(emp)}
                        className="px-3 py-1.5 text-xs font-medium border border-sa-strawberry/30 rounded-lg hover:bg-sa-strawberry/10 text-sa-strawberry"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
