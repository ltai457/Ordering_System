import apiClient from './apiClient.js'

const menuItemAddOnService = {
  /**
   * Get all add-ons for a menu item
   */
  async getAddOnsByMenuItem(menuItemId) {
    return apiClient.get(`/api/MenuItemAddOn/menu-item/${menuItemId}`)
  },

  /**
   * Get a single add-on by ID
   */
  async getAddOn(id) {
    return apiClient.get(`/api/MenuItemAddOn/${id}`)
  },

  /**
   * Create a new add-on for a menu item
   */
  async createAddOn(menuItemId, data) {
    return apiClient.post(`/api/MenuItemAddOn/menu-item/${menuItemId}`, data)
  },

  /**
   * Update an add-on
   */
  async updateAddOn(id, data) {
    return apiClient.put(`/api/MenuItemAddOn/${id}`, data)
  },

  /**
   * Delete an add-on
   */
  async deleteAddOn(id) {
    return apiClient.delete(`/api/MenuItemAddOn/${id}`)
  },
}

export default menuItemAddOnService
