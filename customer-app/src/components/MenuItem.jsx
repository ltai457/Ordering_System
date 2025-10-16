import { useState, useRef, useEffect } from 'react'
import ItemCustomizationModal from './ItemCustomizationModal'

// Categories that should NOT have customization options
const NON_CUSTOMIZABLE_CATEGORIES = [
  'drinks',
  'beverage',
  'beverages',
  'desserts',
  'dessert',
  'ភេសជ្ជៈ drinks',
]

const MenuItem = ({ item, category, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showCustomizationModal, setShowCustomizationModal] = useState(false)
  const [lastQuantityAdded, setLastQuantityAdded] = useState(0)
  const confirmationTimeout = useRef(null)

  const itemAddOns = (
    Array.isArray(item?.addOns)
      ? item.addOns
      : Array.isArray(item?.AddOns)
        ? item.AddOns
        : []
  ).map((addOn) => ({
    ...addOn,
    price:
      typeof addOn.price === 'number'
        ? addOn.price
        : Number.parseFloat(addOn.price ?? '0'),
  }))

  const hasAddOns = itemAddOns.length > 0

  // Allow customization if the category permits it or the item has add-ons
  const allowCustomization = hasAddOns
    ? true
    : category
      ? !NON_CUSTOMIZABLE_CATEGORIES.includes(category.name.toLowerCase())
      : true // Default to true for search results

  useEffect(() => {
    return () => {
      if (confirmationTimeout.current) {
        clearTimeout(confirmationTimeout.current)
      }
    }
  }, [])

  const handleQuickAdd = () => {
    // Quick add without customization
    onAddToCart(item, quantity, null)
    setLastQuantityAdded(quantity)
    setShowConfirmation(true)

    if (confirmationTimeout.current) {
      clearTimeout(confirmationTimeout.current)
    }

    confirmationTimeout.current = setTimeout(() => {
      setShowConfirmation(false)
    }, 1800)
  }

  const handleCustomize = () => {
    setShowCustomizationModal(true)
  }

  const handleAddWithCustomization = (item, qty, customization) => {
    onAddToCart(item, qty, customization)
    setLastQuantityAdded(qty)
    setShowConfirmation(true)

    if (confirmationTimeout.current) {
      clearTimeout(confirmationTimeout.current)
    }

    confirmationTimeout.current = setTimeout(() => {
      setShowConfirmation(false)
    }, 1800)
  }

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  return (
    <>
      {showCustomizationModal && (
        <ItemCustomizationModal
          item={{
            ...item,
            addOns: itemAddOns,
          }}
          category={category}
          onClose={() => setShowCustomizationModal(false)}
          onAddToCart={handleAddWithCustomization}
        />
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      {/* Item Image */}
      <div className="relative h-48 bg-white">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-16 h-16"
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

        {/* Availability Badge */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {item.name}
        </h3>

        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-orange-500">
              ${item.price.toFixed(2)}
            </div>

            {/* Quantity Selector */}
            {item.isAvailable && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                <button
                  onClick={decreaseQuantity}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold text-xl"
                >
                  -
                </button>
                <span className="font-bold text-gray-900 w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold text-xl"
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {item.isAvailable ? (
            allowCustomization ? (
              <div className="flex gap-2">
                <button
                  onClick={handleCustomize}
                  className="flex-1 py-2.5 rounded-lg font-semibold bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50 transition-all"
                >
                  Customize
                </button>
                <button
                  onClick={handleQuickAdd}
                  className="flex-1 py-2.5 rounded-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all"
                >
                  Quick Add
                </button>
              </div>
            ) : (
              <button
                onClick={handleQuickAdd}
                className="w-full py-2.5 rounded-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all"
              >
                Add to Cart
              </button>
            )
          ) : (
            <button
              disabled
              className="w-full py-2.5 rounded-lg font-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
            >
              Unavailable
            </button>
          )}

          {showConfirmation && item.isAvailable && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
              Added {lastQuantityAdded} × {item.name} to cart
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  )
}

export default MenuItem
