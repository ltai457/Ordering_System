import { useState, useEffect } from 'react'
import addOnLibraryService from '../../services/addOnLibraryService.js'

const RESTAURANT_ID = 1 // Default restaurant ID

const SUGGESTED_CATEGORIES = [
  'Protein',
  'Vegetables',
  'Noodles & Rice',
  'Sauces & Condiments',
  'Extras',
  'Toppings',
]

const AddOnLibraryView = () => {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterActive, setFilterActive] = useState('all')
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    defaultPrice: '',
    category: '',
    isActive: true,
  })

  useEffect(() => {
    loadItems()
  }, [filterCategory, filterActive])

  const loadItems = async () => {
    try {
      setIsLoading(true)
      const filters = {}
      if (filterCategory) filters.category = filterCategory
      if (filterActive !== 'all') filters.isActive = filterActive === 'active'

      const data = await addOnLibraryService.getAll(RESTAURANT_ID, filters)
      setItems(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load add-ons')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setIsEditing(true)
    setEditingId(null)
    setEditForm({
      name: '',
      defaultPrice: '',
      category: '',
      isActive: true,
    })
  }

  const handleEdit = (item) => {
    setIsEditing(true)
    setEditingId(item.id)
    setEditForm({
      name: item.name,
      defaultPrice: item.defaultPrice.toString(),
      category: item.category || '',
      isActive: item.isActive,
    })
  }

  const handleSave = async () => {
    if (!editForm.name || editForm.defaultPrice === '') {
      alert('Please fill in name and price')
      return
    }

    try {
      if (editingId) {
        await addOnLibraryService.update(editingId, {
          name: editForm.name,
          defaultPrice: parseFloat(editForm.defaultPrice),
          category: editForm.category || null,
          isActive: editForm.isActive,
        })
      } else {
        await addOnLibraryService.create(RESTAURANT_ID, {
          name: editForm.name,
          defaultPrice: parseFloat(editForm.defaultPrice),
          category: editForm.category || null,
          isActive: editForm.isActive,
        })
      }
      setIsEditing(false)
      await loadItems()
    } catch (err) {
      alert(err.message || 'Failed to save add-on')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this add-on from the library?')) {
      return
    }

    try {
      await addOnLibraryService.delete(id)
      await loadItems()
    } catch (err) {
      alert(err.message || 'Failed to delete add-on')
    }
  }

  const handleToggleActive = async (item) => {
    try {
      await addOnLibraryService.update(item.id, {
        isActive: !item.isActive,
      })
      await loadItems()
    } catch (err) {
      alert(err.message || 'Failed to update add-on')
    }
  }

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))].sort()

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Add-on Library</h2>
          <p className="text-sm text-slate-400">
            Manage reusable add-ons that can be assigned to menu items
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Add New Item</span>
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search add-ons..."
            className="w-full rounded-lg border border-white/10 bg-surface px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-white/10 bg-surface px-4 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="rounded-lg border border-white/10 bg-surface px-4 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Edit Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-sidebar p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-white">
              {editingId ? 'Edit Add-on' : 'Create New Add-on'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g., Extra Noodles"
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Default Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.defaultPrice}
                  onChange={(e) => setEditForm({ ...editForm, defaultPrice: e.target.value })}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  list="categories"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  placeholder="e.g., Protein, Vegetables"
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <datalist id="categories">
                  {SUGGESTED_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="rounded border-white/10 bg-surface text-primary focus:ring-2 focus:ring-primary/40"
                />
                <label htmlFor="isActive" className="text-sm text-slate-300">
                  Active
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-sidebar/60 px-6 py-10 text-center text-sm text-slate-400">
          Loading add-ons...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-sidebar/40 px-6 py-10 text-center text-sm text-slate-400">
          {searchTerm ? 'No add-ons found matching your search' : 'No add-ons in library yet'}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-white/10 bg-sidebar/70 p-4 shadow-lg transition hover:border-white/20"
            >
              <div>
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-base font-bold text-white">{item.name}</h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      item.isActive
                        ? 'bg-emerald-500/10 text-emerald-200'
                        : 'bg-slate-600/20 text-slate-400'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-lg font-bold text-primary">${item.defaultPrice.toFixed(2)}</p>
                  {item.category && (
                    <p className="mt-1 text-xs text-slate-400">{item.category}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(item)}
                  className="flex-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/5"
                >
                  {item.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/5"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
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
  )
}

export default AddOnLibraryView
