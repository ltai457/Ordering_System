import { useCallback, useEffect, useMemo, useState } from 'react'
import menuItemService from '../../services/menuItemService.js'
import menuCategoryService from '../../services/menuCategoryService.js'
import imageService from '../../services/imageService.js'
import {
  menuItemFormInitialState,
  mapMenuItemToForm,
  validateMenuItemForm,
} from '../../models/menu/menuItemFormModel.js'

const useMenuItemsViewModel = () => {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [form, setForm] = useState(menuItemFormInitialState)
  const [formErrors, setFormErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const loadCategories = useCallback(async () => {
    try {
      const data = await menuCategoryService.getAll(false) // Only active categories
      setCategories(data ?? [])
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }, [])

  const loadItems = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await menuItemService.getAll()
      setItems(data ?? [])
    } catch (err) {
      setError(err.message ?? 'Unable to load menu items')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
    loadItems()
  }, [loadCategories, loadItems])

  const openCreateForm = () => {
    setCurrentItem(null)
    setForm(menuItemFormInitialState)
    setFormErrors({})
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  const openEditForm = (item) => {
    setCurrentItem(item)
    setForm(mapMenuItemToForm(item))
    setFormErrors({})
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setForm(menuItemFormInitialState)
    setCurrentItem(null)
    setFormErrors({})
  }

  const handleFormChange = useCallback((field) => (event) => {
    const value =
      field === 'displayOrder'
        ? Number(event.target.value ?? 0)
        : field === 'imageFile'
          ? event.target.files?.[0] ?? null
          : event.target.value

    setForm((prev) => ({ ...prev, [field]: value }))

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }, [formErrors])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSuccessMessage('')

    const errors = validateMenuItemForm(form)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      let imageUrl = currentItem?.imageUrl ?? ''

      // Upload new image if a file was selected
      if (form.imageFile) {
        imageUrl = await imageService.uploadMenuItemImage(form.imageFile)
      }

      const payload = {
        categoryId: parseInt(form.categoryId),
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        imageUrl: imageUrl || null,
        dietaryInfo: form.dietaryInfo || null,
        displayOrder: form.displayOrder,
      }

      if (currentItem) {
        await menuItemService.update(currentItem.id, payload)
        setSuccessMessage('Menu item updated successfully')
      } else {
        await menuItemService.create(payload)
        setSuccessMessage('Menu item created successfully')
      }

      await loadItems()
      closeForm()
    } catch (err) {
      setError(err.message ?? 'Unable to save menu item')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete menu item "${item.name}"? This cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    try {
      await menuItemService.remove(item.id)
      setSuccessMessage('Menu item deleted successfully')
      await loadItems()
    } catch (err) {
      setError(err.message ?? 'Unable to delete menu item')
    }
  }

  const handleToggleAvailability = async (item) => {
    try {
      await menuItemService.toggleAvailability(item.id)
      setSuccessMessage(`Menu item set to ${item.isAvailable ? 'unavailable' : 'available'} successfully`)
      await loadItems()
    } catch (err) {
      setError(err.message ?? 'Unable to update menu item availability')
    }
  }

  const handleReorder = async (categoryId, sourceIndex, destinationIndex) => {
    if (sourceIndex === destinationIndex) {
      return
    }

    // Create a backup of the current items
    const previousItems = [...items]

    // Get items for this category only
    const categoryItems = filteredItems.filter(item => item.categoryId === categoryId)

    // Reorder the items within this category
    const reordered = Array.from(categoryItems)
    const [movedItem] = reordered.splice(sourceIndex, 1)
    reordered.splice(destinationIndex, 0, movedItem)

    // Update the items state with the new order
    const otherItems = items.filter(item => item.categoryId !== categoryId)
    setItems([...otherItems, ...reordered])

    try {
      // Send the new order to the backend
      const menuItemIds = reordered.map((item) => item.id)
      await menuItemService.reorder(categoryId, menuItemIds)
      setSuccessMessage('Menu items reordered successfully')
    } catch (err) {
      // Revert to the previous state on error
      setItems(previousItems)
      setError(err.message ?? 'Unable to reorder menu items')
    }
  }

  const filteredItems = useMemo(() => {
    let filtered = [...items]

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((item) => item.categoryId === parseInt(categoryFilter))
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.categoryName.toLowerCase().includes(term)
      )
    }

    // Sort by category and display order
    return filtered.sort((a, b) => {
      if (a.categoryName !== b.categoryName) {
        return a.categoryName.localeCompare(b.categoryName)
      }
      return a.displayOrder - b.displayOrder
    })
  }, [items, categoryFilter, searchTerm])

  return {
    items: filteredItems,
    categories,
    isLoading,
    error,
    successMessage,
    isFormOpen,
    form,
    formErrors,
    isSubmitting,
    currentItem,
    categoryFilter,
    setCategoryFilter,
    searchTerm,
    setSearchTerm,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormChange,
    handleSubmit,
    handleDelete,
    handleToggleAvailability,
    handleReorder,
    reload: loadItems,
  }
}

export default useMenuItemsViewModel
