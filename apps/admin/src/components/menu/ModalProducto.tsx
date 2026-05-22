import React, { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import type { ProductoConCategoria, CategoriaConCocina, ProductoInput } from '../../hooks/useMenu'

interface Props {
  open: boolean
  onClose: () => void
  onGuardar: (input: ProductoInput) => Promise<unknown>
  producto: ProductoConCategoria | null
  categorias: CategoriaConCocina[]
}

const VACIO: ProductoInput = {
  nombre: '',
  descripcion: '',
  precio: 0,
  imagen_url: '',
  categoria_id: '',
  activo: true,
}

export function ModalProducto({ open, onClose, onGuardar, producto, categorias }: Props) {
  const [form, setForm] = useState<ProductoInput>(VACIO)
  const [filtroCocina, setFiltroCocina] = useState<string>('')
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState<Partial<Record<keyof ProductoInput, string>>>({})

  useEffect(() => {
    if (!open) return
    if (producto) {
      setForm({
        nombre: producto.nombre,
        descripcion: producto.descripcion ?? '',
        precio: producto.precio,
        imagen_url: producto.imagen_url ?? '',
        categoria_id: producto.categoria_id,
        activo: producto.activo,
      })
      setFiltroCocina(producto.categorias?.cocinas?.id ?? '')
    } else {
      setForm(VACIO)
      setFiltroCocina('')
    }
    setErrores({})
  }, [open, producto])

  const categoriasFiltradas = filtroCocina
    ? categorias.filter((c) => c.cocina_id === filtroCocina)
    : categorias

  function set<K extends keyof ProductoInput>(key: K, value: ProductoInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrores((prev) => ({ ...prev, [key]: undefined }))
  }

  function validar(): boolean {
    const e: typeof errores = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (form.precio <= 0) e.precio = 'Debe ser mayor a 0'
    if (!form.categoria_id) e.categoria_id = 'Selecciona una categoría'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return
    setGuardando(true)
    try {
      await onGuardar(form)
      onClose()
    } finally {
      setGuardando(false)
    }
  }

  const cocinaUnica = Array.from(
    new Map(
      categorias
        .filter((c) => c.cocinas)
        .map((c) => [c.cocinas!.id, c.cocinas!]),
    ).values(),
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={producto ? 'Editar producto' : 'Nuevo producto'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">
            Nombre <span className="text-sa-strawberry">*</span>
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Ej. Pechuga a la plancha"
            className="w-full border border-sa-green-ink/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
          />
          {errores.nombre && <p className="text-sa-strawberry text-xs mt-1">{errores.nombre}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => set('descripcion', e.target.value)}
            placeholder="Ingredientes o descripción breve"
            rows={2}
            className="w-full border border-sa-green-ink/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40 resize-none"
          />
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">
            Precio (MXN) <span className="text-sa-strawberry">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sa-green-ink/40 text-sm">$</span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={form.precio || ''}
              onChange={(e) => set('precio', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full border border-sa-green-ink/15 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
            />
          </div>
          {errores.precio && <p className="text-sa-strawberry text-xs mt-1">{errores.precio}</p>}
        </div>

        {/* Cocina (filtro) */}
        <div>
          <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">Cocina</label>
          <select
            value={filtroCocina}
            onChange={(e) => {
              setFiltroCocina(e.target.value)
              set('categoria_id', '')
            }}
            className="w-full border border-sa-green-ink/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40 bg-white"
          >
            <option value="">Todas las cocinas</option>
            {cocinaUnica.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">
            Categoría <span className="text-sa-strawberry">*</span>
          </label>
          <select
            value={form.categoria_id}
            onChange={(e) => set('categoria_id', e.target.value)}
            className="w-full border border-sa-green-ink/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40 bg-white"
          >
            <option value="">Selecciona categoría</option>
            {categoriasFiltradas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          {errores.categoria_id && (
            <p className="text-sa-strawberry text-xs mt-1">{errores.categoria_id}</p>
          )}
        </div>

        {/* Imagen URL */}
        <div>
          <label className="block text-sm font-medium text-sa-green-ink/80 mb-1">URL de imagen</label>
          <input
            type="url"
            value={form.imagen_url}
            onChange={(e) => set('imagen_url', e.target.value)}
            placeholder="https://..."
            className="w-full border border-sa-green-ink/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green/40"
          />
          {form.imagen_url && (
            <img
              src={form.imagen_url}
              alt="preview"
              className="mt-2 h-20 w-20 object-cover rounded-xl border border-sa-green-ink/10"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}
        </div>

        {/* Activo */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => set('activo', !form.activo)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              form.activo ? 'bg-sa-green' : 'bg-sa-green-ink/15'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.activo ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
          <span className="text-sm font-medium text-sa-green-ink/80">Producto activo</span>
        </label>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-sa-green-ink/15 text-sa-green-ink/80 py-2.5 rounded-xl font-medium text-sm hover:bg-sa-cream-paper"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="flex-1 bg-sa-green disabled:opacity-50 text-sa-cream py-2.5 rounded-xl font-medium text-sm hover:bg-sa-green-deep"
          >
            {guardando ? 'Guardando...' : producto ? 'Actualizar' : 'Crear producto'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
