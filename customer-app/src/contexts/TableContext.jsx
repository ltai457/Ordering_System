import { createContext, useContext, useEffect, useState } from 'react'

const TableContext = createContext()

export const useTable = () => {
  const context = useContext(TableContext)
  if (!context) {
    throw new Error('useTable must be used within a TableProvider')
  }
  return context
}

export const TableProvider = ({ children }) => {
  const STORAGE_KEY = 'customer-app-table'

  const [tableInfo, setTableInfoState] = useState(() => {
    if (typeof window === 'undefined') {
      return null
    }

    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn('Failed to load table info from storage', error)
      return null
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      if (tableInfo) {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tableInfo))
      } else {
        window.sessionStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.warn('Failed to persist table info', error)
    }
  }, [tableInfo])

  const setTableInfo = (info) => {
    setTableInfoState(info ?? null)
  }

  const value = {
    tableInfo,
    setTableInfo,
  }

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>
}
