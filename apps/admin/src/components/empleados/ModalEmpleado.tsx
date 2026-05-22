import React, { useEffect, useRef, useState } from 'react'
import { Modal } from '../ui/Modal'
import type { Empleado, EmpleadoInput, Rol } from '../../hooks/useEmpleados'

interface Props {
  open: boolean
  onClose: () => void
  onGuardar: (input: EmpleadoInput) => void
  empleado: Empleado | null
}

const ROLES: { rol: Rol; label: string; emoji: string }[] = [
  { rol: 'admin',      label: 'Admin',      emoji: '👑' },
  { rol: 'cajero',     label: 'Cajero',     emoji: '💳' },
  { rol: 'cocinero',   label: 'Cocinero',   emoji: '🍳' },
  { rol: 'mesero',     label: 'Mesero',     emoji: '🛎' },
  { rol: 'supervisor', label: 'Supervisor', emoji: '🔑' },
]

const VACIO: EmpleadoInput = {
  nombre: '',
  pin: '',
  rol: 'cajero',
  activo: true,
  sucursal_id: null,
}

export function ModalEmpleado({ open, onClose, onGuardar, empleado }: Props) {
  const [form, setForm] = useState<EmpleadoInput>(VACIO)
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', ''])
  const [pinFocused, setPinFocused] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState<Partial<Record<keyof EmpleadoInput | 'pin', string>>>({})

  const pinRefs: [
    React.RefObject<HTMLInputElement>,
    React.RefObject<HTMLInputElement>,
    React.RefObject<HTMLInputElement>,
    React.RefObject<HTMLInputElement>,
  ] = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    if (!open) return
    if (empleado) {
      setForm({
        nombre: empleado.nombre,
        pin: '',
        rol: empleado.rol,
        activo: empleado.activo,
        sucursal_id: empleado.sucursal_id,
      })
      setPinDigits(['', '', '', ''])
    } else {
      setForm(VACIO)
      setPinDigits(['', '', '', ''])
    }
    setErrores({})
  }, [open, empleado])

  function set<K extends keyof EmpleadoInput>(key: K, value: EmpleadoInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrores((prev) => ({ ...prev, [key]: undefined }))
  }

  function handlePinChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...pinDigits]
    next[index] = digit
    setPinDigits(next)
    setErrores((prev) => ({ ...prev, pin: undefined }))

    if (digit && index < 3) {
      pinRefs[index + 1 as 0 | 1 | 2 | 3]?.current?.focus()
    }
  }

  function handlePinKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinRefs[index - 1 as 0 | 1 | 2 | 3]?.current?.focus()
    }
  }

  function handlePinPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    const next = ['', '', '', '']
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i] ?? ''
    setPinDigits(next)
    const lastFilled = Math.min(pasted.length, 3) as 0 | 1 | 2 | 3
    pinRefs[lastFilled]?.current?.focus()
  }

  function validar(): boolean {
    const e: typeof errores = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'

    if (empleado) {
      // editing: PIN can be empty (keep existing) or must be 4 digits
      const filledDigits = pinDigits.join('')
      if (filledDigits.length > 0 && filledDigits.length < 4) {
        e.pin = 'El PIN debe tener exactamente 4 dígitos'
      }
    } else {
      // new: PIN required
      const filledDigits = pinDigits.join('')
      if (filledDigits.length !== 4) {
        e.pin = 'El PIN debe tener exactamente 4 dígitos'
      }
    }

    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return
    setGuardando(true)
    try {
      const pinValue = pinDigits.join('')
      const pinFinal = pinValue.length === 4 ? pinValue : (empleado ? empleado.pin : '')
      onGuardar({ ...form, pin: pinFinal })
      onClose()
    } finally {
      setGuardando(false)
    }
  }

  const pinTouched = pinDigits.some((d) => d !== '')

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={empleado ? 'Editar empleado' : 'Nuevo empleado'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Ej. Juan López"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          {errores.nombre && <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>}
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rol <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {ROLES.map(({ rol, label, emoji }) => (
              <button
                key={rol}
                type="button"
                onClick={() => set('rol', rol)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-medium transition-colors ${
                  form.rol === rol
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* PIN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PIN {empleado ? <span className="text-gray-400 font-normal">(dejar vacío para mantener)</span> : <span className="text-red-500">*</span>}
          </label>
          <div className="flex gap-3 justify-start" onFocus={() => setPinFocused(true)} onBlur={() => setPinFocused(false)}>
            {pinDigits.map((digit, i) => (
              <input
                key={i}
                ref={pinRefs[i]}
                type={pinFocused || pinTouched ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={1}
                value={digit ? (pinFocused ? digit : '•') : ''}
                onChange={(e) => handlePinChange(i, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(i, e)}
                onPaste={handlePinPaste}
                placeholder={empleado && !pinTouched ? '•' : '_'}
                className={`w-12 h-12 text-center text-lg font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors ${
                  errores.pin
                    ? 'border-red-400 bg-red-50'
                    : digit
                    ? 'border-orange-400 bg-orange-50 text-orange-600'
                    : 'border-gray-300 text-gray-400'
                }`}
              />
            ))}
          </div>
          {errores.pin && <p className="text-red-500 text-xs mt-1">{errores.pin}</p>}
        </div>

        {/* Activo */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => set('activo', !form.activo)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              form.activo ? 'bg-orange-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.activo ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">Empleado activo</span>
        </label>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="flex-1 bg-orange-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-orange-600"
          >
            {guardando ? 'Guardando...' : empleado ? 'Actualizar' : 'Crear empleado'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
