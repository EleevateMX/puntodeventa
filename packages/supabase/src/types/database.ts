export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type CocinaSlug = 'alimentos' | 'bebidas'
export type EstadoOrden = 'pendiente' | 'en_preparacion' | 'lista' | 'entregada' | 'cancelada'
export type MetodoPago = 'mercado_pago' | 'efectivo'
export type RolUsuario = 'admin' | 'cocina' | 'cajero'
export type TipoMovimiento = 'venta' | 'ajuste_manual' | 'compra'

export interface Database {
  public: {
    Tables: {
      cocinas: {
        Row: { id: string; nombre: string; slug: CocinaSlug }
        Insert: { id?: string; nombre: string; slug: CocinaSlug }
        Update: { id?: string; nombre?: string; slug?: CocinaSlug }
      }
      categorias: {
        Row: { id: string; nombre: string; cocina_id: string; activa: boolean }
        Insert: { id?: string; nombre: string; cocina_id: string; activa?: boolean }
        Update: { id?: string; nombre?: string; cocina_id?: string; activa?: boolean }
      }
      insumos: {
        Row: {
          id: string; nombre: string; unidad: string
          stock_actual: number; stock_minimo: number; costo_unitario: number
        }
        Insert: {
          id?: string; nombre: string; unidad: string
          stock_actual?: number; stock_minimo?: number; costo_unitario?: number
        }
        Update: {
          id?: string; nombre?: string; unidad?: string
          stock_actual?: number; stock_minimo?: number; costo_unitario?: number
        }
      }
      productos: {
        Row: {
          id: string; nombre: string; descripcion: string | null
          precio: number; imagen_url: string | null; categoria_id: string; activo: boolean
        }
        Insert: {
          id?: string; nombre: string; descripcion?: string | null
          precio: number; imagen_url?: string | null; categoria_id: string; activo?: boolean
        }
        Update: {
          id?: string; nombre?: string; descripcion?: string | null
          precio?: number; imagen_url?: string | null; categoria_id?: string; activo?: boolean
        }
      }
      recetas: {
        Row: { id: string; producto_id: string; insumo_id: string; cantidad: number }
        Insert: { id?: string; producto_id: string; insumo_id: string; cantidad: number }
        Update: { id?: string; producto_id?: string; insumo_id?: string; cantidad?: number }
      }
      ordenes: {
        Row: {
          id: string; folio: number; estado: EstadoOrden; total: number
          metodo_pago: MetodoPago | null; pagado: boolean
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; folio?: number; estado?: EstadoOrden; total: number
          metodo_pago?: MetodoPago | null; pagado?: boolean
          created_at?: string; updated_at?: string
        }
        Update: {
          id?: string; folio?: number; estado?: EstadoOrden; total?: number
          metodo_pago?: MetodoPago | null; pagado?: boolean
          created_at?: string; updated_at?: string
        }
      }
      orden_items: {
        Row: {
          id: string; orden_id: string; producto_id: string; cantidad: number
          precio_unitario: number; personalizacion: string | null; cocina_id: string
        }
        Insert: {
          id?: string; orden_id: string; producto_id: string; cantidad: number
          precio_unitario: number; personalizacion?: string | null; cocina_id: string
        }
        Update: {
          id?: string; orden_id?: string; producto_id?: string; cantidad?: number
          precio_unitario?: number; personalizacion?: string | null; cocina_id?: string
        }
      }
      inventario_movimientos: {
        Row: {
          id: string; insumo_id: string; cantidad: number
          tipo: TipoMovimiento; referencia_id: string | null; created_at: string
        }
        Insert: {
          id?: string; insumo_id: string; cantidad: number
          tipo: TipoMovimiento; referencia_id?: string | null; created_at?: string
        }
        Update: {
          id?: string; insumo_id?: string; cantidad?: number
          tipo?: TipoMovimiento; referencia_id?: string | null; created_at?: string
        }
      }
      ventas: {
        Row: {
          id: string; orden_id: string; total: number; metodo_pago: MetodoPago
          cfdi_solicitado: boolean; facturapi_id: string | null; created_at: string
        }
        Insert: {
          id?: string; orden_id: string; total: number; metodo_pago: MetodoPago
          cfdi_solicitado?: boolean; facturapi_id?: string | null; created_at?: string
        }
        Update: {
          id?: string; orden_id?: string; total?: number; metodo_pago?: MetodoPago
          cfdi_solicitado?: boolean; facturapi_id?: string | null; created_at?: string
        }
      }
      usuarios: {
        Row: { id: string; nombre: string; email: string; rol: RolUsuario }
        Insert: { id?: string; nombre: string; email: string; rol?: RolUsuario }
        Update: { id?: string; nombre?: string; email?: string; rol?: RolUsuario }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
