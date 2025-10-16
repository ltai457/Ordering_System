import { useEffect, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import tableService from '../../services/tableService.js'
import authService from '../../services/authService.js'

const TablesView = () => {
  const [tables, setTables] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)
  const [editingTable, setEditingTable] = useState(null)
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
    location: '',
    isActive: true,
  })

  const user = authService.getStoredUser()
  const restaurantId = user?.restaurantId || 1

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await tableService.getTables(restaurantId)
      setTables(data)
    } catch (err) {
      setError(err.message || 'Failed to load tables')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (table = null) => {
    if (table) {
      setEditingTable(table)
      setFormData({
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        location: table.location || '',
        isActive: table.isActive,
      })
    } else {
      setEditingTable(null)
      setFormData({
        tableNumber: '',
        capacity: 4,
        location: '',
        isActive: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTable(null)
    setFormData({
      tableNumber: '',
      capacity: 4,
      location: '',
      isActive: true,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTable) {
        await tableService.updateTable(editingTable.id, formData)
      } else {
        await tableService.createTable({
          ...formData,
          restaurantId,
        })
      }
      await fetchTables()
      handleCloseModal()
    } catch (err) {
      alert(err.message || 'Failed to save table')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this table?')) return

    try {
      await tableService.deleteTable(id)
      await fetchTables()
    } catch (err) {
      alert(err.message || 'Failed to delete table')
    }
  }

  const handleShowQR = (table) => {
    setSelectedTable(table)
    setShowQRModal(true)
  }

  const handleCloseQRModal = () => {
    setShowQRModal(false)
    setSelectedTable(null)
  }

  const handleDownloadQR = () => {
    if (!selectedTable) return

    const canvas = document.getElementById('qr-code-canvas')
    if (!canvas) return

    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `Table-${selectedTable.tableNumber}-QR.png`
    link.href = url
    link.click()
  }

  const getQRCodeURL = (table) => {
    // Customer app URL with table code
    // Use local IP for phone access on port 5173
    const customerAppUrl = 'http://192.168.88.6:5173'
    return `${customerAppUrl}/menu/${table.tableCode}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-slate-400">Loading tables...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
        <p>{error}</p>
        <button
          onClick={fetchTables}
          className="mt-2 text-sm underline hover:text-red-300"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Tables</h2>
          <p className="text-sm text-slate-400">
            Manage restaurant tables and seating
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          + Add Table
        </button>
      </div>

      {/* Tables Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className="rounded-xl border border-white/10 bg-sidebar/80 p-4 transition hover:border-white/20"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {table.tableNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Capacity: {table.capacity} people
                </p>
                {table.location && (
                  <p className="text-xs text-slate-500">{table.location}</p>
                )}
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  table.isActive
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {table.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleShowQR(table)}
                className="flex-1 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/20"
              >
                QR Code
              </button>
              <button
                onClick={() => handleOpenModal(table)}
                className="flex-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(table.id)}
                className="flex-1 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
              >
                Delete
              </button>
            </div>

            <div className="mt-3 rounded-lg bg-white/5 p-2">
              <p className="text-xs text-slate-500">Table Code:</p>
              <p className="mt-1 break-all text-xs text-slate-400">
                {table.tableCode}
              </p>
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-sidebar/80 p-8 text-center">
          <p className="text-slate-400">No tables yet. Create your first one!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-sidebar p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">
              {editingTable ? 'Edit Table' : 'Add New Table'}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Table Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tableNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, tableNumber: e.target.value })
                  }
                  placeholder="e.g., T1, Table 1"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-4 py-2 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Capacity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-4 py-2 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Main Hall, Patio, Window"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-4 py-2 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-white/10 bg-surface text-primary focus:ring-2 focus:ring-primary/40"
                />
                <label htmlFor="isActive" className="text-sm text-slate-300">
                  Active (available for use)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  {editingTable ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-sidebar p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                QR Code - {selectedTable.tableNumber}
              </h3>
              <button
                onClick={handleCloseQRModal}
                className="text-slate-400 hover:text-white"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center">
              {/* QR Code */}
              <div className="rounded-xl bg-white p-6 relative">
                <QRCodeCanvas
                  id="qr-code-canvas"
                  value={getQRCodeURL(selectedTable)}
                  size={256}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: '/logo.png',
                    height: 48,
                    width: 48,
                    excavate: true,
                  }}
                />
              </div>

              {/* Table Info */}
              <div className="mt-6 w-full space-y-2 rounded-lg bg-white/5 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Table:</span>
                  <span className="font-semibold text-white">
                    {selectedTable.tableNumber}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Capacity:</span>
                  <span className="text-white">{selectedTable.capacity} people</span>
                </div>
                {selectedTable.location && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-white">{selectedTable.location}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Table Code:</span>
                  <span className="font-mono text-xs text-white">
                    {selectedTable.tableCode}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-4">
                <p className="text-xs text-primary">
                  <strong>Instructions:</strong> Print this QR code and place it on
                  the table. Customers can scan it with their phone camera to view
                  the menu and place orders.
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 flex w-full gap-3">
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  Download QR Code
                </button>
                <button
                  onClick={handleCloseQRModal}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TablesView
