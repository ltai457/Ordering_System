import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import orderService from '../../services/orderService.js'

const STATUS_COLUMNS = [
  { key: 'Received', label: 'New Orders', accent: 'border-emerald-500/60' },
  { key: 'Preparing', label: 'Cooking', accent: 'border-amber-500/60' },
  { key: 'Ready', label: 'Ready to Serve', accent: 'border-blue-500/60' },
]

const KitchenView = () => {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [highlightedIds, setHighlightedIds] = useState([])

  const previousIdsRef = useRef(new Set())
  const timersRef = useRef({})

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await orderService.getActiveOrders()
        const newIds = data
          .filter((order) => !previousIdsRef.current.has(order.id))
          .map((order) => order.id)

        previousIdsRef.current = new Set(data.map((order) => order.id))
        setOrders(data)
        setIsLoading(false)
        setError(null)

        if (newIds.length > 0) {
          setHighlightedIds((prev) => Array.from(new Set([...prev, ...newIds])))
          newIds.forEach((id) => {
            if (timersRef.current[id]) {
              clearTimeout(timersRef.current[id])
            }
            timersRef.current[id] = setTimeout(() => {
              setHighlightedIds((prev) => prev.filter((existingId) => existingId !== id))
              delete timersRef.current[id]
            }, 4000)
          })
        }
      } catch (err) {
        setError(err.message || 'Failed to load orders')
        setIsLoading(false)
      }
    }

    loadOrders()
    const interval = setInterval(loadOrders, 5000)

    return () => {
      clearInterval(interval)
      Object.values(timersRef.current).forEach((timer) => clearTimeout(timer))
      timersRef.current = {}
    }
  }, [])

  const groupedOrders = useMemo(() => {
    return STATUS_COLUMNS.reduce((acc, column) => {
      acc[column.key] = orders
        .filter((order) => order.status?.toLowerCase() === column.key.toLowerCase())
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      return acc
    }, {})
  }, [orders])

  const getNextStatus = (currentStatus) => {
    switch (currentStatus?.toLowerCase()) {
      case 'received':
        return 'Preparing'
      case 'preparing':
        return 'Ready'
      default:
        return null
    }
  }

  const handleAdvanceStatus = async (order) => {
    const nextStatus = getNextStatus(order.status)
    if (!nextStatus) return

    try {
      await orderService.updateOrderStatus(order.id, nextStatus)
      setOrders((prev) =>
        prev.map((existingOrder) =>
          existingOrder.id === order.id
            ? { ...existingOrder, status: nextStatus, updatedAt: new Date().toISOString() }
            : existingOrder
        )
      )
    } catch (err) {
      alert(err.message || 'Failed to update order status')
    }
  }

  const handleMarkServed = async (order) => {
    try {
      await orderService.updateOrderStatus(order.id, 'Served')
      setOrders((prev) => prev.filter((existingOrder) => existingOrder.id !== order.id))
    } catch (err) {
      alert(err.message || 'Failed to mark order as served')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Kitchen Display</h2>
          <p className="text-sm text-slate-400">
            Track incoming orders and move them through the line.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            Auto-refreshing
          </span>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-sidebar/60 px-6 py-10 text-center text-sm text-slate-400">
          Loading active orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-sidebar/40 px-6 py-10 text-center text-sm text-slate-400">
          No open orders right now.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {STATUS_COLUMNS.map((column) => {
            const columnOrders = groupedOrders[column.key] ?? []
            return (
              <section
                key={column.key}
                className={clsx(
                  'flex flex-col rounded-2xl border bg-sidebar/70 backdrop-blur shadow-lg',
                  column.accent || 'border-white/10'
                )}
              >
                <header className="border-b border-white/10 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                      {column.label}
                    </h3>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">
                      {columnOrders.length}
                    </span>
                  </div>
                </header>

                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                  {columnOrders.length === 0 ? (
                    <p className="text-xs text-slate-500">No orders in this lane.</p>
                  ) : (
                    columnOrders.map((order) => {
                      const highlight = highlightedIds.includes(order.id)
                      const nextStatus = getNextStatus(order.status)

                      return (
                        <article
                          key={order.id}
                          className={clsx(
                            'rounded-xl border border-white/10 bg-sidebar/90 px-4 py-4 shadow-md transition',
                            highlight ? 'ring-2 ring-emerald-400/60 animate-pulse' : ''
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-lg font-bold text-white">
                                #{order.id}
                              </h4>
                              <p className="text-xs text-slate-400">
                                Table {order.tableNumber || '—'}
                                {order.tableLocation ? ` • ${order.tableLocation}` : ''}
                                {order.tableCode ? ` • ${order.tableCode}` : ''}
                              </p>
                            </div>
                            <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white">
                              {order.status}
                            </span>
                          </div>

                          <div className="mt-3 space-y-2">
                            {order.orderItems?.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200"
                              >
                                <div className="flex justify-between">
                                  <span className="font-semibold">
                                    {item.quantity} × {item.menuItemName}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    ${(item.unitPrice * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                                {item.specialInstructions && (
                                  <p className="mt-1 rounded-md bg-amber-500/10 px-2 py-1 text-xs text-amber-200">
                                    {item.specialInstructions}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          {order.notes && (
                            <div className="mt-3 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-200">
                              Guest note: {order.notes}
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap gap-2">
                            {nextStatus && (
                              <button
                                className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary/90"
                                onClick={() => handleAdvanceStatus(order)}
                                type="button"
                              >
                                Mark {nextStatus}
                              </button>
                            )}
                            {order.status?.toLowerCase() === 'ready' && (
                              <button
                                className="flex-1 rounded-lg border border-emerald-400/40 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/10"
                                onClick={() => handleMarkServed(order)}
                                type="button"
                              >
                                Send to Floor
                              </button>
                            )}
                          </div>
                        </article>
                      )
                    })
                  )}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default KitchenView
