import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from '../views/layouts/AuthLayout.jsx'
import AdminLayout from '../views/layouts/AdminLayout.jsx'
import DashboardView from '../views/dashboard/DashboardView.jsx'
import LoginView from '../views/auth/LoginView.jsx'
import MenuCategoriesView from '../views/menu/MenuCategoriesView.jsx'

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginView />} />
      </Route>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="/menu" element={<MenuCategoriesView />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
)

export default App
