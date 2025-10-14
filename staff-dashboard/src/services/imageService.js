import apiClient from './apiClient.js'

/**
 * Upload a category image to S3 via the API
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The uploaded image URL
 */
const uploadCategoryImage = async (file) => {
  const formData = new FormData()
  formData.append('File', file)

  const response = await apiClient.postFormData('/api/Image/category', formData)

  if (!response?.imageUrl) {
    throw new Error('Image upload failed - no URL returned')
  }

  return response.imageUrl
}

/**
 * Upload a menu item image to S3 via the API
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The uploaded image URL
 */
const uploadMenuItemImage = async (file) => {
  const formData = new FormData()
  formData.append('File', file)

  const response = await apiClient.postFormData('/api/Image/menu-item', formData)

  if (!response?.imageUrl) {
    throw new Error('Image upload failed - no URL returned')
  }

  return response.imageUrl
}

/**
 * Delete an image from S3 by its URL
 * @param {string} imageUrl - The full image URL to delete
 * @returns {Promise<boolean>} True if deletion was successful
 */
const deleteImage = async (imageUrl) => {
  const params = new URLSearchParams({ imageUrl })
  await apiClient.delete(`/api/Image?${params.toString()}`)
  return true
}

const imageService = {
  uploadCategoryImage,
  uploadMenuItemImage,
  deleteImage,
}

export default imageService
