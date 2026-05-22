import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePosStore } from '@/store/posStore'
import { CatalogoBusqueda } from '@/components/pos/CatalogoBusqueda'
import { OrdenPanel } from '@/components/pos/OrdenPanel'
import type { Producto, Categoria } from '../types'

// Demo data — replace with Supabase queries when connected
const DEMO_CATEGORIAS: Categoria[] = [
  { id: 'cat-1', nombre: 'Platillos', cocina_id: 'c1', cocinas: { id: 'c1', nombre: 'Alimentos', slug: 'alimentos' } },
  { id: 'cat-2', nombre: 'Ensaladas', cocina_id: 'c1', cocinas: { id: 'c1', nombre: 'Alimentos', slug: 'alimentos' } },
  { id: 'cat-3', nombre: 'Shakes', cocina_id: 'c2', cocinas: { id: 'c2', nombre: 'Bebidas', slug: 'bebidas' } },
  { id: 'cat-4', nombre: 'Café', cocina_id: 'c2', cocinas: { id: 'c2', nombre: 'Bebidas', slug: 'bebidas' } },
]

const DEMO_PRODUCTOS: Producto[] = [
  { id: 'p1', nombre: 'Pechuga a la plancha', descripcion: 'Con arroz y verduras', precio: 120, imagen_url: null, categoria_id: 'cat-1', activo: true, categorias: DEMO_CATEGORIAS[0]! },
  { id: 'p2', nombre: 'Bistec encebollado', descripcion: 'Con papas y frijoles', precio: 130, imagen_url: null, categoria_id: 'cat-1', activo: true, categorias: DEMO_CATEGORIAS[0]! },
  { id: 'p3', nombre: 'Quesadillas', descripcion: '3 piezas con salsa', precio: 75, imagen_url: null, categoria_id: 'cat-1', activo: true, categorias: DEMO_CATEGORIAS[0]! },
  { id: 'p4', nombre: 'Ensalada César', descripcion: 'Lechuga romana y aderezo', precio: 85, imagen_url: null, categoria_id: 'cat-2', activo: true, categorias: DEMO_CATEGORIAS[1]! },
  { id: 'p5', nombre: 'Ensalada mixta', descripcion: 'Vegetales frescos', precio: 70, imagen_url: null, categoria_id: 'cat-2', activo: true, categorias: DEMO_CATEGORIAS[1]! },
  { id: 'p6', nombre: 'Shake de fresa', descripcion: 'Con leche y fresa natural', precio: 65, imagen_url: null, categoria_id: 'cat-3', activo: true, categorias: DEMO_CATEGORIAS[2]! },
  { id: 'p7', nombre: 'Shake de mango', descripcion: 'Mango con leche', precio: 65, imagen_url: null, categoria_id: 'cat-3', activo: true, categorias: DEMO_CATEGORIAS[2]! },
  { id: 'p8', nombre: 'Café americano', descripcion: 'Grano recién molido', precio: 35, imagen_url: null, categoria_id: 'cat-4', activo: true, categorias: DEMO_CATEGORIAS[3]! },
  { id: 'p9', nombre: 'Café con leche', descripcion: 'Espresso y leche vaporizada', precio: 45, imagen_url: null, categoria_id: 'cat-4', activo: true, categorias: DEMO_CATEGORIAS[3]! },
  { id: 'p10', nombre: 'Limonada natural', descripcion: 'Con menta y hielo', precio: 40, imagen_url: null, categoria_id: 'cat-4', activo: true, categorias: DEMO_CATEGORIAS[3]! },
]

export function Caja() {
  const navigate = useNavigate()
  const { empleadoActivo, cerrarSesion, totalItems, limpiarOrden } = usePosStore()
  const [horaActual, setHoraActual] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setHoraActual(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  const hora = horaActual.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-2.5 bg-gray-900 text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-orange-400 font-bold text-lg">POS</span>
          <span className="text-gray-500">|</span>
          <span className="text-sm text-gray-300">Sucursal Principal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{hora}</span>
          <span className="text-sm text-gray-300">
            👤 {empleadoActivo?.nombre}
          </span>
          <button
            onClick={() => navigate('/corte')}
            className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg text-gray-300 transition-colors"
          >
            Corte de caja
          </button>
          <button
            onClick={() => { limpiarOrden(); cerrarSesion() }}
            className="text-xs bg-red-900 hover:bg-red-800 px-3 py-1.5 rounded-lg text-red-300 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Main split layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Catalog */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200 bg-white">
          <CatalogoBusqueda
            productos={DEMO_PRODUCTOS}
            categorias={DEMO_CATEGORIAS}
          />
        </div>

        {/* Right: Order panel */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-white overflow-hidden">
          <OrdenPanel onCobrar={() => navigate('/cobro')} />
        </div>
      </div>
    </div>
  )
}
