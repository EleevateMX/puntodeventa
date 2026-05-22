import React, { useState } from 'react'
import { useInventario, type Insumo } from '../hooks/useInventario'
import { TablaInsumos } from '../components/inventario/TablaInsumos'
import { ModalInsumo } from '../components/inventario/ModalInsumo'
import { TablaStock } from '../components/inventario/TablaStock'
import { TablaLotes } from '../components/inventario/TablaLotes'
import { ModalLote } from '../components/inventario/ModalLote'
import { TablaMermas } from '../components/inventario/TablaMermas'
import { ModalMerma } from '../components/inventario/ModalMerma'
import { TablaTransferencias } from '../components/inventario/TablaTransferencias'
import { ModalTransferencia } from '../components/inventario/ModalTransferencia'

type Tab = 'insumos' | 'stock' | 'lotes' | 'mermas' | 'transferencias'

export function Inventario() {
  const inv = useInventario()
  const [tab, setTab] = useState<Tab>('insumos')

  // Modals
  const [modalInsumo, setModalInsumo] = useState(false)
  const [insumoEditar, setInsumoEditar] = useState<Insumo | null>(null)
  const [modalLote, setModalLote] = useState(false)
  const [modalMerma, setModalMerma] = useState(false)
  const [modalTransferencia, setModalTransferencia] = useState(false)
  const [confirmEliminar, setConfirmEliminar] = useState<{ tipo: string; id: string; nombre: string } | null>(null)

  function abrirNuevoInsumo() { setInsumoEditar(null); setModalInsumo(true) }
  function abrirEditarInsumo(i: Insumo) { setInsumoEditar(i); setModalInsumo(true) }

  const TABS: { key: Tab; label: string; icon: string; badge?: number }[] = [
    { key: 'insumos', label: 'Insumos', icon: '🧂', badge: inv.insumos.length },
    { key: 'stock', label: 'Stock', icon: '📊', badge: inv.alertasStock.length > 0 ? inv.alertasStock.length : undefined },
    { key: 'lotes', label: 'Lotes', icon: '📦', badge: inv.lotesVencidos.length + inv.lotesPorVencer.length > 0 ? inv.lotesVencidos.length + inv.lotesPorVencer.length : undefined },
    { key: 'mermas', label: 'Mermas', icon: '🗑️' },
    { key: 'transferencias', label: 'Transferencias', icon: '🚚' },
  ]

  const CTA: Record<Tab, { label: string; onClick: () => void } | null> = {
    insumos: { label: '+ Nuevo insumo', onClick: abrirNuevoInsumo },
    stock: null,
    lotes: { label: '+ Registrar lote', onClick: () => setModalLote(true) },
    mermas: { label: '+ Registrar merma', onClick: () => setModalMerma(true) },
    transferencias: { label: '+ Nueva transferencia', onClick: () => setModalTransferencia(true) },
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-8 pt-8 pb-0 bg-gray-50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inventario</h2>
            {inv.alertasStock.length > 0 && (
              <p className="text-yellow-600 text-sm mt-0.5">
                ⚠ {inv.alertasStock.length} insumo{inv.alertasStock.length > 1 ? 's' : ''} con stock bajo mínimo
              </p>
            )}
          </div>
          {CTA[tab] && (
            <button
              onClick={CTA[tab]!.onClick}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              {CTA[tab]!.label}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-medium transition-all border-b-2 ${
                tab === t.key
                  ? 'bg-white text-gray-900 border-orange-500'
                  : 'text-gray-500 hover:text-gray-700 border-transparent hover:bg-white/60'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
              {t.badge !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  tab === t.key
                    ? t.key === 'stock' || t.key === 'lotes'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 bg-gray-50 border-t border-gray-200">
        {tab === 'insumos' && (
          <TablaInsumos
            insumos={inv.insumos}
            stock={inv.stock}
            almacenes={inv.almacenes}
            onEditar={abrirEditarInsumo}
            onEliminar={(i) => setConfirmEliminar({ tipo: 'insumo', id: i.id, nombre: i.nombre })}
          />
        )}
        {tab === 'stock' && (
          <TablaStock
            insumos={inv.insumos}
            stock={inv.stock}
            almacenes={inv.almacenes}
            onAjustar={inv.ajustarStock}
          />
        )}
        {tab === 'lotes' && (
          <TablaLotes
            lotes={inv.lotes}
            insumos={inv.insumos}
            almacenes={inv.almacenes}
            onEliminar={(id) => inv.borrarLote(id)}
          />
        )}
        {tab === 'mermas' && (
          <TablaMermas
            mermas={inv.mermas}
            insumos={inv.insumos}
            almacenes={inv.almacenes}
          />
        )}
        {tab === 'transferencias' && (
          <TablaTransferencias
            transferencias={inv.transferencias}
            insumos={inv.insumos}
            almacenes={inv.almacenes}
            onCambiarEstado={inv.cambiarEstadoTransferencia}
          />
        )}
      </div>

      {/* Modals */}
      <ModalInsumo
        open={modalInsumo}
        onClose={() => setModalInsumo(false)}
        insumo={insumoEditar}
        onGuardar={(data) =>
          insumoEditar ? inv.editarInsumo(insumoEditar.id, data) : inv.agregarInsumo(data)
        }
      />
      <ModalLote
        open={modalLote}
        onClose={() => setModalLote(false)}
        onGuardar={inv.agregarLote}
        insumos={inv.insumos}
        almacenes={inv.almacenes}
      />
      <ModalMerma
        open={modalMerma}
        onClose={() => setModalMerma(false)}
        onGuardar={inv.registrarMerma}
        insumos={inv.insumos}
        almacenes={inv.almacenes}
        lotes={inv.lotes}
      />
      <ModalTransferencia
        open={modalTransferencia}
        onClose={() => setModalTransferencia(false)}
        onGuardar={inv.crearTransferencia}
        insumos={inv.insumos}
        almacenes={inv.almacenes}
      />

      {/* Delete confirm */}
      {confirmEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmEliminar(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar {confirmEliminar.tipo}?</h3>
            <p className="text-gray-500 text-sm mb-5">
              Se eliminará <span className="font-medium text-gray-700">"{confirmEliminar.nombre}"</span> permanentemente.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmEliminar(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50">Cancelar</button>
              <button
                onClick={() => {
                  if (confirmEliminar.tipo === 'insumo') inv.borrarInsumo(confirmEliminar.id)
                  setConfirmEliminar(null)
                }}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
