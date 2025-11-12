import { useState, useRef, useEffect } from 'react'
import { useCart } from '../contexts/CartContext'
import ItemCustomizationModal from './ItemCustomizationModal'

// Define font styles to match reference design
const styles = {
  preahvihearFont: {
    fontFamily: "'Preahvihear', sans-serif",
    fontWeight: 800,
    fontStyle: "bold"
  },
  winkySansFont: {
    fontFamily: "'Winky Sans', sans-serif",
    fontOpticalSizing: "auto",
    fontWeight: 400,
    fontStyle: "normal"
  }
}

const MenuItem = ({ item, category, onAddToCart }) => {
  const { cartItems, decreaseQuantity: decreaseCartQty } = useCart()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showCustomizationModal, setShowCustomizationModal] = useState(false)
  const [lastQuantityAdded, setLastQuantityAdded] = useState(0)
  const confirmationTimeout = useRef(null)

  // Calculate total quantity from cart (including both customized and non-customized)
  const quantity = cartItems
    .filter(cartItem => cartItem.id === item.id)
    .reduce((total, cartItem) => total + cartItem.quantity, 0)

  // Display all languages and prices together
  const displayNames = {
    kh: item.nameKH || item.name,
    en: item.nameEN || item.name,
    cn: item.nameCN || item.name
  }

  const displayPrices = {
    usd: item.priceUSD || item.price || 0,
    khr: item.priceKHR || item.price || 0
  }

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

  useEffect(() => {
    return () => {
      if (confirmationTimeout.current) {
        clearTimeout(confirmationTimeout.current)
      }
    }
  }, [])

  const handleAddClick = () => {
    // Always open customization modal to let customer choose spicy level, quantity, etc.
    setShowCustomizationModal(true)
  }

  const decreaseQuantity = () => {
    // Find the most recently added item (last in cart) and decrease its quantity
    const itemsInCart = cartItems.filter(ci => ci.id === item.id)
    if (itemsInCart.length > 0) {
      // Get the last added item
      const lastItem = itemsInCart[itemsInCart.length - 1]
      decreaseCartQty(lastItem.cartItemId || `${lastItem.id}-default`)
    }
  }

  const handleAddWithCustomization = (item, qty, customization) => {
    onAddToCart(item, qty, customization)
    setLastQuantityAdded(qty)
    setShowConfirmation(true)
    // Don't reset quantity - keep counter visible

    if (confirmationTimeout.current) {
      clearTimeout(confirmationTimeout.current)
    }

    confirmationTimeout.current = setTimeout(() => {
      setShowConfirmation(false)
    }, 1800)
  }

  // Format price display - one line with /
  const displayPrice = () => {
    const formatNumber = (num) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
    return (
      <>
        <span style={{ fontSize: '1.3em', fontWeight: '900' }}>៛</span>{formatNumber(displayPrices.khr || "0")}
        {displayPrices.usd && (
          <>
            {' / '}
            <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>$</span>{formatNumber(displayPrices.usd.toFixed(2))}
          </>
        )}
      </>
    )
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
        {/* Item Image */}
        <div className="h-40 w-full overflow-hidden bg-white relative">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={displayNames.en || displayNames.kh || displayNames.cn}
              className="w-full h-full object-cover"
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

          {/* Floating Quantity Controls - Overlaid on Image */}
          {item.isAvailable && (
            quantity === 0 ? (
              // Show only + button when quantity is 0
              <div className="absolute bottom-2 right-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleAddClick}
                  className="w-8 h-8 flex items-center justify-center text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-lg transition-all active:scale-95"
                >
                  <span className="text-xl font-bold">+</span>
                </button>
              </div>
            ) : (
              // Show − [qty] + when quantity > 0
              <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-1.5 py-1 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={decreaseQuantity}
                  className="w-7 h-7 flex items-center justify-center text-emerald-600 hover:text-emerald-700 font-bold text-xl bg-white rounded-full border-2 border-emerald-600 transition-all active:scale-95"
                >
                  −
                </button>
                <span className="font-bold text-gray-900 w-6 text-center text-sm">
                  {quantity}
                </span>
                <button
                  onClick={handleAddClick}
                  className="w-8 h-8 flex items-center justify-center text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-md transition-all active:scale-95"
                >
                  <span className="text-xl font-bold">+</span>
                </button>
              </div>
            )
          )}
        </div>

        {/* Item Details */}
        <div className="p-3 flex-grow flex flex-col">
          <div>
            {/* Khmer Name - Bold with Preahvihear font */}
            {displayNames.kh && (
              <h3 className="text-base font-extrabold text-gray-900" style={styles.preahvihearFont}>
                {displayNames.kh}
              </h3>
            )}
            {/* English Name - Bold with Winky Sans font */}
            {displayNames.en && (
              <div className="text-sm font-bold text-gray-800" style={styles.winkySansFont}>
                {displayNames.en}
              </div>
            )}
            {/* Chinese Name - Bold with Preahvihear font */}
            {displayNames.cn && (
              <div className="text-sm font-bold text-gray-800" style={styles.preahvihearFont}>
                {displayNames.cn}
              </div>
            )}
          </div>

          {/* Price - one line */}
          <div className="mt-1">
            <span className="text-red-600 font-bold text-sm lg:text-base">
              {displayPrice()}
            </span>
          </div>

          {showConfirmation && item.isAvailable && (
            <div className="mt-2 rounded-lg bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
              Added {lastQuantityAdded} × {displayNames.en || displayNames.kh || displayNames.cn} to cart
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default MenuItem
