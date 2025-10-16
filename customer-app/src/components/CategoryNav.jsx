const CategoryNav = ({ categories, activeCategory, onCategoryClick }) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm overflow-x-auto scrollbar-hide">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 py-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className={`
                px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all
                ${
                  activeCategory === category.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CategoryNav
