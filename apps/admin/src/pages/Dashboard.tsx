import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReportes } from '../hooks/useReportes'
import { useInventario } from '../hooks/useInventario'
import { useEmpleados } from '../hooks/useEmpleados'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return n.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDateTime(d: Date): { fecha: string; hora: string } {
  const fecha = d.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const hora = d.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  return { fecha, hora }
}

// ─── Demo data: live orders ────────────────────────────────────────────────────

type EstadoOrden = 'nueva' | 'preparando' | 'lista'

interface OrdenLive {
  id: string
  folio: string
  total: number
  estado: EstadoOrden
  minutos: number
}

const ORDENES_DEMO: OrdenLive[] = [
  { id: 'o1', folio: '#A-1043', total: 345.0, estado: 'preparando', minutos: 4 },
  { id: 'o2', folio: '#A-1044', total: 128.5, estado: 'nueva', minutos: 1 },
  { id: 'o3', folio: '#A-1045', total: 612.0, estado: 'lista', minutos: 8 },
  { id: 'o4', folio: '#A-1046', total: 89.0, estado: 'nueva', minutos: 2 },
  { id: 'o5', folio: '#A-1047', total: 276.5, estado: 'preparando', minutos: 6 },
]

const ACTIVIDAD_DEMO = [
  { id: 'a1', tiempo: 'Hace 2 min', accion: 'Ana García cobró $345.00', color: 'bg-green-500' },
  { id: 'a2', tiempo: 'Hace 5 min', accion: 'Lote L-2024-002 marcado como vencido', color: 'bg-red-500' },
  { id: 'a3', tiempo: 'Hace 8 min', accion: 'Nueva categoría creada: Postres', color: 'bg-blue-500' },
  { id: 'a4', tiempo: 'Hace 15 min', accion: 'Carlos López inició turno', color: 'bg-orange-500' },
  { id: 'a5', tiempo: 'Hace 23 min', accion: "Producto 'Café latte' actualizado", color: 'bg-purple-500' },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

const estadoStyles: Record<EstadoOrden, { bg: string; text: string; label: string }> = {
  nueva: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Nueva' },
  preparando: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Preparando' },
  lista: { bg: 'bg-green-50', text: 'text-green-700', label: 'Lista' },
}

function MiniBarChart({ data }: { data: { fecha: string; total: number }[] }) {
  const WIDTH = 520
  const HEIGHT = 180
  const PAD_L = 36
  const PAD_R = 12
  const PAD_T = 12
  const PAD_B = 26
  const chartW = WIDTH - PAD_L - PAD_R
  const chartH = HEIGHT - PAD_T - PAD_B

  const max = Math.max(...data.map((d) => d.total), 1)
  const roundedMax = Math.ceil(max / 500) * 500
  const barW = Math.max(8, chartW / data.length - 12)
  const gap = chartW / data.length

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {[0, 0.5, 1].map((pct) => {
        const y = PAD_T + chartH - chartH * pct
        return (
          <g key={pct}>
            <line x1={PAD_L} y1={y} x2={PAD_L + chartW} y2={y} stroke="#f3f4f6" strokeWidth={1} />
            <text x={PAD_L - 6} y={y + 4} fontSize={10} fill="#9ca3af" textAnchor="end">
              {Math.round((roundedMax * pct) / 100) * 100}
            </text>
          </g>
        )
      })}
      {data.map((d, i) => {
        const barH = (d.total / roundedMax) * chartH
        const x = PAD_L + i * gap + (gap - barW) / 2
        const y = PAD_T + chartH - barH
        const label = new Date(d.fecha + 'T12:00:00').toLocaleDateString('es-MX', {
          weekday: 'short',
        })
        return (
          <g key={d.fecha}>
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill="#f97316" />
            <text
              x={x + barW / 2}
              y={PAD_T + chartH + 16}
              fontSize={10}
              fill="#6b7280"
              textAnchor="middle"
            >
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function Dashboard() {
  const { ventasPorDia, productosMasVendidos } = useReportes()
  const { alertasStock, lotesVencidos, lotesPorVencer } = useInventario()
  const { empleados } = useEmpleados()

  // Live clock
  const [now, setNow] = useState<Date>(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const { fecha, hora } = formatDateTime(now)

  // KPI computations
  const hoyVenta = ventasPorDia[ventasPorDia.length - 1]
  const ayerVenta = ventasPorDia[ventasPorDia.length - 2]
  const totalHoy = hoyVenta?.total ?? 0
  const totalAyer = ayerVenta?.total ?? 0
  const cambioPct =
    totalAyer > 0 ? Math.round(((totalHoy - totalAyer) / totalAyer) * 100) : 0
  const ordenesHoy = hoyVenta?.num_ordenes ?? 0
  const ticketHoy = hoyVenta?.ticket_promedio ?? 0

  const empleadosActivos = empleados.filter((e) => e.activo).length
  const empleadosTotales = empleados.length

  // Last 7 days for chart
  const ultimos7 = useMemo(
    () => ventasPorDia.slice(-7).map((d) => ({ fecha: d.fecha, total: d.total })),
    [ventasPorDia],
  )

  const top5 = productosMasVendidos.slice(0, 5)

  const totalAlertas = alertasStock.length + lotesVencidos.length + lotesPorVencer.length

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1 capitalize">
            {fecha} · <span className="font-mono text-gray-700">{hora}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-sm font-medium text-gray-700">Sucursal: Principal</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Ventas de hoy</span>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{formatCurrency(totalHoy)}</p>
          <p
            className={`text-xs mt-2 font-semibold ${
              cambioPct >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {cambioPct >= 0 ? '+' : ''}
            {cambioPct}% vs ayer
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Órdenes hoy</span>
            <span className="text-2xl">🧾</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{ordenesHoy}</p>
          <p className="text-xs mt-2 text-gray-500">
            Ticket promedio {formatCurrency(ticketHoy)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">En cocina ahora</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500 animate-pulse"></span>
              </span>
            </div>
            <span className="text-2xl">🍳</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">6</p>
          <p className="text-xs mt-2 text-gray-500">3 nuevas · 3 preparando</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Empleados activos</span>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{empleadosActivos}</p>
          <p className="text-xs mt-2 text-gray-500">de {empleadosTotales} totales</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* A — Ventas últimos 7 días */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Ventas últimos 7 días</h3>
              <Link
                to="/ventas"
                className="text-xs font-medium text-orange-600 hover:text-orange-700"
              >
                Ver detalle →
              </Link>
            </div>
            <MiniBarChart data={ultimos7} />
          </div>

          {/* B — Órdenes en vivo */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">Órdenes en vivo</h3>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </div>
              <span className="text-xs text-gray-500">{ORDENES_DEMO.length} órdenes</span>
            </div>
            <div className="space-y-2">
              {ORDENES_DEMO.map((o) => {
                const style = estadoStyles[o.estado]
                return (
                  <div
                    key={o.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}
                      >
                        {style.label}
                      </span>
                      <span className="font-mono text-sm font-bold text-gray-900">
                        {o.folio}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">{o.minutos} min</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(o.total)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* C — Alertas */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Alertas</h3>
            {totalAlertas === 0 ? (
              <div className="text-center py-6 text-green-600 font-medium">
                Todo bajo control ✓
              </div>
            ) : (
              <div className="space-y-2">
                {alertasStock.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-yellow-50 border border-yellow-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">⚠️</span>
                      <span className="text-xs text-gray-700 truncate">
                        <span className="font-bold">{alertasStock.length}</span> insumos
                        con stock bajo
                      </span>
                    </div>
                    <Link
                      to="/inventario"
                      className="text-xs font-medium text-yellow-700 hover:text-yellow-800 px-2 py-1 rounded-md hover:bg-yellow-100 shrink-0"
                    >
                      Ver →
                    </Link>
                  </div>
                )}
                {lotesVencidos.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">🔴</span>
                      <span className="text-xs text-gray-700 truncate">
                        <span className="font-bold">{lotesVencidos.length}</span> lotes
                        vencidos
                      </span>
                    </div>
                    <Link
                      to="/inventario"
                      className="text-xs font-medium text-red-700 hover:text-red-800 px-2 py-1 rounded-md hover:bg-red-100 shrink-0"
                    >
                      Ver →
                    </Link>
                  </div>
                )}
                {lotesPorVencer.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-orange-50 border border-orange-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">🟠</span>
                      <span className="text-xs text-gray-700 truncate">
                        <span className="font-bold">{lotesPorVencer.length}</span> lotes
                        por vencer
                      </span>
                    </div>
                    <Link
                      to="/inventario"
                      className="text-xs font-medium text-orange-700 hover:text-orange-800 px-2 py-1 rounded-md hover:bg-orange-100 shrink-0"
                    >
                      Ver →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* D — Top 5 productos hoy */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 productos hoy</h3>
            <ol className="space-y-2">
              {top5.map((p, i) => (
                <li
                  key={p.producto_id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-100 text-orange-700 text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-800 truncate">{p.nombre}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 shrink-0 ml-2">
                    {p.cantidad}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* E — Actividad reciente */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actividad reciente</h3>
            <ul className="space-y-3">
              {ACTIVIDAD_DEMO.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${item.color} mt-1.5 shrink-0`}
                  ></span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 font-medium">{item.tiempo}</p>
                    <p className="text-sm text-gray-700">{item.accion}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
