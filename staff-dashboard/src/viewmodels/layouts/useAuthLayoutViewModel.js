import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const TOKEN_STORAGE_KEY = 'dms.auth.token'

const useAuthLayoutViewModel = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_STORAGE_KEY)
    if (token) {
      const { state } = location
      const redirectTo =
        typeof state === 'object' && state?.from ? state.from : '/dashboard'
      navigate(redirectTo, { replace: true })
    }
  }, [location, navigate])
}

export default useAuthLayoutViewModel
