import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MenuItem from './MenuItem'

describe('MenuItem Component', () => {
  const mockItem = {
    id: 1,
    name: 'Test Burger',
    description: 'Delicious test burger',
    price: 9.99,
    imageUrl: 'https://example.com/burger.jpg',
    isAvailable: true,
    addOns: [],
  }

  const mockCategory = {
    name: 'Main Dishes',
  }

  const mockOnAddToCart = vi.fn()

  beforeEach(() => {
    mockOnAddToCart.mockClear()
  })

  it('renders menu item with correct details', () => {
    render(
      <MenuItem
        item={mockItem}
        category={mockCategory}
        onAddToCart={mockOnAddToCart}
      />
    )

    expect(screen.getByText('Test Burger')).toBeInTheDocument()
    expect(screen.getByText('Delicious test burger')).toBeInTheDocument()
    expect(screen.getByText('$9.99')).toBeInTheDocument()
  })

  it('displays unavailable badge when item is not available', () => {
    const unavailableItem = { ...mockItem, isAvailable: false }

    render(
      <MenuItem
        item={unavailableItem}
        category={mockCategory}
        onAddToCart={mockOnAddToCart}
      />
    )

    // Use getAllByText since "Unavailable" appears in both badge and button
    const unavailableElements = screen.getAllByText('Unavailable')
    expect(unavailableElements.length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /unavailable/i })).toBeDisabled()
  })

  it('increases quantity when plus button is clicked', () => {
    render(
      <MenuItem
        item={mockItem}
        category={mockCategory}
        onAddToCart={mockOnAddToCart}
      />
    )

    const plusButton = screen.getByText('+')
    fireEvent.click(plusButton)

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('decreases quantity when minus button is clicked', () => {
    render(
      <MenuItem
        item={mockItem}
        category={mockCategory}
        onAddToCart={mockOnAddToCart}
      />
    )

    const plusButton = screen.getByText('+')
    const minusButton = screen.getByText('-')

    // Increase to 2
    fireEvent.click(plusButton)
    expect(screen.getByText('2')).toBeInTheDocument()

    // Decrease to 1
    fireEvent.click(minusButton)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('does not decrease quantity below 1', () => {
    render(
      <MenuItem
        item={mockItem}
        category={mockCategory}
        onAddToCart={mockOnAddToCart}
      />
    )

    const minusButton = screen.getByText('-')
    fireEvent.click(minusButton)

    // Should still be 1
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('calls onAddToCart when Quick Add button is clicked', () => {
    render(
      <MenuItem
        item={mockItem}
        category={mockCategory}
        onAddToCart={mockOnAddToCart}
      />
    )

    const quickAddButton = screen.getByText('Quick Add')
    fireEvent.click(quickAddButton)

    expect(mockOnAddToCart).toHaveBeenCalledWith(mockItem, 1, null)
  })

  it('shows confirmation message after adding to cart', async () => {
    render(
      <MenuItem
        item={mockItem}
        category={mockCategory}
        onAddToCart={mockOnAddToCart}
      />
    )

    const quickAddButton = screen.getByText('Quick Add')
    fireEvent.click(quickAddButton)

    await waitFor(() => {
      expect(screen.getByText(/Added 1 × Test Burger to cart/i)).toBeInTheDocument()
    })
  })

  it('shows Customize and Quick Add buttons for customizable items', () => {
    render(
      <MenuItem
        item={mockItem}
        category={mockCategory}
        onAddToCart={mockOnAddToCart}
      />
    )

    expect(screen.getByText('Customize')).toBeInTheDocument()
    expect(screen.getByText('Quick Add')).toBeInTheDocument()
  })

  it('shows only Add to Cart button for non-customizable categories', () => {
    const drinksCategory = { name: 'Drinks' }

    render(
      <MenuItem
        item={mockItem}
        category={drinksCategory}
        onAddToCart={mockOnAddToCart}
      />
    )

    expect(screen.getByText('Add to Cart')).toBeInTheDocument()
    expect(screen.queryByText('Customize')).not.toBeInTheDocument()
    expect(screen.queryByText('Quick Add')).not.toBeInTheDocument()
  })

  it('displays placeholder image when imageUrl is not provided', () => {
    const itemWithoutImage = { ...mockItem, imageUrl: null }

    const { container } = render(
      <MenuItem
        item={itemWithoutImage}
        category={mockCategory}
        onAddToCart={mockOnAddToCart}
      />
    )

    // Check for SVG placeholder icon
    const svgElement = container.querySelector('svg')
    expect(svgElement).toBeInTheDocument()
  })
})
