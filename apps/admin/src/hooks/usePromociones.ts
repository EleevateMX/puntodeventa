import { useState, useEffect, useCallback } from 'react'
import {
  isSupabaseConfigured,
  getPromociones,
  crearPromocionDB,
  actualizarPromocionDB,
  eliminarPromocionDB,
  toggleActivaPromocionDB,
} from '@pos/supabase'

export type TipoPromocion =
  | 'descuento_porcentaje'
  | 'descuento_monto'
  | 'combo'
  | 'segunda_unidad'
  | 'regalo'

export type AplicaA = 'todo' | 'categoria' | 'producto'

export interface Promocion {
  id: string
  nombre: string
  descripcion: string | null
  tipo: TipoPromocion
  valor: number
  codigo: string | null
  activa: boolean
  aplica_a: AplicaA
  referencia_id: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
  horas_inicio: string | null
  horas_fin: string | null
}

export interface PromocionInput {
  nombre: string
  descripcion: string | null
  tipo: TipoPromocion
  valor: number
  codigo: string | null
  activa: boolean
  aplica_a: AplicaA
  referencia_id: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
  horas_inicio: string | null
  horas_fin: string | null
}

// ── Demo data ──────────────────────────────────────────────────────────────────

const HACE_UN_MES = (() => {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 10)
})()

export const DEMO_PROMOCIONES: Promocion[] = [
  { id: 'pr-1', nombre: 'FRESH15', descripcion: '15% en toda tu orden', tipo: 'descuento_porcentaje', valor: 15, codigo: 'FRESH15', activa: true, aplica_a: 'todo', referencia_id: null, fecha_inicio: null, fecha_fin: null, horas_inicio: null, horas_fin: null },
  { id: 'pr-2', nombre: 'Happy Hour Café', descripcion: '10% off en cafés de 4 a 6 PM', tipo: 'descuento_porcentaje', valor: 10, codigo: null, activa: true, aplica_a: 'categoria', referencia_id: null, fecha_inicio: null, fecha_fin: null, horas_inicio: '16:00', horas_fin: '18:00' },
  { id: 'pr-3', nombre: 'Bowl Power Combo', descripcion: '$20 off si llevas un Bowl + un Shake', tipo: 'combo', valor: 20, codigo: null, activa: true, aplica_a: 'todo', referencia_id: null, fecha_inicio: null, fecha_fin: null, horas_inicio: null, horas_fin: null },
  { id: 'pr-4', nombre: 'Segunda al 2x1', descripcion: 'La segunda Shake al 50%', tipo: 'segunda_unidad', valor: 50, codigo: null, activa: true, aplica_a: 'todo', referencia_id: null, fecha_inicio: null, fecha_fin: null, horas_inicio: null, horas_fin: null },
  { id: 'pr-5', nombre: 'BIENVENIDA', descripcion: '$50 de descuento en tu primera orden', tipo: 'descuento_monto', valor: 50, codigo: 'BIENVENIDA', activa: true, aplica_a: 'todo', referencia_id: null, fecha_inicio: null, fecha_fin: null, horas_inicio: null, horas_fin: null },
  { id: 'pr-6', nombre: 'MEGADESCUENTO', descripcion: '30% en todo — en pausa', tipo: 'descuento_porcentaje', valor: 30, codigo: 'MEGADESCUENTO', activa: false, aplica_a: 'todo', referencia_id: null, fecha_inicio: null, fecha_fin: null, horas_inicio: null, horas_fin: null },
  { id: 'pr-7', nombre: 'Combo Snack', descripcion: '$15 off en snacks — promo de temporada', tipo: 'descuento_monto', valor: 15, codigo: null, activa: true, aplica_a: 'categoria', referencia_id: null, fecha_inicio: null, fecha_fin: HACE_UN_MES, horas_inicio: null, horas_fin: null },
  { id: 'pr-8', nombre: 'Lunes de Mango', descripcion: '20% en Shake de Mango todos los lunes', tipo: 'descuento_porcentaje', valor: 20, codigo: null, activa: true, aplica_a: 'producto', referencia_id: null, fecha_inicio: null, fecha_fin: null, horas_inicio: null, horas_fin: null },
]

