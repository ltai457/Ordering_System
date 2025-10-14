import { Outlet } from 'react-router-dom'
import useAuthLayoutViewModel from '../../viewmodels/layouts/useAuthLayoutViewModel.js'

const AuthLayout = () => {
  useAuthLayoutViewModel()

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
