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
  return apiClient.get(`/api/MenuItem/restaurant/${restaurantId}`)
}

const getByCategory = async (categoryId) => {
  return apiClient.get(`/api/MenuItem/category/${categoryId}`)
}

const getById = async (id) => apiClient.get(`/api/MenuItem/${id}`)

const create = async (payload) => {
  return apiClient.post('/api/MenuItem', payload)
}

const update = async (id, payload) => {
  return apiClient.put(`/api/MenuItem/${id}`, payload)
}

const remove = async (id) => apiClient.delete(`/api/MenuItem/${id}`)

const toggleAvailability = async (id) => {
  return apiClient.patch(`/api/MenuItem/${id}/toggle-availability`)
}

const search = async (searchTerm) => {
  const restaurantId = getRestaurantId()
  const params = new URLSearchParams({
    restaurantId: restaurantId.toString(),
    searchTerm
  })
  return apiClient.get(`/api/MenuItem/search?${params.toString()}`)
}

const reorder = async (categoryId, menuItemIds) => {
  return apiClient.post(`/api/MenuItem/category/${categoryId}/reorder`, {
    menuItemIds,
  })
}

const menuItemService = {
  getAll,
  getByCategory,
  getById,
  create,
  update,
  remove,
  toggleAvailability,
  search,
  reorder,
}

export default menuItemService
