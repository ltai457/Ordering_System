import { useState, useRef, useEffect } from 'react'
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

  // Load Preahvihear font
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Preahvihear&display=swap'
    document.head.appendChild(link)

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [])

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

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
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

  // Format price display with larger currency symbols
  const displayPrice = () => {
    const formatNumber = (num) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    return (
      <>
        <span style={{ fontSize: '1.2em' }}>៛</span> {formatNumber(displayPrices.khr || "0")}
        {displayPrices.usd && (
          <>
            {' / '}
            <span style={{ fontSize: '1.1em' }}>$</span>
            {formatNumber(displayPrices.usd.toFixed(2))}
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
        <div className="h-40 w-full overflow-hidden bg-white">
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
        </div>

        {/* Item Details */}
        <div className="p-3 flex-grow flex flex-col justify-between">
          <div className="mb-2">
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

          {item.description && (
            <div className="mb-2">
              <p className="text-gray-600 text-xs line-clamp-2" style={styles.preahvihearFont}>
                {item.description}
              </p>
            </div>
          )}

          {/* Price and Actions */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-red-600 font-bold text-sm">
                {displayPrice()}
              </span>

              {/* Quantity Selector */}
              {item.isAvailable && (
                <div className="flex items-center gap-1 lg:gap-2 bg-gray-100 rounded-lg px-1.5 lg:px-2 py-0.5 lg:py-1">
                  <button
                    onClick={decreaseQuantity}
                    className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold text-base lg:text-xl"
                  >
                    -
                  </button>
                  <span className="font-bold text-gray-900 w-6 lg:w-8 text-center text-sm lg:text-base">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold text-base lg:text-xl"
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
                    className="flex-1 py-2 px-2 rounded-lg text-xs font-semibold bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50 transition-all"
                  >
                    Customize
                  </button>
                  <button
                    onClick={handleQuickAdd}
                    className="flex-1 py-2 px-2 rounded-lg text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    Quick Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleQuickAdd}
                  className="w-full py-2 px-2 rounded-lg text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all"
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
              <div className="mt-2 rounded-lg bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
                Added {lastQuantityAdded} × {displayNames.en || displayNames.kh || displayNames.cn} to cart
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default MenuItem
