import apiClient from './apiClient.js'

const addOnLibraryService = {
  /**
   * Get all add-ons in the library for a restaurant
   */
  async getAll(restaurantId, filters = {}) {
    const params = new URLSearchParams()
    if (filters.category) params.append('category', filters.category)
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive)

    const queryString = params.toString()
    const url = `/api/AddOnLibrary/restaurant/${restaurantId}${queryString ? `?${queryString}` : ''}`

    return apiClient.get(url)
  },

  /**
   * Get a single add-on from library by ID
   */
  async getById(id) {
    return apiClient.get(`/api/AddOnLibrary/${id}`)
  },

  /**
   * Create a new add-on in the library
   */
  async create(restaurantId, data) {
    return apiClient.post(`/api/AddOnLibrary/restaurant/${restaurantId}`, data)
  },

  /**
   * Update an add-on in the library
   */
  async update(id, data) {
    return apiClient.put(`/api/AddOnLibrary/${id}`, data)
  },

  /**
   * Delete an add-on from the library
   */
  async delete(id) {
    return apiClient.delete(`/api/AddOnLibrary/${id}`)
  },

  /**
   * Get all unique categories
   */
  async getCategories(restaurantId) {
    return apiClient.get(`/api/AddOnLibrary/restaurant/${restaurantId}/categories`)
  },
}

export default addOnLibraryService
