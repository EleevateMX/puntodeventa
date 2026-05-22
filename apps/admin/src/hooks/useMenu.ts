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

export function useMenu() {
  const [productos, setProductos] = useState<ProductoConCategoria[]>([])
  const [categorias, setCategorias] = useState<CategoriaConCocina[]>([])
  const [cocinas, setCocinas] = useState<Cocina[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    if (!isSupabaseConfigured) return
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
