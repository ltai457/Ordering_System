import { useMemo } from 'react'
import authService from '../../services/authService.js'

const useDashboardViewModel = () => {
  const user = authService.getStoredUser()

  const greeting = useMemo(() => {
    const now = new Date()
    const hour = now.getHours()

    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  return {
    user,
    greeting,
  }
}

export default useDashboardViewModel
