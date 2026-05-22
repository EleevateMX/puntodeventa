import { useState, useEffect, useCallback } from 'react'
import {
  isSupabaseConfigured,
  getAlmacenes, getInsumos, getStock, getLotes, getMermas, getTransferencias,
  crearInsumo as crearInsumoDB,
  actualizarInsumo as actualizarInsumoDB,
  eliminarInsumo as eliminarInsumoDB,
  upsertStock,
  crearLote as crearLoteDB,
  eliminarLote as eliminarLoteDB,
  registrarMermaDB,
  crearTransferenciaDB,
  cambiarEstadoTransferenciaDB,
} from '@pos/supabase'

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

// ─── Demo data ─────────────────────────────────────────────────────────────────

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
  { id: 's1', insumo_id: 'ins-1', almacen_id: 'alm-1', stock_actual: 25, stock_minimo: 5 },
  { id: 's2', insumo_id: 'ins-1', almacen_id: 'alm-2', stock_actual: 8, stock_minimo: 2 },
  { id: 's3', insumo_id: 'ins-2', almacen_id: 'alm-1', stock_actual: 40, stock_minimo: 10 },
  { id: 's4', insumo_id: 'ins-2', almacen_id: 'alm-2', stock_actual: 3, stock_minimo: 4 },
  { id: 's5', insumo_id: 'ins-3', almacen_id: 'alm-1', stock_actual: 12, stock_minimo: 3 },
  { id: 's6', insumo_id: 'ins-3', almacen_id: 'alm-2', stock_actual: 0.5, stock_minimo: 2 },
  { id: 's7', insumo_id: 'ins-4', almacen_id: 'alm-1', stock_actual: 8, stock_minimo: 2 },
  { id: 's8', insumo_id: 'ins-4', almacen_id: 'alm-2', stock_actual: 1.8, stock_minimo: 0.5 },
  { id: 's9', insumo_id: 'ins-5', almacen_id: 'alm-1', stock_actual: 30, stock_minimo: 10 },
  { id: 's10', insumo_id: 'ins-5', almacen_id: 'alm-2', stock_actual: 4, stock_minimo: 5 },
  { id: 's11', insumo_id: 'ins-6', almacen_id: 'alm-1', stock_actual: 15, stock_minimo: 3 },
  { id: 's12', insumo_id: 'ins-6', almacen_id: 'alm-2', stock_actual: 3.5, stock_minimo: 2 },
  { id: 's13', insumo_id: 'ins-7', almacen_id: 'alm-1', stock_actual: 20, stock_minimo: 5 },
  { id: 's14', insumo_id: 'ins-7', almacen_id: 'alm-2', stock_actual: 5, stock_minimo: 2 },
  { id: 's15', insumo_id: 'ins-8', almacen_id: 'alm-1', stock_actual: 60, stock_minimo: 20 },
  { id: 's16', insumo_id: 'ins-8', almacen_id: 'alm-2', stock_actual: 18, stock_minimo: 10 },
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

// ─── Hook ──────────────────────────────────────────────────────────────────────

const usarDemo = () => !isSupabaseConfigured || localStorage.getItem('shake-demo-mode') === 'true'

