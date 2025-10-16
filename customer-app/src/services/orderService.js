import apiClient from './apiClient'

const orderService = {
  async createOrder(payload) {
    return apiClient.post('/Order', payload)
  },
}

export default orderService
