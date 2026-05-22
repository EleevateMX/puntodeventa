import React, { useState } from 'react'
import { useEmpleados, type Empleado, type Rol } from '../hooks/useEmpleados'
import { TablaEmpleados } from '../components/empleados/TablaEmpleados'
import { ModalEmpleado } from '../components/empleados/ModalEmpleado'

// ─── Permisions matrix ────────────────────────────────────────────────────────

type Accion =
  | 'Crear orden'
  | 'Cobrar'
  | 'Aplicar descuento'
  | 'Ver reportes'
  | 'Gestionar menú'
  | 'Gestionar empleados'
  | 'Acceso completo'

const ACCIONES: Accion[] = [
  'Crear orden',
  'Cobrar',
  'Aplicar descuento',
  'Ver reportes',
  'Gestionar menú',
  'Gestionar empleados',
  'Acceso completo',
]

const PERMISOS: Record<Accion, Record<Rol, boolean>> = {
  'Crear orden':          { cajero: true,  mesero: true,  cocinero: false, supervisor: true,  admin: true },
  'Cobrar':               { cajero: true,  mesero: false, cocinero: false, supervisor: true,  admin: true },
  'Aplicar descuento':    { cajero: false, mesero: false, cocinero: false, supervisor: true,  admin: true },
  'Ver reportes':         { cajero: false, mesero: false, cocinero: false, supervisor: true,  admin: true },
  'Gestionar menú':       { cajero: false, mesero: false, cocinero: false, supervisor: false, admin: true },
  'Gestionar empleados':  { cajero: false, mesero: false, cocinero: false, supervisor: false, admin: true },
  'Acceso completo':      { cajero: false, mesero: false, cocinero: false, supervisor: false, admin: true },
}

const ROLES_TABLA: Rol[] = ['cajero', 'mesero', 'cocinero', 'supervisor', 'admin']

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

const ROL_DOT: Record<Rol, string> = {
  admin:      'bg-purple-500',
  cajero:     'bg-blue-500',
  cocinero:   'bg-orange-500',
  mesero:     'bg-teal-500',
  supervisor: 'bg-indigo-500',
}

const ROL_COLOR: Record<Rol, string> = {
  admin:      'bg-purple-100 text-purple-700',
  cajero:     'bg-blue-100 text-blue-700',
  cocinero:   'bg-orange-100 text-orange-700',
  mesero:     'bg-teal-100 text-teal-700',
  supervisor: 'bg-indigo-100 text-indigo-700',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Roles() {
  const {
    empleados,
    agregarEmpleado,
    editarEmpleado,
    borrarEmpleado,
    toggleActivoEmpleado,
  } = useEmpleados()

  const [modalOpen, setModalOpen] = useState(false)
  const [empleadoEditar, setEmpleadoEditar] = useState<Empleado | null>(null)
  const [confirmEliminar, setConfirmEliminar] = useState<Empleado | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const totalActivos = empleados.filter((e) => e.activo).length

  // Count per rol
  const conteoRol = ROLES_TABLA.reduce<Record<Rol, number>>((acc, rol) => {
    acc[rol] = empleados.filter((e) => e.rol === rol).length
    return acc
  }, {} as Record<Rol, number>)

  // Most common rol
  const rolMasComun = ROLES_TABLA.reduce<Rol>((prev, cur) =>
    conteoRol[cur] > conteoRol[prev] ? cur : prev,
  'cajero')

  function abrirNuevo() {
    setEmpleadoEditar(null)
    setModalOpen(true)
  }

  function abrirEditar(e: Empleado) {
    setEmpleadoEditar(e)
    setModalOpen(true)
  }

  async function confirmarEliminar() {
    if (!confirmEliminar) return
    setEliminando(true)
    try {
      borrarEmpleado(confirmEliminar.id)
    } finally {
      setEliminando(false)
      setConfirmEliminar(null)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Empleados y Roles</h2>
          <button
            onClick={abrirNuevo}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            + Nuevo empleado
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {/* Total */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total empleados</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{empleados.length}</p>
          </div>

          {/* Activos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Activos</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{totalActivos}</p>
            <p className="text-xs text-gray-400 mt-0.5">{empleados.length - totalActivos} inactivos</p>
          </div>

          {/* Rol más común */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rol más común</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">{ROL_EMOJI[rolMasComun]}</span>
              <span className={`px-2.5 py-1 rounded-full text-sm font-semibold ${ROL_COLOR[rolMasComun]}`}>
                {ROL_LABEL[rolMasComun]}
              </span>
            </div>
          </div>

          {/* Roles breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Roles</p>
            <div className="space-y-1">
              {ROLES_TABLA.filter((r) => conteoRol[r] > 0).map((rol) => (
                <div key={rol} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ROL_DOT[rol]}`} />
                  <span className="text-xs text-gray-600 flex-1">{ROL_LABEL[rol]}</span>
                  <span className="text-xs font-semibold text-gray-800">{conteoRol[rol]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-10">
        <TablaEmpleados
          empleados={empleados}
          onEditar={abrirEditar}
          onEliminar={(e) => setConfirmEliminar(e)}
          onToggleActivo={toggleActivoEmpleado}
        />

        {/* Permisos por rol */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Permisos por rol</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium w-48">Acción</th>
                  {ROLES_TABLA.map((rol) => (
                    <th key={rol} className="px-5 py-3 font-medium text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-base">{ROL_EMOJI[rol]}</span>
                        <span>{ROL_LABEL[rol]}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ACCIONES.map((accion) => (
                  <tr key={accion} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-700">{accion}</td>
                    {ROLES_TABLA.map((rol) => {
                      const tiene = PERMISOS[accion][rol]
                      return (
                        <td key={rol} className="px-5 py-3 text-center">
                          {tiene ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 font-bold text-xs">
                              ✓
                            </span>
                          ) : (
                            <span className="text-gray-300 font-medium">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal empleado */}
      <ModalEmpleado
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onGuardar={empleadoEditar
          ? (input) => editarEmpleado(empleadoEditar.id, input)
          : agregarEmpleado
        }
        empleado={empleadoEditar}
      />

      {/* Diálogo de confirmación de eliminación */}
      {confirmEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmEliminar(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar empleado?</h3>
            <p className="text-gray-500 text-sm mb-5">
              Se eliminará a{' '}
              <span className="font-medium text-gray-700">"{confirmEliminar.nombre}"</span>{' '}
              permanentemente. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmEliminar(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="flex-1 bg-red-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-red-600"
              >
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
