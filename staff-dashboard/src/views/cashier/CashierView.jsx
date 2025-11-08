import { useState, useEffect } from 'react'
import orderService from '../../services/orderService.js'
import clsx from 'clsx'

const CashierView = () => {
  const [awaitingPayment, setAwaitingPayment] = useState([])
  const [paidToday, setPaidToday] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingOrderId, setProcessingOrderId] = useState(null)
  const [activeTab, setActiveTab] = useState('awaiting') // 'awaiting' or 'history'

  useEffect(() => {
    loadOrders()
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadOrders = async () => {
    setError(null)
    try {
      const [awaitingData, paidData] = await Promise.all([
        orderService.getOrdersAwaitingPayment(),
        orderService.getTodayPaidOrders(),
      ])
      setAwaitingPayment(awaitingData || [])
      setPaidToday(paidData || [])
    } catch (err) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsPaid = async (orderId) => {
    setProcessingOrderId(orderId)
    try {
      const response = await orderService.markOrderAsPaid(orderId)

      // If customer receipt print is required
      if (response.printCustomerReceipt && response.order) {
        printCustomerReceipt(response.order)
      }

      // Reload orders
      await loadOrders()

      // Show success notification
      alert(`Order #${orderId} marked as paid!`)
    } catch (err) {
      alert(err.message || 'Failed to mark order as paid')
    } finally {
      setProcessingOrderId(null)
    }
  }

  const printCustomerReceipt = (order) => {
    const printWindow = window.open('', '', 'width=300,height=600')

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Customer Receipt - Order #${order.id}</title>
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
          .restaurant-name {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .info {
            margin: 10px 0;
            font-size: 11px;
          }
          .items {
            margin: 15px 0;
            border-top: 1px solid #000;
            padding-top: 10px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .item-name {
            flex: 1;
          }
          .item-price {
            text-align: right;
            min-width: 60px;
          }
          .total-section {
            border-top: 2px solid #000;
            margin-top: 10px;
            padding-top: 10px;
          }
          .total {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 14px;
            margin: 5px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px dashed #000;
            font-size: 10px;
          }
          .paid-stamp {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            margin: 15px 0;
            padding: 10px;
            border: 3px double #000;
          }
        </style>
      </head>
      <body>
        <div class="restaurant-name">Digital Menu System</div>
        <div class="header">CUSTOMER RECEIPT</div>

        <div class="info">
          <div><strong>Order #:</strong> ${order.id}</div>
          <div><strong>Table:</strong> ${order.tableNumber}</div>
          <div><strong>Date:</strong> ${new Date(order.paidAt || order.createdAt).toLocaleDateString()}</div>
          <div><strong>Time:</strong> ${new Date(order.paidAt || order.createdAt).toLocaleTimeString()}</div>
          <div><strong>Served by:</strong> ${order.paidBy || 'Cashier'}</div>
        </div>

        <div class="items">
          ${order.orderItems.map(item => `
            <div class="item">
              <div class="item-name">${item.quantity}x ${item.menuItemName}</div>
              <div class="item-price">$${(item.unitPrice * item.quantity).toFixed(2)}</div>
            </div>
          `).join('')}
        </div>

        <div class="total-section">
          <div class="total">
            <span>TOTAL:</span>
            <span>$${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div class="paid-stamp">PAID</div>

        <div class="footer">
          <div>Thank you for your visit!</div>
          <div>Please come again</div>
          <div style="margin-top: 10px;">--- END OF RECEIPT ---</div>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(receiptHTML)
    printWindow.document.close()

    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  const displayOrders = activeTab === 'awaiting' ? awaitingPayment : paidToday

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Cashier Station</h2>
          <p className="text-sm text-slate-400">
            Process payments and print customer receipts
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

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('awaiting')}
          className={clsx(
            'px-6 py-3 text-sm font-semibold transition border-b-2',
            activeTab === 'awaiting'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          Awaiting Payment
          {awaitingPayment.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-orange-500 rounded-full">
              {awaitingPayment.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={clsx(
            'px-6 py-3 text-sm font-semibold transition border-b-2',
            activeTab === 'history'
              ? 'border-green-500 text-green-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          Today's Paid Orders
          {paidToday.length > 0 && (
            <span className="ml-2 text-xs text-slate-400">
              ({paidToday.length})
            </span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-sidebar/60 px-6 py-10 text-center text-sm text-slate-400">
          Loading orders...
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-sidebar/40 px-6 py-10 text-center">
          <div className="text-6xl mb-4">
            {activeTab === 'awaiting' ? '💰' : '✓'}
          </div>
          <p className="text-lg font-semibold text-slate-300 mb-1">
            {activeTab === 'awaiting' ? 'All payments processed!' : 'No paid orders today yet'}
          </p>
          <p className="text-sm text-slate-400">
            {activeTab === 'awaiting'
              ? 'No orders awaiting payment at the moment'
              : 'Completed orders will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayOrders.map((order) => (
            <div
              key={order.id}
              className={clsx(
                'rounded-2xl border-2 p-6 shadow-xl transition',
                activeTab === 'awaiting'
                  ? 'border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-purple-500/10'
                  : 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-75'
              )}
            >
              {/* Extra Large Table Number for Easy Identification */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className={clsx(
                    'absolute inset-0 rounded-3xl blur-lg opacity-50',
                    activeTab === 'awaiting'
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                      : 'bg-gradient-to-br from-green-500 to-emerald-500'
                  )}></div>
                  <div className={clsx(
                    'relative rounded-3xl px-10 py-8 border-4 shadow-2xl',
                    activeTab === 'awaiting'
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-blue-300'
                      : 'bg-gradient-to-br from-green-600 to-emerald-600 border-green-300'
                  )}>
                    <div className="text-center">
                      <div className={clsx(
                        'text-xs font-semibold mb-1 tracking-wider',
                        activeTab === 'awaiting' ? 'text-blue-100' : 'text-green-100'
                      )}>TABLE</div>
                      <div className="text-6xl font-black text-white drop-shadow-lg">
                        {order.tableNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-white mb-1">Order #{order.id}</h3>
                <p className="text-xs text-slate-300">
                  {new Date(order.createdAt).toLocaleTimeString()}
                  {order.tableLocation && ` • ${order.tableLocation}`}
                </p>
                {order.acceptedBy && (
                  <p className="text-xs text-slate-400 mt-1">
                    Accepted by: {order.acceptedBy}
                  </p>
                )}
              </div>

              {/* Order Items Summary */}
              <div className="space-y-2 mb-4 rounded-lg border border-white/20 bg-white/5 p-3 max-h-40 overflow-y-auto">
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-300">
                      {item.quantity}x {item.menuItemName}
                    </span>
                    <span className="text-slate-400 font-medium">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Amount - Very Prominent */}
              <div className="rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 border-2 border-white/20 p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-300">TOTAL</span>
                  <span className="text-3xl font-black text-white">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {activeTab === 'awaiting' ? (
                <button
                  onClick={() => handleMarkAsPaid(order.id)}
                  disabled={processingOrderId === order.id}
                  className={clsx(
                    'w-full rounded-lg px-6 py-4 text-sm font-bold text-white transition shadow-lg',
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
                      Mark as Paid & Print Receipt
                    </span>
                  )}
                </button>
              ) : (
                <div className="text-center py-3">
                  <div className="inline-flex items-center gap-2 text-green-400 font-semibold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    PAID
                  </div>
                  {order.paidAt && (
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(order.paidAt).toLocaleTimeString()}
                    </p>
                  )}
                  {order.paidBy && (
                    <p className="text-xs text-slate-400">by {order.paidBy}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CashierView
