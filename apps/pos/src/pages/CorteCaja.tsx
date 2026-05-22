import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePosStore } from '@/store/posStore'

interface ResumenTurno {
  efectivo: number
  tarjeta_credito: number
  tarjeta_debito: number
  qr: number
  wallet: number
  total: number
  ordenes: number
  ticket_promedio: number
}

const RESUMEN_DEMO: ResumenTurno = {
  efectivo: 1250.00,
  tarjeta_credito: 890.00,
  tarjeta_debito: 430.50,
  qr: 120.00,
  wallet: 0,
  total: 2690.50,
  ordenes: 28,
  ticket_promedio: 96.09,
}

export function CorteCaja() {
  const navigate = useNavigate()
  const { empleadoActivo, cerrarSesion } = usePosStore()
  const [cortado, setCortado] = useState(false)
  const [notas, setNotas] = useState('')

  function realizarCorte() {
    // TODO: insert corte_caja to Supabase
    setCortado(true)
  }

  if (cortado) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-6">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-4xl">✓</div>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold">Corte realizado</h1>
          <p className="text-gray-400 mt-2">Total del turno: <span className="text-white font-bold text-xl">${RESUMEN_DEMO.total.toFixed(2)}</span></p>
        </div>
        <button
          onClick={() => { cerrarSesion(); navigate('/login') }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg mt-4 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="text-gray-500 text-xl hover:text-gray-700">←</button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Corte de caja</h1>
            <p className="text-gray-500 text-sm">Cajero: {empleadoActivo?.nombre}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm">Órdenes del turno</p>
            <p className="text-4xl font-extrabold text-gray-900 mt-1">{RESUMEN_DEMO.ordenes}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm">Ticket promedio</p>
            <p className="text-4xl font-extrabold text-orange-500 mt-1">${RESUMEN_DEMO.ticket_promedio.toFixed(2)}</p>
          </div>
        </div>

        {/* Breakdown by method */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Desglose por método de pago</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { label: '💵 Efectivo', value: RESUMEN_DEMO.efectivo },
              { label: '💳 Tarjeta crédito', value: RESUMEN_DEMO.tarjeta_credito },
              { label: '💳 Tarjeta débito', value: RESUMEN_DEMO.tarjeta_debito },
              { label: '📱 QR', value: RESUMEN_DEMO.qr },
              { label: '💰 Wallet', value: RESUMEN_DEMO.wallet },
            ].map((row) => (
              <div key={row.label} className="flex justify-between px-6 py-3">
                <span className="text-gray-600 text-sm">{row.label}</span>
                <span className={`font-semibold ${row.value > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                  ${row.value.toFixed(2)}
                </span>
              </div>
            ))}
            <div className="flex justify-between px-6 py-4 bg-gray-50">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-extrabold text-xl text-gray-900">${RESUMEN_DEMO.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas del turno (opcional)</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Incidencias, observaciones..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 border border-gray-200 text-gray-700 py-4 rounded-2xl font-medium hover:bg-gray-50"
          >
            Seguir vendiendo
          </button>
          <button
            onClick={realizarCorte}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors"
          >
            Realizar corte
          </button>
        </div>
      </div>
    </div>
  )
}