export function useInventario() {
  const demo = usarDemo()

  const [loading, setLoading] = useState(!demo)
  const [almacenes, setAlmacenes] = useState<Almacen[]>(demo ? ALMACENES_DEMO : [])
  const [insumos, setInsumos] = useState<Insumo[]>(demo ? INSUMOS_DEMO : [])
  const [stock, setStock] = useState<StockItem[]>(demo ? STOCK_DEMO : [])
  const [lotes, setLotes] = useState<Lote[]>(demo ? LOTES_DEMO : [])
  const [mermas, setMermas] = useState<Merma[]>(demo ? MERMAS_DEMO : [])
  const [transferencias, setTransferencias] = useState<Transferencia[]>(demo ? TRANSFERENCIAS_DEMO : [])

  const cargar = useCallback(async () => {
    if (demo) return
    try {
      const [alms, ins, stk, lts, mrm, trn] = await Promise.all([
        getAlmacenes(), getInsumos(), getStock(), getLotes(), getMermas(), getTransferencias(),
      ])
      setAlmacenes(alms.map((a) => ({ id: a.id, nombre: a.nombre, tipo: a.tipo as Almacen['tipo'], sucursal_id: a.sucursal_id })))
      setInsumos(ins.map((i) => ({ id: i.id, nombre: i.nombre, unidad: i.unidad, costo_unitario: Number(i.costo_unitario) })))
      setStock(stk.map((s) => ({ id: s.id, almacen_id: s.almacen_id, insumo_id: s.insumo_id, stock_actual: Number(s.stock_actual), stock_minimo: Number(s.stock_minimo) })))
      setLotes(lts.map((l) => ({ id: l.id, insumo_id: l.insumo_id, almacen_id: l.almacen_id, numero_lote: l.numero_lote, cantidad_inicial: Number(l.cantidad_inicial), cantidad_actual: Number(l.cantidad_actual), costo_unitario: l.costo_unitario !== null ? Number(l.costo_unitario) : null, fecha_vencimiento: l.fecha_vencimiento })))
      setMermas(mrm.map((m) => ({ id: m.id, insumo_id: m.insumo_id, almacen_id: m.almacen_id, lote_id: m.lote_id, cantidad: Number(m.cantidad), tipo: m.tipo as Merma['tipo'], notas: m.notas, created_at: m.created_at })))
      setTransferencias(trn.map((t) => ({ id: t.id, origen_id: t.origen_id, destino_id: t.destino_id, estado: t.estado as Transferencia['estado'], notas: t.notas, created_at: t.created_at, items: t.items.map((i) => ({ insumo_id: i.insumo_id, cantidad: Number(i.cantidad) })) })))
    } catch (err) {
      console.error('Error cargando inventario:', err)
    } finally {
      setLoading(false)
    }
  }, [demo])

  useEffect(() => { cargar() }, [cargar])

  // ── Insumos ──

  const agregarInsumo = useCallback(async (data: Omit<Insumo, 'id'>) => {
    if (demo) {
      const nuevo: Insumo = { ...data, id: `ins-${Date.now()}` }
      setInsumos((prev) => [...prev, nuevo])
      setStock((prev) => [
        ...prev,
        ...ALMACENES_DEMO.map((a, i) => ({ id: `s-${Date.now()}-${i}`, insumo_id: nuevo.id, almacen_id: a.id, stock_actual: 0, stock_minimo: 0 })),
      ])
      return nuevo
    }
    const row = await crearInsumoDB(data)
    const nuevo: Insumo = { id: row.id, nombre: row.nombre, unidad: row.unidad, costo_unitario: Number(row.costo_unitario) }
    setInsumos((prev) => [...prev, nuevo])
    // Create empty stock rows for each warehouse
    await Promise.allSettled(almacenes.map((a) => upsertStock(a.id, nuevo.id, 0, 0)))
    const nuevosStock = almacenes.map((a, i) => ({ id: `tmp-${i}`, insumo_id: nuevo.id, almacen_id: a.id, stock_actual: 0, stock_minimo: 0 }))
    setStock((prev) => [...prev, ...nuevosStock])
    return nuevo
  }, [demo, almacenes])

  const editarInsumo = useCallback(async (id: string, data: Omit<Insumo, 'id'>) => {
    if (!demo) await actualizarInsumoDB(id, data)
    setInsumos((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)))
  }, [demo])

  const borrarInsumo = useCallback(async (id: string) => {
    if (!demo) await eliminarInsumoDB(id)
    setInsumos((prev) => prev.filter((i) => i.id !== id))
    setStock((prev) => prev.filter((s) => s.insumo_id !== id))
  }, [demo])

  // ── Stock ──

  const ajustarStock = useCallback(async (insumoId: string, almacenId: string, cantidad: number) => {
    const valor = Math.max(0, cantidad)
    if (!demo) await upsertStock(almacenId, insumoId, valor)
    setStock((prev) =>
      prev.map((s) =>
        s.insumo_id === insumoId && s.almacen_id === almacenId ? { ...s, stock_actual: valor } : s,
      ),
    )
  }, [demo])

  // ── Lotes ──

  const agregarLote = useCallback(async (data: Omit<Lote, 'id'>) => {
    if (demo) {
      const nuevo: Lote = { ...data, id: `lot-${Date.now()}` }
      setLotes((prev) => [...prev, nuevo])
      return nuevo
    }
    const row = await crearLoteDB(data)
    const nuevo: Lote = { id: row.id, insumo_id: row.insumo_id, almacen_id: row.almacen_id, numero_lote: row.numero_lote, cantidad_inicial: Number(row.cantidad_inicial), cantidad_actual: Number(row.cantidad_actual), costo_unitario: row.costo_unitario !== null ? Number(row.costo_unitario) : null, fecha_vencimiento: row.fecha_vencimiento }
    setLotes((prev) => [...prev, nuevo])
    return nuevo
  }, [demo])

  const borrarLote = useCallback(async (id: string) => {
    if (!demo) await eliminarLoteDB(id)
    setLotes((prev) => prev.filter((l) => l.id !== id))
  }, [demo])

  // ── Mermas ──

  const registrarMerma = useCallback(async (data: Omit<Merma, 'id' | 'created_at'>) => {
    if (demo) {
      const nueva: Merma = { ...data, id: `mer-${Date.now()}`, created_at: new Date().toISOString() }
      setMermas((prev) => [nueva, ...prev])
      setStock((prev) =>
        prev.map((s) =>
          s.insumo_id === data.insumo_id && s.almacen_id === data.almacen_id
            ? { ...s, stock_actual: Math.max(0, s.stock_actual - data.cantidad) }
            : s,
        ),
      )
      return nueva
    }
    const row = await registrarMermaDB(data)
    const nueva: Merma = { id: row.id, insumo_id: row.insumo_id, almacen_id: row.almacen_id, lote_id: row.lote_id, cantidad: Number(row.cantidad), tipo: row.tipo as Merma['tipo'], notas: row.notas, created_at: row.created_at }
    setMermas((prev) => [nueva, ...prev])
    setStock((prev) =>
      prev.map((s) =>
        s.insumo_id === data.insumo_id && s.almacen_id === data.almacen_id
          ? { ...s, stock_actual: Math.max(0, s.stock_actual - data.cantidad) }
          : s,
      ),
    )
    return nueva
  }, [demo])

  // ── Transferencias ──

  const crearTransferencia = useCallback(async (
    origenId: string,
    destinoId: string,
    items: TransferenciaItem[],
    notas: string,
  ) => {
    if (demo) {
      const nueva: Transferencia = { id: `tr-${Date.now()}`, origen_id: origenId, destino_id: destinoId, estado: 'pendiente', notas: notas || null, created_at: new Date().toISOString(), items }
      setTransferencias((prev) => [nueva, ...prev])
      return nueva
    }
    const result = await crearTransferenciaDB(origenId, destinoId, items, notas)
    const nueva: Transferencia = { id: result.id, origen_id: result.origen_id, destino_id: result.destino_id, estado: result.estado as Transferencia['estado'], notas: result.notas, created_at: result.created_at, items }
    setTransferencias((prev) => [nueva, ...prev])
    return nueva
  }, [demo])

  const cambiarEstadoTransferencia = useCallback(async (id: string, estado: Transferencia['estado']) => {
    if (!demo) await cambiarEstadoTransferenciaDB(id, estado)
    setTransferencias((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
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
            // Sync stock changes to DB
            if (!demo) {
              t.items.forEach((item) => {
                const src = updated.find((s) => s.insumo_id === item.insumo_id && s.almacen_id === t.origen_id)
                const dst = updated.find((s) => s.insumo_id === item.insumo_id && s.almacen_id === t.destino_id)
                if (src) upsertStock(t.origen_id, item.insumo_id, src.stock_actual).catch(console.error)
                if (dst) upsertStock(t.destino_id, item.insumo_id, dst.stock_actual).catch(console.error)
              })
            }
            return updated
          })
        }
        return { ...t, estado }
      }),
    )
  }, [demo])

  // ── Helpers ──

  const getStockInsumo = useCallback(
    (insumoId: string, almacenId?: string): StockItem[] =>
      stock.filter((s) => s.insumo_id === insumoId && (!almacenId || s.almacen_id === almacenId)),
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
    loading,
    demo,
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
