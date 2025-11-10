import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TableProvider } from './contexts/TableContext'
import { CartProvider } from './contexts/CartContext'
import { LanguageProvider } from './contexts/LanguageContext'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
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
      </LanguageProvider>
    </BrowserRouter>
  )
}

export default App
