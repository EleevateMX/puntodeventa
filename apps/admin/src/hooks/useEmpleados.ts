/// <reference types="vite/client" />
import { useState } from 'react'

export type Rol = 'admin' | 'cajero' | 'cocinero' | 'mesero' | 'supervisor'

export interface Empleado {
  id: string
  nombre: string
  pin: string
  rol: Rol
  activo: boolean
  sucursal_id: string | null
}

export interface EmpleadoInput {
  nombre: string
  pin: string
  rol: Rol
  activo: boolean
  sucursal_id: string | null
}

const isSupabaseConfigured =
  import.meta.env.VITE_SUPABASE_URL &&
  !String(import.meta.env.VITE_SUPABASE_URL).includes('xxxx')

const DEMO_EMPLEADOS: Empleado[] = [
  { id: '1', nombre: 'Carlos Mendoza',   pin: '1234', rol: 'admin',      activo: true,  sucursal_id: null },
  { id: '2', nombre: 'Laura García',     pin: '5678', rol: 'cajero',     activo: true,  sucursal_id: null },
  { id: '3', nombre: 'Pedro Ramírez',    pin: '2468', rol: 'cocinero',   activo: true,  sucursal_id: null },
  { id: '4', nombre: 'Ana Torres',       pin: '1357', rol: 'mesero',     activo: true,  sucursal_id: null },
  { id: '5', nombre: 'Roberto Sánchez',  pin: '9012', rol: 'supervisor', activo: false, sucursal_id: null },
]

function generarId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function useEmpleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>(DEMO_EMPLEADOS)

  function agregarEmpleado(input: EmpleadoInput): void {
    const nuevo: Empleado = { ...input, id: generarId() }
    setEmpleados((prev) => [...prev, nuevo])
  }

  function editarEmpleado(id: string, input: EmpleadoInput): void {
    setEmpleados((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...input } : e)),
    )
  }

  function borrarEmpleado(id: string): void {
    setEmpleados((prev) => prev.filter((e) => e.id !== id))
  }

  function toggleActivoEmpleado(id: string): void {
    setEmpleados((prev) =>
      prev.map((e) => (e.id === id ? { ...e, activo: !e.activo } : e)),
    )
  }

  return {
    empleados,
    isSupabaseConfigured: Boolean(isSupabaseConfigured),
    agregarEmpleado,
    editarEmpleado,
    borrarEmpleado,
    toggleActivoEmpleado,
  }
}
