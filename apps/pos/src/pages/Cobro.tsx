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
  const { total, clienteActivo, limpiarOrden, items, sucursalId, empleadoActivo } = usePosStore()

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
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 bg-white shadow-sm flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-700 transition-colors text-xl"
        >
          ←
        </button>
        <div>
          <h1 className="font-bold text-gray-900 text-lg">Cobro</h1>
          <p className="text-gray-400 text-sm">{items.length} productos</p>
        </div>
        {clienteActivo && (
          <div className="ml-auto flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl">
            <span className="text-sm">👤</span>
            <span className="text-sm font-medium text-blue-700">{clienteActivo.nombre}</span>
          </div>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: payment options */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Total */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 text-center">
            <p className="text-gray-500 text-sm mb-1">Total a cobrar</p>
            <p className="text-5xl font-extrabold text-gray-900">${totalOrden.toFixed(2)}</p>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setModo('simple')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                modo === 'simple' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600'
              }`}
            >
              Un método
            </button>
            <button
              onClick={() => setModo('mixto')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                modo === 'mixto' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600'
              }`}
            >
              Pago mixto
            </button>
          </div>

          {modo === 'simple' ? (
            <>
              {/* Single method selection */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {METODOS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMetodoPrincipal(m.key)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
                      metodoPrincipal === m.key
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-xs font-medium text-gray-700">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Cash received */}
              {metodoPrincipal === 'efectivo' && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recibido</label>
                  <div className="relative mb-3">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={recibido}
                      onChange={(e) => setRecibido(e.target.value)}
                      placeholder={totalOrden.toFixed(2)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  {/* Quick amount buttons */}
                  <div className="flex gap-2 mb-3">
                    {CAMBIO_RAPIDO.filter((v) => v >= totalOrden).slice(0, 4).map((v) => (
                      <button
                        key={v}
                        onClick={() => setRecibido(String(v))}
                        className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
                      >
                        ${v}
                      </button>
                    ))}
                    <button
                      onClick={() => setRecibido(totalOrden.toFixed(2))}
                      className="flex-1 py-2 bg-orange-100 hover:bg-orange-200 rounded-xl text-sm font-medium text-orange-700 transition-colors"
                    >
                      Exacto
                    </button>
                  </div>
                  {recibidoNum >= totalOrden && (
                    <div className="flex justify-between bg-green-50 rounded-xl px-4 py-2.5">
                      <span className="text-green-700 font-medium text-sm">Cambio</span>
                      <span className="text-green-700 font-bold text-lg">${cambio.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Mixed payment mode */
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">Pagos registrados</p>
                <p className="text-sm text-gray-500">
                  Pendiente: <span className="font-bold text-orange-500">${restante.toFixed(2)}</span>
                </p>
              </div>

              {/* Added payments */}
              {pagos.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-700 capitalize">{p.metodo.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">${p.monto.toFixed(2)}</span>
                    <button
                      onClick={() => setPagos((prev) => prev.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {/* Add payment */}
              {restante > 0 && (
                <div className="mt-3 space-y-2">
                  <input
                    type="number"
                    value={montoPago}
                    onChange={(e) => setMontoPago(e.target.value)}
                    placeholder={`Monto (máx $${restante.toFixed(2)})`}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <div className="grid grid-cols-5 gap-1.5">
                    {METODOS.map((m) => (
                      <button
                        key={m.key}
                        onClick={() => agregarPago(m.key)}
                        className="flex flex-col items-center gap-0.5 py-2 bg-gray-100 hover:bg-orange-50 hover:border-orange-200 border border-transparent rounded-xl text-xs transition-all"
                      >
                        <span>{m.icon}</span>
                        <span className="text-gray-600 text-xs">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: order summary + confirm */}
        <div className="w-72 bg-white border-l border-gray-100 flex flex-col p-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Resumen</h3>
          <div className="flex-1 overflow-y-auto space-y-1 mb-4">
            {items.map((item) => (
              <div key={item.producto_id} className="flex justify-between text-sm py-1">
                <span className="text-gray-600 truncate flex-1 mr-2">
                  ×{item.cantidad} {item.nombre}
                </span>
                <span className="font-medium text-gray-800 flex-shrink-0">
                  ${(item.precio * item.cantidad).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-1 mb-4">
            <div className="flex justify-between text-lg font-extrabold text-gray-900">
              <span>Total</span>
              <span>${totalOrden.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={confirmarPago}
            disabled={!listo || procesando}
            className="w-full bg-green-500 disabled:opacity-40 hover:bg-green-600 active:scale-95 text-white py-4 rounded-2xl font-bold text-lg transition-all"
          >
            {procesando ? 'Procesando...' : '✓ Confirmar pago'}
          </button>
        </div>
      </div>
    </div>
  )
}
