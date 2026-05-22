import { supabase } from '../client'
import type { EstadoOrden, MetodoPago } from '../types/database'

export interface ItemOrden {
  producto_id: string
  cantidad: number
  precio_unitario: number
  cocina_id: string
  personalizacion?: string
}

export async function crearOrden(items: ItemOrden[], total: number) {
  const { data: orden, error: ordenError } = await supabase
    .from('ordenes')
    .insert({ total, estado: 'pendiente' })
    .select()
    .single()

  if (ordenError) throw ordenError

  const { error: itemsError } = await supabase
    .from('orden_items')
    .insert(items.map(item => ({ ...item, orden_id: orden.id })))

  if (itemsError) throw itemsError
  return orden
}

export async function actualizarEstadoOrden(ordenId: string, estado: EstadoOrden) {
  const { data, error } = await supabase
    .from('ordenes')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', ordenId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function marcarOrdenPagada(ordenId: string, metodoPago: MetodoPago) {
  const { data, error } = await supabase
    .from('ordenes')
    .update({ pagado: true, metodo_pago: metodoPago, estado: 'en_preparacion' })
    .eq('id', ordenId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getOrdenesPorCocina(cocinaId: string, estado?: EstadoOrden) {
  let query = supabase
    .from('ordenes')
    .select(`
      *,
      orden_items!inner(
        id, cantidad, precio_unitario, personalizacion, cocina_id,
        productos(id, nombre)
      )
    `)
    .eq('orden_items.cocina_id', cocinaId)
    .eq('pagado', true)
    .order('created_at', { ascending: true })

  if (estado) {
    query = query.eq('estado', estado)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export function suscribirseAOrdenes(
  cocinaId: string,
  callback: (payload: unknown) => void,
) {
  return supabase
    .channel(`ordenes-cocina-${cocinaId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'orden_items',
        filter: `cocina_id=eq.${cocinaId}`,
      },
      callback,
    )
    .subscribe()
}
