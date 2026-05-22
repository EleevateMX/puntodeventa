/// <reference types="vite/client" />
import { useState, useEffect, useCallback } from 'react'
import {
  isSupabaseConfigured,
  getClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  getGiftCards,
  crearGiftCard as crearGiftCardDB,
  anularGiftCard as anularGiftCardDB,
  cargarWalletCliente,
  agregarPuntosCliente,
  type ClienteRow,
  type GiftCardRow,
} from '@pos/supabase'

// ── Types ──────────────────────────────────────────────────────────────────────

export type NivelLealtad = 'bronce' | 'plata' | 'oro' | 'platino'

export interface ClienteLealtad {
  id: string
  nombre: string
  telefono: string | null
  email: string | null
  puntos: number
  wallet_saldo: number
  nivel: NivelLealtad
  total_gastado: number
  fecha_registro: string
  ultima_visita: string
}

export interface GiftCard {
  id: string
  codigo: string
  monto_original: number
  saldo_actual: number
  activa: boolean
  fecha_vencimiento: string | null
  creada_en: string
  canjeada_en: string | null
}

export interface LealtadConfig {
  pesos_por_punto: number
  puntos_por_visita: number
  niveles: {
    nivel: NivelLealtad
    min_puntos: number
    beneficio: string
    emoji: string
    color: string
  }[]
}

// ── Pure helpers ───────────────────────────────────────────────────────────────

export function evaluarNivel(puntos: number): NivelLealtad {
  if (puntos >= 5000) return 'platino'
  if (puntos >= 2000) return 'oro'
  if (puntos >= 500) return 'plata'
  return 'bronce'
}

// ── Config (constant — not mutated) ───────────────────────────────────────────

export const LEALTAD_CONFIG: LealtadConfig = {
  pesos_por_punto: 10,
  puntos_por_visita: 5,
  niveles: [
    {
      nivel: 'bronce',
      min_puntos: 0,
      beneficio: 'Acumula puntos en cada compra',
      emoji: '🥉',
      color: 'bg-sa-mango/30',
    },
    {
      nivel: 'plata',
      min_puntos: 500,
      beneficio: '5% de descuento en toda la orden',
      emoji: '🥈',
      color: 'bg-sa-cream-soft',
    },
    {
      nivel: 'oro',
      min_puntos: 2000,
      beneficio: '10% de descuento + bebida gratis al mes',
      emoji: '🥇',
      color: 'bg-sa-banana/30',
    },
    {
      nivel: 'platino',
      min_puntos: 5000,
      beneficio: '15% de descuento + acceso a menú exclusivo',
      emoji: '💎',
      color: 'bg-sa-blueberry/15',
    },
  ],
}

// ── Row mappers ────────────────────────────────────────────────────────────────

function rowToCliente(row: ClienteRow): ClienteLealtad {
  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono,
    email: row.email,
    puntos: row.puntos,
    wallet_saldo: Number(row.wallet_saldo),
    nivel: row.nivel as NivelLealtad,
    total_gastado: row.puntos * 10,
    fecha_registro: row.created_at.slice(0, 10),
    ultima_visita: row.created_at.slice(0, 10),
  }
}

function rowToGiftCard(row: GiftCardRow): GiftCard {
  return {
    id: row.id,
    codigo: row.codigo,
    monto_original: row.saldo_inicial,
    saldo_actual: row.saldo,
    activa: row.activa,
    fecha_vencimiento: row.vence_en,
    creada_en: row.created_at.slice(0, 10),
    canjeada_en: null,
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export interface ClienteInput {
  nombre: string
  telefono: string | null
  email: string | null
}

const usarDemo = () => !isSupabaseConfigured || localStorage.getItem('shake-demo-mode') === 'true'

export function useLealtad() {
  const [clientes, setClientes] = useState<ClienteLealtad[]>([])
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    if (usarDemo()) return
    setLoading(true)
    setError(null)
    try {
      const [clientesData, gcData] = await Promise.all([getClientes(), getGiftCards()])
      setClientes(clientesData.map(rowToCliente))
      setGiftCards(gcData.map(rowToGiftCard))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar])

  async function agregarCliente(input: ClienteInput): Promise<void> {
    const row = await crearCliente({
      nombre: input.nombre,
      telefono: input.telefono,
      email: input.email,
    })
    setClientes((prev) => [rowToCliente(row), ...prev])
  }

  async function editarCliente(id: string, input: ClienteInput): Promise<void> {
    const row = await actualizarCliente(id, {
      nombre: input.nombre,
      telefono: input.telefono,
      email: input.email,
    })
    setClientes((prev) =>
      prev.map((c) => (c.id === id ? rowToCliente(row) : c)),
    )
  }

  async function borrarCliente(id: string): Promise<void> {
    await eliminarCliente(id)
    setClientes((prev) => prev.filter((c) => c.id !== id))
  }

  async function cargarPuntosWallet(id: string, puntos: number, wallet: number): Promise<void> {
    if (usarDemo()) {
      // In-memory fallback when Supabase is not configured
      setClientes((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          const nuevosPuntos = c.puntos + puntos
          return {
            ...c,
            puntos: nuevosPuntos,
            wallet_saldo: c.wallet_saldo + wallet,
            nivel: evaluarNivel(nuevosPuntos),
            ultima_visita: new Date().toISOString().slice(0, 10),
          }
        }),
      )
      return
    }
    if (wallet > 0) {
      await cargarWalletCliente(id, wallet)
    }
    if (puntos > 0) {
      await agregarPuntosCliente(id, puntos)
    }
    await cargar()
  }

  async function crearGiftCard(monto: number, fechaVenc: string | null): Promise<void> {
    const row = await crearGiftCardDB(monto, fechaVenc)
    setGiftCards((prev) => [rowToGiftCard(row), ...prev])
  }

  async function anularGiftCard(id: string): Promise<void> {
    await anularGiftCardDB(id)
    setGiftCards((prev) =>
      prev.map((gc) => (gc.id === id ? { ...gc, activa: false } : gc)),
    )
  }

  return {
    clientes,
    giftCards,
    config: LEALTAD_CONFIG,
    loading,
    error,
    cargar,
    agregarCliente,
    editarCliente,
    borrarCliente,
    cargarPuntosWallet,
    crearGiftCard,
    anularGiftCard,
  }
}
