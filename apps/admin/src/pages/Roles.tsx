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
  admin:      'bg-sa-blueberry',
  cajero:     'bg-sa-mint',
  cocinero:   'bg-sa-mango',
  mesero:     'bg-sa-banana',
  supervisor: 'bg-sa-green',
}

const ROL_COLOR: Record<Rol, string> = {
  admin:      'bg-sa-blueberry/15 text-sa-blueberry',
  cajero:     'bg-sa-mint/30 text-sa-green-ink',
  cocinero:   'bg-sa-mango/15 text-sa-mango',
  mesero:     'bg-sa-banana/30 text-sa-coffee',
  supervisor: 'bg-sa-green/15 text-sa-green-deep',
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
    <div className="flex flex-col h-screen bg-sa-cream-paper">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 bg-sa-cream-paper border-b border-sa-green-ink/10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-display text-sa-green-ink">Empleados y Roles</h2>
          <button
            onClick={abrirNuevo}
            className="bg-sa-green hover:bg-sa-green-deep text-sa-cream px-5 py-2.5 rounded-sa font-medium text-sm transition-colors"
          >
            + Nuevo empleado
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {/* Total */}
          <div className="bg-white rounded-sa border border-sa-green-ink/5 shadow-sa-sm p-4">
            <p className="text-xs font-mono text-sa-green-ink/60 uppercase tracking-wide">Total empleados</p>
            <p className="text-4xl font-display text-sa-green-ink mt-1 leading-none">{empleados.length}</p>
          </div>

          {/* Activos */}
          <div className="bg-white rounded-sa border border-sa-green-ink/5 shadow-sa-sm p-4">
            <p className="text-xs font-mono text-sa-green-ink/60 uppercase tracking-wide">Activos</p>
            <p className="text-4xl font-display text-sa-green mt-1 leading-none">{totalActivos}</p>
            <p className="text-xs font-mono text-sa-green-ink/50 mt-1">{empleados.length - totalActivos} inactivos</p>
          </div>

          {/* Rol más común */}
          <div className="bg-white rounded-sa border border-sa-green-ink/5 shadow-sa-sm p-4">
            <p className="text-xs font-mono text-sa-green-ink/60 uppercase tracking-wide">Rol más común</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl">{ROL_EMOJI[rolMasComun]}</span>
              <span className={`px-2.5 py-1 rounded-full text-sm font-semibold ${ROL_COLOR[rolMasComun]}`}>
                {ROL_LABEL[rolMasComun]}
              </span>
            </div>
          </div>

          {/* Roles breakdown */}
          <div className="bg-white rounded-sa border border-sa-green-ink/5 shadow-sa-sm p-4">
            <p className="text-xs font-mono text-sa-green-ink/60 uppercase tracking-wide mb-2">Roles</p>
            <div className="space-y-1">
              {ROLES_TABLA.filter((r) => conteoRol[r] > 0).map((rol) => (
                <div key={rol} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ROL_DOT[rol]}`} />
                  <span className="text-xs text-sa-green-ink/70 flex-1">{ROL_LABEL[rol]}</span>
                  <span className="text-xs font-mono font-semibold text-sa-green-ink">{conteoRol[rol]}</span>
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
          <h3 className="text-2xl font-display text-sa-green-ink mb-4">Permisos por rol</h3>
          <div className="bg-white rounded-sa shadow-sa-sm border border-sa-green-ink/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sa-cream-soft border-b border-sa-green-ink/10 text-left text-sa-green-ink/60 font-mono text-xs uppercase tracking-wide">
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
              <tbody className="divide-y divide-sa-green-ink/5">
                {ACCIONES.map((accion) => (
                  <tr key={accion} className="hover:bg-sa-cream-soft/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-sa-green-ink/80">{accion}</td>
                    {ROLES_TABLA.map((rol) => {
                      const tiene = PERMISOS[accion][rol]
                      return (
                        <td key={rol} className="px-5 py-3 text-center">
                          {tiene ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sa-mint/30 text-sa-green-deep font-bold text-xs">
                              ✓
                            </span>
                          ) : (
                            <span className="text-sa-green-ink/25 font-medium">—</span>
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
          <div className="absolute inset-0 bg-sa-green-ink/50 backdrop-blur-sm" onClick={() => setConfirmEliminar(null)} />
          <div className="relative bg-sa-cream-soft rounded-sa-lg shadow-sa p-6 w-full max-w-sm border border-sa-green-ink/5">
            <h3 className="text-2xl font-display text-sa-green-ink mb-2">¿Eliminar empleado?</h3>
            <p className="text-sa-green-ink/70 text-sm mb-5">
              Se eliminará a{' '}
              <span className="font-medium text-sa-green-ink">"{confirmEliminar.nombre}"</span>{' '}
              permanentemente. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmEliminar(null)}
                className="flex-1 border border-sa-green-ink/15 text-sa-green-ink py-2.5 rounded-sa font-medium text-sm hover:bg-sa-cream-warm/50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="flex-1 bg-sa-strawberry disabled:opacity-50 text-white py-2.5 rounded-sa font-medium text-sm hover:opacity-90"
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
