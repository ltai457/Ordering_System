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
    sessionStorage.setItem(TOKEN_STORAGE_KEY, payload.token)
  }

  sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload))

  return payload
}

const fetchCurrentUser = async () => {
  const data = await apiClient.get('/api/Auth/me')
  sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data))
  return data
}

const getStoredUser = () => {
  const raw = sessionStorage.getItem(USER_STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

const logout = () => {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  sessionStorage.removeItem(USER_STORAGE_KEY)
}

const authService = {
  login,
  fetchCurrentUser,
  getStoredUser,
  logout,
}

export default authService
