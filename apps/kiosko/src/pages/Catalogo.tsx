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

const COC_ALIMENTOS = { id: 'c-1', nombre: 'Cocina', slug: 'alimentos' }
const COC_BEBIDAS = { id: 'c-2', nombre: 'Barra', slug: 'bebidas' }

const CAT_SHAKES: Categoria = { id: 'cat-shakes', nombre: 'Shakes', cocinas: COC_BEBIDAS }
const CAT_BOWLS:  Categoria = { id: 'cat-bowls',  nombre: 'Bowls',  cocinas: COC_ALIMENTOS }
const CAT_SNACKS: Categoria = { id: 'cat-snacks', nombre: 'Snacks', cocinas: COC_ALIMENTOS }
const CAT_CAFE:   Categoria = { id: 'cat-cafe',   nombre: 'Café',   cocinas: COC_BEBIDAS }

const DEMO_CATEGORIAS: Categoria[] = [CAT_SHAKES, CAT_BOWLS, CAT_SNACKS, CAT_CAFE]

const DEMO_PRODUCTOS: Producto[] = [
  { id: 'p-1',  nombre: 'Shake Fresa-Banana', descripcion: '40g proteína, fruta real, leche o avena',   precio:  95, imagen_url: null, categoria_id: 'cat-shakes', categorias: CAT_SHAKES },
  { id: 'p-2',  nombre: 'Shake Chocolate',    descripcion: '35g proteína, cacao, plátano',              precio:  90, imagen_url: null, categoria_id: 'cat-shakes', categorias: CAT_SHAKES },
  { id: 'p-3',  nombre: 'Shake Mango',        descripcion: '32g proteína, mango fresco',                precio:  90, imagen_url: null, categoria_id: 'cat-shakes', categorias: CAT_SHAKES },
  { id: 'p-4',  nombre: 'Shake Café',         descripcion: '30g proteína, espresso doble',              precio:  95, imagen_url: null, categoria_id: 'cat-shakes', categorias: CAT_SHAKES },
  { id: 'p-5',  nombre: 'Bowl Pollo Power',   descripcion: 'Pollo, arroz, vegetales, salsa de la casa', precio: 145, imagen_url: null, categoria_id: 'cat-bowls',  categorias: CAT_BOWLS },
  { id: 'p-6',  nombre: 'Bowl Veggie',        descripcion: 'Quinoa, garbanzo, vegetales, tahini',       precio: 130, imagen_url: null, categoria_id: 'cat-bowls',  categorias: CAT_BOWLS },
  { id: 'p-7',  nombre: 'Bowl Atún',          descripcion: 'Atún sellado, aguacate, edamame',           precio: 155, imagen_url: null, categoria_id: 'cat-bowls',  categorias: CAT_BOWLS },
  { id: 'p-8',  nombre: 'Wrap Pollo',         descripcion: 'Tortilla integral, pollo, vegetales',       precio: 110, imagen_url: null, categoria_id: 'cat-snacks', categorias: CAT_SNACKS },
  { id: 'p-9',  nombre: 'Barrita Brownie',    descripcion: '20g proteína, cero culpa',                  precio:  55, imagen_url: null, categoria_id: 'cat-snacks', categorias: CAT_SNACKS },
  { id: 'p-10', nombre: 'Energy Balls',       descripcion: 'Dátil, avena, cacao (6 pzs)',               precio:  65, imagen_url: null, categoria_id: 'cat-snacks', categorias: CAT_SNACKS },
  { id: 'p-11', nombre: 'Café Americano',     descripcion: 'Granos de origen',                          precio:  45, imagen_url: null, categoria_id: 'cat-cafe',   categorias: CAT_CAFE },
  { id: 'p-12', nombre: 'Latte Vainilla',     descripcion: 'Espresso + leche al vapor',                 precio:  60, imagen_url: null, categoria_id: 'cat-cafe',   categorias: CAT_CAFE },
]

