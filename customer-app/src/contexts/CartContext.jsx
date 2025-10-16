import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const STORAGE_KEY = 'customer-app-cart'
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window === 'undefined') {
      return []
    }
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Failed to read cart from storage', error)
      return []
    }
  })

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems))
    } catch (error) {
      console.warn('Failed to persist cart to storage', error)
    }
  }, [cartItems])

  // Add item to cart with specified quantity and customizations
  const addToCart = (item, quantityToAdd = 1, customization = null) => {

    setCartItems((prevItems) => {
      // If has customization, always add as new item (don't merge with existing)
      if (customization) {
        const uniqueId = `${item.id}-${Date.now()}`
        const newItem = {
          ...item,
          cartItemId: uniqueId,
          quantity: quantityToAdd,
          customization
        }
        return [...prevItems, newItem]
      }

      // No customization - check if we can merge with existing plain item
      const existingItem = prevItems.find((i) =>
        i.id === item.id && !i.customization
      )

      if (existingItem) {
        // Increase quantity if plain item already exists
        return prevItems.map((i) =>
          i.id === item.id && !i.customization
            ? { ...i, quantity: i.quantity + quantityToAdd }
            : i
        )
      } else {
        // Add new plain item
        return [...prevItems, {
          ...item,
          cartItemId: `${item.id}-${Date.now()}`,
          quantity: quantityToAdd
        }]
      }
    })
  }

  // Remove item from cart completely (use cartItemId for customized items)
  const removeFromCart = (cartItemId) => {
    setCartItems((prevItems) => prevItems.filter((item) =>
      (item.cartItemId || `${item.id}-default`) !== cartItemId
    ))
  }

  // Update item quantity (use cartItemId for customized items)
  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId)
      return
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        (item.cartItemId || `${item.id}-default`) === cartItemId ? { ...item, quantity } : item
      )
    )
  }

  // Increase quantity by 1 (use cartItemId for customized items)
  const increaseQuantity = (cartItemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        (item.cartItemId || `${item.id}-default`) === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    )
  }

  // Decrease quantity by 1 (use cartItemId for customized items)
  const decreaseQuantity = (cartItemId) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if ((item.cartItemId || `${item.id}-default`) === cartItemId) {
            const newQuantity = item.quantity - 1
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
          }
          return item
        })
        .filter(Boolean)
    })
  }

  // Clear entire cart
  const clearCart = () => {
    setCartItems([])
  }

  // Get total number of items
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  // Get total price (including add-ons)
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      let itemTotal = item.price * item.quantity

      // Add cost of paid add-ons if any
      if (item.customization?.addOns) {
        const addOnsTotal = item.customization.addOns.reduce((sum, addOn) => {
          const price =
            typeof addOn.price === 'number'
              ? addOn.price
              : Number.parseFloat(addOn.price ?? '0')
          return sum + price * addOn.quantity
        }, 0)
        itemTotal += addOnsTotal * item.quantity
      }

      return total + itemTotal
    }, 0)
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
