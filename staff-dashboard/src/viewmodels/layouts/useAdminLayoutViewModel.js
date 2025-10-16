import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import authService from '../../services/authService.js'

const TOKEN_STORAGE_KEY = 'dms.auth.token'

const useAdminLayoutViewModel = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [user, setUser] = useState(() => authService.getStoredUser())
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_STORAGE_KEY)

    if (!token) {
      setIsChecking(false)

      if (location.pathname !== '/login') {
        navigate('/login', { replace: true })
      }
      return
    }

    if (user) {
      setIsChecking(false)
      return
    }

    let ignore = false

    authService
      .fetchCurrentUser()
      .then((profile) => {
        if (!ignore) {
          setUser(profile)
          setIsChecking(false)
        }
      })
      .catch(() => {
        if (!ignore) {
          authService.logout()
          setIsChecking(false)
          navigate('/login', { replace: true })
        }
      })

    return () => {
      ignore = true
    }
  }, [location.pathname, navigate, user])

  const handleLogout = () => {
    authService.logout()
    navigate('/login', { replace: true })
  }

  return {
    user,
    isChecking,
    handleLogout,
  }
}

export default useAdminLayoutViewModel
