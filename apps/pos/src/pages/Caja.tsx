import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePosStore } from '@/store/posStore'
import { CatalogoBusqueda } from '@/components/pos/CatalogoBusqueda'
import { OrdenPanel } from '@/components/pos/OrdenPanel'
import { useProductosPOS } from '@/hooks/useProductosPOS'

export function Caja() {
  const navigate = useNavigate()
  const { empleadoActivo, cerrarSesion, limpiarOrden } = usePosStore()
  const [horaActual, setHoraActual] = useState(new Date())
  const { productos, categorias, loading } = useProductosPOS()

  useEffect(() => {
    const interval = setInterval(() => setHoraActual(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  const hora = horaActual.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="h-screen flex flex-col bg-sa-cream-paper overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-2.5 bg-sa-green-deep text-sa-cream flex-shrink-0 border-b border-sa-cream/10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Shake Aholic" className="h-[110px] w-auto -my-6" />
          <span className="font-mono text-xs uppercase tracking-widest text-sa-cream/50">Sucursal Principal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-sa-cream/70">{hora}</span>
          <span className="font-display text-lg text-sa-cream">
            {empleadoActivo?.nombre.split(' ')[0]}
          </span>
          <button
            onClick={() => navigate('/corte')}
            className="font-mono text-xs uppercase tracking-wide bg-sa-cream-warm/10 hover:bg-sa-cream-warm/20 text-sa-cream px-4 py-2 rounded-full transition-colors border border-sa-cream/20"
          >
            Corte de caja
          </button>
          <button
            onClick={() => { limpiarOrden(); cerrarSesion() }}
            className="font-mono text-xs uppercase tracking-wide bg-sa-strawberry/15 hover:bg-sa-strawberry/30 text-sa-strawberry px-4 py-2 rounded-full transition-colors border border-sa-strawberry/30"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Main split layout */}
      <div className="flex-1 flex overflow-hidden gap-3 p-3">
        {/* Left: Catalog */}
        <div className="flex-1 flex flex-col overflow-hidden bg-sa-cream-soft rounded-sa shadow-sa-sm">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="font-mono text-sm text-sa-green-ink/50 animate-pulse">Cargando menú…</p>
            </div>
          ) : (
            <CatalogoBusqueda
              productos={productos}
              categorias={categorias}
            />
          )}
        </div>

        {/* Right: Order panel */}
        <div className="w-96 flex-shrink-0 flex flex-col bg-white rounded-sa shadow-sa-sm overflow-hidden">
          <OrdenPanel onCobrar={() => navigate('/cobro')} />
        </div>
      </div>
    </div>
  )
}