// ── Helper ─────────────────────────────────────────────────────────────────────

const usarDemo = () => !isSupabaseConfigured || localStorage.getItem('shake-demo-mode') === 'true'

function rowToPromocion(r: { id: string; nombre: string; descripcion: string | null; tipo: string; valor: number | null; codigo: string | null; activa: boolean; aplica_a: string | null; referencia_id: string | null; fecha_inicio: string | null; fecha_fin: string | null; horas_inicio: string | null; horas_fin: string | null }): Promocion {
  return {
    id: r.id,
    nombre: r.nombre,
    descripcion: r.descripcion,
    tipo: r.tipo as TipoPromocion,
    valor: r.valor ?? 0,
    codigo: r.codigo,
    activa: r.activa,
    aplica_a: (r.aplica_a as AplicaA) ?? 'todo',
    referencia_id: r.referencia_id,
    fecha_inicio: r.fecha_inicio,
    fecha_fin: r.fecha_fin,
    horas_inicio: r.horas_inicio,
    horas_fin: r.horas_fin,
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function usePromociones() {
  const demo = usarDemo()
  const [promociones, setPromociones] = useState<Promocion[]>(demo ? DEMO_PROMOCIONES : [])
  const [loading, setLoading] = useState(!demo)

  const cargar = useCallback(async () => {
    if (demo) return
    try {
      const rows = await getPromociones()
      setPromociones(rows.map(rowToPromocion))
    } catch (err) {
      console.error('Error cargando promociones:', err)
      setPromociones(DEMO_PROMOCIONES)
    } finally {
      setLoading(false)
    }
  }, [demo])

  useEffect(() => { cargar() }, [cargar])

  const agregarPromocion = useCallback(async (input: PromocionInput) => {
    if (demo) {
      const nueva: Promocion = { ...input, id: `pr-${Math.random().toString(36).slice(2, 10)}` }
      setPromociones((prev) => [...prev, nueva])
      return
    }
    const row = await crearPromocionDB(input)
    setPromociones((prev) => [...prev, rowToPromocion(row)])
  }, [demo])

  const editarPromocion = useCallback(async (id: string, input: PromocionInput) => {
    if (!demo) await actualizarPromocionDB(id, input)
    setPromociones((prev) => prev.map((p) => (p.id === id ? { ...p, ...input } : p)))
  }, [demo])

  const borrarPromocion = useCallback(async (id: string) => {
    if (!demo) await eliminarPromocionDB(id)
    setPromociones((prev) => prev.filter((p) => p.id !== id))
  }, [demo])

  const toggleActivaPromocion = useCallback(async (id: string) => {
    const promo = promociones.find((p) => p.id === id)
    if (!promo) return
    const next = !promo.activa
    if (!demo) await toggleActivaPromocionDB(id, next)
    setPromociones((prev) => prev.map((p) => (p.id === id ? { ...p, activa: next } : p)))
  }, [demo, promociones])

  return {
    loading,
    demo,
    promociones,
    isSupabaseConfigured: Boolean(isSupabaseConfigured),
    agregarPromocion,
    editarPromocion,
    borrarPromocion,
    toggleActivaPromocion,
  }
}

// ── Pure evaluator (unchanged) ─────────────────────────────────────────────────

export interface ItemEvaluable {
  producto_id: string
  categoria_id: string
  precio: number
  cantidad: number
  nombre: string
}

export interface PromoAplicada {
  promo: Promocion
  descuento: number
  razon: string
}

interface EvaluarOpciones {
  codigoIngresado?: string
  ahora?: Date
}

function dentroDeFechas(promo: Promocion, ahora: Date): boolean {
  if (promo.fecha_inicio && ahora < new Date(promo.fecha_inicio)) return false
  if (promo.fecha_fin) {
    const fin = new Date(promo.fecha_fin)
    fin.setHours(23, 59, 59, 999)
    if (ahora > fin) return false
  }
  return true
}

function dentroDeHoras(promo: Promocion, ahora: Date): boolean {
  if (!promo.horas_inicio || !promo.horas_fin) return true
  const [hi, mi] = promo.horas_inicio.split(':').map(Number)
  const [hf, mf] = promo.horas_fin.split(':').map(Number)
  const minutos = ahora.getHours() * 60 + ahora.getMinutes()
  const inicio = (hi ?? 0) * 60 + (mi ?? 0)
  const fin = (hf ?? 0) * 60 + (mf ?? 0)
  if (inicio <= fin) return minutos >= inicio && minutos <= fin
  return minutos >= inicio || minutos <= fin
}

function itemsAplicables(items: ItemEvaluable[], promo: Promocion): ItemEvaluable[] {
  if (promo.aplica_a === 'todo') return items
  if (promo.aplica_a === 'categoria') return items.filter((i) => i.categoria_id === promo.referencia_id)
  return items.filter((i) => i.producto_id === promo.referencia_id)
}

export function evaluarPromociones(
  items: ItemEvaluable[],
  promos: Promocion[],
  options: EvaluarOpciones = {},
): PromoAplicada[] {
  const ahora = options.ahora ?? new Date()
  const codigo = (options.codigoIngresado ?? '').trim().toUpperCase()
  const resultado: PromoAplicada[] = []
  if (items.length === 0) return resultado

  for (const promo of promos) {
    if (!promo.activa) continue
    if (!dentroDeFechas(promo, ahora)) continue
    if (!dentroDeHoras(promo, ahora)) continue
    if (promo.codigo && (!codigo || codigo !== promo.codigo.trim().toUpperCase())) continue

    const aplicables = itemsAplicables(items, promo)
    if (aplicables.length === 0 && promo.tipo !== 'combo') continue

    const subtotalAplicable = aplicables.reduce((sum, i) => sum + i.precio * i.cantidad, 0)
    let descuento = 0
    let razon = ''

    switch (promo.tipo) {
      case 'descuento_porcentaje': {
        descuento = subtotalAplicable * (promo.valor / 100)
        razon = promo.aplica_a === 'todo' ? `${promo.valor}% en la orden` : `${promo.valor}% en productos elegibles`
        break
      }
      case 'descuento_monto': {
        descuento = Math.min(promo.valor, subtotalAplicable)
        razon = `−$${promo.valor.toFixed(2)} aplicado`
        break
      }
      case 'segunda_unidad': {
        let bonus = 0
        for (const it of aplicables) {
          const pares = Math.floor(it.cantidad / 2)
          if (pares > 0) bonus += pares * it.precio * (promo.valor / 100)
        }
        if (bonus <= 0) continue
        descuento = bonus
        razon = `${promo.valor}% en la 2ª unidad`
        break
      }
      case 'combo': {
        const tieneBowl = items.some((i) => i.nombre.toLowerCase().includes('bowl'))
        const tieneShake = items.some((i) => i.nombre.toLowerCase().includes('shake'))
        if (!tieneBowl || !tieneShake) continue
        const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0)
        descuento = Math.min(promo.valor, subtotal)
        razon = 'Combo Bowl + Shake'
        break
      }
      case 'regalo': {
        if (aplicables.length === 0) continue
        const masBarato = aplicables.reduce((min, i) => (i.precio < min.precio ? i : min), aplicables[0]!)
        descuento = masBarato.precio
        razon = `🎁 ${masBarato.nombre} de cortesía`
        break
      }
    }

    if (descuento > 0) {
      resultado.push({ promo, descuento: Math.round(descuento * 100) / 100, razon })
    }
  }

  return resultado
}
