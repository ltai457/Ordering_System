import { useState, useEffect } from 'react'
import orderService from '../../services/orderService.js'
import clsx from 'clsx'

const TillView = () => {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingOrderId, setProcessingOrderId] = useState(null)

  useEffect(() => {
    loadOrders()
    // Auto-refresh every 5 seconds for till
    const interval = setInterval(loadOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadOrders = async () => {
    setError(null)
    try {
      const data = await orderService.getPendingOrders()
      setOrders(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load pending orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptOrder = async (orderId) => {
    setProcessingOrderId(orderId)
    try {
      const response = await orderService.acceptOrder(orderId)

      // If print is required, trigger print
      if (response.printRequired && response.order) {
        printKitchenReceipt(response.order)
      }

      // Reload orders
      await loadOrders()

      // Show success notification
      alert(`Order #${orderId} accepted and sent to kitchen!`)
    } catch (err) {
      alert(err.message || 'Failed to accept order')
    } finally {
      setProcessingOrderId(null)
    }
  }

  const printKitchenReceipt = (order) => {
    // Create a print window with kitchen receipt format
    const printWindow = window.open('', '', 'width=300,height=600')

    // Filter only items from the latest batch
    const latestBatchItems = order.orderItems.filter(item => item.batchNumber === order.currentBatch)
    const isAdditionalOrder = order.currentBatch > 1

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kitchen Receipt - Order #${order.id}</title>
        <style>
          @media print {
            @page { margin: 0; }
            body { margin: 10px; }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 280px;
            margin: 0 auto;
            padding: 10px;
          }
          .header {
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
          }
          .table-number {
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            margin: 15px 0;
            padding: 15px;
            border: 3px solid #000;
            background: #f0f0f0;
          }
          .info {
            margin: 10px 0;
            font-size: 11px;
          }
          .items {
            margin: 15px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
          }
          .item {
            margin: 8px 0;
          }
          .item-header {
            font-weight: bold;
            font-size: 14px;
          }
          .item-note {
            font-style: italic;
            margin-left: 10px;
            color: #666;
          }
          .notes {
            margin: 10px 0;
            padding: 8px;
            border: 1px solid #000;
            background: #fff;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">KITCHEN RECEIPT${isAdditionalOrder ? ' - ADDITIONAL ITEMS' : ''}</div>

        <div class="table-number">TABLE ${order.tableNumber}</div>

        <div class="info">
          <div><strong>Order #:</strong> ${order.id}${isAdditionalOrder ? ` (Batch ${order.currentBatch})` : ''}</div>
          <div><strong>Time:</strong> ${new Date().toLocaleString()}</div>
          <div><strong>Accepted by:</strong> ${order.acceptedBy || 'Till Staff'}</div>
          ${order.tableLocation ? `<div><strong>Location:</strong> ${order.tableLocation}</div>` : ''}
          ${isAdditionalOrder ? '<div style="margin-top: 10px; padding: 5px; border: 2px solid #000; background: #ff0;"><strong>⚠️ ADDITIONAL ORDER - TABLE ALREADY HAS FOOD</strong></div>' : ''}
        </div>

        <div class="items">
          <div style="font-weight: bold; margin-bottom: 10px;">${isAdditionalOrder ? 'NEW ITEMS TO PREPARE:' : 'ORDER ITEMS:'}</div>
          ${latestBatchItems.map(item => `
            <div class="item">
              <div class="item-header">${item.quantity}x ${item.menuItemName}</div>
              ${item.specialInstructions ? `<div class="item-note">* ${item.specialInstructions}</div>` : ''}
            </div>
          `).join('')}
        </div>

        ${order.notes ? `
          <div class="notes">
            <strong>SPECIAL INSTRUCTIONS:</strong><br>
            ${order.notes}
          </div>
        ` : ''}

        <div class="footer">
          <div>--- END OF RECEIPT ---</div>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(receiptHTML)
    printWindow.document.close()

    // Auto print after a short delay
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Till Management</h2>
          <p className="text-sm text-slate-400">
            Accept incoming orders and print kitchen receipts
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

      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-sidebar/60 px-6 py-10 text-center text-sm text-slate-400">
          Loading pending orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-sidebar/40 px-6 py-10 text-center">
          <div className="text-6xl mb-4">✓</div>
          <p className="text-lg font-semibold text-slate-300 mb-1">All caught up!</p>
          <p className="text-sm text-slate-400">No pending orders at the moment</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border-2 border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 shadow-xl"
            >
              {/* Large Table Number Badge */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur-md opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl px-8 py-6 border-4 border-orange-300 shadow-lg">
                    <div className="text-center">
                      <div className="text-xs font-semibold text-orange-100 mb-1 tracking-wider">TABLE</div>
                      <div className="text-5xl font-black text-white">{order.tableNumber}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">Order #{order.id}</h3>
                  {order.currentBatch > 1 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-400 text-black animate-pulse">
                      +NEW ITEMS
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300">
                  {new Date(order.createdAt).toLocaleTimeString()}
                  {order.tableLocation && ` • ${order.tableLocation}`}
                </p>
                {order.currentBatch > 1 && (
                  <p className="text-xs text-yellow-300 mt-1 font-semibold">
                    ⚠️ Customer ordered more items (Batch {order.currentBatch})
                  </p>
                )}
              </div>

              {/* Special Instructions */}
              {order.notes && (
                <div className="mb-4 rounded-lg border-2 border-amber-400/40 bg-amber-500/20 p-3">
                  <p className="text-xs font-bold text-amber-200 mb-1">⚠️ SPECIAL INSTRUCTIONS</p>
                  <p className="text-sm font-semibold text-amber-100">{order.notes}</p>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-2 mb-4 rounded-lg border border-white/20 bg-white/5 p-4">
                {order.orderItems?.map((item) => {
                  const isNewItem = item.batchNumber === order.currentBatch && order.currentBatch > 1
                  return (
                    <div key={item.id} className={clsx("space-y-1 p-2 rounded", isNewItem && "bg-yellow-400/20 border-2 border-yellow-400")}>
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-white">
                          <span className="inline-block w-8 text-orange-400">{item.quantity}x</span>
                          {item.menuItemName}
                          {isNewItem && <span className="ml-2 text-xs font-bold text-yellow-300">NEW!</span>}
                        </span>
                        <span className="text-slate-300 font-medium">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      {item.specialInstructions && (
                        <p className="text-xs text-amber-200 bg-amber-500/20 border border-amber-500/30 rounded px-2 py-1 ml-8">
                          ★ {item.specialInstructions}
                        </p>
                      )}
                    </div>
                  )
                })}
                <div className="flex justify-between border-t border-white/20 pt-2 mt-2 font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-orange-400 text-lg">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Accept Button */}
              <button
                onClick={() => handleAcceptOrder(order.id)}
                disabled={processingOrderId === order.id}
                className={clsx(
                  'w-full rounded-lg px-6 py-4 text-base font-bold text-white transition shadow-lg',
                  processingOrderId === order.id
                    ? 'bg-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 active:scale-95'
                )}
              >
                {processingOrderId === order.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Accept & Print Kitchen Receipt
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TillView
