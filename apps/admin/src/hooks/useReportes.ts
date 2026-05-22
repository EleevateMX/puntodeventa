import { useState, useMemo, useEffect } from 'react'
import {
  getVentasDiarias,
  getProductosMasVendidos,
  isSupabaseConfigured,
} from '@pos/supabase'
import type { VentaDiaRow, ProductoVendidoRow } from '@pos/supabase'

export interface VentaDia {
  fecha: string // 'YYYY-MM-DD'
  total: number
  num_ordenes: number
  ticket_promedio: number
}

export interface VentaProducto {
  producto_id: string
  nombre: string
  cantidad: number
  total: number
}

export interface VentaMetodo {
  metodo: string // 'efectivo' | 'tarjeta_credito' | 'tarjeta_debito' | 'qr'
  total: number
  num_ordenes: number
}

export interface HoraPico {
  hora: number // 0-23
  num_ordenes: number
}

export type Periodo = '7d' | '30d' | '90d'

// --- Demo data generation ---

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function generarVentasPorDia(): VentaDia[] {
  const hoy = new Date()
  const dias: VentaDia[] = []

  for (let i = 89; i >= 0; i--) {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() - i)
    const fechaStr = fecha.toISOString().split('T')[0] as string
    const diaSemana = fecha.getDay() // 0=dom, 6=sab

    const esFinde = diaSemana === 0 || diaSemana === 6
    const base = esFinde ? 5500 : 3500
    const variacion = seededRandom(i * 7 + 3) * 2500 - 500
    const total = Math.max(1200, Math.round((base + variacion) / 10) * 10)

    const ticketBase = 120 + seededRandom(i * 13 + 7) * 60
    const num_ordenes = Math.round(total / ticketBase)
    const ticket_promedio = Math.round((total / num_ordenes) * 100) / 100

    dias.push({ fecha: fechaStr, total, num_ordenes, ticket_promedio })
  }

  return dias
}

const TODOS_LOS_DIAS = generarVentasPorDia()

const PRODUCTOS_DEMO: VentaProducto[] = [
  { producto_id: 'p1', nombre: 'Pechuga a la plancha', cantidad: 187, total: 28050 },
  { producto_id: 'p2', nombre: 'Enchiladas verdes', cantidad: 163, total: 24450 },
  { producto_id: 'p3', nombre: 'Licuado de fresa', cantidad: 214, total: 16050 },
  { producto_id: 'p4', nombre: 'Café americano', cantidad: 298, total: 14900 },
  { producto_id: 'p5', nombre: 'Tacos de canasta (3)', cantidad: 142, total: 21300 },
  { producto_id: 'p6', nombre: 'Agua de jamaica', cantidad: 176, total: 10560 },
  { producto_id: 'p7', nombre: 'Quesadilla de queso', cantidad: 119, total: 17850 },
  { producto_id: 'p8', nombre: 'Torta de milanesa', cantidad: 98, total: 19600 },
]

const METODOS_BASE: VentaMetodo[] = [
  { metodo: 'efectivo', total: 0, num_ordenes: 0 },
  { metodo: 'tarjeta_debito', total: 0, num_ordenes: 0 },
  { metodo: 'tarjeta_credito', total: 0, num_ordenes: 0 },
  { metodo: 'qr', total: 0, num_ordenes: 0 },
]

const METODO_PCTS = [0.4, 0.35, 0.2, 0.05]

const HORAS_PICO_BASE: HoraPico[] = Array.from({ length: 24 }, (_, hora) => {
  let base = 2
  if (hora >= 7 && hora <= 10) base = 8 + seededRandom(hora * 3) * 4
  else if (hora >= 13 && hora <= 15) base = 20 + seededRandom(hora * 5) * 8
  else if (hora >= 19 && hora <= 21) base = 16 + seededRandom(hora * 7) * 6
  else if (hora >= 11 && hora <= 12) base = 10 + seededRandom(hora * 2) * 4
  else if (hora >= 16 && hora <= 18) base = 8 + seededRandom(hora * 4) * 3
  else if (hora >= 22) base = 3 + seededRandom(hora) * 2
  else if (hora < 7) base = seededRandom(hora + 100) * 1.5
  return { hora, num_ordenes: Math.round(base) }
})

