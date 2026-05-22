import React, { useEffect, useMemo, useState } from 'react'

// ── KPI SVG icons ──────────────────────────────────────────────────────────────
const KpiVentas = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-sa-banana">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)
const KpiOrdenes = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-sa-blueberry">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
)
const KpiCocina = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-sa-strawberry">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z"/>
  </svg>
)
const KpiEmpleados = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-sa-green">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
import { Link } from 'react-router-dom'
import { useReportes } from '../hooks/useReportes'
import { useInventario } from '../hooks/useInventario'
import { useEmpleados } from '../hooks/useEmpleados'
import { getOrdenesRecientes, isSupabaseConfigured, supabase } from '@pos/supabase'
import type { OrdenActivaRow } from '@pos/supabase'

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
  { id: 'a1', tiempo: 'Hace 2 min', accion: 'Ana García cobró $345.00', color: 'bg-sa-mint' },
  { id: 'a2', tiempo: 'Hace 5 min', accion: 'Lote L-2024-002 marcado como vencido', color: 'bg-sa-strawberry' },
  { id: 'a3', tiempo: 'Hace 8 min', accion: 'Nueva categoría creada: Postres', color: 'bg-sa-blueberry' },
  { id: 'a4', tiempo: 'Hace 15 min', accion: 'Carlos López inició turno', color: 'bg-sa-mango' },
  { id: 'a5', tiempo: 'Hace 23 min', accion: "Producto 'Café latte' actualizado", color: 'bg-sa-banana' },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

