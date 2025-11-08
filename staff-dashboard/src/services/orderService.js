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

const acceptOrder = async (id, staffName = 'Till Staff') => {
  return apiClient.post(`/api/Order/${id}/accept`, { staffName })
}

const markOrderAsPaid = async (id, staffName = 'Cashier') => {
  return apiClient.post(`/api/Order/${id}/mark-paid`, { staffName })
}

const getPendingOrders = async () => {
  const restaurantId = getRestaurantId()
  return apiClient.get(`/api/Order/restaurant/${restaurantId}/pending`)
}

const getOrdersAwaitingPayment = async () => {
  const restaurantId = getRestaurantId()
  return apiClient.get(`/api/Order/restaurant/${restaurantId}/awaiting-payment`)
}

const getTodayPaidOrders = async () => {
  const restaurantId = getRestaurantId()
  return apiClient.get(`/api/Order/restaurant/${restaurantId}/today-paid`)
}

const orderService = {
  getAllOrders,
  getActiveOrders,
  getOrdersByStatus,
  getOrderById,
  updateOrderStatus,
  acceptOrder,
  markOrderAsPaid,
  getPendingOrders,
  getOrdersAwaitingPayment,
  getTodayPaidOrders,
}

export default orderService
