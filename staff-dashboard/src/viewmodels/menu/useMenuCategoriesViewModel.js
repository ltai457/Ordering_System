import { useCallback, useEffect, useMemo, useState } from 'react'
import menuCategoryService from '../../services/menuCategoryService.js'
import imageService from '../../services/imageService.js'
import {
  categoryFormInitialState,
  mapCategoryToForm,
  validateCategoryForm,
} from '../../models/menu/categoryFormModel.js'

const useMenuCategoriesViewModel = () => {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null)
  const [form, setForm] = useState(categoryFormInitialState)
  const [formErrors, setFormErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const loadCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Load all categories including inactive ones so we can filter them in the UI
      const data = await menuCategoryService.getAll(true)
      setCategories(data ?? [])
    } catch (err) {
      setError(err.message ?? 'Unable to load categories')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const openCreateForm = () => {
    setCurrentCategory(null)
    setForm(categoryFormInitialState)
    setFormErrors({})
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  const openEditForm = (category) => {
    setCurrentCategory(category)
    setForm(mapCategoryToForm(category))
    setFormErrors({})
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setForm(categoryFormInitialState)
    setCurrentCategory(null)
    setFormErrors({})
  }

  const handleFormChange = useCallback((field) => (event) => {
    const value =
      field === 'displayOrder'
        ? Number(event.target.value ?? 0)
        : field === 'isActive'
          ? event.target.checked
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

    const errors = validateCategoryForm(form)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      let imageUrl = currentCategory?.imageUrl ?? ''

      // Upload new image if a file was selected
      if (form.imageFile) {
        imageUrl = await imageService.uploadCategoryImage(form.imageFile)
      }

      const payload = {
        name: form.name,
        description: form.description,
        imageUrl,
        displayOrder: form.displayOrder,
        isActive: form.isActive,
      }

      if (currentCategory) {
        await menuCategoryService.update(currentCategory.id, payload)
        setSuccessMessage('Category updated successfully')
      } else {
        await menuCategoryService.create(payload)
        setSuccessMessage('Category created successfully')
      }

      await loadCategories()
      closeForm()
    } catch (err) {
      setError(err.message ?? 'Unable to save category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Delete category "${category.name}"? This cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    try {
      await menuCategoryService.remove(category.id)
      setSuccessMessage('Category deleted successfully')
      await loadCategories()
    } catch (err) {
      setError(err.message ?? 'Unable to delete category')
    }
  }

  const handleToggleVisibility = async (category) => {
    try {
      await menuCategoryService.update(category.id, {
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        displayOrder: category.displayOrder,
        isActive: !category.isActive,
      })
      setSuccessMessage(`Category set to ${category.isActive ? 'hidden' : 'visible'} successfully`)
      await loadCategories()
    } catch (err) {
      setError(err.message ?? 'Unable to update category visibility')
    }
  }

  const filteredCategories = useMemo(() => {
    const sorted = [...categories].sort((a, b) => a.displayOrder - b.displayOrder)

    if (statusFilter === 'visible') {
      return sorted.filter((category) => category.isActive)
    }

    if (statusFilter === 'hidden') {
      return sorted.filter((category) => !category.isActive)
    }

    return sorted
  }, [categories, statusFilter])

  return {
    categories: filteredCategories,
    isLoading,
    error,
    successMessage,
    isFormOpen,
    form,
    formErrors,
    isSubmitting,
    currentCategory,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormChange,
    handleSubmit,
    handleDelete,
    handleToggleVisibility,
    statusFilter,
    setStatusFilter,
    reload: loadCategories,
  }
}

export default useMenuCategoriesViewModel
