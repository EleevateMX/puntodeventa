import { useState, useEffect, useCallback } from 'react'
import {
  getProductosAdmin,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  toggleActivoProducto,
  getCategoriasAdmin,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  getCocinas,
} from '@pos/supabase'
import type { Database } from '@pos/supabase'

type Cocina = Database['public']['Tables']['cocinas']['Row']
type CategoriaRow = Database['public']['Tables']['categorias']['Row']
type ProductoRow = Database['public']['Tables']['productos']['Row']

export type CategoriaConCocina = CategoriaRow & {
  cocinas: Cocina | null
}

export type ProductoConCategoria = ProductoRow & {
  categorias: (CategoriaRow & { cocinas: Cocina | null }) | null
}

export interface ProductoInput {
  nombre: string
  descripcion: string
  precio: number
  imagen_url: string
  categoria_id: string
  activo: boolean
}

export interface CategoriaInput {
  nombre: string
  cocina_id: string
  activa: boolean
}

const isSupabaseConfigured =
  import.meta.env.VITE_SUPABASE_URL &&
  !String(import.meta.env.VITE_SUPABASE_URL).includes('xxxx')

const usarDemo = () =>
  !isSupabaseConfigured || localStorage.getItem('shake-demo-mode') === 'true'

const DEMO_COCINAS = [
  { id: 'coc-1', nombre: 'Bebidas', slug: 'bebidas', activa: true, created_at: '' },
  { id: 'coc-2', nombre: 'Alimentos', slug: 'alimentos', activa: true, created_at: '' },
] as unknown as Cocina[]

const DEMO_CATS = [
  { id: 'cat-1', nombre: 'Shakes',  cocina_id: 'coc-1', activa: true, created_at: '', cocinas: DEMO_COCINAS[0] },
  { id: 'cat-2', nombre: 'Bowls',   cocina_id: 'coc-2', activa: true, created_at: '', cocinas: DEMO_COCINAS[1] },
  { id: 'cat-3', nombre: 'Snacks',  cocina_id: 'coc-2', activa: true, created_at: '', cocinas: DEMO_COCINAS[1] },
  { id: 'cat-4', nombre: 'Cafés',   cocina_id: 'coc-1', activa: true, created_at: '', cocinas: DEMO_COCINAS[0] },
] as unknown as CategoriaConCocina[]

const DEMO_PRODS = [
  { id: 'p1', nombre: 'Shake de Fresa',      descripcion: 'Fresas frescas, leche de almendra', precio: 89,  imagen_url: null, categoria_id: 'cat-1', activo: true, created_at: '', cocina_id: null, categorias: DEMO_CATS[0] },
  { id: 'p2', nombre: 'Shake de Mango',      descripcion: 'Mango mexicano, coco y leche',       precio: 89,  imagen_url: null, categoria_id: 'cat-1', activo: true, created_at: '', cocina_id: null, categorias: DEMO_CATS[0] },
  { id: 'p3', nombre: 'Shake Verde',         descripcion: 'Espinaca, pepino, piña y jengibre',  precio: 95,  imagen_url: null, categoria_id: 'cat-1', activo: true, created_at: '', cocina_id: null, categorias: DEMO_CATS[0] },
  { id: 'p4', nombre: 'Power Bowl',          descripcion: 'Pollo, arroz integral, aguacate',    precio: 149, imagen_url: null, categoria_id: 'cat-2', activo: true, created_at: '', cocina_id: null, categorias: DEMO_CATS[1] },
  { id: 'p5', nombre: 'Açaí Bowl',           descripcion: 'Base de açaí, granola, frutos rojos',precio: 139, imagen_url: null, categoria_id: 'cat-2', activo: true, created_at: '', cocina_id: null, categorias: DEMO_CATS[1] },
  { id: 'p6', nombre: 'Energy Bites',        descripcion: 'Avena, mantequilla de maní · 6 pzas',precio: 75,  imagen_url: null, categoria_id: 'cat-3', activo: true, created_at: '', cocina_id: null, categorias: DEMO_CATS[2] },
  { id: 'p7', nombre: 'Café Americano',      descripcion: 'Espresso doble con agua caliente',   precio: 55,  imagen_url: null, categoria_id: 'cat-4', activo: true, created_at: '', cocina_id: null, categorias: DEMO_CATS[3] },
  { id: 'p8', nombre: 'Cold Brew',           descripcion: 'Café en frío 12h, sin acidez',        precio: 69,  imagen_url: null, categoria_id: 'cat-4', activo: true, created_at: '', cocina_id: null, categorias: DEMO_CATS[3] },
] as unknown as ProductoConCategoria[]

export function useMenu() {
  const [productos, setProductos] = useState<ProductoConCategoria[]>([])
  const [categorias, setCategorias] = useState<CategoriaConCocina[]>([])
  const [cocinas, setCocinas] = useState<Cocina[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    if (usarDemo()) {
      setProductos(DEMO_PRODS)
      setCategorias(DEMO_CATS)
      setCocinas(DEMO_COCINAS)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [prods, cats, cocs] = await Promise.all([
        getProductosAdmin(),
        getCategoriasAdmin(),
        getCocinas(),
      ])
      setProductos(prods as ProductoConCategoria[])
      setCategorias(cats as CategoriaConCocina[])
      setCocinas(cocs)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  async function agregarProducto(input: ProductoInput) {
    const data = await crearProducto({
      nombre: input.nombre,
      descripcion: input.descripcion || null,
      precio: input.precio,
      imagen_url: input.imagen_url || null,
      categoria_id: input.categoria_id,
      activo: input.activo,
    })
    await cargar()
    return data
  }

  async function editarProducto(id: string, input: ProductoInput) {
    const data = await actualizarProducto(id, {
      nombre: input.nombre,
      descripcion: input.descripcion || null,
      precio: input.precio,
      imagen_url: input.imagen_url || null,
      categoria_id: input.categoria_id,
      activo: input.activo,
    })
    await cargar()
    return data
  }

  async function borrarProducto(id: string) {
    await eliminarProducto(id)
    setProductos((prev) => prev.filter((p) => p.id !== id))
  }

  async function toggleProducto(id: string, activo: boolean) {
    await toggleActivoProducto(id, activo)
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, activo } : p)),
    )
  }

  async function agregarCategoria(input: CategoriaInput) {
    const data = await crearCategoria({
      nombre: input.nombre,
      cocina_id: input.cocina_id,
      activa: input.activa,
    })
    await cargar()
    return data
  }

  async function editarCategoria(id: string, input: CategoriaInput) {
    const data = await actualizarCategoria(id, {
      nombre: input.nombre,
      cocina_id: input.cocina_id,
      activa: input.activa,
    })
    await cargar()
    return data
  }

  async function borrarCategoria(id: string) {
    await eliminarCategoria(id)
    setCategorias((prev) => prev.filter((c) => c.id !== id))
  }

  return {
    productos,
    categorias,
    cocinas,
    loading,
    error,
    isSupabaseConfigured: Boolean(isSupabaseConfigured),
    cargar,
    agregarProducto,
    editarProducto,
    borrarProducto,
    toggleProducto,
    agregarCategoria,
    editarCategoria,
    borrarCategoria,
  }
}
