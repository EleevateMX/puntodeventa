/// <reference types="vite/client" />
import { useState, useCallback, useEffect } from 'react'
import {
  isSupabaseConfigured,
  getEmpleados as getEmpleadosDB,
  crearEmpleado as crearEmpleadoDB,
  actualizarEmpleado as actualizarEmpleadoDB,
  toggleActivoEmpleado as toggleActivoDB,
} from '@pos/supabase'
import type { EmpleadoInput as DBEmpleadoInput } from '@pos/supabase'

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

const DEMO_EMPLEADOS: Empleado[] = [
  { id: '1', nombre: 'Carlos Mendoza',   pin: '1234', rol: 'admin',      activo: true,  sucursal_id: null },
  { id: '2', nombre: 'Laura García',     pin: '5678', rol: 'cajero',     activo: true,  sucursal_id: null },
  { id: '3', nombre: 'Pedro Ramírez',    pin: '2468', rol: 'cocinero',   activo: true,  sucursal_id: null },
  { id: '4', nombre: 'Ana Torres',       pin: '1357', rol: 'mesero',     activo: true,  sucursal_id: null },
  { id: '5', nombre: 'Roberto Sánchez',  pin: '9012', rol: 'supervisor', activo: false, sucursal_id: null },
]

export function useEmpleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setEmpleados(DEMO_EMPLEADOS)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getEmpleadosDB()
      setEmpleados(data.map(row => ({
        id: row.id,
        nombre: row.nombre,
        pin: row.pin ?? '',
        rol: row.rol as Rol,
        activo: row.activo,
        sucursal_id: row.sucursal_id,
      })))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void cargar() }, [cargar])

  async function agregarEmpleado(input: EmpleadoInput): Promise<void> {
    if (!isSupabaseConfigured) {
      const nuevo: Empleado = { ...input, id: Math.random().toString(36).slice(2, 10) }
      setEmpleados((prev) => [...prev, nuevo])
      return
    }
    await crearEmpleadoDB({
      nombre: input.nombre,
      pin: input.pin,
      rol: input.rol as DBEmpleadoInput['rol'],
      activo: input.activo,
      sucursal_id: input.sucursal_id,
    })
    await cargar()
  }

  async function editarEmpleado(id: string, input: EmpleadoInput): Promise<void> {
    if (!isSupabaseConfigured) {
      setEmpleados((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...input } : e)),
      )
      return
    }
    await actualizarEmpleadoDB(id, {
      nombre: input.nombre,
      pin: input.pin,
      rol: input.rol as DBEmpleadoInput['rol'],
      activo: input.activo,
      sucursal_id: input.sucursal_id,
    })
    await cargar()
  }

  async function borrarEmpleado(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      setEmpleados((prev) => prev.filter((e) => e.id !== id))
      return
    }
    await toggleActivoDB(id, false)
    setEmpleados((prev) => prev.filter((e) => e.id !== id))
  }

  async function toggleActivoEmpleado(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      setEmpleados((prev) =>
        prev.map((e) => (e.id === id ? { ...e, activo: !e.activo } : e)),
      )
      return
    }
    const empleado = empleados.find((e) => e.id === id)
    if (!empleado) return
    await toggleActivoDB(id, !empleado.activo)
    await cargar()
  }

  return {
    empleados,
    loading,
    error,
    cargar,
    isSupabaseConfigured: Boolean(isSupabaseConfigured),
    agregarEmpleado,
    editarEmpleado,
    borrarEmpleado,
    toggleActivoEmpleado,
  }
}
