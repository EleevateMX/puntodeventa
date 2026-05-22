import { useState, useEffect } from 'react'
import { getProductosConCategorias, getCategorias, isSupabaseConfigured } from '@pos/supabase'
import type { Producto, Categoria } from '../types'

export function useProductosPOS() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    setLoading(true)
    Promise.all([getProductosConCategorias(), getCategorias()])
      .then(([productosData, categoriasData]) => {
        setProductos(productosData as Producto[])
        setCategorias(categoriasData as Categoria[])
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error al cargar el menú')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return { productos, categorias, loading, error }
}
