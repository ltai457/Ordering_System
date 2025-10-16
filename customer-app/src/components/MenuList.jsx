import MenuItem from './MenuItem'

const MenuList = ({ menuItems, onAddToCart }) => {
  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No items available in this category</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {menuItems.map((item) => (
        <MenuItem key={item.id} item={item} onAddToCart={onAddToCart} />
      ))}
    </div>
  )
}

export default MenuList
