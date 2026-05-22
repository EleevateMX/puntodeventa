import React from 'react'

const stats = [
  { label: 'Ventas hoy', value: '$0.00', icon: '💰', color: 'text-green-600' },
  { label: 'Órdenes hoy', value: '0', icon: '🧾', color: 'text-blue-600' },
  { label: 'Ticket promedio', value: '$0.00', icon: '📈', color: 'text-purple-600' },
  { label: 'Insumos en alerta', value: '0', icon: '⚠️', color: 'text-red-600' },
]

export function Dashboard() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-400 text-center py-12">
          Conecta Supabase para ver datos en tiempo real
        </p>
      </div>
    </div>
  )
}
