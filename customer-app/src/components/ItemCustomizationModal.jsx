import { useState } from 'react'

const ItemCustomizationModal = ({ item, category, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1)
  const [spiceLevel, setSpiceLevel] = useState('medium')
  const [selectedSides, setSelectedSides] = useState([])
  const [specialInstructions, setSpecialInstructions] = useState('')

  // Determine which customization options to show based on category
  // These categories only need spice level (no free side dishes)
  const spiceOnlyCategories = [
    'ប្រភេទគ្រឿងសមុទ្រនិងប្រហិត grilled seafood&meatball',
    'បាយនិងគុយទាវឆា fried rice & flat noodle',
    'ប្រភេទសាច់អាំង grilled meat',
    'ប្រភេទបន្លែអាំង grilled vegetables',
  ]

  // Signature dishes category - has paid add-ons specific to each item
  const signatureDishCategory = 'ម្ហូបប្រចាំហាង signature dishes'

  const isSpiceOnly = category
    ? spiceOnlyCategories.includes(category.name.toLowerCase())
    : false

  const isSignatureDish = category
    ? category.name.toLowerCase() === signatureDishCategory
    : false

  // Use add-ons from the item (loaded from API)
  const rawAddOns = Array.isArray(item?.addOns)
    ? item.addOns
    : Array.isArray(item?.AddOns)
      ? item.AddOns
      : []

  const availableAddOns = rawAddOns.map((addOn) => ({
    ...addOn,
    price:
      typeof addOn.price === 'number'
        ? addOn.price
        : Number.parseFloat(addOn.price ?? '0'),
  }))

  // Debug logging

  const [selectedAddOns, setSelectedAddOns] = useState([])

  // Common side dish options
  const sideDishOptions = [
    'Rice',
    'Noodles',
    'Salad',
    'Soup',
    'Spring Rolls',
    'Steamed Vegetables',
  ]

  // Spice levels
  const spiceLevels = [
    { value: 'none', label: 'No Spice', icon: '😊' },
    { value: 'mild', label: 'Mild', icon: '🌶️' },
    { value: 'medium', label: 'Medium', icon: '🌶️🌶️' },
    { value: 'hot', label: 'Hot', icon: '🌶️🌶️🌶️' },
    { value: 'extra-hot', label: 'Extra Hot', icon: '🔥🔥🔥' },
  ]

  const handleSideToggle = (side) => {
    setSelectedSides(prev =>
      prev.includes(side)
        ? prev.filter(s => s !== side)
        : [...prev, side]
    )
  }

  const handleAddOnToggle = (addOn) => {
    setSelectedAddOns(prev => {
      const existing = prev.find(a => a.name === addOn.name)
      if (existing) {
        // Remove if already selected
        return prev.filter(a => a.name !== addOn.name)
      } else {
        // Add with quantity 1
        return [...prev, { ...addOn, quantity: 1 }]
      }
    })
  }

  const updateAddOnQuantity = (addOnName, change) => {
    setSelectedAddOns(prev =>
      prev.map(addOn => {
        if (addOn.name === addOnName) {
          const newQty = Math.max(1, addOn.quantity + change)
          return { ...addOn, quantity: newQty }
        }
        return addOn
      })
    )
  }

  const handleAddToCart = () => {
    const customization = {
      spiceLevel,
      sides: selectedSides,
      specialInstructions: specialInstructions.trim(),
      addOns: selectedAddOns.length > 0 ? selectedAddOns : undefined,
    }
    onAddToCart(item, quantity, customization)
    onClose()
  }

  // Calculate total price including add-ons
  const addOnsTotal = selectedAddOns.reduce((sum, addOn) => {
    const price =
      typeof addOn.price === 'number'
        ? addOn.price
        : Number.parseFloat(addOn.price ?? '0')
    return sum + price * addOn.quantity
  }, 0)
  const totalPrice = (item.price * quantity) + (addOnsTotal * quantity)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Customize Your Order</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Item Info */}
          <div className="flex gap-4">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-24 h-24 object-contain rounded-lg bg-gray-50"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
              {item.description && (
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              )}
              <p className="text-xl font-bold text-orange-500 mt-2">
                ${item.price.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-bold text-xl transition"
              >
                -
              </button>
              <span className="text-xl font-bold text-gray-900 w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-bold text-xl transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Spice Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Spice Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {spiceLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSpiceLevel(level.value)}
                  className={`
                    p-3 rounded-lg border-2 transition text-center
                    ${spiceLevel === level.value
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{level.icon}</div>
                  <div className="text-xs font-semibold">{level.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Free Side Dishes - Only show if not spice-only and not signature dish */}
          {!isSpiceOnly && !isSignatureDish && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Side Dishes (Optional - Free)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sideDishOptions.map((side) => (
                  <button
                    key={side}
                    onClick={() => handleSideToggle(side)}
                    className={`
                      px-4 py-2 rounded-lg border-2 transition text-sm font-medium
                      ${selectedSides.includes(side)
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    {selectedSides.includes(side) && (
                      <span className="mr-1">✓</span>
                    )}
                    {side}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paid Add-ons - Show if there are available add-ons */}
          {availableAddOns.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Add Extra Items (Paid)
              </label>
              <div className="space-y-2">
                {availableAddOns.map((addOn) => {
                  const selected = selectedAddOns.find(a => a.name === addOn.name)
                  return (
                    <div
                      key={addOn.name}
                      className={`
                        flex items-center justify-between p-3 rounded-lg border-2 transition
                        ${selected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => handleAddOnToggle(addOn)}
                          className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center transition
                            ${selected
                              ? 'border-orange-500 bg-orange-500 text-white'
                              : 'border-gray-300'
                            }
                          `}
                        >
                          {selected && '✓'}
                        </button>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{addOn.name}</div>
                          <div className="text-sm font-semibold text-orange-600">
                            +${addOn.price.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {selected && (
                        <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1 border border-gray-300">
                          <button
                            onClick={() => updateAddOnQuantity(addOn.name, -1)}
                            className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold text-gray-900 w-6 text-center">
                            {selected.quantity}
                          </span>
                          <button
                            onClick={() => updateAddOnQuantity(addOn.name, 1)}
                            className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Special Instructions - Always show */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="E.g., No onions, extra sauce, well done..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              rows="3"
              maxLength="200"
            />
            <p className="text-xs text-gray-500 mt-1">
              {specialInstructions.length}/200 characters
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          {/* Price Breakdown */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Item ({quantity}x)</span>
              <span>${(item.price * quantity).toFixed(2)}</span>
            </div>
            {selectedAddOns.length > 0 && (
              <>
                {selectedAddOns.map(addOn => (
                  <div key={addOn.name} className="flex items-center justify-between text-sm text-gray-600">
                    <span>{addOn.name} ({addOn.quantity}x × {quantity} items)</span>
                    <span>+${(addOn.price * addOn.quantity * quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex items-center justify-between">
                  <span className="text-gray-700 font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-orange-500">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </>
            )}
            {selectedAddOns.length === 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">Total:</span>
                <span className="text-2xl font-bold text-orange-500">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition"
            >
              Add to Cart - ${totalPrice.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemCustomizationModal
