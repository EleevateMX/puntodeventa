/// <reference types="vite/client" />
import { useState } from 'react'

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

const isSupabaseConfigured =
  import.meta.env.VITE_SUPABASE_URL &&
  !String(import.meta.env.VITE_SUPABASE_URL).includes('xxxx')

// ── Demo data ──────────────────────────────────────────────────────────────
// Hardcoded ids used for demo references (match the Caja demo data).
const DEMO_CAT_CAFE = 'cat-4'
const DEMO_CAT_SNACKS = 'cat-2'
const DEMO_PROD_SHAKE_MANGO = 'p7'

// One year ago for the expired promo
const HACE_UN_MES = (() => {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 10)
})()

export const DEMO_PROMOCIONES: Promocion[] = [
  {
    id: 'pr-1',
    nombre: 'FRESH15',
    descripcion: '15% en toda tu orden — usa el código al pagar',
    tipo: 'descuento_porcentaje',
    valor: 15,
    codigo: 'FRESH15',
    activa: true,
    aplica_a: 'todo',
    referencia_id: null,
    fecha_inicio: null,
    fecha_fin: null,
    horas_inicio: null,
    horas_fin: null,
  },
  {
    id: 'pr-2',
    nombre: 'Happy Hour Café',
    descripcion: '10% off en cafés de 4 a 6 PM — porque el bajón existe',
    tipo: 'descuento_porcentaje',
    valor: 10,
    codigo: null,
    activa: true,
    aplica_a: 'categoria',
    referencia_id: DEMO_CAT_CAFE,
    fecha_inicio: null,
    fecha_fin: null,
    horas_inicio: '16:00',
    horas_fin: '18:00',
  },
  {
    id: 'pr-3',
    nombre: 'Bowl Power Combo',
    descripcion: '$20 off si llevas un Bowl + un Shake',
    tipo: 'combo',
    valor: 20,
    codigo: null,
    activa: true,
    aplica_a: 'todo',
    referencia_id: null,
    fecha_inicio: null,
    fecha_fin: null,
    horas_inicio: null,
    horas_fin: null,
  },
  {
    id: 'pr-4',
    nombre: 'Segunda al 2x1',
    descripcion: 'La segunda Shake al 50% — comparte la vibra',
    tipo: 'segunda_unidad',
    valor: 50,
    codigo: null,
    activa: true,
    aplica_a: 'todo',
    referencia_id: null,
    fecha_inicio: null,
    fecha_fin: null,
    horas_inicio: null,
    horas_fin: null,
  },
  {
    id: 'pr-5',
    nombre: 'BIENVENIDA',
    descripcion: '$50 de descuento en tu primera orden',
    tipo: 'descuento_monto',
    valor: 50,
    codigo: 'BIENVENIDA',
    activa: true,
    aplica_a: 'todo',
    referencia_id: null,
    fecha_inicio: null,
    fecha_fin: null,
    horas_inicio: null,
    horas_fin: null,
  },
  {
    id: 'pr-6',
    nombre: 'MEGADESCUENTO',
    descripcion: '30% en todo — promo guardada en pausa',
    tipo: 'descuento_porcentaje',
    valor: 30,
    codigo: 'MEGADESCUENTO',
    activa: false,
    aplica_a: 'todo',
    referencia_id: null,
    fecha_inicio: null,
    fecha_fin: null,
    horas_inicio: null,
    horas_fin: null,
  },
  {
    id: 'pr-7',
    nombre: 'Combo Snack',
    descripcion: '$15 off en snacks — promo de temporada',
    tipo: 'descuento_monto',
    valor: 15,
    codigo: null,
    activa: true,
    aplica_a: 'categoria',
    referencia_id: DEMO_CAT_SNACKS,
    fecha_inicio: null,
    fecha_fin: HACE_UN_MES,
    horas_inicio: null,
    horas_fin: null,
  },
  {
    id: 'pr-8',
    nombre: 'Lunes de Mango',
    descripcion: '20% en Shake de Mango todos los lunes',
    tipo: 'descuento_porcentaje',
    valor: 20,
    codigo: null,
    activa: true,
    aplica_a: 'producto',
    referencia_id: DEMO_PROD_SHAKE_MANGO,
    fecha_inicio: null,
    fecha_fin: null,
    horas_inicio: null,
    horas_fin: null,
  },
]

function generarId(): string {
  return 'pr-' + Math.random().toString(36).slice(2, 10)
}

export function usePromociones() {
  const [promociones, setPromociones] = useState<Promocion[]>(DEMO_PROMOCIONES)

  function agregarPromocion(input: PromocionInput): void {
    const nueva: Promocion = { ...input, id: generarId() }
    setPromociones((prev) => [...prev, nueva])
  }

  function editarPromocion(id: string, input: PromocionInput): void {
    setPromociones((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...input } : p)),
    )
  }

  function borrarPromocion(id: string): void {
    setPromociones((prev) => prev.filter((p) => p.id !== id))
  }

  function toggleActivaPromocion(id: string): void {
    setPromociones((prev) =>
      prev.map((p) => (p.id === id ? { ...p, activa: !p.activa } : p)),
    )
  }

  return {
    promociones,
    isSupabaseConfigured: Boolean(isSupabaseConfigured),
    agregarPromocion,
    editarPromocion,
    borrarPromocion,
    toggleActivaPromocion,
  }
}

// ── Pure evaluator ─────────────────────────────────────────────────────────

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
  if (promo.fecha_inicio) {
    const inicio = new Date(promo.fecha_inicio)
    if (ahora < inicio) return false
  }
  if (promo.fecha_fin) {
    // include the entire end-day
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
  // overnight window (e.g. 22:00 → 02:00)
  return minutos >= inicio || minutos <= fin
}

function itemsAplicables(
  items: ItemEvaluable[],
  promo: Promocion,
): ItemEvaluable[] {
  if (promo.aplica_a === 'todo') return items
  if (promo.aplica_a === 'categoria') {
    return items.filter((i) => i.categoria_id === promo.referencia_id)
  }
  return items.filter((i) => i.producto_id === promo.referencia_id)
}

function nombreContiene(item: ItemEvaluable, palabra: string): boolean {
  return item.nombre.toLowerCase().includes(palabra.toLowerCase())
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

    // Code-gated promos require the code (case-insensitive)
    if (promo.codigo) {
      if (!codigo || codigo !== promo.codigo.trim().toUpperCase()) continue
    }

    const aplicables = itemsAplicables(items, promo)
    if (aplicables.length === 0 && promo.tipo !== 'combo') continue

    const subtotalAplicable = aplicables.reduce(
      (sum, i) => sum + i.precio * i.cantidad,
      0,
    )

    let descuento = 0
    let razon = ''

    switch (promo.tipo) {
      case 'descuento_porcentaje': {
        descuento = subtotalAplicable * (promo.valor / 100)
        razon =
          promo.aplica_a === 'todo'
            ? `${promo.valor}% en la orden`
            : `${promo.valor}% en productos elegibles`
        break
      }
      case 'descuento_monto': {
        descuento = Math.min(promo.valor, subtotalAplicable)
        razon = `−$${promo.valor.toFixed(2)} aplicado`
        break
      }
      case 'segunda_unidad': {
        // For items with cantidad >= 2, give promo.valor% off every other unit
        let bonus = 0
        for (const it of aplicables) {
          const paresExtra = Math.floor(it.cantidad / 2)
          if (paresExtra > 0) {
            bonus += paresExtra * it.precio * (promo.valor / 100)
          }
        }
        if (bonus <= 0) continue
        descuento = bonus
        razon = `${promo.valor}% en la 2ª unidad`
        break
      }
      case 'combo': {
        // Demo combo rule: need at least one item whose name contains "Bowl"
        // and one whose name contains "Shake"
        const tieneBowl = items.some((i) => nombreContiene(i, 'bowl'))
        const tieneShake = items.some((i) => nombreContiene(i, 'shake'))
        if (!tieneBowl || !tieneShake) continue
        const subtotal = items.reduce(
          (s, i) => s + i.precio * i.cantidad,
          0,
        )
        descuento = Math.min(promo.valor, subtotal)
        razon = 'Combo Bowl + Shake'
        break
      }
      case 'regalo': {
        // Regalo: descuenta el precio del item elegible más barato (1 unidad)
        if (aplicables.length === 0) continue
        const masBarato = aplicables.reduce(
          (min, i) => (i.precio < min.precio ? i : min),
          aplicables[0]!,
        )
        descuento = masBarato.precio
        razon = `🎁 ${masBarato.nombre} de cortesía`
        break
      }
    }

    if (descuento > 0) {
      resultado.push({
        promo,
        descuento: Math.round(descuento * 100) / 100,
        razon,
      })
    }
  }

  return resultado
}
