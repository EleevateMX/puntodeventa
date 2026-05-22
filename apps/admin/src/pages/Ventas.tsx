import React, { useRef, useEffect, useState } from 'react'
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

const METODO_ICON: Record<string, string> = {
  efectivo: '💵',
  tarjeta_debito: '💳',
  tarjeta_credito: '🏦',
  qr: '📱',
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
              stroke="#f3f4f6"
              strokeWidth={1}
            />
            <text
              x={PADDING_LEFT - 6}
              y={t.y + 4}
              textAnchor="end"
              fontSize={10}
              fill="#9ca3af"
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
                fill="#f97316"
                opacity={0.85}
                className="cursor-pointer hover:opacity-100 transition-opacity"
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
                  fill="#9ca3af"
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
              fill="#1f2937"
              opacity={0.92}
            />
            <text x={tooltip.x} y={tooltip.y - 22} textAnchor="middle" fontSize={10} fill="#d1d5db">
              {tooltip.label}
            </text>
            <text x={tooltip.x} y={tooltip.y - 9} textAnchor="middle" fontSize={11} fill="#fff" fontWeight="600">
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
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Reportes de Ventas</h2>
          {/* Period selector */}
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {PERIODOS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriodo(p.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  periodo === p.value
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Demo banner */}
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
          <span className="text-xl">🔌</span>
          <p className="text-amber-800 text-sm font-medium">
            Datos de ejemplo — conecta Supabase para ver reportes reales
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <span>💰</span> Ventas totales
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(totalPeriodo)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <span>🧾</span> Órdenes
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalOrdenes.toLocaleString('es-MX')}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <span>🎯</span> Ticket promedio
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(ticketPromedio)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <span>📅</span> Mejor día
            </div>
            <p className="text-base font-bold text-gray-900 leading-tight">{diaMejorLabel}</p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Ventas por día</h3>
          <BarChart data={ventasPorDia} />
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Productos más vendidos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Productos más vendidos</h3>
            <div className="space-y-3">
              {productosMasVendidos.map((p, i) => {
                const pct = (p.cantidad / maxProducto) * 100
                return (
                  <div key={p.producto_id}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="w-5 text-xs font-bold text-gray-400 text-right">{i + 1}</span>
                      <span className="flex-1 text-sm font-medium text-gray-800 truncate">{p.nombre}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{p.cantidad} uds</span>
                      <span className="text-xs font-semibold text-gray-700 whitespace-nowrap w-20 text-right">
                        {formatMoney(p.total)}
                      </span>
                    </div>
                    <div className="ml-8 h-1.5 bg-orange-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ventas por método de pago */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Ventas por método de pago</h3>
            <div className="space-y-4">
              {ventasPorMetodo.map((m) => {
                const pct = Math.round((m.total / totalMetodos) * 100)
                return (
                  <div key={m.metodo}>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{METODO_ICON[m.metodo] ?? '💳'}</span>
                      <span className="flex-1 text-sm font-medium text-gray-700">
                        {METODO_LABEL[m.metodo] ?? m.metodo}
                      </span>
                      <span className="text-xs text-gray-500">{m.num_ordenes} órd.</span>
                      <span className="text-xs font-semibold text-gray-800 w-24 text-right">
                        {formatMoney(m.total)}
                      </span>
                      <span className="text-xs text-orange-600 font-bold w-8 text-right">{pct}%</span>
                    </div>
                    <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, #fb923c, #f97316)',
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
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-base font-semibold text-gray-800 mb-1">Horas pico</h3>
          <p className="text-xs text-gray-400 mb-4">Órdenes por hora del día</p>
          <div className="flex gap-1 items-end">
            {horasPico.map((h) => {
              const intensity = h.num_ordenes / maxHora
              // Map intensity to orange shades
              const bg =
                intensity < 0.15
                  ? '#fff7ed'
                  : intensity < 0.3
                  ? '#ffedd5'
                  : intensity < 0.5
                  ? '#fed7aa'
                  : intensity < 0.7
                  ? '#fb923c'
                  : '#ea580c'
              return (
                <div key={h.hora} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full rounded-sm transition-transform duration-150 group-hover:scale-110 cursor-default"
                    style={{ height: 32, background: bg }}
                    title={`${h.hora}h: ${h.num_ordenes} órdenes`}
                  />
                  {h.hora % 6 === 0 && (
                    <span className="text-xs text-gray-400">{h.hora}h</span>
                  )}
                </div>
              )
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-xs text-gray-400">Menos</span>
            {['#fff7ed', '#ffedd5', '#fed7aa', '#fb923c', '#ea580c'].map((c) => (
              <div key={c} className="w-4 h-3 rounded-sm" style={{ background: c }} />
            ))}
            <span className="text-xs text-gray-400">Más</span>
          </div>
        </div>

      </div>
    </div>
  )
}
