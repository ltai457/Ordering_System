import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import orderService from '../services/orderService'

const OrderConfirmationPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { clearTable } = useCart()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const orderData = await orderService.getOrderById(orderId)
      setOrder(orderData)
    } catch (err) {
      setError(err.message || 'Failed to load order details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewOrder = () => {
    navigate('/menu')
  }

  const handleFinish = () => {
    clearTable()
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center max-w-md">
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Order Placed!</h1>
          <p className="text-slate-400 mb-6">
            Your order has been sent to the kitchen
          </p>

          {/* Order Number */}
          <div className="bg-slate-900 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-400 mb-1">Order Number</p>
            <p className="text-3xl font-bold text-orange-500">#{order?.id}</p>
          </div>

          {/* Order Details */}
          <div className="bg-slate-900 rounded-xl p-4 mb-6 text-left">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Customer</span>
                <span className="text-white font-medium">{order?.customerName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Table</span>
                <span className="text-white font-medium">
                  {order?.tableNumber} - {order?.tableLocation}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Status</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-200">
                  {order?.status || 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-700">
                <span className="text-slate-400">Total</span>
                <span className="text-lg font-bold text-white">
                  ${order?.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {order?.notes && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs text-blue-300 font-semibold mb-1">Special Instructions</p>
              <p className="text-sm text-blue-200">{order.notes}</p>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-slate-900 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-400">
              Your food will be delivered to your table when ready. You can place additional orders anytime!
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleNewOrder}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Order More Items
            </button>
            <button
              onClick={handleFinish}
              className="w-full border border-slate-600 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Finish & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmationPage
