/// <reference types="vite/client" />
import { useState } from 'react'

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

function generarId(prefijo: string): string {
  return `${prefijo}-${Math.random().toString(36).slice(2, 10)}`
}

function generarCodigoGift(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'GIFT-'
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * chars.length)
    code += chars[idx] ?? chars[0]
  }
  return code
}

// ── Config (constant — not mutated in demo) ────────────────────────────────────

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

// ── Demo customers ─────────────────────────────────────────────────────────────

const clienteBronce1: ClienteLealtad = {
  id: 'cl-1',
  nombre: 'Sofía Ramírez Torres',
  telefono: '5512345678',
  email: 'sofia.ramirez@email.com',
  puntos: 45,
  wallet_saldo: 0,
  nivel: 'bronce',
  total_gastado: 450,
  fecha_registro: '2026-04-10',
  ultima_visita: '2026-05-20',
}

const clienteBronce2: ClienteLealtad = {
  id: 'cl-2',
  nombre: 'Miguel Ángel Herrera',
  telefono: '5587654321',
  email: null,
  puntos: 190,
  wallet_saldo: 50,
  nivel: 'bronce',
  total_gastado: 1900,
  fecha_registro: '2026-03-22',
  ultima_visita: '2026-05-18',
}

const clienteBronce3: ClienteLealtad = {
  id: 'cl-3',
  nombre: 'Valentina Cruz López',
  telefono: null,
  email: 'vale.cruz@correo.mx',
  puntos: 380,
  wallet_saldo: 0,
  nivel: 'bronce',
  total_gastado: 3800,
  fecha_registro: '2026-02-14',
  ultima_visita: '2026-05-15',
}

const clienteBronce4: ClienteLealtad = {
  id: 'cl-4',
  nombre: 'Roberto Jiménez Soto',
  telefono: '5565432100',
  email: null,
  puntos: 10,
  wallet_saldo: 0,
  nivel: 'bronce',
  total_gastado: 100,
  fecha_registro: '2026-05-01',
  ultima_visita: '2026-05-01',
}

const clientePlata1: ClienteLealtad = {
  id: 'cl-5',
  nombre: 'Camila Morales Vega',
  telefono: '5511223344',
  email: 'camila.morales@email.com',
  puntos: 620,
  wallet_saldo: 120,
  nivel: 'plata',
  total_gastado: 6200,
  fecha_registro: '2025-11-30',
  ultima_visita: '2026-05-21',
}

const clientePlata2: ClienteLealtad = {
  id: 'cl-6',
  nombre: 'Andrés Navarro Fuentes',
  telefono: '5599887766',
  email: 'andres.n@outlook.com',
  puntos: 1050,
  wallet_saldo: 0,
  nivel: 'plata',
  total_gastado: 10500,
  fecha_registro: '2025-09-15',
  ultima_visita: '2026-05-19',
}

const clientePlata3: ClienteLealtad = {
  id: 'cl-7',
  nombre: 'Mariana Delgado Ríos',
  telefono: '5544332211',
  email: null,
  puntos: 1780,
  wallet_saldo: 200,
  nivel: 'plata',
  total_gastado: 17800,
  fecha_registro: '2025-08-07',
  ultima_visita: '2026-05-22',
}

const clienteOro1: ClienteLealtad = {
  id: 'cl-8',
  nombre: 'Diego Reyes Castillo',
  telefono: '5578901234',
  email: 'diego.reyes@email.com',
  puntos: 2340,
  wallet_saldo: 0,
  nivel: 'oro',
  total_gastado: 23400,
  fecha_registro: '2025-06-20',
  ultima_visita: '2026-05-20',
}

const clienteOro2: ClienteLealtad = {
  id: 'cl-9',
  nombre: 'Isabella Vargas Méndez',
  telefono: '5567890123',
  email: 'isa.vargas@gmail.com',
  puntos: 3100,
  wallet_saldo: 150,
  nivel: 'oro',
  total_gastado: 31000,
  fecha_registro: '2025-05-10',
  ultima_visita: '2026-05-21',
}

const clienteOro3: ClienteLealtad = {
  id: 'cl-10',
  nombre: 'Fernanda Romero Aguilar',
  telefono: '5556789012',
  email: 'fer.romero@hotmail.com',
  puntos: 4850,
  wallet_saldo: 350,
  nivel: 'oro',
  total_gastado: 48500,
  fecha_registro: '2025-03-01',
  ultima_visita: '2026-05-22',
}

const clientePlatino1: ClienteLealtad = {
  id: 'cl-11',
  nombre: 'Alejandro Torres Guzmán',
  telefono: '5545678901',
  email: 'alex.torres@empresa.mx',
  puntos: 5200,
  wallet_saldo: 0,
  nivel: 'platino',
  total_gastado: 52000,
  fecha_registro: '2025-01-15',
  ultima_visita: '2026-05-18',
}

const clientePlatino2: ClienteLealtad = {
  id: 'cl-12',
  nombre: 'Daniela Flores Ortega',
  telefono: '5534567890',
  email: 'dani.flores@email.com',
  puntos: 7450,
  wallet_saldo: 275,
  nivel: 'platino',
  total_gastado: 74500,
  fecha_registro: '2024-10-08',
  ultima_visita: '2026-05-22',
}

const clientePlatino3: ClienteLealtad = {
  id: 'cl-13',
  nombre: 'Emilio Santos Peña',
  telefono: '5523456789',
  email: 'emilio.santos@correo.mx',
  puntos: 9800,
  wallet_saldo: 0,
  nivel: 'platino',
  total_gastado: 98000,
  fecha_registro: '2024-07-20',
  ultima_visita: '2026-05-17',
}

