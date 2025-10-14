import apiClient from './apiClient.js'

const getCategories = async (restaurantId) => {
  return apiClient.get(`/api/MenuCategory/restaurant/${restaurantId}?includeInactive=false`)
}

const getItemsByCategory = async (categoryId) => {
  return apiClient.get(`/api/MenuItem/category/${categoryId}`)
}

const getAllItems = async (restaurantId) => {
  return apiClient.get(`/api/MenuItem/restaurant/${restaurantId}`)
}

const menuService = {
  getCategories,
  getItemsByCategory,
  getAllItems,
}

export default menuService
