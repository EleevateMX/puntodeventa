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
    subtotal, montoDescuento, total, totalItems, limpiarOrden,
  } = usePosStore()

  const [modalDescuento, setModalDescuento] = useState(false)
  const [modalCliente, setModalCliente] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <h2 className="font-bold text-gray-900">
          Orden
          {totalItems() > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {totalItems()}
            </span>
          )}
        </h2>
        {items.length > 0 && (
          <button
            onClick={limpiarOrden}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Cancelar
          </button>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3 pb-10">
            <span className="text-5xl">🧾</span>
            <p className="text-sm">Agrega productos al pedido</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.producto_id} className="flex items-center gap-2 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.nombre}</p>
                  <p className="text-xs text-gray-400">${item.precio.toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => decrementar(item.producto_id)}
                    className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 text-sm flex items-center justify-center font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-bold">{item.cantidad}</span>
                  <button
                    onClick={() => incrementar(item.producto_id)}
                    className="w-6 h-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm flex items-center justify-center font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="w-14 text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-800">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => quitarItem(item.producto_id)}
                  className="text-gray-300 hover:text-red-400 transition-colors ml-1 flex-shrink-0"
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
        <div className="border-t border-gray-100 flex-shrink-0">
          {/* Client and discount actions */}
          <div className="flex gap-2 px-4 py-2 border-b border-gray-50">
            <button
              onClick={() => setModalCliente(true)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
                clienteActivo
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              👤 {clienteActivo ? clienteActivo.nombre.split(' ')[0] : 'Cliente'}
            </button>
            <button
              onClick={() => setModalDescuento(true)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
                descuento
                  ? 'border-orange-300 bg-orange-50 text-orange-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              🏷️ {descuento
                ? descuento.tipo === 'porcentaje'
                  ? `${descuento.valor}% off`
                  : `-$${descuento.valor}`
                : 'Descuento'}
            </button>
          </div>

          {/* Totals */}
          <div className="px-4 py-3 space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>${subtotal().toFixed(2)}</span>
            </div>
            {descuento && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento</span>
                <span>−${montoDescuento().toFixed(2)}</span>
              </div>
            )}
            {clienteActivo && (
              <div className="flex justify-between text-xs text-blue-500">
                <span>💰 Wallet disponible</span>
                <span>${clienteActivo.wallet_saldo.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 text-lg pt-1 border-t border-gray-100">
              <span>Total</span>
              <span>${total().toFixed(2)}</span>
            </div>
          </div>

          {/* Pay button */}
          <div className="px-4 pb-4">
            <button
              onClick={onCobrar}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white py-4 rounded-2xl font-bold text-lg transition-all"
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
