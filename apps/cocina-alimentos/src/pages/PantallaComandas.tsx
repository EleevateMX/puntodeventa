import React, { useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type EstadoKDS = 'nueva' | 'en_preparacion' | 'lista'
type Canal = 'mesa' | 'kiosko' | 'delivery'

interface OrdenItem {
  id: string
  cantidad: number
  personalizacion: string | null
  productos: { id: string; nombre: string } | null
}

interface Orden {
  id: string
  folio: number
  estado: EstadoKDS
  canal: Canal
  created_at: string
  orden_items: OrdenItem[]
  /** local-only: set when moved to "lista" so we can fade-out */
  completada_at?: number
}

interface Props {
  cocinaSlug: string
  titulo: string
  color: 'orange' | 'blue'
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const now = Date.now()

const DEMO_ORDENES: Orden[] = [
  {
    id: 'demo-1',
    folio: 1,
    estado: 'nueva',
    canal: 'mesa',
    created_at: new Date(now - 1 * 60 * 1000).toISOString(),
    orden_items: [
      { id: 'i1', cantidad: 2, personalizacion: 'sin cebolla', productos: { id: 'p1', nombre: 'Pechuga a la plancha' } },
      { id: 'i2', cantidad: 1, personalizacion: null, productos: { id: 'p2', nombre: 'Ensalada César' } },
    ],
  },
  {
    id: 'demo-2',
    folio: 2,
    estado: 'nueva',
    canal: 'kiosko',
    created_at: new Date(now - 4 * 60 * 1000).toISOString(),
    orden_items: [
      { id: 'i3', cantidad: 3, personalizacion: null, productos: { id: 'p3', nombre: 'Hamburguesa clásica' } },
      { id: 'i4', cantidad: 2, personalizacion: 'extra queso', productos: { id: 'p4', nombre: 'Papas fritas' } },
    ],
  },
  {
    id: 'demo-3',
    folio: 3,
    estado: 'en_preparacion',
    canal: 'delivery',
    created_at: new Date(now - 5 * 60 * 1000).toISOString(),
    orden_items: [
      { id: 'i5', cantidad: 1, personalizacion: null, productos: { id: 'p5', nombre: 'Pasta Alfredo' } },
      { id: 'i6', cantidad: 2, personalizacion: null, productos: { id: 'p6', nombre: 'Pan de ajo' } },
    ],
  },
  {
    id: 'demo-4',
    folio: 4,
    estado: 'en_preparacion',
    canal: 'mesa',
    created_at: new Date(now - 8 * 60 * 1000).toISOString(),
    orden_items: [
      { id: 'i7', cantidad: 1, personalizacion: 'término medio', productos: { id: 'p7', nombre: 'Arrachera' } },
    ],
  },
  {
    id: 'demo-5',
    folio: 5,
    estado: 'lista',
    canal: 'mesa',
    created_at: new Date(now - 12 * 60 * 1000).toISOString(),
    orden_items: [
      { id: 'i8', cantidad: 2, personalizacion: null, productos: { id: 'p8', nombre: 'Tacos de bistec' } },
      { id: 'i9', cantidad: 1, personalizacion: null, productos: { id: 'p9', nombre: 'Agua de horchata' } },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function elapsedColor(ms: number): string {
  const minutes = ms / 1000 / 60
  if (minutes < 3) return 'text-green-400'
  if (minutes < 7) return 'text-yellow-400'
  return 'text-red-400'
}

function sortOrdenes(ordenes: Orden[]): Orden[] {
  const priority: Record<EstadoKDS, number> = { nueva: 0, en_preparacion: 1, lista: 2 }
  return [...ordenes].sort((a, b) => {
    const pd = priority[a.estado] - priority[b.estado]
    if (pd !== 0) return pd
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, ctx.currentTime)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
    osc.onended = () => ctx.close()
  } catch {
    // AudioContext not available (e.g., SSR)
  }
}

// ─── Canal badge ──────────────────────────────────────────────────────────────

const CANAL_LABELS: Record<Canal, string> = {
  mesa: 'Mesa',
  kiosko: 'Kiosko',
  delivery: 'Delivery',
}

const CANAL_CLASSES: Record<Canal, string> = {
  mesa: 'bg-purple-800 text-purple-200',
  kiosko: 'bg-cyan-800 text-cyan-200',
  delivery: 'bg-pink-800 text-pink-200',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PantallaComandas({ cocinaSlug, titulo, color }: Props) {
  const [ordenes, setOrdenes] = useState<Orden[]>(DEMO_ORDENES)
  const [now, setNow] = useState(Date.now())
  const [fadingOut, setFadingOut] = useState<Set<string>>(new Set())

  // Track which order IDs have already triggered a beep
  const seenIds = useRef<Set<string>>(new Set())

  // Tick every second to update timers
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Sound alert for new orders
  useEffect(() => {
    ordenes.forEach((o) => {
      if (o.estado === 'nueva' && !seenIds.current.has(o.id)) {
        seenIds.current.add(o.id)
        playBeep()
      }
    })
  }, [ordenes])

  // Supabase real-time subscription (only when env vars are configured).
  // Dynamic import uses a runtime string so TypeScript never resolves the
  // broken supabase package types during compilation of this file.
  useEffect(() => {
    const meta = (import.meta as unknown as Record<string, Record<string, unknown>>)
    const env = meta['env'] ?? {}
    const url = env['VITE_SUPABASE_URL'] as string | undefined
    const key = env['VITE_SUPABASE_ANON_KEY'] as string | undefined
    if (!url || !key) return

    const PKG = '@pos/supabase'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channel: any = null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function loadOrdenes(mod: any) {
      try {
        const data = await mod.getOrdenesPorCocina(cocinaSlug)
        if (data) {
          setOrdenes(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (data as any[]).map((o: any) => ({
              ...o,
              estado: (o.estado as EstadoKDS) ?? 'nueva',
              canal: (o.canal as Canal) ?? 'mesa',
            })),
          )
        }
      } catch (err) {
        console.error('Error cargando órdenes:', err)
      }
    }

    async function init() {
      try {
        // Use a variable so static analysis tools don't resolve the module
        const mod = await import(/* @vite-ignore */ PKG)
        await loadOrdenes(mod)
        channel = mod.suscribirseAOrdenes(cocinaSlug, () => loadOrdenes(mod))
      } catch (err) {
        console.error('Error inicializando Supabase:', err)
      }
    }

    init()

    return () => {
      channel?.unsubscribe()
    }
  }, [cocinaSlug])

  // State machine actions
  function iniciarPreparacion(id: string) {
    setOrdenes((prev) =>
      prev.map((o) => (o.id === id ? { ...o, estado: 'en_preparacion' as EstadoKDS } : o)),
    )
  }

  function marcarLista(id: string) {
    setOrdenes((prev) =>
      prev.map((o) => (o.id === id ? { ...o, estado: 'lista' as EstadoKDS, completada_at: Date.now() } : o)),
    )
    setFadingOut((prev) => new Set([...prev, id]))
    setTimeout(() => {
      setOrdenes((prev) => prev.filter((o) => o.id !== id))
      setFadingOut((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 3000)
  }

  const colorClasses = {
    orange: {
      header: 'bg-orange-600',
      badge: 'bg-orange-500',
      btn: 'bg-orange-500 hover:bg-orange-600',
      btnPrep: 'bg-orange-700 hover:bg-orange-800',
    },
    blue: {
      header: 'bg-blue-600',
      badge: 'bg-blue-500',
      btn: 'bg-blue-500 hover:bg-blue-600',
      btnPrep: 'bg-blue-700 hover:bg-blue-800',
    },
  }[color]

  const sorted = sortOrdenes(ordenes)

  const enEspera = ordenes.filter((o) => o.estado === 'nueva').length
  const preparando = ordenes.filter((o) => o.estado === 'en_preparacion').length
  const listasHoy = ordenes.filter((o) => o.estado === 'lista').length

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* ── Header ── */}
      <header className={`${colorClasses.header} px-6 py-4`}>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-white">{titulo}</h1>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-300 text-sm font-medium">En vivo</span>
          </div>
        </div>
        {/* Stats row */}
        <div className="flex gap-4">
          <StatPill count={enEspera} label="en espera" colorClass="bg-orange-500/30 text-orange-200" />
          <StatPill count={preparando} label="preparando" colorClass="bg-yellow-500/30 text-yellow-200" />
          <StatPill count={listasHoy} label="listas hoy" colorClass="bg-green-500/30 text-green-200" />
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 p-6">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-600 gap-4">
            <span className="text-7xl">✅</span>
            <p className="text-2xl font-semibold">Todo al día</p>
            <p className="text-sm">Las nuevas órdenes aparecerán aquí automáticamente</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sorted.map((orden) => (
              <OrdenCard
                key={orden.id}
                orden={orden}
                now={now}
                colorClasses={colorClasses}
                isFadingOut={fadingOut.has(orden.id)}
                onIniciarPreparacion={iniciarPreparacion}
                onMarcarLista={marcarLista}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({
  count,
  label,
  colorClass,
}: {
  count: number
  label: string
  colorClass: string
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
      <span className="text-base font-extrabold">{count}</span>
      {label}
    </span>
  )
}

interface OrdenCardProps {
  orden: Orden
  now: number
  colorClasses: { header: string; badge: string; btn: string; btnPrep: string }
  isFadingOut: boolean
  onIniciarPreparacion: (id: string) => void
  onMarcarLista: (id: string) => void
}

function OrdenCard({ orden, now, colorClasses, isFadingOut, onIniciarPreparacion, onMarcarLista }: OrdenCardProps) {
  const elapsed = now - new Date(orden.created_at).getTime()
  const timerColor = elapsedColor(elapsed)

  const stateConfig: Record<EstadoKDS, { label: string; badgeClass: string }> = {
    nueva: { label: 'Nueva', badgeClass: 'bg-orange-500 text-white animate-pulse' },
    en_preparacion: { label: 'Preparando', badgeClass: 'bg-yellow-500 text-gray-900' },
    lista: { label: 'Lista ✓', badgeClass: 'bg-green-500 text-white' },
  }

  const { label: stateLabel, badgeClass } = stateConfig[orden.estado]

  return (
    <div
      className={`bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 flex flex-col transition-all duration-700 ${
        isFadingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-750 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-white font-extrabold text-xl">
            #ORD-{String(orden.folio).padStart(3, '0')}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CANAL_CLASSES[orden.canal]}`}>
            {CANAL_LABELS[orden.canal]}
          </span>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
          {stateLabel}
        </span>
      </div>

      {/* Timer */}
      <div className={`flex items-center gap-1 px-4 pt-3 pb-1 ${timerColor} font-mono font-bold text-lg`}>
        <span>⏱</span>
        <span>{formatElapsed(elapsed)}</span>
      </div>

      {/* Items */}
      <div className="px-4 py-2 space-y-2 flex-1">
        {orden.orden_items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <span
              className={`${colorClasses.badge} text-white text-sm font-bold px-2 py-0.5 rounded-lg min-w-[2.5rem] text-center shrink-0`}
            >
              {item.cantidad}×
            </span>
            <div>
              <p className="text-white font-medium leading-tight">{item.productos?.nombre ?? '—'}</p>
              {item.personalizacion && (
                <p className="text-gray-400 text-xs mt-0.5 italic">{item.personalizacion}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action button */}
      <div className="px-4 pb-4 pt-2">
        {orden.estado === 'nueva' && (
          <button
            onClick={() => onIniciarPreparacion(orden.id)}
            className={`w-full ${colorClasses.btnPrep} text-white py-3 rounded-xl font-semibold transition-colors`}
          >
            Preparando
          </button>
        )}
        {orden.estado === 'en_preparacion' && (
          <button
            onClick={() => onMarcarLista(orden.id)}
            className={`w-full ${colorClasses.btn} text-white py-3 rounded-xl font-semibold transition-colors`}
          >
            Lista ✓
          </button>
        )}
        {orden.estado === 'lista' && (
          <div className="w-full bg-green-800/40 text-green-300 py-3 rounded-xl font-semibold text-center text-sm">
            Completada ✓
          </div>
        )}
      </div>
    </div>
  )
}
