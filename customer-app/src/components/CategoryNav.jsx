const CategoryNav = ({ categories, activeCategory, onCategoryClick }) => {
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 px-3 py-3 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              style={{ fontFamily: "'Preahvihear', sans-serif" }}
              className={`
                relative px-4 py-2.5 rounded-lg font-extrabold whitespace-nowrap transition-all text-sm
                ${
                  activeCategory === category.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300 active:scale-95'
                }
              `}
            >
              {category.name}
              {activeCategory === category.id && (
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-orange-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CategoryNav
