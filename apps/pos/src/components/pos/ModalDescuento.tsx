import React, { useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  descuentoActual: { tipo: 'porcentaje' | 'monto'; valor: number } | null
  onAplicar: (d: { tipo: 'porcentaje' | 'monto'; valor: number }) => void
  onQuitar: () => void
  subtotal: number
}

export function ModalDescuento({ open, onClose, descuentoActual, onAplicar, onQuitar, subtotal }: Props) {
  const [tipo, setTipo] = useState<'porcentaje' | 'monto'>('porcentaje')
  const [valor, setValor] = useState('')

  if (!open) return null

  const valorNum = parseFloat(valor) || 0
  const descuentoCalculado = tipo === 'porcentaje'
    ? subtotal * (valorNum / 100)
    : Math.min(valorNum, subtotal)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Aplicar descuento</h3>

        {/* Tipo */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTipo('porcentaje')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
              tipo === 'porcentaje' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600'
            }`}
          >
            % Porcentaje
          </button>
          <button
            onClick={() => setTipo('monto')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
              tipo === 'monto' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600'
            }`}
          >
            $ Monto fijo
          </button>
        </div>

        {/* Quick % buttons */}
        {tipo === 'porcentaje' && (
          <div className="flex gap-2 mb-3">
            {[5, 10, 15, 20].map((p) => (
              <button
                key={p}
                onClick={() => setValor(String(p))}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  valor === String(p) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p}%
              </button>
            ))}
          </div>
        )}

        {/* Value input */}
        <div className="relative mb-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {tipo === 'porcentaje' ? '%' : '$'}
          </span>
          <input
            type="number"
            min={0}
            max={tipo === 'porcentaje' ? 100 : subtotal}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0"
            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-400"
            autoFocus
          />
        </div>

        {/* Preview */}
        {valorNum > 0 && (
          <div className="bg-green-50 rounded-xl px-4 py-2 mb-4 flex justify-between text-sm">
            <span className="text-green-700">Ahorro</span>
            <span className="text-green-700 font-bold">−${descuentoCalculado.toFixed(2)}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {descuentoActual && (
            <button
              onClick={onQuitar}
              className="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50"
            >
              Quitar
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => valorNum > 0 && onAplicar({ tipo, valor: valorNum })}
            disabled={valorNum <= 0}
            className="flex-1 bg-orange-500 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}
