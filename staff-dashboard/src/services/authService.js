import apiClient from './apiClient.js'

const TOKEN_STORAGE_KEY = 'dms.auth.token'
const USER_STORAGE_KEY = 'dms.auth.user'

const login = async (credentials) => {
  const payload = await apiClient.post(
    '/api/Auth/login',
    credentials,
    { auth: false },
  )

  if (payload?.token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, payload.token)
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload))

  return payload
}

const fetchCurrentUser = async () => {
  const data = await apiClient.get('/api/Auth/me')
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data))
  return data
}

const getStoredUser = () => {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

const logout = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

const authService = {
  login,
  fetchCurrentUser,
  getStoredUser,
  logout,
}

export default authService