const clientePlatino4: ClienteLealtad = {
  id: 'cl-14',
  nombre: 'Lucía Hernández Ramos',
  telefono: '5512347890',
  email: 'lucia.hdz@gmail.com',
  puntos: 6100,
  wallet_saldo: 320,
  nivel: 'platino',
  total_gastado: 61000,
  fecha_registro: '2024-11-12',
  ultima_visita: '2026-05-21',
}

const clientePlatino5: ClienteLealtad = {
  id: 'cl-15',
  nombre: 'Carlos Medina Quintero',
  telefono: '5598760001',
  email: null,
  puntos: 12500,
  wallet_saldo: 100,
  nivel: 'platino',
  total_gastado: 125000,
  fecha_registro: '2024-04-03',
  ultima_visita: '2026-05-19',
}

const DEMO_CLIENTES: ClienteLealtad[] = [
  clienteBronce1,
  clienteBronce2,
  clienteBronce3,
  clienteBronce4,
  clientePlata1,
  clientePlata2,
  clientePlata3,
  clienteOro1,
  clienteOro2,
  clienteOro3,
  clientePlatino1,
  clientePlatino2,
  clientePlatino3,
  clientePlatino4,
  clientePlatino5,
]

// ── Demo gift cards ────────────────────────────────────────────────────────────

const DEMO_GIFT_CARDS: GiftCard[] = [
  {
    id: 'gc-1',
    codigo: 'GIFT-AMOR',
    monto_original: 500,
    saldo_actual: 320,
    activa: true,
    fecha_vencimiento: '2026-12-31',
    creada_en: '2026-03-14',
    canjeada_en: null,
  },
  {
    id: 'gc-2',
    codigo: 'GIFT-LUNA',
    monto_original: 200,
    saldo_actual: 200,
    activa: true,
    fecha_vencimiento: '2026-11-30',
    creada_en: '2026-04-01',
    canjeada_en: null,
  },
  {
    id: 'gc-3',
    codigo: 'GIFT-STAR',
    monto_original: 1000,
    saldo_actual: 750,
    activa: true,
    fecha_vencimiento: null,
    creada_en: '2026-02-20',
    canjeada_en: null,
  },
  {
    id: 'gc-4',
    codigo: 'GIFT-ROSA',
    monto_original: 300,
    saldo_actual: 0,
    activa: false,
    fecha_vencimiento: '2026-10-15',
    creada_en: '2026-01-10',
    canjeada_en: '2026-04-22',
  },
  {
    id: 'gc-5',
    codigo: 'GIFT-MIEL',
    monto_original: 150,
    saldo_actual: 0,
    activa: false,
    fecha_vencimiento: null,
    creada_en: '2025-12-01',
    canjeada_en: '2026-02-14',
  },
  {
    id: 'gc-6',
    codigo: 'GIFT-FUEG',
    monto_original: 500,
    saldo_actual: 500,
    activa: false,
    fecha_vencimiento: '2026-03-01',
    creada_en: '2025-12-15',
    canjeada_en: null,
  },
  {
    id: 'gc-7',
    codigo: 'GIFT-AZUL',
    monto_original: 250,
    saldo_actual: 80,
    activa: true,
    fecha_vencimiento: '2026-09-30',
    creada_en: '2026-04-18',
    canjeada_en: null,
  },
  {
    id: 'gc-8',
    codigo: 'GIFT-JADE',
    monto_original: 800,
    saldo_actual: 0,
    activa: false,
    fecha_vencimiento: '2026-08-31',
    creada_en: '2026-03-05',
    canjeada_en: '2026-05-10',
  },
]

// ── Hook ───────────────────────────────────────────────────────────────────────

export interface ClienteInput {
  nombre: string
  telefono: string | null
  email: string | null
}

export function useLealtad() {
  const [clientes, setClientes] = useState<ClienteLealtad[]>(DEMO_CLIENTES)
  const [giftCards, setGiftCards] = useState<GiftCard[]>(DEMO_GIFT_CARDS)

  function agregarCliente(input: ClienteInput): void {
    const nuevo: ClienteLealtad = {
      id: generarId('cl'),
      nombre: input.nombre,
      telefono: input.telefono,
      email: input.email,
      puntos: 0,
      wallet_saldo: 0,
      nivel: 'bronce',
      total_gastado: 0,
      fecha_registro: new Date().toISOString().slice(0, 10),
      ultima_visita: new Date().toISOString().slice(0, 10),
    }
    setClientes((prev) => [...prev, nuevo])
  }

  function editarCliente(id: string, input: ClienteInput): void {
    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...input } : c)),
    )
  }

  function borrarCliente(id: string): void {
    setClientes((prev) => prev.filter((c) => c.id !== id))
  }

  function cargarPuntosWallet(id: string, puntos: number, wallet: number): void {
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
  }

  function crearGiftCard(monto: number, fechaVenc: string | null): void {
    const nueva: GiftCard = {
      id: generarId('gc'),
      codigo: generarCodigoGift(),
      monto_original: monto,
      saldo_actual: monto,
      activa: true,
      fecha_vencimiento: fechaVenc,
      creada_en: new Date().toISOString().slice(0, 10),
      canjeada_en: null,
    }
    setGiftCards((prev) => [nueva, ...prev])
  }

  function anularGiftCard(id: string): void {
    setGiftCards((prev) =>
      prev.map((gc) => (gc.id === id ? { ...gc, activa: false } : gc)),
    )
  }

  return {
    clientes,
    giftCards,
    config: LEALTAD_CONFIG,
    agregarCliente,
    editarCliente,
    borrarCliente,
    cargarPuntosWallet,
    crearGiftCard,
    anularGiftCard,
  }
}
