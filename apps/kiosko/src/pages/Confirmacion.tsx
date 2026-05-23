import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import QRCode from 'qrcode'
import { cerrarSesionAuth, isSupabaseConfigured } from '@pos/supabase'
import type { ItemCarrito, UsuarioKiosko } from '@/store/carritoStore'

interface EstadoConfirmacion {
  folio?: string | null
  total?: number
  metodo?: 'terminal' | 'efectivo'
  items?: ItemCarrito[]
  usuario?: UsuarioKiosko | null
}

function generarTicketHTML(params: {
  folio: string
  total: number
  metodo: string
  items: ItemCarrito[]
  usuario: UsuarioKiosko | null
  puntosGanados: number
  qrUrl: string
  fecha: string
}) {
  const { folio, total, metodo, items, usuario, puntosGanados, qrUrl, fecha } = params
  const sepFull = '================================'
  const sepDash = '--------------------------------'

  const lineasItems = items
    .map((i) => {
      const nombre = i.nombre.length > 16 ? i.nombre.slice(0, 15) + '…' : i.nombre
      const subtotal = `$${(i.precio * i.cantidad).toFixed(2)}`
      const qty = `x${i.cantidad}`
      const pad = 28 - nombre.length - qty.length - subtotal.length
      return `${nombre} ${qty}${' '.repeat(Math.max(1, pad))}${subtotal}`
    })
    .join('\n')

  const metodoLabel = metodo === 'terminal' ? 'Terminal · Tarjeta' : 'Efectivo · Caja'

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Ticket Shake Aholic #${folio}</title>
<style>
  @page { margin: 4mm; size: 80mm auto; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    color: #000;
    background: #fff;
    width: 72mm;
    padding: 4mm 2mm;
  }
  .center { text-align: center; }
  .right  { text-align: right; }
  .bold   { font-weight: bold; }
  .lg     { font-size: 15px; font-weight: bold; }
  .xl     { font-size: 18px; font-weight: bold; }
  .sep    { letter-spacing: -1px; margin: 4px 0; }
  .items  { width: 100%; border-collapse: collapse; margin: 4px 0; }
  .items td { vertical-align: top; padding: 1px 0; }
  .items .name { width: 55%; }
  .items .qty  { width: 10%; text-align: center; }
  .items .price{ width: 35%; text-align: right; }
  .total-row { display: flex; justify-content: space-between; margin: 2px 0; }
  .qr-img { display: block; margin: 6px auto; width: 120px; height: 120px; }
  pre { white-space: pre-wrap; font-family: inherit; font-size: 11px; }
</style>
</head>
<body>
<div class="center">
  <p class="lg">SHAKE AHOLIC</p>
  <p style="font-size:10px">Kiosko 01 · MXN</p>
</div>
<p class="sep center">${sepFull}</p>

<p>FOLIO: <span class="bold">#${folio}</span></p>
<p>FECHA: ${fecha}</p>
<p>CANAL: Kiosko</p>

<p class="sep">${sepDash}</p>

<table class="items">
  <tbody>
    ${items.map((i) => `
    <tr>
      <td class="name">${i.nombre}</td>
      <td class="qty">x${i.cantidad}</td>
      <td class="price">$${(i.precio * i.cantidad).toFixed(2)}</td>
    </tr>`).join('')}
  </tbody>
</table>

<p class="sep">${sepDash}</p>

<div class="total-row"><span>SUBTOTAL</span><span>$${total.toFixed(2)}</span></div>
<div class="total-row bold xl"><span>TOTAL</span><span>$${total.toFixed(2)}</span></div>

<p class="sep">${sepDash}</p>

<p>MÉTODO: ${metodoLabel}</p>

${usuario ? `
<p class="sep">${sepDash}</p>
<p>CLIENTE: ${usuario.nombre}</p>
${puntosGanados > 0 ? `<p>PUNTOS GANADOS: +${puntosGanados} pts</p>` : ''}
` : ''}

<p class="sep center">${sepFull}</p>
<p class="center bold">¡Gracias por tu visita!</p>
<p class="center" style="font-size:10px">Sin polvo raro. Sin pose fitness.</p>
<p class="sep center">${sepFull}</p>

${qrUrl ? `
<img class="qr-img" src="${qrUrl}" alt="QR recibo"/>
<p class="center" style="font-size:10px">Escanea para recibo digital</p>
` : ''}

<p class="center sep" style="margin-top:8px">- - - - - - - - - - - - - - - - -</p>

<script>window.onload = function(){ window.print(); }</script>
</body>
</html>`
}

export function Confirmacion() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as EstadoConfirmacion | null) ?? {}

  const folioReal  = state.folio  ?? null
  const totalOrden = state.total  ?? 0
  const metodo     = state.metodo ?? 'efectivo'
  const items      = state.items  ?? []
  const usuario    = state.usuario ?? null

  const [segundos, setSegundos] = useState(15)
  const [qrUrl, setQrUrl] = useState<string>('')
  const [mostrarQr, setMostrarQr] = useState(false)

  const fallbackNumero = useMemo(
    () => Math.floor(100 + Math.random() * 900).toString().padStart(3, '0'),
    [],
  )
  const numeroOrden   = folioReal ?? fallbackNumero
  const puntosGanados = usuario?.clienteId ? Math.floor(totalOrden / 10) : 0
  const fecha = new Date().toLocaleString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  useEffect(() => {
    const data = JSON.stringify({
      folio: numeroOrden,
      tienda: 'Shake Aholic',
      total: totalOrden,
      fecha: new Date().toISOString().slice(0, 10),
      ...(usuario ? { cliente: usuario.nombre } : {}),
    })
    QRCode.toDataURL(data, { width: 240, margin: 2, color: { dark: '#14241D', light: '#F8F4EC' } })
      .then(setQrUrl)
      .catch(console.error)
  }, [numeroOrden, totalOrden, usuario])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (isSupabaseConfigured) await cerrarSesionAuth().catch(console.error)
      navigate('/catalogo')
    }, 15000)
    const tick = setInterval(() => setSegundos((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => { clearTimeout(timer); clearInterval(tick) }
  }, [navigate])

  function imprimirTicket() {
    const html = generarTicketHTML({
      folio: numeroOrden,
      total: totalOrden,
      metodo,
      items,
      usuario,
      puntosGanados,
      qrUrl,
      fecha,
    })
    const win = window.open('', '_blank', 'width=420,height=700,toolbar=0,menubar=0')
    if (!win) return
    win.document.write(html)
    win.document.close()
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-sa-green-deep text-sa-cream overflow-hidden px-8">
      <span className="absolute top-10 left-10 font-mono text-xs uppercase tracking-[0.3em] text-sa-banana">
        #ORDEN {numeroOrden}
      </span>
      <span className="absolute top-10 right-10 font-mono text-xs uppercase tracking-[0.3em] text-sa-cream/60">
        Shake Aholic
      </span>

      <img src="/milo.png" alt="Milo celebrando" className="h-44 w-auto drop-shadow-2xl mb-3" />

      <h1 className="font-display text-5xl leading-none text-center text-sa-cream">
        ¡Listo, campeón!
      </h1>
      <p className="font-body text-base mt-3 text-center text-sa-cream/80 max-w-sm">
        Estamos agitando lo tuyo. Sin polvo raro, sin pose fitness.
      </p>

      {/* Loyalty earned */}
      {puntosGanados > 0 && (
        <div className="mt-3 bg-sa-banana/20 border border-sa-banana/40 rounded-sa px-5 py-2 flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <p className="font-display text-lg text-sa-banana">
            +{puntosGanados} puntos para {usuario?.nombre?.split(' ')[0]}
          </p>
        </div>
      )}

      {/* Info row */}
      <div className="mt-4 flex items-center gap-4">
        <div className="bg-sa-green-ink rounded-sa-lg px-6 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-sa-banana">Orden</p>
          <p className="font-display text-4xl text-sa-cream mt-1 leading-none">#{numeroOrden}</p>
        </div>
        <div className="bg-sa-green-ink rounded-sa-lg px-6 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-sa-banana">Listo en</p>
          <p className="font-display text-4xl text-sa-cream mt-1 leading-none">5 min</p>
        </div>
        <div className="bg-sa-green-ink rounded-sa-lg px-6 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-sa-banana">Total</p>
          <p className="font-display text-4xl text-sa-cream mt-1 leading-none">${totalOrden.toFixed(0)}</p>
        </div>
      </div>

      {/* Actions row */}
      <div className="mt-5 flex flex-col items-center gap-3 w-full max-w-xs">
        {/* Print ticket */}
        <button
          onClick={imprimirTicket}
          className="w-full flex items-center justify-center gap-2 bg-sa-cream text-sa-green-ink px-6 py-3 rounded-full font-display text-xl shadow-sa active:scale-95 transition-transform"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Imprimir ticket
        </button>

        {/* QR digital */}
        {mostrarQr ? (
          <div className="flex flex-col items-center gap-1">
            {qrUrl && <img src={qrUrl} alt="QR recibo" className="w-36 h-36 rounded-sa shadow-lg" />}
            <p className="font-mono text-[10px] uppercase tracking-wide text-sa-cream/50">
              Recibo digital
            </p>
          </div>
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

      <div className="mt-5 flex items-center gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-sa-cream/50">
          Menú en {segundos}s
        </p>
        <button
          onClick={() => navigate('/catalogo')}
          className="bg-sa-strawberry text-white px-8 h-12 rounded-full font-display text-xl shadow-sa active:scale-95 transition-transform"
        >
          Otro round
        </button>
      </div>
    </div>
  )
}
