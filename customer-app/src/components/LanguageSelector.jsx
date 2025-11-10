import { useState } from 'react'
import { useLanguage, LANGUAGES, CURRENCIES, LANGUAGE_LABELS, CURRENCY_LABELS } from '../contexts/LanguageContext'

const LanguageSelector = () => {
  const { language, setLanguage, currency, setCurrency } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => setIsOpen(!isOpen)

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    setIsOpen(false)
  }

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-lg bg-white border-2 border-orange-300 hover:bg-orange-50 transition-all text-xs lg:text-sm font-semibold text-gray-700"
      >
        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M10.5 21L15.75 9.75M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z M12 3c2.25 0 4.29.854 5.85 2.25M3.85 9a9.003 9.003 0 0 1 5.85-5.85M9 21c-1.2-1.41-2.1-3.16-2.55-5.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="hidden sm:inline">
          {LANGUAGE_LABELS[language].split('')[0]} | {currency.toUpperCase()}
        </span>
        <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 10 6">
          <path d="m1 1 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-56 lg:w-64 bg-white rounded-xl shadow-2xl border-2 border-orange-200 z-50 overflow-hidden">
            {/* Language Section */}
            <div className="p-3 lg:p-4 border-b border-gray-200">
              <h3 className="text-xs lg:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Language
              </h3>
              <div className="space-y-1">
                {Object.entries(LANGUAGES).map(([key, value]) => (
                  <button
                    key={value}
                    onClick={() => handleLanguageChange(value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm lg:text-base font-medium transition-all ${
                      language === value
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-orange-100'
                    }`}
                  >
                    {LANGUAGE_LABELS[value]}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency Section */}
            <div className="p-3 lg:p-4">
              <h3 className="text-xs lg:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Currency
              </h3>
              <div className="space-y-1">
                {Object.entries(CURRENCIES).map(([key, value]) => (
                  <button
                    key={value}
                    onClick={() => handleCurrencyChange(value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm lg:text-base font-medium transition-all ${
                      currency === value
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-orange-100'
                    }`}
                  >
                    {CURRENCY_LABELS[value]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSelector
