import React, { useRef, useEffect, useState, type JSX } from 'react'
import { useReportes, type Periodo } from '../hooks/useReportes'

// --- Helpers ---

const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatMoney(n: number): string {
  return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parseFecha(fechaStr: string): Date {
  const parts = fechaStr.split('-').map(Number)
  const y = parts[0] ?? 2024
  const mo = parts[1] ?? 1
  const day = parts[2] ?? 1
  return new Date(y, mo - 1, day)
}

function labelDia(fechaStr: string): string {
  const d = parseFecha(fechaStr)
  return DIAS_ES[d.getDay()] ?? ''
}

function labelDiaCorto(fechaStr: string): string {
  const d = parseFecha(fechaStr)
  return `${DIAS_ES[d.getDay()] ?? ''} ${d.getDate()} ${MESES_ES[d.getMonth()] ?? ''}`
}

const METODO_LABEL: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta_debito: 'Tarjeta débito',
  tarjeta_credito: 'Tarjeta crédito',
  qr: 'QR / Transfer.',
}

const METODO_ICON: Record<string, JSX.Element> = {
  efectivo:       (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>),
  tarjeta_debito: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>),
  tarjeta_credito:(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>),
  qr:             (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>),
}

// --- SVG Bar Chart ---

interface BarChartProps {
  data: { fecha: string; total: number }[]
}

function BarChart({ data }: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(800)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: string } | null>(null)

  if (!data.length) return null

  const HEIGHT = 200
  const PADDING_LEFT = 56
  const PADDING_RIGHT = 12
  const PADDING_TOP = 16
  const PADDING_BOTTOM = 36
  const chartW = width - PADDING_LEFT - PADDING_RIGHT
  const chartH = HEIGHT - PADDING_TOP - PADDING_BOTTOM

  const maxVal = Math.max(...data.map((d) => d.total))
  const roundedMax = Math.ceil(maxVal / 1000) * 1000

  const barW = Math.max(2, chartW / data.length - 2)
  const gap = chartW / data.length

  // Y axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    val: Math.round(roundedMax * pct),
    y: PADDING_TOP + chartH - chartH * pct,
  }))

  // X axis labels — show every ~5 bars or at minimum spacing
  const step = data.length <= 7 ? 1 : data.length <= 30 ? 5 : 10

  return (
    <div ref={containerRef} className="w-full relative select-none">
      <svg
        width={width}
        height={HEIGHT}
        className="overflow-visible"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Y grid lines + labels */}
        {yTicks.map((t) => (
          <g key={t.val}>
            <line
              x1={PADDING_LEFT}
              x2={PADDING_LEFT + chartW}
              y1={t.y}
              y2={t.y}
              stroke="rgba(20,36,29,0.08)"
              strokeWidth={1}
            />
            <text
              x={PADDING_LEFT - 6}
              y={t.y + 4}
              textAnchor="end"
              fontSize={10}
              fill="rgba(20,36,29,0.5)"
              fontFamily="DM Mono, monospace"
            >
              {t.val >= 1000 ? `$${t.val / 1000}k` : `$${t.val}`}
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.total / roundedMax) * chartH
          const x = PADDING_LEFT + i * gap + (gap - barW) / 2
          const y = PADDING_TOP + chartH - barH

          return (
            <g key={d.fecha}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={Math.min(3, barW / 2)}
                fill="#2C4A3E"
                opacity={0.9}
                className="cursor-pointer hover:fill-[#E04E5C] transition-colors"
                onMouseEnter={(e) => {
                  const svgRect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect()
                  setTooltip({
                    x: x + barW / 2,
                    y: y - 6,
                    label: labelDiaCorto(d.fecha),
                    value: formatMoney(d.total),
                  })
                }}
              />
              {/* X label */}
              {i % step === 0 && (
                <text
                  x={x + barW / 2}
                  y={PADDING_TOP + chartH + 16}
                  textAnchor="middle"
                  fontSize={10}
                  fill="rgba(20,36,29,0.5)"
                  fontFamily="DM Mono, monospace"
                >
                  {labelDia(d.fecha)}
                </text>
              )}
            </g>
          )
        })}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect
              x={tooltip.x - 52}
              y={tooltip.y - 36}
              width={104}
              height={32}
              rx={6}
              fill="#14241D"
              opacity={0.95}
            />
            <text x={tooltip.x} y={tooltip.y - 22} textAnchor="middle" fontSize={10} fill="#E8E6CC" fontFamily="DM Mono, monospace">
              {tooltip.label}
            </text>
            <text x={tooltip.x} y={tooltip.y - 9} textAnchor="middle" fontSize={11} fill="#fff" fontWeight="600" fontFamily="DM Mono, monospace">
              {tooltip.value}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

