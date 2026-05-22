import { create } from 'zustand'

export interface ItemCarrito {
  producto_id: string
  nombre: string
  precio: number
  cantidad: number
  cocina_id: string
  imagen_url: string | null
  personalizacion?: string
}

export interface UsuarioKiosko {
  authId: string
  nombre: string
  email: string
  clienteId: string | null
}

interface CarritoStore {
  items: ItemCarrito[]
  usuario: UsuarioKiosko | null
  agregar: (item: Omit<ItemCarrito, 'cantidad'>) => void
  quitar: (producto_id: string) => void
  incrementar: (producto_id: string) => void
  decrementar: (producto_id: string) => void
  limpiar: () => void
  setUsuario: (u: UsuarioKiosko | null) => void
  total: () => number
  totalItems: () => number
}

export const useCarrito = create<CarritoStore>((set, get) => ({
  items: [],
  usuario: null,

  agregar: (item) => {
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
    })
  },

  quitar: (producto_id) => {
    set((state) => ({ items: state.items.filter((i) => i.producto_id !== producto_id) }))
  },

  incrementar: (producto_id) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.producto_id === producto_id ? { ...i, cantidad: i.cantidad + 1 } : i,
      ),
    }))
  },

  decrementar: (producto_id) => {
    set((state) => ({
      items: state.items
        .map((i) => (i.producto_id === producto_id ? { ...i, cantidad: i.cantidad - 1 } : i))
        .filter((i) => i.cantidad > 0),
    }))
  },

  limpiar: () => set({ items: [], usuario: null }),

  setUsuario: (usuario) => set({ usuario }),

  total: () => get().items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),

  totalItems: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),
}))
