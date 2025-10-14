export const menuItemFormInitialState = {
  categoryId: '',
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  imageFile: null,
  dietaryInfo: '',
  displayOrder: 0,
}

export const mapMenuItemToForm = (item) => ({
  categoryId: item?.categoryId?.toString() ?? '',
  name: item?.name ?? '',
  description: item?.description ?? '',
  price: item?.price?.toString() ?? '',
  imageUrl: item?.imageUrl ?? '',
  imageFile: null,
  dietaryInfo: item?.dietaryInfo ?? '',
  displayOrder: item?.displayOrder ?? 0,
})

export const validateMenuItemForm = (form) => {
  const errors = {}

  if (!form.categoryId) {
    errors.categoryId = 'Category is required'
  }

  if (!form.name.trim()) {
    errors.name = 'Name is required'
  } else if (form.name.length < 2) {
    errors.name = 'Name must be at least 2 characters'
  } else if (form.name.length > 200) {
    errors.name = 'Name cannot exceed 200 characters'
  }

  if (form.description && form.description.length > 1000) {
    errors.description = 'Description cannot exceed 1000 characters'
  }

  if (!form.price) {
    errors.price = 'Price is required'
  } else {
    const priceNum = parseFloat(form.price)
    if (isNaN(priceNum) || priceNum < 0.01) {
      errors.price = 'Price must be at least 0.01'
    } else if (priceNum > 10000) {
      errors.price = 'Price cannot exceed 10000'
    }
  }

  if (form.dietaryInfo && form.dietaryInfo.length > 200) {
    errors.dietaryInfo = 'Dietary info cannot exceed 200 characters'
  }

  if (form.displayOrder < 0 || form.displayOrder > 1000) {
    errors.displayOrder = 'Display order must be between 0 and 1000'
  }

  // Validate image file if provided
  if (form.imageFile) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(form.imageFile.type)) {
      errors.imageFile = 'Image must be a JPG, PNG, GIF, or WebP file'
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (form.imageFile.size > maxSize) {
      errors.imageFile = 'Image must be smaller than 5MB'
    }
  }

  return errors
}
