import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function Confirmacion() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/catalogo'), 8000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-50 gap-8">
      <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center">
        <span className="text-6xl">✓</span>
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">¡Pedido recibido!</h1>
        <p className="text-xl text-gray-500 mt-3">Tu orden está siendo preparada</p>
      </div>
      <p className="text-gray-400 text-sm">Regresando al menú en 8 segundos...</p>
      <button
        onClick={() => navigate('/catalogo')}
        className="bg-green-500 text-white px-10 py-4 rounded-xl font-bold text-lg mt-4"
      >
        Hacer otro pedido
      </button>
    </div>
  )
}
