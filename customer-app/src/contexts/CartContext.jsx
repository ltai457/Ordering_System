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

  // Add item to cart with specified quantity
  const addToCart = (item, quantityToAdd = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id)

      if (existingItem) {
        // Increase quantity if item already exists
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantityToAdd } : i
        )
      } else {
        // Add new item with specified quantity
        return [...prevItems, { ...item, quantity: quantityToAdd }]
      }
    })
  }

  // Remove item from cart completely
  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
  }

  // Update item quantity
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  // Increase quantity by 1
  const increaseQuantity = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    )
  }

  // Decrease quantity by 1
  const decreaseQuantity = (itemId) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === itemId) {
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

  // Get total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
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
