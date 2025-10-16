import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import CategoryNav from '../components/CategoryNav'
import MenuList from '../components/MenuList'
import menuService from '../services/menuService'
import tableService from '../services/tableService'
import { useTable } from '../contexts/TableContext'

const MenuPage = () => {
  const navigate = useNavigate()
  const { tableCode: tableCodeParam } = useParams()
  const [searchParams] = useSearchParams()
  const qrTableCode = tableCodeParam || searchParams.get('table') || null
  const { addToCart, getTotalItems } = useCart()
  const { tableInfo, setTableInfo } = useTable()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredItems, setFilteredItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tableNumberInput, setTableNumberInput] = useState('')
  const [tableLookupError, setTableLookupError] = useState(null)
  const [isCheckingTable, setIsCheckingTable] = useState(false)

  // Refs for scroll tracking
  const categorySectionsRef = useRef({})
  const isScrollingProgrammatically = useRef(false)

  const resolvedTableCode = qrTableCode || tableInfo?.tableCode || null
  const DEFAULT_RESTAURANT_ID = 1
  const shouldPromptForTable = !tableInfo && !resolvedTableCode

  const fetchMenu = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let restaurantId = DEFAULT_RESTAURANT_ID
      let currentTable = tableInfo

      if (resolvedTableCode) {
        if (!currentTable || currentTable.tableCode !== resolvedTableCode) {
          currentTable = await tableService.getTableByCode(resolvedTableCode)
          setTableInfo(currentTable)
        }
        restaurantId = currentTable.restaurantId
      } else if (tableInfo) {
        setTableInfo(null)
      }

        const [categoriesData, itemsData] = await Promise.all([
          menuService.getCategories(restaurantId),
          menuService.getAllItems(restaurantId),
        ])

      setCategories(categoriesData || [])
      setItems(itemsData || [])

      if (categoriesData && categoriesData.length > 0) {
        setActiveCategory(categoriesData[0].id)
      }
    } catch (err) {
      setCategories([])
      setItems([])
      setActiveCategory(null)
      setError(err.message || 'Failed to load menu')
    } finally {
      setIsLoading(false)
    }
  }, [resolvedTableCode, setTableInfo, tableInfo])

  useEffect(() => {
    fetchMenu()
  }, [fetchMenu])

  // Scroll event listener to update active category
  useEffect(() => {
    const handleScroll = () => {
      // Don't update active category if we're programmatically scrolling
      if (isScrollingProgrammatically.current) {
        return
      }

      const headerHeight = 140 + 56 + 100 // header + category nav + offset
      const scrollPosition = window.scrollY + headerHeight

      // Find which category section is currently visible
      for (const [categoryId, section] of Object.entries(categorySectionsRef.current)) {
        if (section) {
          const sectionTop = section.offsetTop
          const sectionBottom = sectionTop + section.offsetHeight

          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            setActiveCategory(Number(categoryId))
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [categories])

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (!value.trim()) {
      setFilteredItems([])
      return
    }

    const normalizedSearchTerm = value.toLowerCase()
    const results = items.filter((item) => {
      const nameMatch = item.name && item.name.toLowerCase().includes(normalizedSearchTerm)
      const descMatch = item.description && item.description.toLowerCase().includes(normalizedSearchTerm)
      return nameMatch || descMatch
    })

    setFilteredItems(results)
  }

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId)

    // Set flag to prevent scroll event from updating active category
    isScrollingProgrammatically.current = true

    // Scroll to the category section
    const section = categorySectionsRef.current[categoryId]
    if (section) {
      const headerHeight = 140 + 56 // header + category nav height
      const offsetTop = section.offsetTop - headerHeight
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })

      // Reset flag after scroll animation completes
      setTimeout(() => {
        isScrollingProgrammatically.current = false
      }, 1000)
    }
  }

  const handleAddToCart = (item, quantity = 1, customization = null) => {
    addToCart(item, quantity, customization)
  }

  const handleManualTableSubmit = async (event) => {
    event.preventDefault()
    const trimmed = tableNumberInput.trim()

    if (!trimmed) {
      setTableLookupError('Enter your table number to continue.')
      return
    }

    setIsCheckingTable(true)
    setTableLookupError(null)

    try {
      const table = await tableService.getTableByNumber(DEFAULT_RESTAURANT_ID, trimmed)
      setTableInfo(table)
      setTableNumberInput('')
    } catch (err) {
      setTableLookupError(err.message || 'Could not find that table. Please check the number.')
    } finally {
      setIsCheckingTable(false)
    }
  }

  // Get items for a specific category
  const getItemsByCategory = (categoryId) => {
    return items.filter(item => item.categoryId === categoryId && item.isAvailable)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Logo and Restaurant Name - Better mobile layout */}
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Restaurant Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
              />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 whitespace-nowrap">
                ChangAn BBQ
              </h1>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            {tableInfo ? (
              <>
                <p className="text-center text-sm text-gray-500">
                  You are ordering for <span className="font-semibold text-gray-700">Table {tableInfo.tableNumber}</span>
                  {tableInfo.location ? ` • ${tableInfo.location}` : ''}
                </p>
                <button
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600"
                  onClick={() => {
                    setTableInfo(null)
                    setTableNumberInput('')
                  }}
                  type="button"
                >
                  Change table
                </button>
              </>
            ) : (
              <p className="text-center text-sm text-gray-500">
                Enter your table number to make sure we deliver food to the right spot.
              </p>
            )}
          </div>

          {/* Cart Button - Absolute positioned on right */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <button
              onClick={() => navigate('/cart')}
              className="relative bg-orange-500 hover:bg-orange-600 text-white font-semibold px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-colors shadow-md"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Cart</span>
              </div>
              {/* Cart Badge */}
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 20 20"
              >
                <path
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search menu..."
              className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 block w-full pl-12 pr-4 py-3 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilteredItems([])
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 14 14"
                >
                  <path
                    d="m1 1 12 12M1 13 13 1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {shouldPromptForTable ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <form
            className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-sidebar/90 p-6 shadow-2xl"
            onSubmit={handleManualTableSubmit}
          >
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white text-center">
                Enter Your Table Number
              </h3>
              <p className="text-sm text-slate-300 text-center">
                You&apos;ll find it on the table tent or receipt. This helps us send your order to the right place.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="table-number">
                Table Number
              </label>
              <input
                autoFocus
                className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                id="table-number"
                onChange={(e) => {
                  setTableNumberInput(e.target.value)
                  setTableLookupError(null)
                }}
                placeholder="e.g. T1"
                value={tableNumberInput}
              />
              {tableLookupError && (
                <p className="mt-2 text-xs text-red-300">{tableLookupError}</p>
              )}
            </div>

            <button
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isCheckingTable}
              type="submit"
            >
              {isCheckingTable ? 'Checking...' : 'Confirm Table'}
            </button>
          </form>
        </div>
      ) : null}

      {/* Category Navigation - Sticky */}
      {!searchTerm && categories.length > 0 && (
        <div className="sticky top-[140px] z-40">
          <CategoryNav
            categories={categories}
            activeCategory={activeCategory}
            onCategoryClick={handleCategoryClick}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading menu...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchMenu}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div>
            {searchTerm ? (
              // Search Results
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Search Results for "{searchTerm}"
                </h2>
                {filteredItems.length > 0 ? (
                  <MenuList
                    menuItems={filteredItems}
                    category={null}
                    onAddToCart={handleAddToCart}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No items found matching your search</p>
                  </div>
                )}
              </div>
            ) : (
              // Category Sections
              <div className="space-y-10">
                {categories.map((category) => {
                  const categoryItems = getItemsByCategory(category.id)

                  return (
                    <div
                      key={category.id}
                      ref={(el) => {
                        if (el) categorySectionsRef.current[category.id] = el
                      }}
                      className="scroll-mt-48"
                    >
                      {/* Category Title */}
                      <div className="mb-6">
                        <h2 className="text-3xl font-bold text-gray-900 pb-3 border-b-2 border-orange-500">
                          {category.name}
                        </h2>
                        {category.description && (
                          <p className="text-gray-600 mt-2">{category.description}</p>
                        )}
                      </div>

                      {/* Menu Items */}
                      <MenuList
                        menuItems={categoryItems}
                        category={category}
                        onAddToCart={handleAddToCart}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default MenuPage
