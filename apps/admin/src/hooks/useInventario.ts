import { useState, useCallback } from 'react'

export interface Almacen {
  id: string
  nombre: string
  tipo: 'central' | 'sucursal'
  sucursal_id: string | null
}

export interface Insumo {
  id: string
  nombre: string
  unidad: string
  costo_unitario: number
}

export interface StockItem {
  id: string
  almacen_id: string
  insumo_id: string
  stock_actual: number
  stock_minimo: number
}

export interface Lote {
  id: string
  insumo_id: string
  almacen_id: string
  numero_lote: string | null
  cantidad_inicial: number
  cantidad_actual: number
  costo_unitario: number | null
  fecha_vencimiento: string | null
}

export interface Merma {
  id: string
  insumo_id: string
  almacen_id: string
  lote_id: string | null
  cantidad: number
  tipo: 'vencimiento' | 'accidente' | 'calidad' | 'otro'
  notas: string | null
  created_at: string
}

export interface TransferenciaItem {
  insumo_id: string
  cantidad: number
}

export interface Transferencia {
  id: string
  origen_id: string
  destino_id: string
  estado: 'pendiente' | 'enviada' | 'recibida' | 'cancelada'
  notas: string | null
  created_at: string
  items: TransferenciaItem[]
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const ALMACENES_DEMO: Almacen[] = [
  { id: 'alm-1', nombre: 'Almacén Central', tipo: 'central', sucursal_id: null },
  { id: 'alm-2', nombre: 'Sucursal Principal', tipo: 'sucursal', sucursal_id: 'suc-1' },
]

const INSUMOS_DEMO: Insumo[] = [
  { id: 'ins-1', nombre: 'Pollo', unidad: 'kg', costo_unitario: 80 },
  { id: 'ins-2', nombre: 'Leche', unidad: 'litro', costo_unitario: 22 },
  { id: 'ins-3', nombre: 'Fresas', unidad: 'kg', costo_unitario: 45 },
  { id: 'ins-4', nombre: 'Café molido', unidad: 'kg', costo_unitario: 180 },
  { id: 'ins-5', nombre: 'Lechuga', unidad: 'pieza', costo_unitario: 8 },
  { id: 'ins-6', nombre: 'Tomate', unidad: 'kg', costo_unitario: 25 },
  { id: 'ins-7', nombre: 'Azúcar', unidad: 'kg', costo_unitario: 20 },
  { id: 'ins-8', nombre: 'Agua purificada', unidad: 'litro', costo_unitario: 5 },
]

const STOCK_DEMO: StockItem[] = [
  { id: 's1', insumo_id: 'ins-1', almacen_id: 'alm-1', stock_actual: 25.0, stock_minimo: 5.0 },
  { id: 's2', insumo_id: 'ins-1', almacen_id: 'alm-2', stock_actual: 8.0, stock_minimo: 2.0 },
  { id: 's3', insumo_id: 'ins-2', almacen_id: 'alm-1', stock_actual: 40.0, stock_minimo: 10.0 },
  { id: 's4', insumo_id: 'ins-2', almacen_id: 'alm-2', stock_actual: 3.0, stock_minimo: 4.0 },
  { id: 's5', insumo_id: 'ins-3', almacen_id: 'alm-1', stock_actual: 12.0, stock_minimo: 3.0 },
  { id: 's6', insumo_id: 'ins-3', almacen_id: 'alm-2', stock_actual: 0.5, stock_minimo: 2.0 },
  { id: 's7', insumo_id: 'ins-4', almacen_id: 'alm-1', stock_actual: 8.0, stock_minimo: 2.0 },
  { id: 's8', insumo_id: 'ins-4', almacen_id: 'alm-2', stock_actual: 1.8, stock_minimo: 0.5 },
  { id: 's9', insumo_id: 'ins-5', almacen_id: 'alm-1', stock_actual: 30, stock_minimo: 10 },
  { id: 's10', insumo_id: 'ins-5', almacen_id: 'alm-2', stock_actual: 4, stock_minimo: 5 },
  { id: 's11', insumo_id: 'ins-6', almacen_id: 'alm-1', stock_actual: 15.0, stock_minimo: 3.0 },
  { id: 's12', insumo_id: 'ins-6', almacen_id: 'alm-2', stock_actual: 3.5, stock_minimo: 2.0 },
  { id: 's13', insumo_id: 'ins-7', almacen_id: 'alm-1', stock_actual: 20.0, stock_minimo: 5.0 },
  { id: 's14', insumo_id: 'ins-7', almacen_id: 'alm-2', stock_actual: 5.0, stock_minimo: 2.0 },
  { id: 's15', insumo_id: 'ins-8', almacen_id: 'alm-1', stock_actual: 60.0, stock_minimo: 20.0 },
  { id: 's16', insumo_id: 'ins-8', almacen_id: 'alm-2', stock_actual: 18.0, stock_minimo: 10.0 },
]

const LOTES_DEMO: Lote[] = [
  { id: 'lot-1', insumo_id: 'ins-1', almacen_id: 'alm-1', numero_lote: 'L-2024-001', cantidad_inicial: 20, cantidad_actual: 15, costo_unitario: 78, fecha_vencimiento: '2026-05-28' },
  { id: 'lot-2', insumo_id: 'ins-3', almacen_id: 'alm-1', numero_lote: 'L-2024-002', cantidad_inicial: 10, cantidad_actual: 8, costo_unitario: 44, fecha_vencimiento: '2026-05-24' },
  { id: 'lot-3', insumo_id: 'ins-2', almacen_id: 'alm-2', numero_lote: null, cantidad_inicial: 12, cantidad_actual: 6, costo_unitario: 22, fecha_vencimiento: '2026-06-10' },
  { id: 'lot-4', insumo_id: 'ins-5', almacen_id: 'alm-1', numero_lote: 'L-2024-003', cantidad_inicial: 25, cantidad_actual: 20, costo_unitario: 8, fecha_vencimiento: '2026-05-20' },
  { id: 'lot-5', insumo_id: 'ins-4', almacen_id: 'alm-1', numero_lote: 'L-2024-004', cantidad_inicial: 5, cantidad_actual: 4.5, costo_unitario: 178, fecha_vencimiento: '2026-12-31' },
]

const MERMAS_DEMO: Merma[] = [
  { id: 'mer-1', insumo_id: 'ins-1', almacen_id: 'alm-2', lote_id: null, cantidad: 0.5, tipo: 'accidente', notas: 'Se cayó al suelo', created_at: '2026-05-20T10:00:00Z' },
  { id: 'mer-2', insumo_id: 'ins-5', almacen_id: 'alm-1', lote_id: 'lot-4', cantidad: 3, tipo: 'vencimiento', notas: 'Lote vencido', created_at: '2026-05-21T09:00:00Z' },
  { id: 'mer-3', insumo_id: 'ins-3', almacen_id: 'alm-2', lote_id: null, cantidad: 0.3, tipo: 'calidad', notas: 'Producto en mal estado', created_at: '2026-05-22T08:30:00Z' },
]

const TRANSFERENCIAS_DEMO: Transferencia[] = [
  { id: 'tr-1', origen_id: 'alm-1', destino_id: 'alm-2', estado: 'recibida', notas: 'Abastecimiento semanal', created_at: '2026-05-19T10:00:00Z', items: [{ insumo_id: 'ins-1', cantidad: 5 }, { insumo_id: 'ins-2', cantidad: 8 }] },
  { id: 'tr-2', origen_id: 'alm-1', destino_id: 'alm-2', estado: 'enviada', notas: null, created_at: '2026-05-22T09:00:00Z', items: [{ insumo_id: 'ins-3', cantidad: 3 }, { insumo_id: 'ins-5', cantidad: 10 }] },
  { id: 'tr-3', origen_id: 'alm-1', destino_id: 'alm-2', estado: 'pendiente', notas: null, created_at: '2026-05-22T11:00:00Z', items: [{ insumo_id: 'ins-2', cantidad: 6 }] },
]

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInventario() {
  const [almacenes] = useState<Almacen[]>(ALMACENES_DEMO)
  const [insumos, setInsumos] = useState<Insumo[]>(INSUMOS_DEMO)
  const [stock, setStock] = useState<StockItem[]>(STOCK_DEMO)
  const [lotes, setLotes] = useState<Lote[]>(LOTES_DEMO)
  const [mermas, setMermas] = useState<Merma[]>(MERMAS_DEMO)
  const [transferencias, setTransferencias] = useState<Transferencia[]>(TRANSFERENCIAS_DEMO)

  // ── Insumos ──
  const agregarInsumo = useCallback((data: Omit<Insumo, 'id'>) => {
    const nuevo: Insumo = { ...data, id: `ins-${Date.now()}` }
    setInsumos((prev) => [...prev, nuevo])
    // Add empty stock entries for each almacen
    setStock((prev) => [
      ...prev,
      ...ALMACENES_DEMO.map((a, i) => ({
        id: `s-${Date.now()}-${i}`,
        insumo_id: nuevo.id,
        almacen_id: a.id,
        stock_actual: 0,
        stock_minimo: 0,
      })),
    ])
    return nuevo
  }, [])

  const editarInsumo = useCallback((id: string, data: Omit<Insumo, 'id'>) => {
    setInsumos((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)))
  }, [])

