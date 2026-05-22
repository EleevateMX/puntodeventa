import { create } from 'zustand'
import type { ItemOrdenPOS, ClientePOS, PagoItem } from '../types'

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
  limpiarOrden: () => void

  // Cálculos
  subtotal: () => number
  montoDescuento: () => number
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

  iniciarSesion: (empleado, turnoId) =>
    set({ empleadoActivo: empleado, turnoId }),

  cerrarSesion: () =>
    set({ empleadoActivo: null, turnoId: null, items: [], clienteActivo: null, descuento: null }),

  agregarItem: (item) =>
    set((state) => {
      const existe = state.items.find((i) => i.producto_id === item.producto_id)
      if (existe) {
        return {
          items: state.items.map((i) =>
            i.producto_id === item.producto_id ? { ...i, cantidad: i.cantidad + 1 } : i,
          ),
        }
      }
      return { items: [...state.items, { ...item, cantidad: 1 }] }
    }),

  quitarItem: (producto_id) =>
    set((state) => ({ items: state.items.filter((i) => i.producto_id !== producto_id) })),

  incrementar: (producto_id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.producto_id === producto_id ? { ...i, cantidad: i.cantidad + 1 } : i,
      ),
    })),

  decrementar: (producto_id) =>
    set((state) => ({
      items: state.items
        .map((i) =>
          i.producto_id === producto_id ? { ...i, cantidad: i.cantidad - 1 } : i,
        )
        .filter((i) => i.cantidad > 0),
    })),

  setPersonalizacion: (producto_id, texto) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.producto_id === producto_id ? { ...i, personalizacion: texto } : i,
      ),
    })),

  setCliente: (cliente) => set({ clienteActivo: cliente }),

  setDescuento: (descuento) => set({ descuento }),

  setNotas: (notas) => set({ notas }),

  limpiarOrden: () =>
    set({ items: [], clienteActivo: null, descuento: null, notas: '' }),

  subtotal: () =>
    get().items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),

  montoDescuento: () => {
    const { descuento } = get()
    if (!descuento) return 0
    const sub = get().subtotal()
    if (descuento.tipo === 'porcentaje') return sub * (descuento.valor / 100)
    return Math.min(descuento.valor, sub)
  },

  total: () => get().subtotal() - get().montoDescuento(),

  totalItems: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),
}))
