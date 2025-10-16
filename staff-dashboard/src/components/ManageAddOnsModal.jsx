import { useState, useEffect } from 'react'
import menuItemAddOnService from '../services/menuItemAddOnService.js'
import addOnLibraryService from '../services/addOnLibraryService.js'

const RESTAURANT_ID = 1

const ManageAddOnsModal = ({ menuItem, onClose, onSave }) => {
  const [addOns, setAddOns] = useState([])
  const [libraryItems, setLibraryItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    isAvailable: true,
    displayOrder: 0,
  })
  const [editingId, setEditingId] = useState(null)

  const getNextDisplayOrder = () =>
    Array.isArray(addOns) && addOns.length > 0 ? Math.max(...addOns.map((x) => x.displayOrder ?? 0)) + 1 : 0

  useEffect(() => {
    if (!menuItem?.id) {
      setAddOns([])
      setIsLoading(false)
      return
    }
    loadAddOns()
    loadLibraryItems()
  }, [menuItem?.id])

  const loadAddOns = async () => {
    if (!menuItem?.id) {
      setAddOns([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await menuItemAddOnService.getAddOnsByMenuItem(menuItem.id)
      const normalized = Array.isArray(data)
        ? data.map((addOn) => ({
            ...addOn,
            price:
              typeof addOn.price === 'number'
                ? addOn.price
                : Number.parseFloat(addOn.price ?? '0'),
            displayOrder:
              typeof addOn.displayOrder === 'number'
                ? addOn.displayOrder
                : Number.parseInt(addOn.displayOrder ?? '0', 10) || 0,
          }))
        : []
      setAddOns(normalized)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load add-ons')
    } finally {
      setIsLoading(false)
    }
  }

  const loadLibraryItems = async () => {
    try {
      const data = await addOnLibraryService.getAll(RESTAURANT_ID, { isActive: true })
      setLibraryItems(data || [])
    } catch (err) {
      // Silent fail - library is optional
    }
  }

  const handleCreate = () => {
    setIsEditing(true)
    setShowQuickAdd(false)
    setEditingId(null)
    setEditForm({
      name: '',
      price: '',
      isAvailable: true,
      displayOrder: getNextDisplayOrder(),
    })
  }

  const handleQuickAddFromLibrary = async (libraryItem) => {
    try {
      await menuItemAddOnService.createAddOn(menuItem.id, {
        name: libraryItem.name,
        price: libraryItem.defaultPrice,
        isAvailable: true,
        displayOrder: getNextDisplayOrder(),
      })
      setShowQuickAdd(false)
      setSearchTerm('')
      await loadAddOns()
    } catch (err) {
      alert(err.message || 'Failed to add item')
    }
  }

  const filteredLibraryItems = libraryItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (addOn) => {
    setIsEditing(true)
    setEditingId(addOn.id)
    setEditForm({
      name: addOn.name,
      price: addOn.price.toString(),
      isAvailable: addOn.isAvailable,
      displayOrder: addOn.displayOrder ?? 0,
    })
  }

  const handleSave = async () => {
    if (!editForm.name || editForm.price === '') {
      alert('Please fill in all fields')
      return
    }

    try {
      if (editingId) {
        // Update
        await menuItemAddOnService.updateAddOn(editingId, {
          name: editForm.name,
          price: parseFloat(editForm.price),
          isAvailable: editForm.isAvailable,
          displayOrder: Number.parseInt(editForm.displayOrder, 10) || 0,
        })
      } else {
        // Create
        await menuItemAddOnService.createAddOn(menuItem.id, {
          name: editForm.name,
          price: parseFloat(editForm.price),
          isAvailable: editForm.isAvailable,
          displayOrder: Number.parseInt(editForm.displayOrder, 10) || 0,
        })
      }
      setIsEditing(false)
      setEditForm({
        name: '',
        price: '',
        isAvailable: true,
        displayOrder: getNextDisplayOrder(),
      })
      await loadAddOns()
    } catch (err) {
      alert(err.message || 'Failed to save add-on')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this add-on?')) {
      return
    }

    try {
      await menuItemAddOnService.deleteAddOn(id)
      await loadAddOns()
    } catch (err) {
      alert(err.message || 'Failed to delete add-on')
    }
  }

  const handleToggleAvailability = async (addOn) => {
    try {
      await menuItemAddOnService.updateAddOn(addOn.id, {
        isAvailable: !addOn.isAvailable
      })
      await loadAddOns()
    } catch (err) {
      alert(err.message || 'Failed to update add-on')
    }
  }

  const displayAddOns = Array.isArray(addOns) ? addOns : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-sidebar shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-sidebar border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Manage Add-ons</h2>
            <p className="text-sm text-slate-400">{menuItem.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Add New Buttons */}
          {!isEditing && !showQuickAdd && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowQuickAdd(true)}
                className="flex-1 rounded-lg border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:border-emerald-500/50 hover:bg-emerald-500/10"
              >
                ⚡ Quick Add from Library
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 rounded-lg border-2 border-dashed border-white/20 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-primary/40 hover:bg-primary/5"
              >
                + Create Custom Item
              </button>
            </div>
          )}

          {/* Quick Add from Library */}
          {showQuickAdd && !isEditing && (
            <div className="rounded-lg border border-white/10 bg-surface/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Add from Library</h3>
                <button
                  onClick={() => {
                    setShowQuickAdd(false)
                    setSearchTerm('')
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search library..."
                className="w-full mb-3 rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {filteredLibraryItems.length === 0 ? (
                  <div className="col-span-2 py-8 text-center text-sm text-slate-400">
                    {searchTerm ? 'No items found' : 'No items in library yet'}
                  </div>
                ) : (
                  filteredLibraryItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleQuickAddFromLibrary(item)}
                      className="flex flex-col items-start rounded-lg border border-white/10 bg-surface px-3 py-2 text-left transition hover:border-emerald-500/50 hover:bg-emerald-500/10"
                    >
                      <span className="text-sm font-medium text-white">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-400">
                          +${item.defaultPrice.toFixed(2)}
                        </span>
                        {item.category && (
                          <span className="text-xs text-slate-500">{item.category}</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Edit Form */}
          {isEditing && (
            <div className="rounded-lg border border-white/10 bg-surface/50 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-white">
                {editingId ? 'Edit Add-on' : 'New Add-on'}
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g., Extra Noodles"
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={editForm.isAvailable}
                  onChange={(e) => setEditForm({ ...editForm, isAvailable: e.target.checked })}
                  className="rounded border-white/10 bg-surface text-primary focus:ring-2 focus:ring-primary/40"
                />
                <label htmlFor="isAvailable" className="text-sm text-slate-300">
                  Available
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.displayOrder}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      displayOrder: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Lower numbers appear first. New add-ons default to the end of the list.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          )}

          {/* Add-ons List */}
          {isLoading ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Loading add-ons...
            </div>
          ) : displayAddOns.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No add-ons yet. Click "Add New Extra Item" to create one.
            </div>
          ) : (
            <div className="space-y-2">
              {displayAddOns.map((addOn) => (
                <div
                  key={addOn.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-surface/30 px-4 py-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{addOn.name}</h4>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          addOn.isAvailable
                            ? 'bg-emerald-500/10 text-emerald-200'
                            : 'bg-slate-600/20 text-slate-400'
                        }`}
                      >
                        {addOn.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-primary mt-1">
                      +${addOn.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAvailability(addOn)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/5"
                    >
                      {addOn.isAvailable ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleEdit(addOn)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/5"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addOn.id)}
                      className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-sidebar border-t border-white/10 px-6 py-4">
          <button
            onClick={onSave}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default ManageAddOnsModal
