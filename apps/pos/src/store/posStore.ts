import { create } from 'zustand'
import type { ItemOrdenPOS, ClientePOS } from '../types'
import { publish } from '../display/sync'

export interface PromoAplicada {
  promo: { id: string; nombre: string }
  descuento: number
  razon: string
}

interface PosStore {
  // Sesión
  empleadoActivo: { id: string; nombre: string; rol: string } | null
  turnoId: string | null
  sucursalId: string

  // Orden activa
  items: ItemOrdenPOS[]
  clienteActivo: ClientePOS | null
  descuento: { tipo: 'porcentaje' | 'monto'; valor: number } | null
  notas: string
  codigoPromo: string
  promocionesAplicadas: PromoAplicada[]

  // Acciones de sesión
  iniciarSesion: (empleado: { id: string; nombre: string; rol: string }, turnoId: string) => void
  cerrarSesion: () => void

  // Acciones de orden
  agregarItem: (item: Omit<ItemOrdenPOS, 'cantidad'>) => void
  quitarItem: (producto_id: string) => void
  incrementar: (producto_id: string) => void
  decrementar: (producto_id: string) => void
  setPersonalizacion: (producto_id: string, texto: string) => void
  setCliente: (cliente: ClientePOS | null) => void
  setDescuento: (descuento: { tipo: 'porcentaje' | 'monto'; valor: number } | null) => void
  setNotas: (notas: string) => void
  setCodigoPromo: (codigo: string) => void
  setPromocionesAplicadas: (promos: PromoAplicada[]) => void
  limpiarOrden: () => void
  marcarPagado: (folio: string) => void

  // Cálculos
  subtotal: () => number
  montoDescuento: () => number
  montoPromos: () => number
  total: () => number
  totalItems: () => number
}

export const usePosStore = create<PosStore>((set, get) => ({
  empleadoActivo: null,
  turnoId: null,
  sucursalId: '00000000-0000-0000-0000-000000000001',
  items: [],
  clienteActivo: null,
  descuento: null,
  notas: '',
  codigoPromo: '',
  promocionesAplicadas: [],

  iniciarSesion: (empleado, turnoId) =>
    set({ empleadoActivo: empleado, turnoId }),

  cerrarSesion: () =>
    set({
      empleadoActivo: null,
      turnoId: null,
      items: [],
      clienteActivo: null,
      descuento: null,
      codigoPromo: '',
      promocionesAplicadas: [],
    }),

  agregarItem: (item) =>
    set((state) => {
      const existe = state.items.find((i) => i.producto_id === item.producto_id)
      const newItems: ItemOrdenPOS[] = existe
        ? state.items.map((i) =>
            i.producto_id === item.producto_id ? { ...i, cantidad: i.cantidad + 1 } : i,
          )
        : [...state.items, { ...item, cantidad: 1 }]

      const updated = newItems.find((i) => i.producto_id === item.producto_id)!
      publish({
        type: 'item-added',
        item: { id: updated.producto_id, nombre: updated.nombre, cantidad: updated.cantidad, precio: updated.precio },
        total: newItems.reduce((s, i) => s + i.precio * i.cantidad, 0),
        totalItems: newItems.reduce((s, i) => s + i.cantidad, 0),
      })
      return { items: newItems }
    }),

  quitarItem: (producto_id) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.producto_id !== producto_id)
      publish({
        type: 'item-removed',
        id: producto_id,
        total: newItems.reduce((s, i) => s + i.precio * i.cantidad, 0),
        totalItems: newItems.reduce((s, i) => s + i.cantidad, 0),
      })
      return { items: newItems }
    }),

  incrementar: (producto_id) =>
    set((state) => {
      const newItems = state.items.map((i) =>
        i.producto_id === producto_id ? { ...i, cantidad: i.cantidad + 1 } : i,
      )
      const updated = newItems.find((i) => i.producto_id === producto_id)!
      publish({
        type: 'item-added',
        item: { id: updated.producto_id, nombre: updated.nombre, cantidad: updated.cantidad, precio: updated.precio },
        total: newItems.reduce((s, i) => s + i.precio * i.cantidad, 0),
        totalItems: newItems.reduce((s, i) => s + i.cantidad, 0),
      })
      return { items: newItems }
    }),

  decrementar: (producto_id) =>
    set((state) => {
      const newItems = state.items
        .map((i) =>
          i.producto_id === producto_id ? { ...i, cantidad: i.cantidad - 1 } : i,
        )
        .filter((i) => i.cantidad > 0)
      const totalItems = newItems.reduce((s, i) => s + i.cantidad, 0)
      if (totalItems === 0) {
        publish({ type: 'cart-cleared' })
      } else {
        publish({
          type: 'item-removed',
          id: producto_id,
          total: newItems.reduce((s, i) => s + i.precio * i.cantidad, 0),
          totalItems,
        })
      }
      return { items: newItems }
    }),

  setPersonalizacion: (producto_id, texto) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.producto_id === producto_id ? { ...i, personalizacion: texto } : i,
      ),
    })),

  setCliente: (cliente) => set({ clienteActivo: cliente }),

  setDescuento: (descuento) => set({ descuento }),

  setNotas: (notas) => set({ notas }),

  setCodigoPromo: (codigoPromo) => set({ codigoPromo }),

  setPromocionesAplicadas: (promocionesAplicadas) => set({ promocionesAplicadas }),

  limpiarOrden: () => {
    publish({ type: 'cart-cleared' })
    set({
      items: [],
      clienteActivo: null,
      descuento: null,
      notas: '',
      codigoPromo: '',
      promocionesAplicadas: [],
    })
  },

  marcarPagado: (folio) => {
    publish({ type: 'order-paid', folio })
    set({
      items: [],
      clienteActivo: null,
      descuento: null,
      notas: '',
      codigoPromo: '',
      promocionesAplicadas: [],
    })
  },

  subtotal: () =>
    get().items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),

  montoDescuento: () => {
    const { descuento } = get()
    if (!descuento) return 0
    const sub = get().subtotal()
    if (descuento.tipo === 'porcentaje') return sub * (descuento.valor / 100)
    return Math.min(descuento.valor, sub)
  },

  montoPromos: () =>
    get().promocionesAplicadas.reduce((sum, p) => sum + p.descuento, 0),

  total: () => Math.max(0, get().subtotal() - get().montoDescuento() - get().montoPromos()),

  totalItems: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),
}))
