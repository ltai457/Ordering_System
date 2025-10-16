import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TableProvider } from './contexts/TableContext'
import { CartProvider } from './contexts/CartContext'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'

function App() {
  return (
    <BrowserRouter>
      <TableProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/menu" replace />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/:tableCode" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </CartProvider>
      </TableProvider>
    </BrowserRouter>
  )
}

export default App
