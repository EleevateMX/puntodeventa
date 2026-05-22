import React, { useEffect, useState } from 'react'
import { Badge } from '@pos/ui'

interface OrdenItem {
  id: string
  cantidad: number
  personalizacion: string | null
  productos: { id: string; nombre: string } | null
}

interface Orden {
  id: string
  folio: number
  estado: string
  created_at: string
  orden_items: OrdenItem[]
}

interface Props {
  cocinaSlug: string
  titulo: string
  color: 'orange' | 'blue'
}

export function PantallaComandas({ cocinaSlug, titulo, color }: Props) {
  const [ordenes, setOrdenes] = useState<Orden[]>([])

  useEffect(() => {
    // TODO: Cargar órdenes activas desde Supabase y suscribirse a Realtime
  }, [cocinaSlug])

  const colorClasses = {
    orange: { header: 'bg-orange-600', badge: 'bg-orange-500', btn: 'bg-orange-500 hover:bg-orange-600' },
    blue: { header: 'bg-blue-600', badge: 'bg-blue-500', btn: 'bg-blue-500 hover:bg-blue-600' },
  }[color]

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className={`${colorClasses.header} px-6 py-4 flex items-center justify-between`}>
        <h1 className="text-2xl font-bold text-white">{titulo}</h1>
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-300 text-sm font-medium">En vivo</span>
        </div>
      </header>

      <main className="flex-1 p-6">
        {ordenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-600 gap-4">
            <span className="text-7xl">✅</span>
            <p className="text-2xl font-semibold">Todo al día</p>
            <p className="text-sm">Las nuevas órdenes aparecerán aquí automáticamente</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ordenes.map((orden) => (
              <div key={orden.id} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-750 border-b border-gray-700">
                  <span className="text-white font-extrabold text-xl">#{orden.folio}</span>
                  <Badge variant={orden.estado === 'en_preparacion' ? 'warning' : 'success'}>
                    {orden.estado === 'en_preparacion' ? 'En preparación' : 'Lista'}
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  {orden.orden_items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <span className={`${colorClasses.badge} text-white text-sm font-bold px-2 py-0.5 rounded-lg min-w-[2rem] text-center`}>
                        ×{item.cantidad}
                      </span>
                      <div>
                        <p className="text-white font-medium leading-tight">
                          {item.productos?.nombre ?? '—'}
                        </p>
                        {item.personalizacion && (
                          <p className="text-gray-400 text-xs mt-0.5">{item.personalizacion}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4">
                  <button className={`w-full ${colorClasses.btn} text-white py-3 rounded-xl font-semibold transition-colors`}>
                    Marcar lista ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
