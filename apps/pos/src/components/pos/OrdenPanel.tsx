import React, { useState } from 'react'
import { usePosStore } from '@/store/posStore'
import { ModalDescuento } from './ModalDescuento'
import { ModalCliente } from './ModalCliente'

interface Props {
  onCobrar: () => void
}

export function OrdenPanel({ onCobrar }: Props) {
  const {
    items, incrementar, decrementar, quitarItem,
    clienteActivo, descuento, setDescuento,
    subtotal, montoDescuento, montoPromos, total, totalItems, limpiarOrden,
    codigoPromo, setCodigoPromo, promocionesAplicadas,
  } = usePosStore()

  const [modalDescuento, setModalDescuento] = useState(false)
  const [modalCliente, setModalCliente] = useState(false)
  const [inputPromo, setInputPromo] = useState('')

  function aplicarPromo() {
    if (inputPromo.trim()) {
      setCodigoPromo(inputPromo.trim())
      setInputPromo('')
    }
  }

  function quitarPromo() {
    setCodigoPromo('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-sa-green-ink/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl text-sa-green-ink">Orden actual</h2>
          {totalItems() > 0 && (
            <span className="font-mono text-xs bg-sa-green text-sa-cream px-2 py-0.5 rounded-full">
              {totalItems()}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={limpiarOrden}
            className="font-mono text-xs uppercase tracking-wide text-sa-strawberry hover:brightness-110"
          >
            Cancelar
          </button>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-sa-green-ink/40 gap-3 pb-10 px-6">
            <img src="/milo-transparent.png" alt="Milo" className="w-32 h-32 opacity-80" />
            <p className="font-display text-lg text-sa-green-ink/60 text-center leading-tight">
              Aún no agitas nada
            </p>
            <p className="font-mono text-xs uppercase tracking-wide text-sa-green-ink/40 text-center">
              Toca un producto para empezar
            </p>
          </div>
        ) : (
          <div className="px-3 py-3 space-y-2">
            {items.map((item) => (
              <div
                key={item.producto_id}
                className="flex items-center gap-2 bg-sa-cream-soft rounded-sa px-3 py-2.5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sa-green-ink truncate">{item.nombre}</p>
                  <p className="font-mono text-xs text-sa-green-ink/50">${item.precio.toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => decrementar(item.producto_id)}
                    className="w-7 h-7 rounded-full bg-white hover:bg-sa-strawberry/10 text-sa-green-ink hover:text-sa-strawberry text-sm flex items-center justify-center font-bold transition-colors border border-sa-green-ink/10"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-mono text-sm font-medium text-sa-green-ink">
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() => incrementar(item.producto_id)}
                    className="w-7 h-7 rounded-full bg-sa-green hover:bg-sa-green-deep text-sa-cream text-sm flex items-center justify-center font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="w-16 text-right flex-shrink-0">
                  <p className="font-mono text-sm font-medium text-sa-green-ink">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => quitarItem(item.producto_id)}
                  className="text-sa-green-ink/30 hover:text-sa-strawberry transition-colors ml-1 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: client + discount + totals + pay button */}
      {items.length > 0 && (
        <div className="border-t border-sa-green-ink/10 flex-shrink-0 bg-sa-cream-paper/30">
          {/* Client and discount actions */}
          <div className="flex gap-2 px-4 py-3">
            <button
              onClick={() => setModalCliente(true)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full font-mono text-xs uppercase tracking-wide transition-colors ${
                clienteActivo
                  ? 'bg-sa-mint/30 text-sa-green-ink border border-sa-mint'
                  : 'bg-white text-sa-green-ink/70 border border-sa-green-ink/15 hover:bg-sa-cream-soft'
              }`}
            >
              <span>👤</span>
              {clienteActivo ? clienteActivo.nombre.split(' ')[0] : 'Cliente'}
            </button>
            <button
              onClick={() => setModalDescuento(true)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full font-mono text-xs uppercase tracking-wide transition-colors ${
                descuento
                  ? 'bg-sa-banana/30 text-sa-green-ink border border-sa-banana'
                  : 'bg-white text-sa-green-ink/70 border border-sa-green-ink/15 hover:bg-sa-cream-soft'
              }`}
            >
              <span>🏷️</span>
              {descuento
                ? descuento.tipo === 'porcentaje'
                  ? `${descuento.valor}% off`
                  : `-$${descuento.valor}`
                : 'Descuento'}
            </button>
          </div>

          {/* Promo code input */}
          <div className="px-4 pb-2">
            {codigoPromo ? (
              <div className="flex items-center gap-2 bg-sa-green/10 border border-sa-green/30 rounded-full px-3 py-1.5">
                <span className="font-mono text-xs text-sa-green-ink flex-1">🎟️ {codigoPromo}</span>
                <button
                  onClick={quitarPromo}
                  className="text-sa-strawberry/70 hover:text-sa-strawberry text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputPromo}
                  onChange={(e) => setInputPromo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && aplicarPromo()}
                  placeholder="Código promo…"
                  className="flex-1 px-3 py-1.5 bg-white border border-sa-green-ink/10 rounded-full font-mono text-xs text-sa-green-ink focus:outline-none focus:ring-2 focus:ring-sa-green/30"
                />
                <button
                  onClick={aplicarPromo}
                  className="px-3 py-1.5 bg-sa-green text-sa-cream rounded-full font-mono text-xs uppercase tracking-wide hover:bg-sa-green-deep"
                >
                  Aplicar
                </button>
              </div>
            )}
          </div>

          {/* Applied promos */}
          {promocionesAplicadas.length > 0 && (
            <div className="px-4 pb-2 space-y-1">
              {promocionesAplicadas.map((p) => (
                <div key={p.promo.id} className="flex items-center justify-between bg-sa-green/10 border border-sa-green/20 rounded-sa px-3 py-1.5">
                  <span className="font-mono text-xs text-sa-green-ink truncate flex-1 mr-2">🎟️ {p.razon}</span>
                  <span className="font-mono text-xs text-sa-green flex-shrink-0">−${p.descuento.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="px-5 py-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-sa-green-ink/60">Subtotal</span>
              <span className="font-mono text-sa-green-ink/70">${subtotal().toFixed(2)}</span>
            </div>
            {descuento && (
              <div className="flex justify-between text-sm">
                <span className="text-sa-strawberry">Descuento</span>
                <span className="font-mono text-sa-strawberry">−${montoDescuento().toFixed(2)}</span>
              </div>
            )}
            {montoPromos() > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-sa-green">Promos</span>
                <span className="font-mono text-sa-green">−${montoPromos().toFixed(2)}</span>
              </div>
            )}
            {clienteActivo && (
              <div className="flex justify-between text-xs">
                <span className="text-sa-blueberry">💰 Wallet</span>
                <span className="font-mono text-sa-blueberry">${clienteActivo.wallet_saldo.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-sa-green-ink/10">
              <span className="font-display text-lg text-sa-green-ink">Total</span>
              <span className="font-display text-3xl text-sa-green-ink">
                ${total().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Pay button */}
          <div className="px-4 pb-4">
            <button
              onClick={onCobrar}
              className="w-full bg-sa-strawberry hover:brightness-110 active:scale-[0.98] text-white py-4 rounded-sa-lg font-display text-2xl shadow-sa-sm transition-all"
            >
              Cobrar ${total().toFixed(2)}
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ModalDescuento
        open={modalDescuento}
        onClose={() => setModalDescuento(false)}
        descuentoActual={descuento}
        onAplicar={(d) => { setDescuento(d); setModalDescuento(false) }}
        onQuitar={() => { setDescuento(null); setModalDescuento(false) }}
        subtotal={subtotal()}
      />
      <ModalCliente
        open={modalCliente}
        onClose={() => setModalCliente(false)}
      />
    </div>
  )
}
