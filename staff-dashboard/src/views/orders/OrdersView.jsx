import { useState, useEffect } from 'react'
import orderService from '../../services/orderService.js'
import clsx from 'clsx'

const OrdersView = () => {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('active') // 'active' or 'all'

  useEffect(() => {
    loadOrders()
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadOrders, 10000)
    return () => clearInterval(interval)
  }, [filter])

  const loadOrders = async () => {
    setError(null)
    try {
      const data = filter === 'active'
        ? await orderService.getActiveOrders()
        : await orderService.getAllOrders()
      setOrders(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      await loadOrders()
    } catch (err) {
      alert(err.message || 'Failed to update order status')
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-200 border-yellow-500/30'
      case 'preparing':
        return 'bg-blue-500/10 text-blue-200 border-blue-500/30'
      case 'ready':
        return 'bg-green-500/10 text-green-200 border-green-500/30'
      case 'served':
        return 'bg-slate-600/20 text-slate-400 border-slate-600/30'
      case 'cancelled':
        return 'bg-red-500/10 text-red-200 border-red-500/30'
      default:
        return 'bg-slate-600/20 text-slate-400 border-slate-600/30'
    }
  }

  const getNextStatus = (currentStatus) => {
    switch (currentStatus?.toLowerCase()) {
      case 'pending':
        return 'Preparing'
      case 'preparing':
        return 'Ready'
      case 'ready':
        return 'Served'
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Orders</h2>
          <p className="text-sm text-slate-400">
            Monitor and manage incoming orders in real-time
          </p>
        </div>
        <button
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/5"
          onClick={loadOrders}
          type="button"
        >
          Refresh
        </button>
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('active')}
          className={clsx(
            'rounded-full px-4 py-2 text-sm font-medium transition',
            filter === 'active'
              ? 'bg-primary text-white'
              : 'border border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'
          )}
        >
          Active Orders
        </button>
        <button
          onClick={() => setFilter('all')}
          className={clsx(
            'rounded-full px-4 py-2 text-sm font-medium transition',
            filter === 'all'
              ? 'bg-primary text-white'
              : 'border border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'
          )}
        >
          All Orders
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-sidebar/60 px-6 py-10 text-center text-sm text-slate-400">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-sidebar/40 px-6 py-10 text-center text-sm text-slate-400">
          {filter === 'active' ? 'No active orders at the moment' : 'No orders yet'}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-white/10 bg-sidebar/70 p-5 shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Order #{order.id}</h3>
                  <p className="text-sm text-slate-400">{order.customerName}</p>
                </div>
                <span
                  className={clsx(
                    'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
                    getStatusColor(order.status)
                  )}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <svg
                    className="h-4 w-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Table {order.tableNumber} - {order.tableLocation}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <svg
                    className="h-4 w-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {new Date(order.createdAt).toLocaleTimeString()}
                </div>
              </div>

              {order.notes && (
                <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                  <p className="text-xs font-semibold text-blue-300 mb-1">Special Instructions</p>
                  <p className="text-sm text-blue-200">{order.notes}</p>
                </div>
              )}

              <div className="space-y-2 mb-4 border-t border-white/10 pt-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-300">
                      {item.quantity}x {item.menuItemName}
                    </span>
                    <span className="text-slate-400">
                      ${(item.priceAtOrder * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-white/10 pt-2 font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-primary">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {getNextStatus(order.status) && (
                <button
                  onClick={() => handleStatusChange(order.id, getNextStatus(order.status))}
                  className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  Mark as {getNextStatus(order.status)}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersView
