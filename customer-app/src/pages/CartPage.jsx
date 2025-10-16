import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useTable } from '../contexts/TableContext'
import orderService from '../services/orderService'

const CartPage = () => {
  const navigate = useNavigate()
  const { tableInfo } = useTable()
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    getTotalPrice,
    clearCart,
  } = useCart()

  const [orderNotes, setOrderNotes] = useState('')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [orderConfirmation, setOrderConfirmation] = useState(null)

  const menuPath = tableInfo ? `/menu/${tableInfo.tableCode}` : '/menu'
  const subtotal = getTotalPrice()
  const taxAmount = subtotal * 0.1
  const total = subtotal * 1.1

  const handleCheckout = async () => {
    if (cartItems.length === 0 || isPlacingOrder) {
      return
    }

    if (!tableInfo) {
      setSubmitError('Please enter your table number on the menu page before placing an order.')
      return
    }

    setIsPlacingOrder(true)
    setSubmitError(null)

    try {
      const payload = {
        tableId: tableInfo.id,
        notes: orderNotes.trim() || null,
        orderItems: cartItems.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions ?? null,
        })),
      }

      const order = await orderService.createOrder(payload)
      clearCart()
      setOrderNotes('')
      setOrderConfirmation(order)
    } catch (err) {
      setSubmitError(err.message || 'Failed to place order. Please try again.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (orderConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-md">
          <div className="max-w-3xl mx-auto px-4 py-6 text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
            <p className="text-gray-600">
              Order <span className="font-semibold text-gray-900">#{orderConfirmation.id}</span> has been sent to the kitchen.
            </p>
            <p className="text-sm text-gray-500">
              Table {orderConfirmation.tableNumber}
              {orderConfirmation.tableLocation ? ` • ${orderConfirmation.tableLocation}` : ''}
            </p>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
          <section className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
            <div className="space-y-3">
              {orderConfirmation.orderItems?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                  <span className="text-gray-700">
                    {item.quantity} × {item.menuItemName}
                  </span>
                  <span className="text-gray-500">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-3 text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>${orderConfirmation.totalAmount.toFixed(2)}</span>
              </div>
              {orderConfirmation.notes && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                  Guest note: {orderConfirmation.notes}
                </div>
              )}
            </div>
          </section>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setOrderConfirmation(null)
                navigate(menuPath)
              }}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Order More Items
            </button>
            <button
              onClick={() => setOrderConfirmation(null)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
            >
              View Current Cart
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(menuPath)}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            </div>
          </div>
        </header>

        {/* Empty Cart */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some items to get started!</p>
            <button
              onClick={() => navigate(menuPath)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(menuPath)}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-4 flex gap-4"
              >
                {/* Item Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-orange-500 font-bold text-lg">
                    ${item.price.toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-2 py-1">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-gray-900 w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <p className="font-bold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="order-notes">
                  Order notes (optional)
                </label>
                <textarea
                  id="order-notes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  disabled={isPlacingOrder}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:opacity-60"
                  placeholder="Add special instructions for the kitchen"
                  rows={3}
                />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isPlacingOrder}
                className={`w-full font-bold py-3 rounded-lg transition-colors ${
                  isPlacingOrder
                    ? 'bg-orange-300 text-white cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {isPlacingOrder ? 'Sending to kitchen...' : 'Send Order to Kitchen'}
              </button>

              {submitError && (
                <p className="mt-3 text-sm text-red-600">{submitError}</p>
              )}

              <button
                onClick={() => navigate(menuPath)}
                className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
