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
  const { empleadoActivo, cerrarSesion, limpiarOrden } = usePosStore()
  const [horaActual, setHoraActual] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setHoraActual(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  const hora = horaActual.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="h-screen flex flex-col bg-sa-cream-paper overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-2.5 bg-sa-green-deep text-sa-cream flex-shrink-0 border-b border-sa-cream/10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Shake Aholic" className="h-[110px] w-auto -my-6" />
          <span className="font-mono text-xs uppercase tracking-widest text-sa-cream/50">Sucursal Principal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-sa-cream/70">{hora}</span>
          <span className="font-display text-lg text-sa-cream">
            {empleadoActivo?.nombre.split(' ')[0]}
          </span>
          <button
            onClick={() => navigate('/corte')}
            className="font-mono text-xs uppercase tracking-wide bg-sa-cream-warm/10 hover:bg-sa-cream-warm/20 text-sa-cream px-4 py-2 rounded-full transition-colors border border-sa-cream/20"
          >
            Corte de caja
          </button>
          <button
            onClick={() => { limpiarOrden(); cerrarSesion() }}
            className="font-mono text-xs uppercase tracking-wide bg-sa-strawberry/15 hover:bg-sa-strawberry/30 text-sa-strawberry px-4 py-2 rounded-full transition-colors border border-sa-strawberry/30"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Main split layout */}
      <div className="flex-1 flex overflow-hidden gap-3 p-3">
        {/* Left: Catalog */}
        <div className="flex-1 flex flex-col overflow-hidden bg-sa-cream-soft rounded-sa shadow-sa-sm">
          <CatalogoBusqueda
            productos={DEMO_PRODUCTOS}
            categorias={DEMO_CATEGORIAS}
          />
        </div>

        {/* Right: Order panel */}
        <div className="w-96 flex-shrink-0 flex flex-col bg-white rounded-sa shadow-sa-sm overflow-hidden">
          <OrdenPanel onCobrar={() => navigate('/cobro')} />
        </div>
      </div>
    </div>
  )
}