function computarMetodos(dias: VentaDia[]): VentaMetodo[] {
  const totalGeneral = dias.reduce((s, d) => s + d.total, 0)
  const ordenesGeneral = dias.reduce((s, d) => s + d.num_ordenes, 0)
  return METODOS_BASE.map((m, i) => ({
    ...m,
    total: Math.round(totalGeneral * (METODO_PCTS[i] ?? 0)),
    num_ordenes: Math.round(ordenesGeneral * (METODO_PCTS[i] ?? 0)),
  }))
}

function filtrarDias(dias: VentaDia[], periodo: Periodo): VentaDia[] {
  const n = periodo === '7d' ? 7 : periodo === '30d' ? 30 : 90
  return dias.slice(-n)
}

function mapVentaDiaRow(row: VentaDiaRow): VentaDia {
  return {
    fecha: row.dia,
    total: Number(row.total_ventas),
    num_ordenes: Number(row.num_ordenes),
    ticket_promedio: Number(row.ticket_promedio),
  }
}

function mapProductoVendidoRow(row: ProductoVendidoRow): VentaProducto {
  return {
    producto_id: row.id,
    nombre: row.nombre,
    cantidad: Number(row.total_vendido),
    total: Number(row.total_ingresos),
  }
}

export function useReportes() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [realVentasDias, setRealVentasDias] = useState<VentaDia[] | null>(null)
  const [realProductos, setRealProductos] = useState<VentaProducto[] | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    setLoading(true)
    setError(null)

    Promise.all([getVentasDiarias(90), getProductosMasVendidos(10)])
      .then(([ventasRows, productosRows]) => {
        setRealVentasDias(ventasRows.map(mapVentaDiaRow))
        setRealProductos(productosRows.map(mapProductoVendidoRow))
      })
      .catch((err: unknown) => {
        console.error('[useReportes] Error fetching Supabase data:', err)
        setRealVentasDias(null)
        setRealProductos(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const todosLosDias = realVentasDias ?? TODOS_LOS_DIAS

  const ventasPorDia = useMemo(() => filtrarDias(todosLosDias, periodo), [todosLosDias, periodo])

  const totalPeriodo = useMemo(
    () => ventasPorDia.reduce((s, d) => s + d.total, 0),
    [ventasPorDia],
  )

  const totalOrdenes = useMemo(
    () => ventasPorDia.reduce((s, d) => s + d.num_ordenes, 0),
    [ventasPorDia],
  )

  const ticketPromedio = useMemo(
    () => (totalOrdenes > 0 ? Math.round((totalPeriodo / totalOrdenes) * 100) / 100 : 0),
    [totalPeriodo, totalOrdenes],
  )

  const diaMayorVenta = useMemo(
    () =>
      ventasPorDia.length > 0
        ? ventasPorDia.reduce(
            (best, d) => (d.total > best.total ? d : best),
            ventasPorDia[0] as VentaDia,
          )
        : null,
    [ventasPorDia],
  )

  const productosMasVendidos = useMemo((): VentaProducto[] => {
    if (realProductos !== null) {
      return [...realProductos].sort((a, b) => b.cantidad - a.cantidad)
    }
    const factor = periodo === '7d' ? 7 / 30 : periodo === '90d' ? 3 : 1
    return PRODUCTOS_DEMO.map((p) => ({
      ...p,
      cantidad: Math.round(p.cantidad * factor),
      total: Math.round(p.total * factor),
    })).sort((a, b) => b.cantidad - a.cantidad)
  }, [realProductos, periodo])

  const ventasPorMetodo = useMemo(() => computarMetodos(ventasPorDia), [ventasPorDia])

  const horasPico = HORAS_PICO_BASE

  return {
    periodo,
    setPeriodo,
    ventasPorDia,
    productosMasVendidos,
    ventasPorMetodo,
    horasPico,
    totalPeriodo,
    totalOrdenes,
    ticketPromedio,
    diaMayorVenta,
    loading,
    error,
  }
}
