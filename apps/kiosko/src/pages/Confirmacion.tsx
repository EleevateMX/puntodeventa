import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import QRCode from 'qrcode'
import { cerrarSesionAuth, isSupabaseConfigured } from '@pos/supabase'
import { useCarrito } from '@/store/carritoStore'

export function Confirmacion() {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario } = useCarrito()
  const folioReal = (location.state as { folio?: string | null; total?: number } | null)?.folio ?? null
  const totalOrden = (location.state as { folio?: string | null; total?: number } | null)?.total ?? 0
  const [segundos, setSegundos] = useState(12)
  const [qrUrl, setQrUrl] = useState<string>('')
  const [mostrarQr, setMostrarQr] = useState(false)

  const fallbackNumero = useMemo(
    () => Math.floor(100 + Math.random() * 900).toString().padStart(3, '0'),
    [],
  )
  const numeroOrden = folioReal ?? fallbackNumero
  const puntosGanados = usuario?.clienteId ? Math.floor(totalOrden / 10) : 0

  // Generate QR with receipt data
  useEffect(() => {
    const data = JSON.stringify({
      folio: numeroOrden,
      tienda: 'Shake Aholic',
      total: totalOrden,
      fecha: new Date().toISOString().slice(0, 10),
      ...(usuario ? { cliente: usuario.nombre } : {}),
    })
    QRCode.toDataURL(data, { width: 220, margin: 2, color: { dark: '#14241D', light: '#F8F4EC' } })
      .then(setQrUrl)
      .catch(console.error)
  }, [numeroOrden, totalOrden, usuario])

  // Auto-redirect + sign out previous customer
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (isSupabaseConfigured) await cerrarSesionAuth().catch(console.error)
      navigate('/catalogo')
    }, 12000)
    const tick = setInterval(() => setSegundos((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => { clearTimeout(timer); clearInterval(tick) }
  }, [navigate])

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-sa-green-deep text-sa-cream overflow-hidden px-8">
      <span className="absolute top-10 left-10 font-mono text-xs uppercase tracking-[0.3em] text-sa-banana">
        #ORDEN {numeroOrden}
      </span>
      <span className="absolute top-10 right-10 font-mono text-xs uppercase tracking-[0.3em] text-sa-cream/60">
        Shake Aholic
      </span>

      <img src="/milo.png" alt="Milo celebrando" className="h-48 w-auto drop-shadow-2xl mb-4" />

      <h1 className="font-display text-5xl leading-none text-center text-sa-cream">
        ¡Listo, campeón!
      </h1>
      <p className="font-body text-base mt-4 text-center text-sa-cream/80 max-w-sm">
        Estamos agitando lo tuyo. Sin polvo raro, sin pose fitness.
      </p>

      {/* Loyalty earned */}
      {puntosGanados > 0 && (
        <div className="mt-4 bg-sa-banana/20 border border-sa-banana/40 rounded-sa px-5 py-2 flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <p className="font-display text-lg text-sa-banana">
            +{puntosGanados} puntos para {usuario?.nombre.split(' ')[0]}
          </p>
        </div>
      )}

      {/* Info row */}
      <div className="mt-5 flex items-center gap-4">
        <div className="bg-sa-green-ink rounded-sa-lg px-6 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-sa-banana">Orden</p>
          <p className="font-display text-4xl text-sa-cream mt-1 leading-none">#{numeroOrden}</p>
        </div>
        <div className="bg-sa-green-ink rounded-sa-lg px-6 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-sa-banana">Listo en</p>
          <p className="font-display text-4xl text-sa-cream mt-1 leading-none">5 min</p>
        </div>
      </div>

      {/* QR receipt toggle */}
      <div className="mt-5 flex flex-col items-center gap-2">
        {mostrarQr ? (
          <>
            {qrUrl && <img src={qrUrl} alt="QR recibo" className="w-44 h-44 rounded-sa shadow-lg" />}
            <p className="font-mono text-[10px] uppercase tracking-wide text-sa-cream/50">
              Escanea para guardar tu recibo digital
            </p>
          </>
        ) : (
          <button
            onClick={() => setMostrarQr(true)}
            className="flex items-center gap-2 border border-sa-cream/20 hover:border-sa-cream/50 text-sa-cream/60 hover:text-sa-cream px-5 py-2.5 rounded-sa transition-colors font-mono text-xs uppercase tracking-wide"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Ver recibo digital (QR)
          </button>
        )}
      </div>

      <p className="font-mono text-xs uppercase tracking-[0.25em] text-sa-cream/50 mt-4">
        Volvemos al menú en {segundos}s
      </p>

      <button
        onClick={() => navigate('/catalogo')}
        className="mt-4 bg-sa-strawberry text-white px-10 h-12 rounded-full font-display text-xl shadow-sa active:scale-95 transition-transform"
      >
        Otro round
      </button>
    </div>
  )
}