  const borrarInsumo = useCallback((id: string) => {
    setInsumos((prev) => prev.filter((i) => i.id !== id))
    setStock((prev) => prev.filter((s) => s.insumo_id !== id))
  }, [])

  // ── Stock ──
  const ajustarStock = useCallback((insumoId: string, almacenId: string, cantidad: number) => {
    setStock((prev) =>
      prev.map((s) =>
        s.insumo_id === insumoId && s.almacen_id === almacenId
          ? { ...s, stock_actual: Math.max(0, cantidad) }
          : s,
      ),
    )
  }, [])

  // ── Lotes ──
  const agregarLote = useCallback((data: Omit<Lote, 'id'>) => {
    const nuevo: Lote = { ...data, id: `lot-${Date.now()}` }
    setLotes((prev) => [...prev, nuevo])
    return nuevo
  }, [])

  const borrarLote = useCallback((id: string) => {
    setLotes((prev) => prev.filter((l) => l.id !== id))
  }, [])

  // ── Mermas ──
  const registrarMerma = useCallback((data: Omit<Merma, 'id' | 'created_at'>) => {
    const nueva: Merma = { ...data, id: `mer-${Date.now()}`, created_at: new Date().toISOString() }
    setMermas((prev) => [nueva, ...prev])
    // Deduct from stock
    setStock((prev) =>
      prev.map((s) =>
        s.insumo_id === data.insumo_id && s.almacen_id === data.almacen_id
          ? { ...s, stock_actual: Math.max(0, s.stock_actual - data.cantidad) }
          : s,
      ),
    )
    return nueva
  }, [])

