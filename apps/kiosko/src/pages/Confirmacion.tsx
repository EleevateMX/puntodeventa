import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function Confirmacion() {
  const navigate = useNavigate()
  const location = useLocation()
  const folioReal = (location.state as { folio?: string | null } | null)?.folio ?? null
  const [segundos, setSegundos] = useState(8)

  const fallbackNumero = useMemo(
    () => Math.floor(100 + Math.random() * 900).toString().padStart(3, '0'),
    [],
  )
  const numeroOrden = folioReal ?? fallbackNumero

  useEffect(() => {
    const timer = setTimeout(() => navigate('/catalogo'), 8000)
    const tick = setInterval(
      () => setSegundos((s) => (s > 0 ? s - 1 : 0)),
      1000,
    )
    return () => {
      clearTimeout(timer)
      clearInterval(tick)
    }
  }, [navigate])

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-sa-green-deep text-sa-cream overflow-hidden px-8">
      {/* decorative chips */}
      <span className="absolute top-10 left-10 font-mono text-xs uppercase tracking-[0.3em] text-sa-banana">
        #ORDEN {numeroOrden}
      </span>
      <span className="absolute top-10 right-10 font-mono text-xs uppercase tracking-[0.3em] text-sa-cream/60">
        Shake Aholic
      </span>

      <img
        src="/milo.png"
        alt="Milo celebrando"
        className="h-64 w-auto drop-shadow-2xl mb-6"
      />

      <h1 className="font-display text-6xl leading-none text-center text-sa-cream">
        ¡Listo, campeón!
      </h1>

      <p className="font-body text-lg mt-5 text-center text-sa-cream/85 max-w-md">
        Estamos agitando lo tuyo. Sin polvo raro, sin pose fitness, sin pelos en la lengua.
      </p>

      <div className="mt-8 flex items-center gap-6">
        <div className="bg-sa-green-ink rounded-sa-lg px-6 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-sa-banana">
            Orden
          </p>
          <p className="font-display text-4xl text-sa-cream mt-1 leading-none">
            #{numeroOrden}
          </p>
        </div>
        <div className="bg-sa-green-ink rounded-sa-lg px-6 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-sa-banana">
            Listo en
          </p>
          <p className="font-display text-4xl text-sa-cream mt-1 leading-none">
            5 min
          </p>
        </div>
      </div>

      <p className="font-mono text-xs uppercase tracking-[0.25em] text-sa-cream/60 mt-10">
        Volvemos al menú en {segundos}s
      </p>

      <button
        onClick={() => navigate('/catalogo')}
        className="mt-5 bg-sa-strawberry text-white px-10 h-14 rounded-full font-display text-2xl shadow-sa active:scale-95 transition-transform"
      >
        Otro round
      </button>
    </div>
  )
}
