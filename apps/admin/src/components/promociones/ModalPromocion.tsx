import React, { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import type {
  Promocion,
  PromocionInput,
  TipoPromocion,
  AplicaA,
} from '../../hooks/usePromociones'
import type { CategoriaConCocina, ProductoConCategoria } from '../../hooks/useMenu'

interface Props {
  open: boolean
  onClose: () => void
  onGuardar: (input: PromocionInput) => void
  promocion: Promocion | null
  categorias: CategoriaConCocina[]
  productos: ProductoConCategoria[]
}

const TIPOS: { tipo: TipoPromocion; label: string; emoji: string; sufijo: string }[] = [
  { tipo: 'descuento_porcentaje', label: '% Descuento',   emoji: '📉', sufijo: '%' },
  { tipo: 'descuento_monto',      label: 'Monto fijo',    emoji: '💰', sufijo: 'MXN' },
  { tipo: 'combo',                label: 'Combo',         emoji: '🥤', sufijo: 'MXN' },
  { tipo: 'segunda_unidad',       label: 'Segunda unidad',emoji: '2️⃣', sufijo: '%' },
  { tipo: 'regalo',               label: 'Regalo',        emoji: '🎁', sufijo: '' },
]

const APLICA_OPS: { value: AplicaA; label: string; emoji: string }[] = [
  { value: 'todo',      label: 'Todo el menú', emoji: '🌐' },
  { value: 'categoria', label: 'Una categoría', emoji: '🗂️' },
  { value: 'producto',  label: 'Un producto',   emoji: '🍽️' },
]

const VACIO: PromocionInput = {
  nombre: '',
  descripcion: '',
  tipo: 'descuento_porcentaje',
  valor: 10,
  codigo: null,
  activa: true,
  aplica_a: 'todo',
  referencia_id: null,
  fecha_inicio: null,
  fecha_fin: null,
  horas_inicio: null,
  horas_fin: null,
}

export function ModalPromocion({
  open,
  onClose,
  onGuardar,
  promocion,
  categorias,
  productos,
}: Props) {
  const [form, setForm] = useState<PromocionInput>(VACIO)
  const [codigoTxt, setCodigoTxt] = useState('')
  const [usaHorario, setUsaHorario] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState<Partial<Record<keyof PromocionInput, string>>>({})

  useEffect(() => {
    if (!open) return
    if (promocion) {
      setForm({
        nombre: promocion.nombre,
        descripcion: promocion.descripcion ?? '',
        tipo: promocion.tipo,
        valor: promocion.valor,
        codigo: promocion.codigo,
        activa: promocion.activa,
        aplica_a: promocion.aplica_a,
        referencia_id: promocion.referencia_id,
        fecha_inicio: promocion.fecha_inicio,
        fecha_fin: promocion.fecha_fin,
        horas_inicio: promocion.horas_inicio,
        horas_fin: promocion.horas_fin,
      })
      setCodigoTxt(promocion.codigo ?? '')
      setUsaHorario(Boolean(promocion.horas_inicio && promocion.horas_fin))
    } else {
      setForm(VACIO)
      setCodigoTxt('')
      setUsaHorario(false)
    }
    setErrores({})
  }, [open, promocion])

  function set<K extends keyof PromocionInput>(key: K, value: PromocionInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrores((prev) => ({ ...prev, [key]: undefined }))
  }

  function validar(): boolean {
    const e: typeof errores = {}
    if (!form.nombre.trim()) e.nombre = 'Ponle un nombre a la promo'
    if (form.tipo !== 'regalo' && (!form.valor || form.valor <= 0)) {
      e.valor = 'Debe ser mayor a 0'
    }
    if (form.aplica_a !== 'todo' && !form.referencia_id) {
      e.referencia_id = 'Elige a qué aplica'
    }
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return
    setGuardando(true)
    try {
      const input: PromocionInput = {
        ...form,
        codigo: codigoTxt.trim() ? codigoTxt.trim().toUpperCase() : null,
        horas_inicio: usaHorario ? form.horas_inicio : null,
        horas_fin: usaHorario ? form.horas_fin : null,
        descripcion: form.descripcion?.toString().trim() || null,
      }
      onGuardar(input)
      onClose()
    } finally {
      setGuardando(false)
    }
  }

  const sufijo = TIPOS.find((t) => t.tipo === form.tipo)?.sufijo ?? ''

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={promocion ? 'Editar promoción' : 'Nueva promoción'}
      width="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-sa-green-ink mb-1">
            Nombre <span className="text-sa-strawberry">*</span>
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Ej. Happy Hour Café"
            className="w-full border border-sa-green-ink/15 bg-white rounded-sa px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
          />
          {errores.nombre && <p className="text-sa-strawberry text-xs mt-1">{errores.nombre}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-sa-green-ink mb-1">
            Descripción
          </label>
          <textarea
            value={form.descripcion ?? ''}
            onChange={(e) => set('descripcion', e.target.value)}
            rows={2}
            placeholder="¿Cómo se la vendes al cliente?"
            className="w-full border border-sa-green-ink/15 bg-white rounded-sa px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40 resize-none"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-sa-green-ink mb-2">
            Tipo de promo <span className="text-sa-strawberry">*</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {TIPOS.map(({ tipo, label, emoji }) => (
              <button
                key={tipo}
                type="button"
                onClick={() => set('tipo', tipo)}
                className={`flex flex-col items-center gap-1 py-3 rounded-sa border-2 text-xs font-medium transition-colors ${
                  form.tipo === tipo
                    ? 'border-sa-green bg-sa-green/10 text-sa-green-deep'
                    : 'border-sa-green-ink/15 text-sa-green-ink/70 hover:border-sa-green-ink/30 bg-white'
                }`}
              >
                <span className="text-2xl leading-none">{emoji}</span>
                <span className="text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Valor */}
        {form.tipo !== 'regalo' && (
          <div>
            <label className="block text-sm font-medium text-sa-green-ink mb-1">
              Valor <span className="text-sa-strawberry">*</span>{' '}
              <span className="text-sa-green-ink/50 font-normal">({sufijo})</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sa-green-ink/40 text-lg">
                {sufijo === '%' ? '%' : '$'}
              </span>
              <input
                type="number"
                min={0}
                step={sufijo === '%' ? 1 : 0.5}
                value={form.valor}
                onChange={(e) => set('valor', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-sa-green-ink/15 rounded-sa font-mono text-lg focus:outline-none focus:ring-2 focus:ring-sa-green/40"
              />
            </div>
            {errores.valor && <p className="text-sa-strawberry text-xs mt-1">{errores.valor}</p>}
          </div>
        )}

        {/* Código */}
        <div>
          <label className="block text-sm font-medium text-sa-green-ink mb-1">
            Código{' '}
            <span className="text-sa-green-ink/50 font-normal">
              (opcional — déjalo vacío para auto-aplicar)
            </span>
          </label>
          <input
            type="text"
            value={codigoTxt}
            onChange={(e) => setCodigoTxt(e.target.value.toUpperCase())}
            placeholder="Ej. FRESH15"
            className="w-full border border-sa-green-ink/15 bg-white rounded-sa px-3 py-2.5 text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-sa-green/40"
          />
        </div>

        {/* Aplica a */}
        <div>
          <label className="block text-sm font-medium text-sa-green-ink mb-2">
            Aplica a
          </label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {APLICA_OPS.map(({ value, label, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  set('aplica_a', value)
                  if (value === 'todo') set('referencia_id', null)
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-sa border-2 text-xs font-medium transition-colors ${
                  form.aplica_a === value
                    ? 'border-sa-green bg-sa-green/10 text-sa-green-deep'
                    : 'border-sa-green-ink/15 text-sa-green-ink/70 hover:border-sa-green-ink/30 bg-white'
                }`}
              >
                <span>{emoji}</span>
                {label}
              </button>
            ))}
          </div>

          {form.aplica_a === 'categoria' && (
            <select
              value={form.referencia_id ?? ''}
              onChange={(e) => set('referencia_id', e.target.value || null)}
              className="w-full border border-sa-green-ink/15 bg-white rounded-sa px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
            >
              <option value="">Elige una categoría…</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          )}

          {form.aplica_a === 'producto' && (
            <select
              value={form.referencia_id ?? ''}
              onChange={(e) => set('referencia_id', e.target.value || null)}
              className="w-full border border-sa-green-ink/15 bg-white rounded-sa px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
            >
              <option value="">Elige un producto…</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          )}

          {errores.referencia_id && (
            <p className="text-sa-strawberry text-xs mt-1">{errores.referencia_id}</p>
          )}
        </div>

        {/* Vigencia */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-sa-green-ink mb-1">
              Desde
            </label>
            <input
              type="date"
              value={form.fecha_inicio ?? ''}
              onChange={(e) => set('fecha_inicio', e.target.value || null)}
              className="w-full border border-sa-green-ink/15 bg-white rounded-sa px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sa-green/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sa-green-ink mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={form.fecha_fin ?? ''}
              onChange={(e) => set('fecha_fin', e.target.value || null)}
              className="w-full border border-sa-green-ink/15 bg-white rounded-sa px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sa-green/40"
            />
          </div>
        </div>

        {/* Horario opcional */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer mb-2">
            <div
              onClick={() => {
                const next = !usaHorario
                setUsaHorario(next)
                if (!next) {
                  set('horas_inicio', null)
                  set('horas_fin', null)
                } else {
                  set('horas_inicio', form.horas_inicio ?? '16:00')
                  set('horas_fin', form.horas_fin ?? '18:00')
                }
              }}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                usaHorario ? 'bg-sa-green' : 'bg-sa-green-ink/20'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  usaHorario ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-sm font-medium text-sa-green-ink">
              Horario específico <span className="text-sa-green-ink/50 font-normal">(happy hour)</span>
            </span>
          </label>

          {usaHorario && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-sa-green-ink/60 mb-1">
                  Desde
                </label>
                <input
                  type="time"
                  value={form.horas_inicio ?? ''}
                  onChange={(e) => set('horas_inicio', e.target.value || null)}
                  className="w-full border border-sa-green-ink/15 bg-white rounded-sa px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sa-green/40"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-sa-green-ink/60 mb-1">
                  Hasta
                </label>
                <input
                  type="time"
                  value={form.horas_fin ?? ''}
                  onChange={(e) => set('horas_fin', e.target.value || null)}
                  className="w-full border border-sa-green-ink/15 bg-white rounded-sa px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sa-green/40"
                />
              </div>
            </div>
          )}
        </div>

        {/* Activa */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => set('activa', !form.activa)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              form.activa ? 'bg-sa-green' : 'bg-sa-green-ink/20'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.activa ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
          <span className="text-sm font-medium text-sa-green-ink">Promo activa</span>
        </label>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-sa-green-ink/15 text-sa-green-ink py-2.5 rounded-sa font-medium text-sm hover:bg-sa-cream-warm/50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="flex-1 bg-sa-green disabled:opacity-50 text-sa-cream py-2.5 rounded-sa font-medium text-sm hover:bg-sa-green-deep"
          >
            {guardando ? 'Guardando…' : promocion ? 'Actualizar' : 'Crear promoción'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
