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
  admin:      'bg-purple-100 text-purple-700',
  cajero:     'bg-blue-100 text-blue-700',
  cocinero:   'bg-orange-100 text-orange-700',
  mesero:     'bg-teal-100 text-teal-700',
  supervisor: 'bg-indigo-100 text-indigo-700',
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
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {value ? `${ROL_EMOJI[value as Rol]} ${label}` : label}
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar empleado..."
            className="pl-8 pr-4 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white w-52"
          />
        </div>
      </div>

      {/* Tabla */}
      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
          <span className="text-5xl">👥</span>
          <p className="text-base font-medium">
            {busqueda || filtroRol ? 'Sin resultados para los filtros aplicados' : 'No hay empleados aún'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Empleado</th>
                <th className="px-5 py-3 font-medium">Rol</th>
                <th className="px-5 py-3 font-medium text-center">PIN</th>
                <th className="px-5 py-3 font-medium text-center">Estado</th>
                <th className="px-5 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  {/* Nombre */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base font-semibold text-gray-500 flex-shrink-0">
                        {emp.nombre.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{emp.nombre}</span>
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
                    <span className="font-mono text-base tracking-[0.3em] text-gray-400 select-none">••••</span>
                  </td>

                  {/* Estado */}
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      emp.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {emp.activo ? '● Activo' : '○ Inactivo'}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditar(emp)}
                        className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onToggleActivo(emp.id)}
                        className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
                          emp.activo
                            ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {emp.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => onEliminar(emp)}
                        className="px-3 py-1.5 text-xs font-medium border border-red-200 rounded-lg hover:bg-red-50 text-red-600"
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
