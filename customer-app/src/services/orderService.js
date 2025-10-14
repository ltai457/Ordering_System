import apiClient from './apiClient.js'

const createOrder = async (orderData) => {
  return apiClient.post('/api/Order', orderData)
}

const getOrderById = async (orderId) => {
  return apiClient.get(`/api/Order/${orderId}`)
}

const orderService = {
  createOrder,
  getOrderById,
}

export default orderService
