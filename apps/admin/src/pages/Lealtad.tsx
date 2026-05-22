import React, { useMemo, useState, type JSX } from 'react'

const IcoWallet = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>)
const IcoTrash2 = () => (<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sa-green-ink/30 mx-auto mb-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>)

const NIVEL_ICON: Record<string, JSX.Element> = {
  bronce: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>),
  plata:  (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9EA8B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>),
  oro:    (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>),
  platino:(<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6C4A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>),
}
import {
  useLealtad,
  evaluarNivel,
  LEALTAD_CONFIG,
} from '../hooks/useLealtad'
import type { ClienteLealtad, GiftCard, NivelLealtad, ClienteInput } from '../hooks/useLealtad'

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatMXN(n: number): string {
  return n.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function nivelLabel(n: NivelLealtad): string {
  return n.charAt(0).toUpperCase() + n.slice(1)
}

function nivelBadgeClass(n: NivelLealtad): string {
  switch (n) {
    case 'bronce':  return 'bg-sa-mango/30 text-amber-800'
    case 'plata':   return 'bg-sa-green-ink/10 text-sa-green-ink'
    case 'oro':     return 'bg-sa-banana/50 text-yellow-800'
    case 'platino': return 'bg-sa-blueberry/20 text-indigo-800'
  }
}

function siguienteNivelPuntos(puntos: number): number {
  if (puntos >= 5000) return 5000
  if (puntos >= 2000) return 5000
  if (puntos >= 500)  return 2000
  return 500
}

function estadoGiftCard(gc: GiftCard): 'activa' | 'canjeada' | 'vencida' {
  if (!gc.activa && gc.saldo_actual === 0) return 'canjeada'
  if (!gc.activa) {
    if (gc.fecha_vencimiento && new Date(gc.fecha_vencimiento) < new Date()) return 'vencida'
    return 'canjeada'
  }
  if (gc.fecha_vencimiento && new Date(gc.fecha_vencimiento) < new Date()) return 'vencida'
  return 'activa'
}

// ── Sub-components ─────────────────────────────────────────────────────────────

type Tab = 'clientes' | 'giftcards' | 'config'

const TABS: { key: Tab; label: string }[] = [
  { key: 'clientes',  label: 'Clientes' },
  { key: 'giftcards', label: 'Gift Cards' },
  { key: 'config',    label: 'Configuración' },
]

type FiltroNivel = 'todos' | NivelLealtad

const FILTROS_NIVEL: { key: FiltroNivel; label: string }[] = [
  { key: 'todos',    label: 'Todos' },
  { key: 'bronce',   label: 'Bronce' },
  { key: 'plata',    label: 'Plata' },
  { key: 'oro',      label: 'Oro' },
  { key: 'platino',  label: 'Platino' },
]

// ── Modal editar puntos/wallet ─────────────────────────────────────────────────

interface ModalCargaProps {
  cliente: ClienteLealtad
  onClose: () => void
  onGuardar: (puntos: number, wallet: number) => void
}

function ModalCargaPuntos({ cliente, onClose, onGuardar }: ModalCargaProps) {
  const [puntos, setPuntos] = useState(0)
  const [wallet, setWallet] = useState(0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onGuardar(puntos, wallet)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-sa-green-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-sa-lg shadow-sa border border-sa-green-ink/8 p-8 w-full max-w-sm">
        <h3 className="font-display text-2xl text-sa-green-deep mb-1">
          Cargar puntos
        </h3>
        <p className="text-sm text-sa-green-ink/60 mb-6">
          {cliente.nombre} · {cliente.puntos} pts actuales
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-sa-green-ink/60 uppercase tracking-wider mb-1">
              Puntos a agregar
            </label>
            <input
              type="number"
              min={0}
              value={puntos}
              onChange={(e) => setPuntos(Number(e.target.value))}
              className="w-full border border-sa-green-ink/15 rounded-sa px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-sa-green-ink/60 uppercase tracking-wider mb-1">
              Saldo Wallet (MXN)
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={wallet}
              onChange={(e) => setWallet(Number(e.target.value))}
              className="w-full border border-sa-green-ink/15 rounded-sa px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-sa-green-ink/15 text-sa-green-ink py-2.5 rounded-sa font-medium text-sm hover:bg-sa-cream-paper"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-sa-green text-sa-cream py-2.5 rounded-sa font-medium text-sm hover:bg-sa-green-deep transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal nuevo cliente ────────────────────────────────────────────────────────

interface ModalClienteProps {
  onClose: () => void
  onGuardar: (input: ClienteInput) => void
}

function ModalNuevoCliente({ onClose, onGuardar }: ModalClienteProps) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return
    onGuardar({
      nombre: nombre.trim(),
      telefono: telefono.trim() || null,
      email: email.trim() || null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-sa-green-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-sa-lg shadow-sa border border-sa-green-ink/8 p-8 w-full max-w-sm">
        <h3 className="font-display text-2xl text-sa-green-deep mb-6">Nuevo cliente</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-sa-green-ink/60 uppercase tracking-wider mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full border border-sa-green-ink/15 rounded-sa px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-sa-green-ink/60 uppercase tracking-wider mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full border border-sa-green-ink/15 rounded-sa px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-sa-green-ink/60 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-sa-green-ink/15 rounded-sa px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-sa-green-ink/15 text-sa-green-ink py-2.5 rounded-sa font-medium text-sm hover:bg-sa-cream-paper"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-sa-green text-sa-cream py-2.5 rounded-sa font-medium text-sm hover:bg-sa-green-deep transition-colors"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Tab Clientes ───────────────────────────────────────────────────────────────

interface TabClientesProps {
  clientes: ClienteLealtad[]
  onAgregar: (input: ClienteInput) => void
  onCargar: (id: string, puntos: number, wallet: number) => void
  onBorrar: (id: string) => void
}

function TabClientes({ clientes, onAgregar, onCargar, onBorrar }: TabClientesProps) {
  const [filtroNivel, setFiltroNivel] = useState<FiltroNivel>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [modalNuevo, setModalNuevo] = useState(false)
  const [clienteCargando, setClienteCargando] = useState<ClienteLealtad | null>(null)
  const [confirmBorrar, setConfirmBorrar] = useState<string | null>(null)

  const conteos = useMemo(() => ({
    total:   clientes.length,
    bronce:  clientes.filter((c) => c.nivel === 'bronce').length,
    plata:   clientes.filter((c) => c.nivel === 'plata').length,
    oro:     clientes.filter((c) => c.nivel === 'oro').length,
    platino: clientes.filter((c) => c.nivel === 'platino').length,
  }), [clientes])

  const filtrados = useMemo(() => {
    let list = clientes
    if (filtroNivel !== 'todos') list = list.filter((c) => c.nivel === filtroNivel)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      list = list.filter(
        (c) =>
          c.nombre.toLowerCase().includes(q) ||
          (c.telefono ?? '').includes(q),
      )
    }
    return list
  }, [clientes, filtroNivel, busqueda])

  function handleBorrarConfirm() {
    if (confirmBorrar) onBorrar(confirmBorrar)
    setConfirmBorrar(null)
  }

  return (
    <div>
      {/* KPI row */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total', value: conteos.total, color: 'text-sa-green-deep', bg: 'bg-sa-mint/20' },
          { label: 'Bronce', value: conteos.bronce, color: 'text-amber-700', bg: 'bg-sa-mango/20' },
          { label: 'Plata', value: conteos.plata, color: 'text-sa-green-ink', bg: 'bg-sa-green-ink/6' },
          { label: 'Oro', value: conteos.oro, color: 'text-yellow-700', bg: 'bg-sa-banana/30' },
          { label: 'Platino', value: conteos.platino, color: 'text-indigo-700', bg: 'bg-sa-blueberry/15' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-sa-lg px-5 py-4 border border-sa-green-ink/6`}>
            <p className={`font-display text-4xl ${color}`}>{value}</p>
            <p className="font-mono text-xs uppercase tracking-wide text-sa-green-ink/50 mt-1">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex gap-1 bg-sa-green-ink/6 p-1 rounded-sa flex-shrink-0">
          {FILTROS_NIVEL.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFiltroNivel(key)}
              className={`px-4 py-1.5 rounded-[6px] text-sm font-medium transition-colors ${
                filtroNivel === key
                  ? 'bg-white text-sa-green-deep shadow-sa-sm'
                  : 'text-sa-green-ink/60 hover:text-sa-green-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o teléfono…"
          className="flex-1 min-w-[220px] border border-sa-green-ink/15 bg-white rounded-sa px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
        />
        <button
          onClick={() => setModalNuevo(true)}
          className="flex items-center gap-2 bg-sa-green text-sa-cream px-5 py-2 rounded-sa font-medium text-sm hover:bg-sa-green-deep transition-colors shadow-sa-sm flex-shrink-0"
        >
          + Nuevo cliente
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-sa-lg border border-sa-green-ink/8 shadow-sa-sm overflow-hidden">
        {filtrados.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sa-green-ink/40 text-sm">Sin clientes que coincidan</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sa-green-ink/8 bg-sa-cream-paper">
                <th className="text-left px-5 py-3 font-mono text-xs uppercase tracking-wider text-sa-green-ink/50">
                  Cliente
                </th>
                <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-sa-green-ink/50">
                  Nivel
                </th>
                <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-sa-green-ink/50">
                  Puntos
                </th>
                <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-sa-green-ink/50">
                  Wallet
                </th>
                <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-sa-green-ink/50">
                  Gastado
                </th>
                <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-sa-green-ink/50">
                  Última visita
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c, idx) => {
                const siguiente = siguienteNivelPuntos(c.puntos)
                const base = LEALTAD_CONFIG.niveles.find((n) => n.nivel === c.nivel)?.min_puntos ?? 0
                const progreso = c.nivel === 'platino'
                  ? 100
                  : Math.min(100, Math.round(((c.puntos - base) / (siguiente - base)) * 100))

                return (
                  <tr
                    key={c.id}
                    className={`border-b border-sa-green-ink/5 hover:bg-sa-cream-paper/60 transition-colors ${
                      idx % 2 === 0 ? '' : 'bg-sa-cream-paper/30'
                    }`}
                  >
                    {/* Avatar + nombre */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-sa-green text-sa-cream flex items-center justify-center font-display text-base flex-shrink-0">
                          {c.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sa-green-ink">{c.nombre}</p>
                          {c.telefono && (
                            <p className="text-xs text-sa-green-ink/50 font-mono">{c.telefono}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Nivel badge */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${nivelBadgeClass(c.nivel)}`}>
                        {nivelLabel(c.nivel)}
                      </span>
                    </td>

                    {/* Puntos + barra de progreso */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-sa-green-ink tabular-nums">{c.puntos.toLocaleString('es-MX')}</p>
                      <div className="mt-1 h-1.5 w-28 rounded-full bg-sa-green-ink/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-sa-green transition-all"
                          style={{ width: `${progreso}%` }}
                        />
                      </div>
                      {c.nivel !== 'platino' && (
                        <p className="text-[10px] text-sa-green-ink/40 mt-0.5 font-mono">
                          {(siguiente - c.puntos).toLocaleString('es-MX')} pts para {evaluarNivel(siguiente)}
                        </p>
                      )}
                    </td>

                    {/* Wallet */}
                    <td className="px-4 py-3">
                      {c.wallet_saldo > 0 ? (
                        <span className="inline-flex items-center gap-1 font-medium text-sa-green-deep">
                          <IcoWallet /> {formatMXN(c.wallet_saldo)}
                        </span>
                      ) : (
                        <span className="text-sa-green-ink/30 text-xs">—</span>
                      )}
                    </td>

                    {/* Total gastado */}
                    <td className="px-4 py-3 tabular-nums text-sa-green-ink/70">
                      {formatMXN(c.total_gastado)}
                    </td>

                    {/* Última visita */}
                    <td className="px-4 py-3 text-sa-green-ink/50 text-xs">
                      {formatFecha(c.ultima_visita)}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setClienteCargando(c)}
                          className="text-xs px-3 py-1.5 rounded-sa border border-sa-green/30 text-sa-green hover:bg-sa-mint/20 transition-colors font-medium"
                          title="Cargar puntos / wallet"
                        >
                          + Puntos
                        </button>
                        <button
                          onClick={() => setConfirmBorrar(c.id)}
                          className="text-xs px-3 py-1.5 rounded-sa border border-sa-strawberry/30 text-sa-strawberry hover:bg-sa-strawberry/10 transition-colors font-medium"
                          title="Borrar cliente"
                        >
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal nuevo cliente */}
      {modalNuevo && (
        <ModalNuevoCliente
          onClose={() => setModalNuevo(false)}
          onGuardar={onAgregar}
        />
      )}

      {/* Modal cargar puntos */}
      {clienteCargando && (
        <ModalCargaPuntos
          cliente={clienteCargando}
          onClose={() => setClienteCargando(null)}
          onGuardar={(pts, wallet) => onCargar(clienteCargando.id, pts, wallet)}
        />
      )}

      {/* Confirm borrar */}
      {confirmBorrar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-sa-green-ink/40 backdrop-blur-sm"
            onClick={() => setConfirmBorrar(null)}
          />
          <div className="relative bg-white rounded-sa-lg shadow-sa border border-sa-green-ink/8 p-8 max-w-sm w-full text-center">
            <IcoTrash2 />
            <h3 className="font-display text-2xl text-sa-green-deep mb-2">¿Borrar cliente?</h3>
            <p className="text-sm text-sa-green-ink/60 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmBorrar(null)}
                className="flex-1 border border-sa-green-ink/15 text-sa-green-ink py-2.5 rounded-sa font-medium text-sm hover:bg-sa-cream-paper"
              >
                Cancelar
              </button>
              <button
                onClick={handleBorrarConfirm}
                className="flex-1 bg-sa-strawberry text-white py-2.5 rounded-sa font-medium text-sm hover:bg-sa-strawberry/90"
              >
                Borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tab Gift Cards ─────────────────────────────────────────────────────────────

interface TabGiftCardsProps {
  giftCards: GiftCard[]
  onCrear: (monto: number, fechaVenc: string | null) => void
  onAnular: (id: string) => void
}

function TabGiftCards({ giftCards, onCrear, onAnular }: TabGiftCardsProps) {
  const [showForm, setShowForm] = useState(false)
  const [monto, setMonto] = useState(500)
  const [fechaVenc, setFechaVenc] = useState('')

  const cardsActivas = giftCards.filter((gc) => estadoGiftCard(gc) === 'activa')
  const totalCirculacion = cardsActivas.reduce((sum, gc) => sum + gc.saldo_actual, 0)

  function handleCrear(e: React.FormEvent) {
    e.preventDefault()
    if (monto <= 0) return
    onCrear(monto, fechaVenc.trim() || null)
    setMonto(500)
    setFechaVenc('')
    setShowForm(false)
  }

  function estadoChip(gc: GiftCard) {
    const estado = estadoGiftCard(gc)
    switch (estado) {
      case 'activa':   return 'bg-sa-mint/30 text-sa-green-deep'
      case 'canjeada': return 'bg-sa-green-ink/10 text-sa-green-ink/50'
      case 'vencida':  return 'bg-sa-strawberry/15 text-sa-strawberry'
    }
  }

  function estadoTexto(gc: GiftCard): string {
    const estado = estadoGiftCard(gc)
    switch (estado) {
      case 'activa':   return 'Activa'
      case 'canjeada': return 'Canjeada'
      case 'vencida':  return 'Vencida'
    }
  }

  return (
    <div>
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-sa-mint/20 rounded-sa-lg px-5 py-4 border border-sa-green-ink/6">
          <p className="font-display text-4xl text-sa-green-deep">{cardsActivas.length}</p>
          <p className="font-mono text-xs uppercase tracking-wide text-sa-green-ink/50 mt-1">
            Cards activas
          </p>
        </div>
        <div className="bg-sa-banana/20 rounded-sa-lg px-5 py-4 border border-sa-green-ink/6">
          <p className="font-display text-3xl text-yellow-700">{formatMXN(totalCirculacion)}</p>
          <p className="font-mono text-xs uppercase tracking-wide text-sa-green-ink/50 mt-1">
            Saldo en circulación
          </p>
        </div>
      </div>

      {/* Nueva gift card button / inline form */}
      <div className="mb-6">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-sa-green text-sa-cream px-5 py-2.5 rounded-sa font-medium text-sm hover:bg-sa-green-deep transition-colors shadow-sa-sm"
          >
            + Nueva Gift Card
          </button>
        ) : (
          <form
            onSubmit={handleCrear}
            className="bg-white border border-sa-green-ink/8 rounded-sa-lg p-5 flex items-end gap-4 flex-wrap shadow-sa-sm"
          >
            <div>
              <label className="block text-xs font-medium text-sa-green-ink/60 uppercase tracking-wider mb-1">
                Monto (MXN) *
              </label>
              <input
                type="number"
                min={1}
                step={0.01}
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
                required
                className="w-36 border border-sa-green-ink/15 rounded-sa px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-sa-green-ink/60 uppercase tracking-wider mb-1">
                Vencimiento (opcional)
              </label>
              <input
                type="date"
                value={fechaVenc}
                onChange={(e) => setFechaVenc(e.target.value)}
                className="border border-sa-green-ink/15 rounded-sa px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-sa-green text-sa-cream px-5 py-2 rounded-sa font-medium text-sm hover:bg-sa-green-deep transition-colors"
              >
                Crear
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-sa-green-ink/15 text-sa-green-ink px-5 py-2 rounded-sa font-medium text-sm hover:bg-sa-cream-paper"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-sa-lg border border-sa-green-ink/8 shadow-sa-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sa-green-ink/8 bg-sa-cream-paper">
              <th className="text-left px-5 py-3 font-mono text-xs uppercase tracking-wider text-sa-green-ink/50">Código</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-sa-green-ink/50">Monto original</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-sa-green-ink/50">Saldo actual</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-sa-green-ink/50">Estado</th>
              <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-sa-green-ink/50">Vencimiento</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {giftCards.map((gc, idx) => {
              const pct = gc.monto_original > 0
                ? Math.round((gc.saldo_actual / gc.monto_original) * 100)
                : 0
              const estado = estadoGiftCard(gc)

              return (
                <tr
                  key={gc.id}
                  className={`border-b border-sa-green-ink/5 hover:bg-sa-cream-paper/60 transition-colors ${
                    idx % 2 === 0 ? '' : 'bg-sa-cream-paper/30'
                  }`}
                >
                  <td className="px-5 py-3">
                    <span className="font-mono text-sa-green-deep font-medium tracking-wider">
                      {gc.codigo}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-sa-green-ink/70">
                    {formatMXN(gc.monto_original)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium tabular-nums text-sa-green-ink">
                      {formatMXN(gc.saldo_actual)}
                    </p>
                    <div className="mt-1 h-1.5 w-28 rounded-full bg-sa-green-ink/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sa-green transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoChip(gc)}`}>
                      {estadoTexto(gc)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-sa-green-ink/50">
                    {gc.fecha_vencimiento ? formatFecha(gc.fecha_vencimiento) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {estado === 'activa' && (
                      <button
                        onClick={() => onAnular(gc.id)}
                        className="text-xs px-3 py-1.5 rounded-sa border border-sa-strawberry/30 text-sa-strawberry hover:bg-sa-strawberry/10 transition-colors font-medium"
                      >
                        Anular
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Tab Configuración ──────────────────────────────────────────────────────────

function TabConfiguracion() {
  const config = LEALTAD_CONFIG

  return (
    <div className="max-w-2xl">
      {/* Reglas generales */}
      <div className="bg-white rounded-sa-lg border border-sa-green-ink/8 shadow-sa-sm p-6 mb-6">
        <h3 className="font-display text-xl text-sa-green-deep mb-4">Reglas de acumulación</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-sa-mint/20 rounded-sa p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-sa-green-ink/50 mb-1">
              Pesos por punto
            </p>
            <p className="font-display text-3xl text-sa-green-deep">
              ${config.pesos_por_punto}
            </p>
            <p className="text-xs text-sa-green-ink/60 mt-1">
              Por cada ${config.pesos_por_punto} gastados se acumula 1 punto
            </p>
          </div>
          <div className="bg-sa-banana/20 rounded-sa p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-sa-green-ink/50 mb-1">
              Puntos por visita
            </p>
            <p className="font-display text-3xl text-yellow-700">
              +{config.puntos_por_visita}
            </p>
            <p className="text-xs text-sa-green-ink/60 mt-1">
              Puntos de bonificación por cada visita registrada
            </p>
          </div>
        </div>
      </div>

      {/* Niveles */}
      <h3 className="font-display text-xl text-sa-green-deep mb-4">Niveles de lealtad</h3>
      <div className="grid grid-cols-2 gap-4">
        {config.niveles.map((n) => (
          <div
            key={n.nivel}
            className={`${n.color} rounded-sa-lg border border-sa-green-ink/8 p-5`}
          >
            <div className="flex items-center gap-2 mb-2">
              {NIVEL_ICON[n.nivel] ?? null}
              <span className="font-display text-xl text-sa-green-deep capitalize">
                {n.nivel}
              </span>
            </div>
            <p className="font-mono text-xs text-sa-green-ink/50 uppercase tracking-wider mb-1">
              Desde {n.min_puntos.toLocaleString('es-MX')} puntos
            </p>
            <p className="text-sm text-sa-green-ink/80">{n.beneficio}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function Lealtad() {
  const [tab, setTab] = useState<Tab>('clientes')
  const {
    clientes,
    giftCards,
    agregarCliente,
    borrarCliente,
    cargarPuntosWallet,
    crearGiftCard,
    anularGiftCard,
  } = useLealtad()

  return (
    <div className="p-8 max-w-[1300px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-sa-green-deep">Lealtad y Wallet</h1>
        <p className="font-mono text-sm text-sa-green-ink/50 uppercase tracking-wider mt-1">
          {clientes.length} clientes · {giftCards.filter((gc) => estadoGiftCard(gc) === 'activa').length} gift cards activas
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-sa-green-ink/6 p-1 rounded-sa mb-8 w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-6 py-2 rounded-[6px] text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-white text-sa-green-deep shadow-sa-sm'
                : 'text-sa-green-ink/60 hover:text-sa-green-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'clientes' && (
        <TabClientes
          clientes={clientes}
          onAgregar={agregarCliente}
          onCargar={cargarPuntosWallet}
          onBorrar={borrarCliente}
        />
      )}
      {tab === 'giftcards' && (
        <TabGiftCards
          giftCards={giftCards}
          onCrear={crearGiftCard}
          onAnular={anularGiftCard}
        />
      )}
      {tab === 'config' && <TabConfiguracion />}
    </div>
  )
}
