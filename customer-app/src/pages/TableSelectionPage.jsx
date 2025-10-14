import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import tableService from '../services/tableService'

const TableSelectionPage = () => {
  const navigate = useNavigate()
  const { setTable } = useCart()
  const [tableCode, setTableCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!tableCode.trim()) {
      setError('Please enter a table code')
      return
    }

    setIsLoading(true)

    try {
      const table = await tableService.getTableByCode(tableCode.trim().toUpperCase())

      if (!table.isActive) {
        setError('This table is currently unavailable')
        return
      }

      setTable(table)
      navigate('/menu')
    } catch (err) {
      setError(err.message || 'Table not found. Please check your code and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/20 rounded-2xl mb-4">
            <svg
              className="w-10 h-10 text-orange-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 15.75m18 0v-2.513m0 2.513v.375c0 .621-.504 1.125-1.125 1.125h-15.75A1.125 1.125 0 0 1 3 16.125V15.75m18-2.513v-2.013a2.25 2.25 0 0 0-1.5-2.122l-1.5-.5m-15 4.635v2.513m0-2.513V11.25a2.25 2.25 0 0 1 1.5-2.122l1.5-.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome!</h1>
          <p className="text-slate-400">Enter your table code to get started</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Table Code
              </label>
              <input
                type="text"
                value={tableCode}
                onChange={(e) => setTableCode(e.target.value.toUpperCase())}
                placeholder="e.g. TBL-001"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-center text-lg font-mono uppercase tracking-wider placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
              <p className="mt-2 text-xs text-slate-400 text-center">
                Find your table code on the QR code sticker at your table
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Continue to Menu'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="flex items-start gap-3 text-sm text-slate-400">
              <svg
                className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p>
                Scan the QR code at your table to automatically fill in your table code, or enter it manually above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TableSelectionPage