export function Catalogo() {
  const navigate = useNavigate()
  const { agregar, totalItems } = useCarrito()
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setCategorias(DEMO_CATEGORIAS)
    setProductos(DEMO_PRODUCTOS)
    setLoading(false)
  }, [])

  const productosFiltrados = categoriaActiva
    ? productos.filter((p) => p.categoria_id === categoriaActiva)
    : productos

  return (
    <div className="flex flex-col h-screen bg-sa-cream-paper">
      {/* Hero strip */}
      <header className="relative bg-sa-green-deep text-sa-cream px-8 pt-8 pb-10 overflow-hidden">
        <div className="absolute -right-6 -bottom-10 opacity-90 pointer-events-none select-none">
          <img
            src="/milo-transparent.png"
            alt=""
            className="h-56 w-auto drop-shadow-2xl"
          />
        </div>
        <div className="relative z-10 flex items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src="/logo.png"
              alt="Shake Aholic"
              className="h-20 w-20 rounded-sa bg-sa-cream object-contain p-2 shadow-sa-sm"
            />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-sa-banana">
                #MENU · KIOSKO 01
              </p>
              <h1 className="font-display text-5xl leading-none mt-2 text-sa-cream">
                Shake Aholic
              </h1>
              <p className="font-body text-lg mt-3 max-w-md text-sa-cream/90">
                ¿Listo para mover esa proteína? Agitamos fruta, comida real y sabor sin pose fitness.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Categorías */}
      <div className="bg-sa-cream-paper border-b border-sa-cream-warm">
        <div className="flex gap-3 px-8 py-5 overflow-x-auto">
          <button
            onClick={() => setCategoriaActiva(null)}
            className={`flex-shrink-0 px-5 h-12 rounded-full font-mono text-sm uppercase tracking-wider transition-all ${
              categoriaActiva === null
                ? 'bg-sa-green text-sa-cream shadow-sa-sm'
                : 'bg-sa-cream-warm text-sa-green-ink hover:bg-sa-cream'
            }`}
          >
            Todo
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`flex-shrink-0 px-5 h-12 rounded-full font-mono text-sm uppercase tracking-wider transition-all ${
                categoriaActiva === cat.id
                  ? 'bg-sa-green text-sa-cream shadow-sa-sm'
                  : 'bg-sa-cream-warm text-sa-green-ink hover:bg-sa-cream'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Productos */}
      <main className="flex-1 overflow-y-auto px-8 py-6 pb-32">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner className="w-12 h-12 text-sa-green" />
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
            <img src="/milo-transparent.png" alt="Milo" className="h-40 opacity-80" />
            <p className="font-display text-3xl text-sa-green-ink">
              Aún no agitamos nada
            </p>
            <p className="font-body text-sa-green-ink/70 max-w-sm">
              Conecta Supabase para llenar la barra con shakes, bowls y comida de verdad.
            </p>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-sa-green/70 mt-2">
              · sin polvo raro ·
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="group relative bg-sa-cream-soft rounded-sa-lg overflow-hidden shadow-sa-sm hover:shadow-sa transition-all active:scale-[0.98]"
              >
                <div className="relative">
                  {producto.imagen_url ? (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-sa-cream-warm flex items-center justify-center">
                      <img src="/milo-transparent.png" alt="" className="h-28 opacity-70" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-widest bg-sa-green-deep text-sa-cream px-2 py-1 rounded-full">
                    #{producto.id.slice(0, 4)}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-display text-xl leading-tight text-sa-green-ink line-clamp-2">
                    {producto.nombre}
                  </p>
                  {producto.descripcion && (
                    <p className="font-body text-xs text-sa-green-ink/60 mt-1 line-clamp-2">
                      {producto.descripcion}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <p className="font-mono text-lg font-medium text-sa-green">
                      ${producto.precio.toFixed(2)}
                    </p>
                    <button
                      onClick={() =>
                        agregar({
                          producto_id: producto.id,
                          nombre: producto.nombre,
                          precio: producto.precio,
                          cocina_id: producto.categorias?.cocinas?.id ?? '',
                          imagen_url: producto.imagen_url,
                        })
                      }
                      className="w-14 h-14 rounded-full bg-sa-green text-sa-cream font-display text-3xl flex items-center justify-center shadow-sa-sm active:scale-95 transition-transform"
                      aria-label={`Agregar ${producto.nombre}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating cart */}
      {totalItems() > 0 && (
        <button
          onClick={() => navigate('/carrito')}
          className="fixed bottom-8 right-8 z-20 flex items-center gap-3 bg-sa-strawberry text-white pl-6 pr-7 h-16 rounded-full shadow-sa active:scale-95 transition-transform"
        >
          <span className="font-display text-2xl">Tu shake</span>
          <span className="font-mono text-sm bg-white text-sa-strawberry rounded-full min-w-7 h-7 px-2 flex items-center justify-center font-medium">
            {totalItems()}
          </span>
        </button>
      )}
    </div>
  )
}
