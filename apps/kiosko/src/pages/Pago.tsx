import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearOrden, agregarPuntosCliente, isSupabaseConfigured } from '@pos/supabase'
import { useCarrito } from '@/store/carritoStore'

type MetodoPago = 'terminal' | 'efectivo'

export function Pago() {
  const navigate = useNavigate()
  const { items, total, usuario, limpiar } = useCarrito()
  const [metodo, setMetodo] = useState<MetodoPago | null>(null)
  const [procesando, setProcesando] = useState(false)

  async function confirmarPago() {
    if (!metodo) return
    setProcesando(true)

    const totalOrden = total()
    let folio: string | null = null

    if (isSupabaseConfigured) {
      try {
        const mapMetodo = metodo === 'terminal' ? 'tarjeta_debito' : 'efectivo'
        const orden = await crearOrden(
          {
            sucursal_id: '00000000-0000-0000-0000-000000000001',
            canal: 'kiosko',
            metodo_pago: mapMetodo,
            total: totalOrden,
            cliente_id: usuario?.clienteId ?? null,
          },
          items.map((i) => ({
            producto_id: i.producto_id,
            cantidad: i.cantidad,
            precio_unitario: i.precio,
            cocina_id: i.cocina_id,
            personalizacion: i.personalizacion ?? null,
          }))
        )
        folio = String(orden.folio)

        // Award loyalty points — never blocks checkout
        if (usuario?.clienteId) {
          const puntos = Math.floor(totalOrden / 10)
          if (puntos > 0) {
            agregarPuntosCliente(usuario.clienteId, puntos, orden.id).catch(console.error)
          }
        }
      } catch (e) {
        console.error('[Kiosko] Error guardando orden:', e)
      }
    } else {
      await new Promise((r) => setTimeout(r, 1500))
    }

    limpiar()
    navigate('/confirmacion', { state: { folio, total: totalOrden } })
    setProcesando(false)
  }

  return (
    <div className="flex flex-col h-screen bg-sa-cream-paper">
      <header className="flex items-center gap-4 px-8 py-6 bg-sa-green-deep text-sa-cream">
        <button
          onClick={() => navigate('/carrito')}
          className="w-12 h-12 rounded-full bg-sa-green-ink hover:bg-sa-green flex items-center justify-center text-2xl"
          aria-label="Volver"
        >
          ←
        </button>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-sa-banana">
            #PAGO
          </p>
          <h1 className="font-display text-3xl mt-1">¿Cómo lo pagas?</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-8 py-10">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-sa-green/70">
            Total a soltar
          </p>
          <p className="font-display text-7xl text-sa-green-ink leading-none mt-2">
            ${total().toFixed(2)}
          </p>
          <p className="font-mono text-sm text-sa-green-ink/60 mt-2">MXN · sin pelos en la lengua</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-md">
          <button
            onClick={() => setMetodo('terminal')}
            className={`flex items-center gap-5 p-6 rounded-sa-lg transition-all text-left ${
              metodo === 'terminal'
                ? 'bg-sa-cream-soft ring-4 ring-sa-green shadow-sa'
                : 'bg-sa-cream-soft hover:bg-sa-cream shadow-sa-sm'
            }`}
          >
            <span className="text-5xl">💳</span>
            <div>
              <p className="font-display text-2xl text-sa-green-ink leading-tight">
                Terminal
              </p>
              <p className="font-mono text-xs uppercase tracking-wider text-sa-green-ink/60 mt-1">
                Mercado Pago · tarjeta
              </p>
            </div>
          </button>

          <button
            onClick={() => setMetodo('efectivo')}
            className={`flex items-center gap-5 p-6 rounded-sa-lg transition-all text-left ${
              metodo === 'efectivo'
                ? 'bg-sa-cream-soft ring-4 ring-sa-green shadow-sa'
                : 'bg-sa-cream-soft hover:bg-sa-cream shadow-sa-sm'
            }`}
          >
            <span className="text-5xl">💵</span>
            <div>
              <p className="font-display text-2xl text-sa-green-ink leading-tight">
                Efectivo
              </p>
              <p className="font-mono text-xs uppercase tracking-wider text-sa-green-ink/60 mt-1">
                Paga en caja · billete en mano
              </p>
            </div>
          </button>
        </div>
      </main>

      <footer className="px-8 py-6 bg-sa-cream-paper">
        <button
          onClick={confirmarPago}
          disabled={!metodo || procesando}
          className="w-full bg-sa-strawberry disabled:bg-sa-cream-warm disabled:text-sa-green-ink/40 text-white py-5 rounded-full font-display text-3xl shadow-sa-sm active:scale-[0.98] transition-transform"
        >
          {procesando ? 'Agitando...' : 'Confirmar pago'}
        </button>
      </footer>
    </div>
  )
}