const estadoStyles: Record<EstadoOrden, { bg: string; text: string; label: string }> = {
  nueva: { bg: 'bg-sa-blueberry/15', text: 'text-sa-blueberry', label: 'Nueva' },
  preparando: { bg: 'bg-sa-banana/30', text: 'text-sa-coffee', label: 'Preparando' },
  lista: { bg: 'bg-sa-mint/30', text: 'text-sa-green-ink', label: 'Lista' },
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
            <line x1={PAD_L} y1={y} x2={PAD_L + chartW} y2={y} stroke="rgba(20,36,29,0.08)" strokeWidth={1} />
            <text x={PAD_L - 6} y={y + 4} fontSize={10} fill="rgba(20,36,29,0.5)" textAnchor="end" fontFamily="DM Mono, monospace">
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
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill="#2C4A3E" />
            <text
              x={x + barW / 2}
              y={PAD_T + chartH + 16}
              fontSize={10}
              fill="rgba(20,36,29,0.6)"
              textAnchor="middle"
              fontFamily="DM Mono, monospace"
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

  // Live orders from Supabase
  const SUCURSAL_ID = '00000000-0000-0000-0000-000000000001'
  const [ordenesVivo, setOrdenesVivo] = useState<OrdenActivaRow[]>([])

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const fetchOrdenes = () => {
      getOrdenesRecientes(SUCURSAL_ID, 4)
        .then(setOrdenesVivo)
        .catch((err: unknown) => console.error('[Dashboard] Error fetching ordenes recientes:', err))
    }

    fetchOrdenes()

    const channel = supabase
      .channel('dashboard-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ordenes' }, () => fetchOrdenes())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ordenes' }, () => fetchOrdenes())
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

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

  // En cocina: derived from live orders (or demo fallback)
  const ordenesParaKPI = ordenesVivo.length > 0 ? ordenesVivo : null
  const enCocinaCount = ordenesParaKPI
    ? ordenesParaKPI.filter(
        (o) => o.estado === 'pendiente' || o.estado === 'en_preparacion' || o.estado === 'lista',
      ).length
    : 6
  const nuevasCount = ordenesParaKPI
    ? ordenesParaKPI.filter((o) => o.estado === 'pendiente').length
    : 3
  const preparandoCount = ordenesParaKPI
    ? ordenesParaKPI.filter((o) => o.estado === 'en_preparacion').length
    : 3

  // Last 7 days for chart
  const ultimos7 = useMemo(
    () => ventasPorDia.slice(-7).map((d) => ({ fecha: d.fecha, total: d.total })),
    [ventasPorDia],
  )

  const top5 = productosMasVendidos.slice(0, 5)

  const totalAlertas = alertasStock.length + lotesVencidos.length + lotesPorVencer.length

  return (
    <div className="p-8 bg-sa-cream-paper min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-4xl font-display text-sa-green-ink tracking-wide">Dashboard</h2>
          <p className="text-sa-green-ink/60 text-sm mt-2 capitalize">
            {fecha} · <span className="font-mono text-sa-green-ink/80">{hora}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-sa-green-ink/10 rounded-full px-4 py-2 shadow-sa-sm">
          <span className="w-2 h-2 rounded-full bg-sa-mint"></span>
          <span className="text-sm font-medium text-sa-green-ink">Sucursal: Principal</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-sa p-5 shadow-sa-sm border border-sa-green-ink/5 transition-all hover:shadow-sa hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-sa-green-ink/60 font-mono uppercase tracking-wide">Ventas de hoy</span>
            <KpiVentas />
          </div>
          <p className="text-4xl font-display text-sa-green-ink leading-none">{formatCurrency(totalHoy)}</p>
          <p
            className={`text-xs mt-3 font-mono ${
              cambioPct >= 0 ? 'text-sa-green' : 'text-sa-strawberry'
            }`}
          >
            {cambioPct >= 0 ? '+' : ''}
            {cambioPct}% vs ayer
          </p>
        </div>

        <div className="bg-white rounded-sa p-5 shadow-sa-sm border border-sa-green-ink/5 transition-all hover:shadow-sa hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-sa-green-ink/60 font-mono uppercase tracking-wide">Órdenes hoy</span>
            <KpiOrdenes />
          </div>
          <p className="text-4xl font-display text-sa-green-ink leading-none">{ordenesHoy}</p>
          <p className="text-xs mt-3 text-sa-green-ink/60">
            Ticket promedio <span className="font-mono text-sa-green-ink/80">{formatCurrency(ticketHoy)}</span>
          </p>
        </div>

        <div className="bg-white rounded-sa p-5 shadow-sa-sm border border-sa-green-ink/5 transition-all hover:shadow-sa hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-sa-green-ink/60 font-mono uppercase tracking-wide">En cocina ahora</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sa-strawberry opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sa-strawberry animate-pulse"></span>
              </span>
            </div>
            <KpiCocina />
          </div>
          <p className="text-4xl font-display text-sa-green-ink leading-none">{enCocinaCount}</p>
          <p className="text-xs mt-3 text-sa-green-ink/60">{nuevasCount} nuevas · {preparandoCount} preparando</p>
        </div>

        <div className="bg-white rounded-sa p-5 shadow-sa-sm border border-sa-green-ink/5 transition-all hover:shadow-sa hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-sa-green-ink/60 font-mono uppercase tracking-wide">Empleados activos</span>
            <KpiEmpleados />
          </div>
          <p className="text-4xl font-display text-sa-green-ink leading-none">{empleadosActivos}</p>
          <p className="text-xs mt-3 text-sa-green-ink/60">de {empleadosTotales} totales</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* A — Ventas últimos 7 días */}
          <div className="bg-white rounded-sa p-6 shadow-sa-sm border border-sa-green-ink/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-display text-sa-green-ink">Ventas últimos 7 días</h3>
              <Link
                to="/ventas"
                className="text-xs font-mono text-sa-green hover:text-sa-green-deep uppercase tracking-wide"
              >
                Ver detalle →
              </Link>
            </div>
            <MiniBarChart data={ultimos7} />
          </div>

          {/* B — Órdenes en vivo */}
          {(() => {
            const ordenesParaPanel: OrdenLive[] =
              ordenesVivo.length > 0
                ? ordenesVivo.map((o) => {
                    const mapEstado = (e: string): EstadoOrden => {
                      if (e === 'lista') return 'lista'
                      if (e === 'en_preparacion') return 'preparando'
                      if (e === 'pendiente') return 'preparando'
                      return 'nueva'
                    }
                    return {
                      id: o.id,
                      folio: `#A-${o.folio}`,
                      total: o.total,
                      estado: mapEstado(o.estado),
                      minutos: Math.floor(
                        (Date.now() - new Date(o.created_at).getTime()) / 60000,
                      ),
                    }
                  })
                : ORDENES_DEMO
            return (
              <div className="bg-white rounded-sa p-6 shadow-sa-sm border border-sa-green-ink/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-display text-sa-green-ink">Órdenes en vivo</h3>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sa-mint opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sa-mint"></span>
                    </span>
                  </div>
                  <span className="text-xs font-mono text-sa-green-ink/60">{ordenesParaPanel.length} órdenes</span>
                </div>
                <div className="space-y-2">
                  {ordenesParaPanel.map((o) => {
                    const style = estadoStyles[o.estado]
                    return (
                      <div
                        key={o.id}
                        className="flex items-center justify-between px-4 py-3 rounded-sa bg-sa-cream-soft/60 border border-sa-green-ink/5 hover:bg-sa-cream-soft transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}
                          >
                            {style.label}
                          </span>
                          <span className="font-mono text-sm font-semibold text-sa-green-ink">
                            {o.folio}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono text-sa-green-ink/60">{o.minutos} min</span>
                          <span className="text-sm font-mono font-semibold text-sa-green-ink">
                            {formatCurrency(o.total)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* C — Alertas */}
          <div className="bg-white rounded-sa p-6 shadow-sa-sm border border-sa-green-ink/5">
            <h3 className="text-xl font-display text-sa-green-ink mb-4">Alertas</h3>
            {totalAlertas === 0 ? (
              <div className="text-center py-6 text-sa-green font-medium">
                Todo bajo control ✓
              </div>
            ) : (
              <div className="space-y-2">
                {alertasStock.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-sa bg-sa-banana/20 border border-sa-banana/40">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sa-coffee shrink-0"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      <span className="text-xs text-sa-coffee truncate">
                        <span className="font-bold">{alertasStock.length}</span> insumos
                        con stock bajo
                      </span>
                    </div>
                    <Link
                      to="/inventario"
                      className="text-xs font-mono font-medium text-sa-coffee hover:text-sa-green-ink px-2 py-1 rounded-md hover:bg-sa-banana/30 shrink-0"
                    >
                      Ver →
                    </Link>
                  </div>
                )}
                {lotesVencidos.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-sa bg-sa-strawberry/10 border border-sa-strawberry/30">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">🔴</span>
                      <span className="text-xs text-sa-strawberry truncate">
                        <span className="font-bold">{lotesVencidos.length}</span> lotes
                        vencidos
                      </span>
                    </div>
                    <Link
                      to="/inventario"
                      className="text-xs font-mono font-medium text-sa-strawberry hover:opacity-80 px-2 py-1 rounded-md hover:bg-sa-strawberry/15 shrink-0"
                    >
                      Ver →
                    </Link>
                  </div>
                )}
                {lotesPorVencer.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-sa bg-sa-mango/10 border border-sa-mango/30">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">🟠</span>
                      <span className="text-xs text-sa-mango truncate">
                        <span className="font-bold">{lotesPorVencer.length}</span> lotes
                        por vencer
                      </span>
                    </div>
                    <Link
                      to="/inventario"
                      className="text-xs font-mono font-medium text-sa-mango hover:opacity-80 px-2 py-1 rounded-md hover:bg-sa-mango/15 shrink-0"
                    >
                      Ver →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* D — Top 5 productos hoy */}
          <div className="bg-white rounded-sa p-6 shadow-sa-sm border border-sa-green-ink/5">
            <h3 className="text-xl font-display text-sa-green-ink mb-4">Top 5 productos hoy</h3>
            <ol className="space-y-2">
              {top5.map((p, i) => (
                <li
                  key={p.producto_id}
                  className="flex items-center justify-between py-2 border-b border-sa-green-ink/5 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-sa-green text-sa-cream font-mono text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-sa-green-ink truncate">{p.nombre}</span>
                  </div>
                  <span className="text-sm font-mono font-semibold text-sa-green-ink shrink-0 ml-2">
                    {p.cantidad}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* E — Actividad reciente */}
          <div className="bg-white rounded-sa p-6 shadow-sa-sm border border-sa-green-ink/5">
            <h3 className="text-xl font-display text-sa-green-ink mb-4">Actividad reciente</h3>
            <ul className="space-y-3">
              {ACTIVIDAD_DEMO.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${item.color} mt-1.5 shrink-0`}
                  ></span>
                  <div className="min-w-0">
                    <p className="text-xs text-sa-green-ink/50 font-mono">{item.tiempo}</p>
                    <p className="text-sm text-sa-green-ink/80">{item.accion}</p>
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
