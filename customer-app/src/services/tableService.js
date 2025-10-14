import apiClient from './apiClient.js'

const getTableByCode = async (tableCode) => {
  return apiClient.get(`/api/Table/code/${tableCode}`)
}

const getTablesByRestaurant = async (restaurantId) => {
  return apiClient.get(`/api/Table/restaurant/${restaurantId}`)
}

const tableService = {
  getTableByCode,
  getTablesByRestaurant,
}

export default tableService
