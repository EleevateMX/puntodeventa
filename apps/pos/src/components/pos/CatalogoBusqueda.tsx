import React, { useState, useMemo } from 'react'
import { usePosStore } from '@/store/posStore'
import type { Producto, Categoria } from '../../types'

const COCINA_COLOR: Record<string, string> = {
  alimentos: 'bg-orange-100 text-orange-700',
  bebidas: 'bg-blue-100 text-blue-700',
}

interface Props {
  productos: Producto[]
  categorias: Categoria[]
}

export function CatalogoBusqueda({ productos, categorias }: Props) {
  const agregarItem = usePosStore((s) => s.agregarItem)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null)

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideBusqueda =
        !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      const coincideCategoria = !categoriaActiva || p.categoria_id === categoriaActiva
      return coincideBusqueda && coincideCategoria
    })
  }, [productos, busqueda, categoriaActiva])

  function handleAgregar(p: Producto) {
    agregarItem({
      producto_id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      cocina_id: p.categorias?.cocinas?.id ?? '',
      imagen_url: p.imagen_url,
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-100">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setCategoriaActiva(null) }}
            placeholder="Buscar producto..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-gray-100 flex-shrink-0">
        <button
          onClick={() => setCategoriaActiva(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !categoriaActiva ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoriaActiva(cat.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              categoriaActiva === cat.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.nombre}
            {cat.cocinas && (
              <span className={`ml-1 text-xs px-1 rounded ${COCINA_COLOR[cat.cocinas.slug] ?? ''}`}>
                {cat.cocinas.slug === 'alimentos' ? '🍽️' : '🥤'}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <p className="text-sm">Sin resultados</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {productosFiltrados.map((p) => (
              <button
                key={p.id}
                onClick={() => handleAgregar(p)}
                className="flex flex-col items-center p-3 bg-gray-50 hover:bg-orange-50 active:scale-95 border border-transparent hover:border-orange-200 rounded-xl transition-all text-left group"
              >
                {p.imagen_url ? (
                  <img
                    src={p.imagen_url}
                    alt={p.nombre}
                    className="w-14 h-14 rounded-lg object-cover mb-2"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-2xl mb-2">
                    {p.categorias?.cocinas?.slug === 'bebidas' ? '🥤' : '🍽️'}
                  </div>
                )}
                <p className="text-xs font-medium text-gray-800 text-center leading-tight line-clamp-2 w-full">
                  {p.nombre}
                </p>
                <p className="text-sm font-bold text-orange-500 mt-1">${p.precio}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
