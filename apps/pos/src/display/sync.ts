type DisplayItem = { id: string; nombre: string; cantidad: number; precio: number }

type DisplayEvent =
  | { type: 'item-added'; item: DisplayItem; total: number; totalItems: number }
  | { type: 'item-removed'; id: string; total: number; totalItems: number }
  | { type: 'cart-cleared' }
  | { type: 'order-paid'; folio: string }

const CHANNEL = 'shakeaholic-display'

export function publish(event: DisplayEvent): void {
  try {
    if (typeof BroadcastChannel === 'undefined') return
    const ch = new BroadcastChannel(CHANNEL)
    ch.postMessage(event)
    ch.close()
  } catch {
    // no-op in environments without BroadcastChannel
  }
}