  // ── Transferencias ──
  const crearTransferencia = useCallback(
    (origenId: string, destinoId: string, items: TransferenciaItem[], notas: string) => {
      const nueva: Transferencia = {
        id: `tr-${Date.now()}`,
        origen_id: origenId,
        destino_id: destinoId,
        estado: 'pendiente',
        notas: notas || null,
        created_at: new Date().toISOString(),
        items,
      }
      setTransferencias((prev) => [nueva, ...prev])
      return nueva
    },
    [],
  )

  const cambiarEstadoTransferencia = useCallback(
    (id: string, estado: Transferencia['estado']) => {
      setTransferencias((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t
          // When received, update stock
          if (estado === 'recibida') {
            setStock((prevStock) => {
              let updated = [...prevStock]
              t.items.forEach((item) => {
                updated = updated.map((s) => {
                  if (s.insumo_id === item.insumo_id && s.almacen_id === t.origen_id)
                    return { ...s, stock_actual: Math.max(0, s.stock_actual - item.cantidad) }
                  if (s.insumo_id === item.insumo_id && s.almacen_id === t.destino_id)
                    return { ...s, stock_actual: s.stock_actual + item.cantidad }
                  return s
                })
              })
              return updated
            })
          }
          return { ...t, estado }
        }),
      )
    },
    [],
  )

  // ── Helpers ──
  const getStockInsumo = useCallback(
    (insumoId: string, almacenId?: string): StockItem[] =>
      stock.filter(
        (s) => s.insumo_id === insumoId && (!almacenId || s.almacen_id === almacenId),
      ),
    [stock],
  )

  const alertasStock = stock.filter((s) => s.stock_actual <= s.stock_minimo)

  const lotesVencidos = lotes.filter(
    (l) => l.fecha_vencimiento && new Date(l.fecha_vencimiento) < new Date(),
  )
  const lotesPorVencer = lotes.filter((l) => {
    if (!l.fecha_vencimiento) return false
    const dias = (new Date(l.fecha_vencimiento).getTime() - Date.now()) / 86400000
    return dias >= 0 && dias <= 7
  })

  return {
    almacenes,
    insumos,
    stock,
    lotes,
    mermas,
    transferencias,
    alertasStock,
    lotesVencidos,
    lotesPorVencer,
    agregarInsumo,
    editarInsumo,
    borrarInsumo,
    ajustarStock,
    agregarLote,
    borrarLote,
    registrarMerma,
    crearTransferencia,
    cambiarEstadoTransferencia,
    getStockInsumo,
  }
}
