import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@pos/ui'
import { useCarrito } from '@/store/carritoStore'

interface Categoria {
  id: string
  nombre: string
  cocinas: { id: string; nombre: string; slug: string } | null
}

interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  imagen_url: string | null
  categoria_id: string
  categorias: Categoria | null
}

export function Catalogo() {
  const navigate = useNavigate()
  const { agregar, totalItems } = useCarrito()
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Placeholder: cargar productos desde Supabase cuando esté configurado
    setLoading(false)
  }, [])

  const productosFiltrados = categoriaActiva
    ? productos.filter((p) => p.categoria_id === categoriaActiva)
    : productos

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-orange-500">🍽️ Nuestro Menú</h1>
        <button
          onClick={() => navigate('/carrito')}
          className="relative flex items-center gap-2 bg-orange-500 text-white px-5 py-3 rounded-xl font-semibold text-lg"
        >
          🛒 Ver pedido
          {totalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {totalItems()}
            </span>
          )}
        </button>
      </header>

      {/* Categorías */}
      {categorias.length > 0 && (
        <div className="flex gap-3 px-6 py-4 overflow-x-auto bg-white border-b">
          <button
            onClick={() => setCategoriaActiva(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-colors ${
              categoriaActiva === null
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                categoriaActiva === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Productos */}
      <main className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner className="w-10 h-10 text-orange-500" />
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
            <span className="text-6xl">🍽️</span>
            <p className="text-xl font-medium">No hay productos disponibles</p>
            <p className="text-sm">Conecta Supabase para ver el menú</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                onClick={() =>
                  agregar({
                    producto_id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    cocina_id: producto.categorias?.cocinas?.id ?? '',
                    imagen_url: producto.imagen_url,
                  })
                }
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md active:scale-95 transition-all"
              >
                {producto.imagen_url ? (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-full h-36 object-cover"
                  />
                ) : (
                  <div className="w-full h-36 bg-orange-50 flex items-center justify-center text-4xl">
                    🍽️
                  </div>
                )}
                <div className="p-3">
                  <p className="font-semibold text-gray-900 leading-tight">{producto.nombre}</p>
                  {producto.descripcion && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{producto.descripcion}</p>
                  )}
                  <p className="text-orange-500 font-bold text-lg mt-2">
                    ${producto.precio.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
