const API_BASE_URL = 'http://192.168.88.6:5100/api'

const apiClient = {
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API GET Error:', error)
      throw error
    }
  },

  async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API POST Error:', error)
      throw error
    }
  },
}

export default apiClient
