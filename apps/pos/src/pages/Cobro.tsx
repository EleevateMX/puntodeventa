import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePosStore } from '@/store/posStore'
import type { MetodoPago, PagoItem } from '../types'

const METODOS: { key: MetodoPago; label: string; icon: string }[] = [
  { key: 'efectivo', label: 'Efectivo', icon: '💵' },
  { key: 'tarjeta_credito', label: 'Crédito', icon: '💳' },
  { key: 'tarjeta_debito', label: 'Débito', icon: '💳' },
  { key: 'qr', label: 'QR', icon: '📱' },
  { key: 'wallet', label: 'Wallet', icon: '💰' },
]

const CAMBIO_RAPIDO = [50, 100, 200, 500]

export function Cobro() {
  const navigate = useNavigate()
  const { total, clienteActivo, limpiarOrden, items } = usePosStore()

  const [modo, setModo] = useState<'simple' | 'mixto'>('simple')
  const [metodoPrincipal, setMetodoPrincipal] = useState<MetodoPago>('efectivo')
  const [recibido, setRecibido] = useState('')
  const [pagos, setPagos] = useState<PagoItem[]>([])
  const [montoPago, setMontoPago] = useState('')
  const [procesando, setProcesando] = useState(false)

  const totalOrden = total()
  const recibidoNum = parseFloat(recibido) || 0
  const cambio = recibidoNum - totalOrden

  const totalPagado = pagos.reduce((s, p) => s + p.monto, 0)
  const restante = Math.max(0, totalOrden - totalPagado)

  function agregarPago(metodo: MetodoPago) {
    const monto = parseFloat(montoPago) || restante
    if (monto <= 0) return
    setPagos((prev) => [...prev, { metodo, monto: Math.min(monto, restante) }])
    setMontoPago('')
  }

  async function confirmarPago() {
    setProcesando(true)
    // TODO: Insert orden + orden_items + orden_pagos to Supabase
    await new Promise((r) => setTimeout(r, 800))
    limpiarOrden()
    navigate('/')
    setProcesando(false)
  }

  const listo = modo === 'simple'
    ? (metodoPrincipal !== 'efectivo' || recibidoNum >= totalOrden)
    : totalPagado >= totalOrden

  return (
    <div className="h-screen flex flex-col bg-sa-cream-paper overflow-hidden">
      {/* Hero strip with total */}
      <header className="bg-sa-green-deep text-sa-cream flex-shrink-0">
        <div className="flex items-center gap-4 px-6 py-3 border-b border-sa-cream/10">
          <button
            onClick={() => navigate('/')}
            className="text-sa-cream/70 hover:text-sa-cream transition-colors text-2xl"
          >
            ←
          </button>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-sa-cream/50">
              Cobrar orden
            </p>
            <p className="font-display text-lg text-sa-cream">
              {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          {clienteActivo && (
            <div className="ml-auto flex items-center gap-2 bg-sa-blueberry/20 px-4 py-2 rounded-full border border-sa-blueberry/30">
              <span>👤</span>
              <span className="font-mono text-sm text-sa-cream">{clienteActivo.nombre}</span>
            </div>
          )}
        </div>
        <div className="px-6 py-6 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-sa-cream/50 mb-2">
            Total a cobrar
          </p>
          <p className="font-display text-7xl text-sa-cream leading-none">
            ${totalOrden.toFixed(2)}
          </p>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: payment options */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Mode toggle */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setModo('simple')}
              className={`flex-1 py-3 rounded-full font-mono text-xs uppercase tracking-wide transition-colors ${
                modo === 'simple'
                  ? 'bg-sa-green text-sa-cream'
                  : 'bg-sa-cream-soft text-sa-green-ink/60 hover:bg-sa-cream-warm'
              }`}
            >
              Un método
            </button>
            <button
              onClick={() => setModo('mixto')}
              className={`flex-1 py-3 rounded-full font-mono text-xs uppercase tracking-wide transition-colors ${
                modo === 'mixto'
                  ? 'bg-sa-green text-sa-cream'
                  : 'bg-sa-cream-soft text-sa-green-ink/60 hover:bg-sa-cream-warm'
              }`}
            >
              Pago mixto
            </button>
          </div>

          {modo === 'simple' ? (
            <>
              {/* Single method selection */}
              <div className="grid grid-cols-5 gap-3 mb-5">
                {METODOS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMetodoPrincipal(m.key)}
                    className={`flex flex-col items-center gap-2 py-5 rounded-sa bg-sa-cream-soft transition-all ${
                      metodoPrincipal === m.key
                        ? 'ring-4 ring-sa-green shadow-sa-sm'
                        : 'hover:bg-sa-cream-warm'
                    }`}
                  >
                    <span className="text-3xl">{m.icon}</span>
                    <span className="font-display text-sm text-sa-green-ink">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Cash received */}
              {metodoPrincipal === 'efectivo' && (
                <div className="bg-white rounded-sa p-5 shadow-sa-sm">
                  <label className="block font-mono text-xs uppercase tracking-wide text-sa-green-ink/60 mb-2">
                    Recibido
                  </label>
                  <div className="relative mb-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sa-green-ink/40 text-xl">$</span>
                    <input
                      type="number"
                      value={recibido}
                      onChange={(e) => setRecibido(e.target.value)}
                      placeholder={totalOrden.toFixed(2)}
                      className="w-full pl-10 pr-4 py-3 bg-sa-cream-soft border border-sa-green-ink/10 rounded-sa font-mono text-2xl text-sa-green-ink focus:outline-none focus:ring-2 focus:ring-sa-green/30"
                    />
                  </div>
                  {/* Quick amount buttons */}
                  <div className="flex gap-2 mb-3">
                    {CAMBIO_RAPIDO.filter((v) => v >= totalOrden).slice(0, 4).map((v) => (
                      <button
                        key={v}
                        onClick={() => setRecibido(String(v))}
                        className="flex-1 py-2.5 bg-sa-cream-warm hover:bg-sa-banana rounded-full font-mono text-sm text-sa-green-ink transition-colors"
                      >
                        ${v}
                      </button>
                    ))}
                    <button
                      onClick={() => setRecibido(totalOrden.toFixed(2))}
                      className="flex-1 py-2.5 bg-sa-banana/40 hover:bg-sa-banana rounded-full font-mono text-sm text-sa-green-ink transition-colors"
                    >
                      Exacto
                    </button>
                  </div>
                  {recibidoNum >= totalOrden && (
                    <div className="flex justify-between items-center bg-sa-mint/25 rounded-sa px-4 py-3 border border-sa-mint/50">
                      <span className="font-mono text-sm uppercase tracking-wide text-sa-green-ink/70">
                        Cambio
                      </span>
                      <span className="font-display text-2xl text-sa-green">
                        ${cambio.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Mixed payment mode */
            <div className="bg-white rounded-sa p-5 shadow-sa-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-xs uppercase tracking-wide text-sa-green-ink/60">
                  Pagos registrados
                </p>
                <p className="font-mono text-sm text-sa-green-ink/60">
                  Pendiente: <span className="font-bold text-sa-strawberry">${restante.toFixed(2)}</span>
                </p>
              </div>

              {/* Added payments */}
              {pagos.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-sa-green-ink/10">
                  <span className="text-sm text-sa-green-ink capitalize">{p.metodo.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-sa-green-ink">${p.monto.toFixed(2)}</span>
                    <button
                      onClick={() => setPagos((prev) => prev.filter((_, j) => j !== i))}
                      className="text-sa-strawberry/70 hover:text-sa-strawberry text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {/* Add payment */}
              {restante > 0 && (
                <div className="mt-4 space-y-3">
                  <input
                    type="number"
                    value={montoPago}
                    onChange={(e) => setMontoPago(e.target.value)}
                    placeholder={`Monto (máx $${restante.toFixed(2)})`}
                    className="w-full px-4 py-2.5 bg-sa-cream-soft border border-sa-green-ink/10 rounded-sa font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/30"
                  />
                  <div className="grid grid-cols-5 gap-2">
                    {METODOS.map((m) => (
                      <button
                        key={m.key}
                        onClick={() => agregarPago(m.key)}
                        className="flex flex-col items-center gap-1 py-3 bg-sa-cream-soft hover:bg-sa-cream-warm rounded-sa transition-all"
                      >
                        <span className="text-lg">{m.icon}</span>
                        <span className="font-mono text-[10px] uppercase text-sa-green-ink/70">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: order summary + confirm */}
        <div className="w-80 bg-white border-l border-sa-green-ink/10 flex flex-col p-5">
          <h3 className="font-display text-lg text-sa-green-ink mb-3">Ticket</h3>
          <div className="flex-1 overflow-y-auto space-y-1.5 mb-4 font-mono text-sm">
            {items.map((item) => (
              <div key={item.producto_id} className="flex justify-between py-1 border-b border-dashed border-sa-green-ink/10">
                <span className="text-sa-green-ink/70 truncate flex-1 mr-2">
                  ×{item.cantidad} {item.nombre}
                </span>
                <span className="font-medium text-sa-green-ink flex-shrink-0">
                  ${(item.precio * item.cantidad).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-sa-green-ink/15 pt-3 space-y-1 mb-4">
            <div className="flex justify-between items-baseline">
              <span className="font-display text-xl text-sa-green-ink">Total</span>
              <span className="font-display text-2xl text-sa-green-ink">${totalOrden.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={confirmarPago}
            disabled={!listo || procesando}
            className="w-full bg-sa-strawberry disabled:opacity-40 hover:brightness-110 active:scale-[0.98] text-white py-4 rounded-sa-lg font-display text-xl shadow-sa-sm transition-all"
          >
            {procesando ? 'Agitando…' : 'Confirmar pago'}
          </button>
        </div>
      </div>
    </div>
  )
}
