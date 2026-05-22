import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCarrito } from '@/store/carritoStore'

export function Carrito() {
  const navigate = useNavigate()
  const { items, incrementar, decrementar, quitar, total, totalItems } = useCarrito()

  if (totalItems() === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-6">
        <span className="text-8xl">🛒</span>
        <p className="text-2xl font-semibold text-gray-500">Tu pedido está vacío</p>
        <button
          onClick={() => navigate('/catalogo')}
          className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-xl"
        >
          Ver menú
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex items-center gap-4 px-6 py-4 bg-white shadow-sm">
        <button
          onClick={() => navigate('/catalogo')}
          className="text-gray-500 text-2xl"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold">Tu pedido</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-3">
        {items.map((item) => (
          <div
            key={item.producto_id}
            className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm"
          >
            {item.imagen_url ? (
              <img src={item.imagen_url} alt={item.nombre} className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">🍽️</div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{item.nombre}</p>
              <p className="text-orange-500 font-bold">${(item.precio * item.cantidad).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => decrementar(item.producto_id)}
                className="w-10 h-10 rounded-full bg-gray-100 font-bold text-xl flex items-center justify-center"
              >
                −
              </button>
              <span className="w-8 text-center font-bold text-lg">{item.cantidad}</span>
              <button
                onClick={() => incrementar(item.producto_id)}
                className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold text-xl flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </main>

      <footer className="p-6 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-500 text-lg">Total</span>
          <span className="text-3xl font-extrabold text-gray-900">${total().toFixed(2)}</span>
        </div>
        <button
          onClick={() => navigate('/pago')}
          className="w-full bg-orange-500 text-white py-5 rounded-2xl font-bold text-xl"
        >
          Continuar al pago →
        </button>
      </footer>
    </div>
  )
}
