import React, { useMemo, useState } from 'react'
import { usePromociones } from '../hooks/usePromociones'
import type { Promocion, PromocionInput } from '../hooks/usePromociones'
import { TablaPromociones } from '../components/promociones/TablaPromociones'
import { ModalPromocion } from '../components/promociones/ModalPromocion'
import { useMenu } from '../hooks/useMenu'

type Filtro = 'todas' | 'activas' | 'pausadas' | 'con_codigo'

const FILTROS: { key: Filtro; label: string }[] = [
  { key: 'todas',      label: 'Todas' },
  { key: 'activas',    label: 'Activas' },
  { key: 'pausadas',   label: 'Pausadas' },
  { key: 'con_codigo', label: 'Con código' },
]

function estaVencida(p: Promocion): boolean {
  if (!p.fecha_fin) return false
  const fin = new Date(p.fecha_fin)
  fin.setHours(23, 59, 59, 999)
  return new Date() > fin
}

export function Promociones() {
  const {
    promociones,
    agregarPromocion,
    editarPromocion,
    borrarPromocion,
    toggleActivaPromocion,
  } = usePromociones()

  const { categorias, productos } = useMenu()

  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [busqueda, setBusqueda] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Promocion | null>(null)
  const [confirmBorrar, setConfirmBorrar] = useState<string | null>(null)

  const filtradas = useMemo(() => {
    let list = promociones
    if (filtro === 'activas')    list = list.filter((p) => p.activa && !estaVencida(p))
    if (filtro === 'pausadas')   list = list.filter((p) => !p.activa || estaVencida(p))
    if (filtro === 'con_codigo') list = list.filter((p) => Boolean(p.codigo))
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          (p.descripcion ?? '').toLowerCase().includes(q) ||
          (p.codigo ?? '').toLowerCase().includes(q),
      )
    }
    return list
  }, [promociones, filtro, busqueda])

  // KPI counts
  const totalActivas   = promociones.filter((p) => p.activa && !estaVencida(p)).length
  const totalPausadas  = promociones.filter((p) => !p.activa).length
  const totalVencidas  = promociones.filter(estaVencida).length
  const totalConCodigo = promociones.filter((p) => Boolean(p.codigo)).length

  function handleGuardar(input: PromocionInput) {
    if (editando) {
      editarPromocion(editando.id, input)
    } else {
      agregarPromocion(input)
    }
    setEditando(null)
  }

  function handleEditar(p: Promocion) {
    setEditando(p)
    setModalOpen(true)
  }

  function handleNueva() {
    setEditando(null)
    setModalOpen(true)
  }

  function handleBorrar(id: string) {
    setConfirmBorrar(id)
  }

  function confirmarBorrado() {
    if (confirmBorrar) borrarPromocion(confirmBorrar)
    setConfirmBorrar(null)
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-sa-green-deep">Promociones</h1>
          <p className="font-mono text-sm text-sa-green-ink/50 uppercase tracking-wider mt-1">
            {promociones.length} promo{promociones.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <button
          onClick={handleNueva}
          className="flex items-center gap-2 bg-sa-green text-sa-cream px-5 py-2.5 rounded-sa font-medium text-sm hover:bg-sa-green-deep transition-colors shadow-sa-sm"
        >
          <span className="text-base">🎟️</span>
          Nueva promo
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Activas',    value: totalActivas,   color: 'text-sa-green', bg: 'bg-sa-mint/20' },
          { label: 'Pausadas',   value: totalPausadas,  color: 'text-sa-green-ink/50', bg: 'bg-sa-green-ink/8' },
          { label: 'Vencidas',   value: totalVencidas,  color: 'text-sa-strawberry', bg: 'bg-sa-strawberry/10' },
          { label: 'Con código', value: totalConCodigo, color: 'text-sa-blueberry', bg: 'bg-sa-blueberry/10' },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className={`${bg} rounded-sa-lg px-5 py-4 border border-sa-green-ink/6`}
          >
            <p className={`font-display text-4xl ${color}`}>{value}</p>
            <p className="font-mono text-xs uppercase tracking-wide text-sa-green-ink/50 mt-1">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex gap-1 bg-sa-green-ink/6 p-1 rounded-sa flex-shrink-0">
          {FILTROS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              className={`px-4 py-1.5 rounded-[6px] text-sm font-medium transition-colors ${
                filtro === key
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
          placeholder="Buscar por nombre, descripción o código…"
          className="flex-1 min-w-[220px] border border-sa-green-ink/15 bg-white rounded-sa px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-sa-lg border border-sa-green-ink/8 shadow-sa-sm p-6">
        <TablaPromociones
          promociones={filtradas}
          onEditar={handleEditar}
          onBorrar={handleBorrar}
          onToggle={toggleActivaPromocion}
        />
      </div>

      {/* Modal create/edit */}
      <ModalPromocion
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditando(null) }}
        onGuardar={handleGuardar}
        promocion={editando}
        categorias={categorias}
        productos={productos}
      />

      {/* Confirm delete dialog */}
      {confirmBorrar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-sa-green-ink/40 backdrop-blur-sm"
            onClick={() => setConfirmBorrar(null)}
          />
          <div className="relative bg-sa-cream-soft rounded-sa-lg shadow-sa border border-sa-green-ink/8 p-8 max-w-sm w-full text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sa-green-ink/30 mx-auto mb-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            <h3 className="font-display text-2xl text-sa-green-deep mb-2">
              ¿Borrar promo?
            </h3>
            <p className="text-sm text-sa-green-ink/60 mb-6">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmBorrar(null)}
                className="flex-1 border border-sa-green-ink/15 text-sa-green-ink py-2.5 rounded-sa font-medium text-sm hover:bg-sa-cream-warm/50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarBorrado}
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
