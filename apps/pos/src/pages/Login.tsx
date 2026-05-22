import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePosStore } from '@/store/posStore'

// Demo employees for development (no Supabase needed)
const DEMO_EMPLEADOS = [
  { id: 'emp-001', nombre: 'Ana García', rol: 'cajero', pin: '1234' },
  { id: 'emp-002', nombre: 'Carlos López', rol: 'cajero', pin: '5678' },
  { id: 'emp-003', nombre: 'Supervisor', rol: 'supervisor', pin: '0000' },
]

export function Login() {
  const navigate = useNavigate()
  const iniciarSesion = usePosStore((s) => s.iniciarSesion)
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<typeof DEMO_EMPLEADOS[0] | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  function seleccionarEmpleado(emp: typeof DEMO_EMPLEADOS[0]) {
    setEmpleadoSeleccionado(emp)
    setPin('')
    setError('')
  }

  function presionarDigito(d: string) {
    if (pin.length >= 6) return
    setPin((p) => p + d)
    setError('')
  }

  function borrar() {
    setPin((p) => p.slice(0, -1))
    setError('')
  }

  function validarPin() {
    if (!empleadoSeleccionado) return
    if (pin === empleadoSeleccionado.pin) {
      iniciarSesion(
        { id: empleadoSeleccionado.id, nombre: empleadoSeleccionado.nombre, rol: empleadoSeleccionado.rol },
        `turno-${Date.now()}`,
      )
      navigate('/')
    } else {
      setError('PIN incorrecto')
      setPin('')
    }
  }

  const TECLADO = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">POS — Caja</h1>
          <p className="text-gray-400 mt-1">Selecciona tu nombre e ingresa tu PIN</p>
        </div>

        {/* Employee selector */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {DEMO_EMPLEADOS.map((emp) => (
            <button
              key={emp.id}
              onClick={() => seleccionarEmpleado(emp)}
              className={`py-4 rounded-2xl border-2 transition-all text-center ${
                empleadoSeleccionado?.id === emp.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">
                {emp.nombre[0]}
              </div>
              <p className="font-semibold text-sm text-gray-900 leading-tight">{emp.nombre}</p>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{emp.rol}</p>
            </button>
          ))}
        </div>

        {/* PIN pad */}
        {empleadoSeleccionado && (
          <div className="max-w-xs mx-auto">
            {/* PIN dots */}
            <div className="flex justify-center gap-3 mb-6">
              {Array.from({ length: Math.max(pin.length, 4) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all ${
                    i < pin.length ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-center text-red-500 text-sm mb-4 font-medium">{error}</p>
            )}

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-3">
              {TECLADO.map((digit, i) => (
                digit === '' ? (
                  <div key={i} />
                ) : digit === '⌫' ? (
                  <button
                    key={i}
                    onClick={borrar}
                    className="h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500 font-medium text-xl transition-colors flex items-center justify-center"
                  >
                    ⌫
                  </button>
                ) : (
                  <button
                    key={i}
                    onClick={() => presionarDigito(digit)}
                    className="h-14 rounded-2xl bg-gray-100 hover:bg-orange-50 hover:text-orange-600 font-bold text-xl transition-colors"
                  >
                    {digit}
                  </button>
                )
              ))}
            </div>

            <button
              onClick={validarPin}
              disabled={pin.length < 4}
              className="w-full mt-4 bg-orange-500 disabled:opacity-40 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-colors"
            >
              Entrar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