// --- Main page ---

export function Ventas() {
  const {
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
  } = useReportes()

  const PERIODOS: { value: Periodo; label: string }[] = [
    { value: '7d', label: 'Última semana' },
    { value: '30d', label: 'Último mes' },
    { value: '90d', label: 'Últimos 3 meses' },
  ]

  const maxProducto = productosMasVendidos[0]?.cantidad ?? 1
  const totalMetodos = ventasPorMetodo.reduce((s, m) => s + m.total, 0) || 1
  const maxHora = Math.max(...horasPico.map((h) => h.num_ordenes)) || 1

  const diaMejorLabel = diaMayorVenta
    ? (() => {
        const d = parseFecha(diaMayorVenta.fecha)
        return `${DIAS_ES[d.getDay()]} ${d.getDate()} ${MESES_ES[d.getMonth()]} · ${formatMoney(diaMayorVenta.total)}`
      })()
    : '—'

  return (
    <div className="min-h-screen bg-sa-cream-paper">
      <div className="px-8 py-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-3xl font-display text-sa-green-ink">Reportes de Ventas</h2>
          {/* Period selector */}
          <div className="flex gap-1 bg-white border border-sa-green-ink/10 rounded-sa p-1 shadow-sa-sm">
            {PERIODOS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriodo(p.value)}
                className={`px-4 py-2 rounded-sa text-sm font-medium transition-colors ${
                  periodo === p.value
                    ? 'bg-sa-green text-sa-cream shadow-sa-sm'
                    : 'text-sa-green-ink/60 hover:text-sa-green-ink hover:bg-sa-cream-soft'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Demo banner */}
        <div className="mb-6 flex items-center gap-3 bg-sa-banana/20 border border-sa-banana/40 rounded-sa px-5 py-3">
          <span className="text-xl">🔌</span>
          <p className="text-sa-coffee text-sm font-medium">
            Datos de ejemplo — conecta Supabase para ver reportes reales
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-sa p-5 shadow-sa-sm border border-sa-green-ink/5">
            <div className="flex items-center gap-2 text-sa-green-ink/60 font-mono text-xs uppercase tracking-wide mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Ventas totales
            </div>
            <p className="text-3xl font-display text-sa-green-ink leading-none">{formatMoney(totalPeriodo)}</p>
          </div>
          <div className="bg-white rounded-sa p-5 shadow-sa-sm border border-sa-green-ink/5">
            <div className="flex items-center gap-2 text-sa-green-ink/60 font-mono text-xs uppercase tracking-wide mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Órdenes
            </div>
            <p className="text-3xl font-display text-sa-green-ink leading-none">{totalOrdenes.toLocaleString('es-MX')}</p>
          </div>
          <div className="bg-white rounded-sa p-5 shadow-sa-sm border border-sa-green-ink/5">
            <div className="flex items-center gap-2 text-sa-green-ink/60 font-mono text-xs uppercase tracking-wide mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> Ticket promedio
            </div>
            <p className="text-3xl font-display text-sa-green-ink leading-none">{formatMoney(ticketPromedio)}</p>
          </div>
          <div className="bg-white rounded-sa p-5 shadow-sa-sm border border-sa-green-ink/5">
            <div className="flex items-center gap-2 text-sa-green-ink/60 font-mono text-xs uppercase tracking-wide mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Mejor día
            </div>
            <p className="text-base font-display text-sa-green-ink leading-tight">{diaMejorLabel}</p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-sa p-6 shadow-sa-sm border border-sa-green-ink/5 mb-6">
          <h3 className="text-xl font-display text-sa-green-ink mb-4">Ventas por día</h3>
          <BarChart data={ventasPorDia} />
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Productos más vendidos */}
          <div className="bg-white rounded-sa p-6 shadow-sa-sm border border-sa-green-ink/5">
            <h3 className="text-xl font-display text-sa-green-ink mb-4">Productos más vendidos</h3>
            <div className="space-y-3">
              {productosMasVendidos.map((p, i) => {
                const pct = (p.cantidad / maxProducto) * 100
                return (
                  <div key={p.producto_id}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="w-5 text-xs font-mono font-bold text-sa-green-ink/40 text-right">{i + 1}</span>
                      <span className="flex-1 text-sm font-medium text-sa-green-ink truncate">{p.nombre}</span>
                      <span className="text-xs font-mono text-sa-green-ink/60 whitespace-nowrap">{p.cantidad} uds</span>
                      <span className="text-xs font-mono font-semibold text-sa-green-ink whitespace-nowrap w-20 text-right">
                        {formatMoney(p.total)}
                      </span>
                    </div>
                    <div className="ml-8 h-1.5 bg-sa-cream-warm rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sa-green rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ventas por método de pago */}
          <div className="bg-white rounded-sa p-6 shadow-sa-sm border border-sa-green-ink/5">
            <h3 className="text-xl font-display text-sa-green-ink mb-4">Ventas por método de pago</h3>
            <div className="space-y-4">
              {ventasPorMetodo.map((m) => {
                const pct = Math.round((m.total / totalMetodos) * 100)
                return (
                  <div key={m.metodo}>
                    <div className="flex items-center gap-2 mb-1">
                      {METODO_ICON[m.metodo] ?? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
                      <span className="flex-1 text-sm font-medium text-sa-green-ink/80">
                        {METODO_LABEL[m.metodo] ?? m.metodo}
                      </span>
                      <span className="text-xs font-mono text-sa-green-ink/60">{m.num_ordenes} órd.</span>
                      <span className="text-xs font-mono font-semibold text-sa-green-ink w-24 text-right">
                        {formatMoney(m.total)}
                      </span>
                      <span className="text-xs font-mono text-sa-green-deep font-bold w-8 text-right">{pct}%</span>
                    </div>
                    <div className="h-2 bg-sa-cream-warm rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, #2C4A3E, #1A2E26)',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Horas pico */}
        <div className="bg-white rounded-sa p-6 shadow-sa-sm border border-sa-green-ink/5 mb-8">
          <h3 className="text-xl font-display text-sa-green-ink mb-1">Horas pico</h3>
          <p className="text-xs font-mono text-sa-green-ink/50 mb-4 uppercase tracking-wide">Órdenes por hora del día</p>
          <div className="flex gap-1 items-end">
            {horasPico.map((h) => {
              const intensity = h.num_ordenes / maxHora
              // Map intensity to brand green shades
              const bg =
                intensity < 0.15
                  ? '#F2EFD9'
                  : intensity < 0.3
                  ? '#DDD9B8'
                  : intensity < 0.5
                  ? '#88C0A0'
                  : intensity < 0.7
                  ? '#2C4A3E'
                  : '#1A2E26'
              return (
                <div key={h.hora} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full rounded-sm transition-transform duration-150 group-hover:scale-110 cursor-default"
                    style={{ height: 32, background: bg }}
                    title={`${h.hora}h: ${h.num_ordenes} órdenes`}
                  />
                  {h.hora % 6 === 0 && (
                    <span className="text-xs font-mono text-sa-green-ink/50">{h.hora}h</span>
                  )}
                </div>
              )
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-xs font-mono text-sa-green-ink/50">Menos</span>
            {['#F2EFD9', '#DDD9B8', '#88C0A0', '#2C4A3E', '#1A2E26'].map((c) => (
              <div key={c} className="w-4 h-3 rounded-sm" style={{ background: c }} />
            ))}
            <span className="text-xs font-mono text-sa-green-ink/50">Más</span>
          </div>
        </div>

      </div>
    </div>
  )
}
