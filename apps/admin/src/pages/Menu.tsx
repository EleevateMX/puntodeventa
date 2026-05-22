import React, { useState } from 'react'
import { useMenu, type ProductoConCategoria, type CategoriaConCocina } from '../hooks/useMenu'
import { ModalProducto } from '../components/menu/ModalProducto'
import { ModalCategoria } from '../components/menu/ModalCategoria'

type Tab = 'productos' | 'categorias'

const COCINA_ICON: Record<string, string> = {
  alimentos: '🍽️',
  bebidas: '🥤',
}

const COCINA_COLOR: Record<string, string> = {
  alimentos: 'bg-orange-100 text-orange-700',
  bebidas: 'bg-blue-100 text-blue-700',
}

export function Menu() {
  const {
    productos,
    categorias,
    cocinas,
    loading,
    error,
    isSupabaseConfigured,
    agregarProducto,
    editarProducto,
    borrarProducto,
    toggleProducto,
    agregarCategoria,
    editarCategoria,
    borrarCategoria,
  } = useMenu()

  const [tab, setTab] = useState<Tab>('productos')
  const [busqueda, setBusqueda] = useState('')
  const [filtroCocina, setFiltroCocina] = useState('')
  const [productoEditar, setProductoEditar] = useState<ProductoConCategoria | null>(null)
  const [modalProductoOpen, setModalProductoOpen] = useState(false)
  const [categoriaEditar, setCategoriaEditar] = useState<CategoriaConCocina | null>(null)
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false)
  const [confirmEliminar, setConfirmEliminar] = useState<{ tipo: 'producto' | 'categoria'; id: string; nombre: string } | null>(null)
  const [eliminando, setEliminando] = useState(false)

  // --- Filtros productos ---
  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCocina =
      !filtroCocina || p.categorias?.cocinas?.id === filtroCocina
    return coincideBusqueda && coincideCocina
  })

  // --- Filtros categorías ---
  const categoriasFiltradas = categorias.filter((c) => {
    return !filtroCocina || c.cocina_id === filtroCocina
  })

  // --- Conteo de productos por categoría ---
  const productosPorCategoria = (catId: string) =>
    productos.filter((p) => p.categoria_id === catId).length

  function abrirNuevoProducto() {
    setProductoEditar(null)
    setModalProductoOpen(true)
  }

  function abrirEditarProducto(p: ProductoConCategoria) {
    setProductoEditar(p)
    setModalProductoOpen(true)
  }

  function abrirNuevaCategoria() {
    setCategoriaEditar(null)
    setModalCategoriaOpen(true)
  }

  function abrirEditarCategoria(c: CategoriaConCocina) {
    setCategoriaEditar(c)
    setModalCategoriaOpen(true)
  }

  async function confirmarEliminar() {
    if (!confirmEliminar) return
    setEliminando(true)
    try {
      if (confirmEliminar.tipo === 'producto') {
        await borrarProducto(confirmEliminar.id)
      } else {
        await borrarCategoria(confirmEliminar.id)
      }
    } finally {
      setEliminando(false)
      setConfirmEliminar(null)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Menú</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <span className="text-4xl">🔌</span>
          <p className="text-amber-800 font-semibold mt-3">Supabase no está configurado</p>
          <p className="text-amber-600 text-sm mt-1">
            Configura <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> y{' '}
            <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> en tu <code className="bg-amber-100 px-1 rounded">.env</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-8 pt-8 pb-0 bg-gray-50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Menú</h2>
          <button
            onClick={tab === 'productos' ? abrirNuevoProducto : abrirNuevaCategoria}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            + {tab === 'productos' ? 'Nuevo producto' : 'Nueva categoría'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-200 p-1 rounded-xl w-fit">
          {(['productos', 'categorias'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setBusqueda('') }}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                tab === t
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'productos' ? `🍽️ Productos (${productos.length})` : `🗂️ Categorías (${categorias.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="px-8 py-4 bg-gray-50 flex items-center gap-3 border-b border-gray-200">
        {/* Cocina filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFiltroCocina('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !filtroCocina ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            Todas
          </button>
          {cocinas.map((c) => (
            <button
              key={c.id}
              onClick={() => setFiltroCocina(c.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                filtroCocina === c.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {COCINA_ICON[c.slug] ?? '🍴'} {c.nombre}
            </button>
          ))}
        </div>

        {/* Search — solo en productos */}
        {tab === 'productos' && (
          <div className="relative ml-auto">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto..."
              className="pl-8 pr-4 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white w-52"
            />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
            <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Cargando...
          </div>
        ) : tab === 'productos' ? (
          productosFiltrados.length === 0 ? (
            <EmptyState
              icon="🍽️"
              mensaje={busqueda ? 'Sin resultados para tu búsqueda' : 'No hay productos aún'}
              accion={!busqueda ? 'Crea el primer producto' : undefined}
              onAccion={!busqueda ? abrirNuevoProducto : undefined}
            />
          ) : (
            <TablaProductos
              productos={productosFiltrados}
              onEditar={abrirEditarProducto}
              onEliminar={(p) => setConfirmEliminar({ tipo: 'producto', id: p.id, nombre: p.nombre })}
              onToggle={toggleProducto}
            />
          )
        ) : categoriasFiltradas.length === 0 ? (
          <EmptyState
            icon="🗂️"
            mensaje="No hay categorías aún"
            accion="Crea la primera categoría"
            onAccion={abrirNuevaCategoria}
          />
        ) : (
          <TablaCategorias
            categorias={categoriasFiltradas}
            productosPorCategoria={productosPorCategoria}
            onEditar={abrirEditarCategoria}
            onEliminar={(c) => setConfirmEliminar({ tipo: 'categoria', id: c.id, nombre: c.nombre })}
          />
        )}
      </div>

      {/* Modales */}
      <ModalProducto
        open={modalProductoOpen}
        onClose={() => setModalProductoOpen(false)}
        onGuardar={productoEditar
          ? (input) => editarProducto(productoEditar.id, input)
          : agregarProducto
        }
        producto={productoEditar}
        categorias={categorias}
      />

      <ModalCategoria
        open={modalCategoriaOpen}
        onClose={() => setModalCategoriaOpen(false)}
        onGuardar={categoriaEditar
          ? (input) => editarCategoria(categoriaEditar.id, input)
          : agregarCategoria
        }
        categoria={categoriaEditar}
        cocinas={cocinas}
      />

      {/* Diálogo de confirmación de eliminación */}
      {confirmEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmEliminar(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar {confirmEliminar.tipo}?</h3>
            <p className="text-gray-500 text-sm mb-5">
              Se eliminará <span className="font-medium text-gray-700">"{confirmEliminar.nombre}"</span> permanentemente.
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmEliminar(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="flex-1 bg-red-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-red-600"
              >
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function EmptyState({
  icon,
  mensaje,
  accion,
  onAccion,
}: {
  icon: string
  mensaje: string
  accion?: string
  onAccion?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
      <span className="text-6xl">{icon}</span>
      <p className="text-lg font-medium">{mensaje}</p>
      {accion && onAccion && (
        <button
          onClick={onAccion}
          className="text-orange-500 hover:underline text-sm font-medium"
        >
          {accion} →
        </button>
      )}
    </div>
  )
}

function TablaProductos({
  productos,
  onEditar,
  onEliminar,
  onToggle,
}: {
  productos: ProductoConCategoria[]
  onEditar: (p: ProductoConCategoria) => void
  onEliminar: (p: ProductoConCategoria) => void
  onToggle: (id: string, activo: boolean) => void
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-500 text-xs uppercase tracking-wide">
            <th className="px-5 py-3 font-medium">Producto</th>
            <th className="px-5 py-3 font-medium">Categoría</th>
            <th className="px-5 py-3 font-medium">Cocina</th>
            <th className="px-5 py-3 font-medium text-right">Precio</th>
            <th className="px-5 py-3 font-medium text-center">Activo</th>
            <th className="px-5 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {productos.map((p) => {
            const slug = p.categorias?.cocinas?.slug ?? ''
            return (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {p.imagen_url ? (
                      <img
                        src={p.imagen_url}
                        alt={p.nombre}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-lg flex-shrink-0">
                        {COCINA_ICON[slug] ?? '🍴'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{p.nombre}</p>
                      {p.descripcion && (
                        <p className="text-gray-400 text-xs truncate max-w-[200px]">{p.descripcion}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600">{p.categorias?.nombre ?? '—'}</td>
                <td className="px-5 py-3">
                  {slug ? (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${COCINA_COLOR[slug] ?? 'bg-gray-100 text-gray-600'}`}>
                      {COCINA_ICON[slug]} {p.categorias?.cocinas?.nombre}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right font-semibold text-gray-900">
                  ${p.precio.toFixed(2)}
                </td>
                <td className="px-5 py-3 text-center">
                  <button
                    onClick={() => onToggle(p.id, !p.activo)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      p.activo ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        p.activo ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEditar(p)}
                      className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onEliminar(p)}
                      className="px-3 py-1.5 text-xs font-medium border border-red-200 rounded-lg hover:bg-red-50 text-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function TablaCategorias({
  categorias,
  productosPorCategoria,
  onEditar,
  onEliminar,
}: {
  categorias: CategoriaConCocina[]
  productosPorCategoria: (id: string) => number
  onEditar: (c: CategoriaConCocina) => void
  onEliminar: (c: CategoriaConCocina) => void
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-500 text-xs uppercase tracking-wide">
            <th className="px-5 py-3 font-medium">Categoría</th>
            <th className="px-5 py-3 font-medium">Cocina</th>
            <th className="px-5 py-3 font-medium text-center">Productos</th>
            <th className="px-5 py-3 font-medium text-center">Activa</th>
            <th className="px-5 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {categorias.map((c) => {
            const slug = c.cocinas?.slug ?? ''
            const total = productosPorCategoria(c.id)
            return (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-900">{c.nombre}</td>
                <td className="px-5 py-3">
                  {slug ? (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${COCINA_COLOR[slug] ?? 'bg-gray-100 text-gray-600'}`}>
                      {COCINA_ICON[slug]} {c.cocinas?.nombre}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-center">
                  <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
                    {total} {total === 1 ? 'producto' : 'productos'}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.activa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {c.activa ? '● Activa' : '○ Inactiva'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEditar(c)}
                      className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onEliminar(c)}
                      disabled={total > 0}
                      title={total > 0 ? 'Elimina primero los productos de esta categoría' : ''}
                      className="px-3 py-1.5 text-xs font-medium border border-red-200 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
