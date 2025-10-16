import apiClient from './apiClient.js'

const createUser = async (data) => {
  return apiClient.post('/api/Auth/register', data)
}

const checkUsername = async (username) => {
  return apiClient.get(`/api/Auth/check-username/${encodeURIComponent(username)}`)
}

const userService = {
  createUser,
  checkUsername,
}

export default userService
