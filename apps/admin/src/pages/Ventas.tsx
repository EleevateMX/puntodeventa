import React from 'react'

export function Ventas() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reporte de Ventas</h2>
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <span className="text-5xl">💰</span>
        <p className="text-gray-400 mt-4">Historial de ventas, corte de caja y exportación</p>
        <p className="text-gray-300 text-sm mt-2">Requiere conexión a Supabase</p>
      </div>
    </div>
  )
}
