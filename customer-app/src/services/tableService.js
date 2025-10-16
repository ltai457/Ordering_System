import apiClient from './apiClient'

const tableService = {
  async getTableByCode(tableCode) {
    const encoded = encodeURIComponent(tableCode)
    return apiClient.get(`/Table/code/${encoded}`)
  },
  async getTableByNumber(restaurantId, tableNumber) {
    const encodedNumber = encodeURIComponent(tableNumber)
    return apiClient.get(`/Table/restaurant/${restaurantId}/number/${encodedNumber}`)
  },
}

export default tableService
