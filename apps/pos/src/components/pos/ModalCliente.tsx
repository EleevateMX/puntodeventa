import React, { useState, useEffect, useRef } from 'react'
import { usePosStore } from '@/store/posStore'
import type { ClientePOS } from '../../types'
import { buscarClientes, isSupabaseConfigured } from '@pos/supabase'

const NIVEL_COLOR: Record<string, string> = {
  bronce: 'bg-sa-mango/30 text-sa-green-ink border-sa-mango',
  plata: 'bg-sa-cream-warm text-sa-green-ink border-sa-green-ink/15',
  oro: 'bg-sa-banana/40 text-sa-green-ink border-sa-banana',
  platino: 'bg-sa-mint/40 text-sa-green-ink border-sa-mint',
}

interface Props {
  open: boolean
  onClose: () => void
}

export function ModalCliente({ open, onClose }: Props) {
  const { clienteActivo, setCliente } = usePosStore()
  const [busqueda, setBusqueda] = useState('')
  const [clientes, setClientes] = useState<ClientePOS[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        const rows = await buscarClientes(busqueda)
        setClientes(rows.map(r => ({
          id: r.id,
          nombre: r.nombre,
          telefono: r.telefono,
          email: r.email,
          puntos: r.puntos,
          wallet_saldo: Number(r.wallet_saldo),
          nivel: r.nivel,
        })))
      } catch { /* silent */ }
    }, 300)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [busqueda])

  if (!open) return null

  function seleccionarCliente(c: ClientePOS) {
    setCliente(c)
    onClose()
  }

  function quitarCliente() {
    setCliente(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-sa-green-deep/60" onClick={onClose} />
      <div className="relative bg-sa-cream-soft rounded-sa-lg shadow-sa w-full max-w-sm">
        <div className="px-5 py-4 border-b border-sa-green-ink/10 flex items-center justify-between">
          <h3 className="font-display text-2xl text-sa-green-ink">Buscar cliente</h3>
          {clienteActivo && (
            <button
              onClick={quitarCliente}
              className="font-mono text-xs uppercase tracking-wide text-sa-strawberry hover:brightness-110"
            >
              Quitar
            </button>
          )}
        </div>

        <div className="p-4">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre o teléfono…"
            className="w-full px-4 py-3 bg-white border border-sa-green-ink/10 rounded-sa font-body text-sm text-sa-green-ink placeholder:font-mono placeholder:text-sa-green-ink/40 focus:outline-none focus:ring-2 focus:ring-sa-green/30"
            autoFocus
          />
        </div>

        <div className="max-h-60 overflow-y-auto px-3 pb-4 space-y-2">
          {clientes.length === 0 ? (
            <p className="text-center font-mono text-sm uppercase tracking-wide text-sa-green-ink/40 py-6">
              Sin resultados
            </p>
          ) : (
            clientes.map((c) => (
              <button
                key={c.id}
                onClick={() => seleccionarCliente(c)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-sa transition-colors text-left ${
                  clienteActivo?.id === c.id
                    ? 'bg-white border-2 border-sa-green'
                    : 'bg-sa-cream-warm/60 hover:bg-white border-2 border-transparent'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-sa-green flex items-center justify-center text-sa-cream font-display text-xl flex-shrink-0">
                  {c.nombre[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display text-base text-sa-green-ink leading-tight">
                      {c.nombre}
                    </p>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                        NIVEL_COLOR[c.nivel] ?? ''
                      }`}
                    >
                      {c.nivel}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-1">
                    <span className="font-mono text-xs text-sa-green-ink/60">
                      ⭐ {c.puntos} pts
                    </span>
                    {c.wallet_saldo > 0 && (
                      <span className="font-mono text-xs text-sa-blueberry">
                        💰 ${c.wallet_saldo.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                {clienteActivo?.id === c.id && (
                  <span className="text-sa-green text-lg flex-shrink-0">✓</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
