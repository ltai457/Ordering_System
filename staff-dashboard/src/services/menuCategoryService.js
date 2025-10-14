import apiClient from './apiClient.js'
import authService from './authService.js'

const getRestaurantId = () => {
  const user = authService.getStoredUser()
  if (!user?.restaurantId) {
    throw new Error('Restaurant context missing')
  }
  return user.restaurantId
}

const getAll = async () => {
  const restaurantId = getRestaurantId()
  const params = new URLSearchParams({ includeInactive: 'true' })
  return apiClient.get(
    `/api/MenuCategory/restaurant/${restaurantId}?${params.toString()}`,
  )
}

const getById = async (id) => apiClient.get(`/api/MenuCategory/${id}`)

const create = async (payload) => {
  const restaurantId = getRestaurantId()
  return apiClient.post('/api/MenuCategory', {
    restaurantId,
    ...payload,
  })
}

const update = async (id, payload) => apiClient.put(
  `/api/MenuCategory/${id}`,
  payload,
)

const remove = async (id) => apiClient.delete(`/api/MenuCategory/${id}`)

const menuCategoryService = {
  getAll,
  getById,
  create,
  update,
  remove,
}

export default menuCategoryService
