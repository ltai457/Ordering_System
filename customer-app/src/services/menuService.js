import apiClient from './apiClient'

const menuService = {
  // Get all categories for a restaurant
  async getCategories(restaurantId) {
    return await apiClient.get(`/MenuCategory/restaurant/${restaurantId}`)
  },

  // Get all menu items for a restaurant
  async getAllItems(restaurantId) {
    return await apiClient.get(`/MenuItem/restaurant/${restaurantId}`)
  },

  // Get items by category
  async getItemsByCategory(categoryId) {
    return await apiClient.get(`/MenuItem/category/${categoryId}`)
  },

  // Search menu items
  async searchItems(restaurantId, searchTerm) {
    return await apiClient.get(`/MenuItem/search?restaurantId=${restaurantId}&searchTerm=${encodeURIComponent(searchTerm)}`)
  },
}

export default menuService
