import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCarrito } from '@/store/carritoStore'

type MetodoPago = 'terminal' | 'efectivo'

export function Pago() {
  const navigate = useNavigate()
  const { total, limpiar } = useCarrito()
  const [metodo, setMetodo] = useState<MetodoPago | null>(null)
  const [procesando, setProcesando] = useState(false)

  async function confirmarPago() {
    if (!metodo) return
    setProcesando(true)
    // TODO: integrar Mercado Pago SDK
    await new Promise((r) => setTimeout(r, 1500))
    limpiar()
    navigate('/confirmacion')
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex items-center gap-4 px-6 py-4 bg-white shadow-sm">
        <button onClick={() => navigate('/carrito')} className="text-gray-500 text-2xl">←</button>
        <h1 className="text-2xl font-bold">Elige cómo pagar</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <p className="text-5xl font-extrabold text-gray-900">${total().toFixed(2)}</p>
        <p className="text-gray-500 text-lg">MXN</p>

        <div className="flex flex-col gap-4 w-full max-w-md mt-4">
          <button
            onClick={() => setMetodo('terminal')}
            className={`flex items-center gap-5 p-6 rounded-2xl border-2 transition-all ${
              metodo === 'terminal'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <span className="text-4xl">💳</span>
            <div className="text-left">
              <p className="font-bold text-lg">Terminal bancaria</p>
              <p className="text-gray-500 text-sm">Mercado Pago</p>
            </div>
          </button>

          <button
            onClick={() => setMetodo('efectivo')}
            className={`flex items-center gap-5 p-6 rounded-2xl border-2 transition-all ${
              metodo === 'efectivo'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <span className="text-4xl">💵</span>
            <div className="text-left">
              <p className="font-bold text-lg">Efectivo</p>
              <p className="text-gray-500 text-sm">Pago en caja</p>
            </div>
          </button>
        </div>
      </main>

      <footer className="p-6 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <button
          onClick={confirmarPago}
          disabled={!metodo || procesando}
          className="w-full bg-orange-500 disabled:opacity-40 text-white py-5 rounded-2xl font-bold text-xl"
        >
          {procesando ? 'Procesando...' : 'Confirmar pago'}
        </button>
      </footer>
    </div>
  )
}
