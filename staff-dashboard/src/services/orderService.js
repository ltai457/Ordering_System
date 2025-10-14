import apiClient from './apiClient.js'
import authService from './authService.js'

const getRestaurantId = () => {
  const user = authService.getStoredUser()
  if (!user?.restaurantId) {
    throw new Error('Restaurant context missing')
  }
  return user.restaurantId
}

const getAllOrders = async () => {
  const restaurantId = getRestaurantId()
  return apiClient.get(`/api/Order/restaurant/${restaurantId}`)
}

const getActiveOrders = async () => {
  const restaurantId = getRestaurantId()
  return apiClient.get(`/api/Order/restaurant/${restaurantId}/active`)
}

const getOrdersByStatus = async (status) => {
  const restaurantId = getRestaurantId()
  return apiClient.get(`/api/Order/restaurant/${restaurantId}/status/${status}`)
}

const getOrderById = async (id) => {
  return apiClient.get(`/api/Order/${id}`)
}

const updateOrderStatus = async (id, status) => {
  return apiClient.patch(`/api/Order/${id}/status`, { status })
}

const orderService = {
  getAllOrders,
  getActiveOrders,
  getOrdersByStatus,
  getOrderById,
  updateOrderStatus,
}

export default orderService
