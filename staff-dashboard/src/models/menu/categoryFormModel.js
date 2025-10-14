export const categoryFormInitialState = {
  name: '',
  description: '',
  imageUrl: '',
  displayOrder: 0,
  isActive: true,
}

export const mapCategoryToForm = (category) => ({
  name: category?.name ?? '',
  description: category?.description ?? '',
  imageUrl: category?.imageUrl ?? '',
  displayOrder: category?.displayOrder ?? 0,
  isActive: category?.isActive ?? true,
})

export const validateCategoryForm = (form) => {
  const errors = {}

  if (!form.name.trim()) {
    errors.name = 'Name is required'
  } else if (form.name.length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }

  if (form.description && form.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters'
  }

  if (form.displayOrder < 0) {
    errors.displayOrder = 'Display order must be zero or greater'
  }

  return errors
}
