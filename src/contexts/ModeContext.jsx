import { createContext, useContext, useState } from 'react'

const ModeContext = createContext({ mode: 'app', setMode: () => {} })

export function ModeProvider({ children }) {
  const [mode, setMode] = useState('app')
  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  return useContext(ModeContext)
}
