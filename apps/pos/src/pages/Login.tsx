import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePosStore } from '@/store/posStore'
import { getEmpleados, buscarEmpleadoPorPin, isSupabaseConfigured } from '@pos/supabase'

type EmpleadoUI = { id: string; nombre: string; rol: string }

const DEMO_EMPLEADOS: EmpleadoUI[] = [
  { id: 'emp-001', nombre: 'Ana García', rol: 'cajero' },
  { id: 'emp-002', nombre: 'Carlos López', rol: 'cajero' },
  { id: 'emp-003', nombre: 'Supervisor', rol: 'supervisor' },
]

const DEMO_PINS: Record<string, string> = {
  'emp-001': '1234',
  'emp-002': '5678',
  'emp-003': '0000',
}

export function Login() {
  const navigate = useNavigate()
  const iniciarSesion = usePosStore((s) => s.iniciarSesion)
  const sucursalId = usePosStore((s) => s.sucursalId)
  const [empleados, setEmpleados] = useState<EmpleadoUI[]>([])
  const [cargando, setCargando] = useState(true)
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<EmpleadoUI | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [validando, setValidando] = useState(false)

  const [usandoDemo, setUsandoDemo] = useState(!isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setEmpleados(DEMO_EMPLEADOS)
      setUsandoDemo(true)
      setCargando(false)
      return
    }
    getEmpleados()
      .then((rows) => {
        if (rows.length === 0) {
          setEmpleados(DEMO_EMPLEADOS)
          setUsandoDemo(true)
        } else {
          setEmpleados(rows.map((r) => ({ id: r.id, nombre: r.nombre, rol: r.rol })))
        }
      })
      .catch(() => { setEmpleados(DEMO_EMPLEADOS); setUsandoDemo(true) })
      .finally(() => setCargando(false))
  }, [])

  function seleccionarEmpleado(emp: EmpleadoUI) {
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

  async function validarPin() {
    if (!empleadoSeleccionado || pin.length < 4 || validando) return
    setValidando(true)
    try {
      if (isSupabaseConfigured && !usandoDemo) {
        const emp = await buscarEmpleadoPorPin(pin, sucursalId)
        if (emp && emp.id === empleadoSeleccionado.id) {
          iniciarSesion({ id: emp.id, nombre: emp.nombre, rol: emp.rol }, `turno-${Date.now()}`)
          navigate('/')
          return
        }
        setError('Ese PIN no agita, intenta de nuevo')
        setPin('')
        return
      }
      if (pin === DEMO_PINS[empleadoSeleccionado.id]) {
        iniciarSesion(
          { id: empleadoSeleccionado.id, nombre: empleadoSeleccionado.nombre, rol: empleadoSeleccionado.rol },
          `turno-${Date.now()}`,
        )
        navigate('/')
      } else {
        setError('Ese PIN no agita, intenta de nuevo')
        setPin('')
      }
    } finally {
      setValidando(false)
    }
  }

  const TECLADO = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫']

  return (
    <div className="min-h-screen bg-sa-green-deep flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <img
        src="/logo.png"
        alt="Shake Aholic"
        className="w-[180px] h-auto mb-6 drop-shadow-2xl"
      />

      <div className="bg-sa-cream-soft rounded-sa-lg shadow-sa w-full max-w-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="font-display text-4xl text-sa-green-ink leading-none">¿Quién agita hoy?</h1>
          <p className="font-body text-sa-green-ink/60 mt-2 text-sm">
            Toca tu nombre y mete tu PIN
          </p>
        </div>

        {/* Employee selector */}
        {cargando ? (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-5 px-3 rounded-sa bg-sa-cream-warm animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {empleados.map((emp) => {
              const activo = empleadoSeleccionado?.id === emp.id
              return (
                <button
                  key={emp.id}
                  onClick={() => seleccionarEmpleado(emp)}
                  className={`py-5 px-3 rounded-sa transition-all text-center border ${
                    activo
                      ? 'bg-sa-cream border-sa-green shadow-sa-sm'
                      : 'bg-sa-cream-warm border-transparent hover:bg-sa-cream'
                  }`}
                >
                  <div className="w-14 h-14 rounded-full bg-sa-green flex items-center justify-center text-sa-cream font-display text-2xl mx-auto mb-2">
                    {emp.nombre[0]}
                  </div>
                  <p className={`font-display text-base leading-tight ${activo ? 'text-sa-green' : 'text-sa-green-ink'}`}>
                    {emp.nombre.split(' ')[0]}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-sa-green-ink/50 mt-1">
                    {emp.rol}
                  </p>
                  {usandoDemo && (
                    <p className="font-mono text-[9px] text-sa-green/60 mt-1 bg-sa-green/10 rounded px-1">
                      PIN: {DEMO_PINS[emp.id] ?? '????'}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* PIN pad */}
        {empleadoSeleccionado && (
          <div className="max-w-xs mx-auto">
            <p className="text-center font-display text-2xl text-sa-green mb-3">
              Hola, {empleadoSeleccionado.nombre.split(' ')[0]}
            </p>

            {/* PIN dots */}
            <div className="flex justify-center gap-3 mb-5">
              {Array.from({ length: Math.max(pin.length, 4) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all ${
                    i < pin.length ? 'bg-sa-green' : 'bg-sa-cream-warm'
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-center text-sa-strawberry text-sm mb-4 font-mono">{error}</p>
            )}

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-3">
              {TECLADO.map((digit, i) => {
                if (digit === 'C') {
                  return (
                    <button
                      key={i}
                      onClick={() => { setPin(''); setError('') }}
                      className="h-16 rounded-sa bg-sa-strawberry hover:brightness-110 text-white font-display text-2xl transition-all flex items-center justify-center"
                    >
                      C
                    </button>
                  )
                }
                if (digit === '⌫') {
                  return (
                    <button
                      key={i}
                      onClick={borrar}
                      className="h-16 rounded-sa bg-sa-cream-warm hover:bg-sa-cream text-sa-green-ink font-display text-2xl transition-colors flex items-center justify-center"
                    >
                      ⌫
                    </button>
                  )
                }
                return (
                  <button
                    key={i}
                    onClick={() => presionarDigito(digit)}
                    className="h-16 rounded-sa bg-sa-cream hover:bg-sa-cream-warm text-sa-green-ink font-display text-2xl transition-colors"
                  >
                    {digit}
                  </button>
                )
              })}
            </div>

            <button
              onClick={validarPin}
              disabled={pin.length < 4 || validando}
              className="w-full mt-5 bg-sa-green disabled:opacity-40 text-sa-cream py-4 rounded-sa-lg font-display text-xl hover:bg-sa-green-deep transition-colors"
            >
              {validando ? 'Verificando…' : 'A agitar'}
            </button>
          </div>
        )}
      </div>

      <p className="font-mono text-xs text-sa-cream/40 mt-6 uppercase tracking-widest">
        Shake Aholic · POS
      </p>
    </div>
  )
}
