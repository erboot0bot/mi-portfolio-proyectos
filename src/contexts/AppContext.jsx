import { createContext, useContext } from 'react'

const AppContext = createContext(null)

export function AppProvider({ app, children }) {
  return (
    <AppContext.Provider value={app}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
