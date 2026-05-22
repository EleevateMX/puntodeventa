import React from 'react'

export function Inventario() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Inventario</h2>
        <button className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-medium">
          + Agregar insumo
        </button>
      </div>
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <span className="text-5xl">📦</span>
        <p className="text-gray-400 mt-4">Aquí controlarás insumos, stock y alertas de mínimo</p>
        <p className="text-gray-300 text-sm mt-2">Requiere conexión a Supabase</p>
      </div>
    </div>
  )
}
