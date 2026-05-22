import React, { useState } from 'react'
import { usePosStore } from '@/store/posStore'
import type { ClientePOS } from '../../types'

// Demo clients
const DEMO_CLIENTES: ClientePOS[] = [
  { id: 'cl-1', nombre: 'María González', telefono: '555-0001', email: 'maria@email.com', puntos: 450, wallet_saldo: 120.50, nivel: 'plata' },
  { id: 'cl-2', nombre: 'Roberto Sánchez', telefono: '555-0002', email: null, puntos: 1200, wallet_saldo: 0, nivel: 'oro' },
  { id: 'cl-3', nombre: 'Laura Torres', telefono: '555-0003', email: null, puntos: 80, wallet_saldo: 50, nivel: 'bronce' },
]

const NIVEL_COLOR: Record<string, string> = {
  bronce: 'bg-amber-100 text-amber-700',
  plata: 'bg-gray-100 text-gray-600',
  oro: 'bg-yellow-100 text-yellow-700',
  platino: 'bg-purple-100 text-purple-700',
}

interface Props {
  open: boolean
  onClose: () => void
}

export function ModalCliente({ open, onClose }: Props) {
  const { clienteActivo, setCliente } = usePosStore()
  const [busqueda, setBusqueda] = useState('')

  if (!open) return null

  const clientesFiltrados = DEMO_CLIENTES.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.telefono?.includes(busqueda) ?? false),
  )

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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Buscar cliente</h3>
          {clienteActivo && (
            <button onClick={quitarCliente} className="text-red-500 text-xs font-medium hover:text-red-700">
              Quitar cliente
            </button>
          )}
        </div>

        <div className="p-4">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre o teléfono..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            autoFocus
          />
        </div>

        <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 px-2 pb-4">
          {clientesFiltrados.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">Sin resultados</p>
          ) : (
            clientesFiltrados.map((c) => (
              <button
                key={c.id}
                onClick={() => seleccionarCliente(c)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left ${
                  clienteActivo?.id === c.id ? 'bg-orange-50' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {c.nombre[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 text-sm">{c.nombre}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize font-medium ${NIVEL_COLOR[c.nivel] ?? ''}`}>
                      {c.nivel}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                    <span>⭐ {c.puntos} pts</span>
                    {c.wallet_saldo > 0 && <span>💰 ${c.wallet_saldo.toFixed(2)}</span>}
                  </div>
                </div>
                {clienteActivo?.id === c.id && (
                  <span className="text-orange-500 text-sm flex-shrink-0">✓</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
