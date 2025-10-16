import apiClient from './apiClient.js'

const tableService = {
  // Get all tables for a restaurant
  async getTables(restaurantId) {
    return apiClient.get(`/api/Table/restaurant/${restaurantId}`)
  },

  // Get table by ID
  async getTableById(id) {
    return apiClient.get(`/api/Table/${id}`)
  },

  // Create new table
  async createTable(data) {
    return apiClient.post('/api/Table', data)
  },

  // Update table
  async updateTable(id, data) {
    return apiClient.put(`/api/Table/${id}`, data)
  },

  // Delete table
  async deleteTable(id) {
    return apiClient.delete(`/api/Table/${id}`)
  },
}

export default tableService
