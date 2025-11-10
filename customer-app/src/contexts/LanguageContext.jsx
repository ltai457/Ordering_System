import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

// Language and currency options
export const LANGUAGES = {
  EN: 'en',
  KH: 'kh',
  CN: 'cn',
}

export const CURRENCIES = {
  USD: 'usd',
  KHR: 'khr',
}

export const LANGUAGE_LABELS = {
  [LANGUAGES.EN]: 'English',
  [LANGUAGES.KH]: 'ភាសាខ្មែរ',
  [LANGUAGES.CN]: '中文',
}

export const CURRENCY_LABELS = {
  [CURRENCIES.USD]: 'USD ($)',
  [CURRENCIES.KHR]: 'KHR (៛)',
}

export const LanguageProvider = ({ children }) => {
  // Load from localStorage or default to English and USD
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('preferredLanguage')
    return saved || LANGUAGES.EN
  })

  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('preferredCurrency')
    return saved || CURRENCIES.USD
  })

  // Save to localStorage whenever language changes
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language)
  }, [language])

  // Save to localStorage whenever currency changes
  useEffect(() => {
    localStorage.setItem('preferredCurrency', currency)
  }, [currency])

  // Get the appropriate name based on selected language
  const getLocalizedName = (item) => {
    if (!item) return ''

    switch (language) {
      case LANGUAGES.KH:
        return item.nameKH || item.name || ''
      case LANGUAGES.CN:
        return item.nameCN || item.name || ''
      case LANGUAGES.EN:
      default:
        return item.nameEN || item.name || ''
    }
  }

  // Get the appropriate price based on selected currency
  const getLocalizedPrice = (item) => {
    if (!item) return 0

    switch (currency) {
      case CURRENCIES.KHR:
        return item.priceKHR || item.price || 0
      case CURRENCIES.USD:
      default:
        return item.priceUSD || item.price || 0
    }
  }

  // Format price with currency symbol
  const formatPrice = (price) => {
    if (currency === CURRENCIES.KHR) {
      return `${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}៛`
    }
    return `$${price.toFixed(2)}`
  }

  const value = {
    language,
    setLanguage,
    currency,
    setCurrency,
    getLocalizedName,
    getLocalizedPrice,
    formatPrice,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
