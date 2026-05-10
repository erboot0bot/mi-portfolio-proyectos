import { useOutletContext } from 'react-router-dom'

export default function PersonalWelcome() {
  const { app } = useOutletContext()
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="text-5xl mb-4">{app.icon}</div>
      <h2 className="text-xl font-bold text-[var(--text)] mb-2">{app.name}</h2>
      <p className="text-[var(--text-muted)] text-sm max-w-xs">
        Selecciona un módulo en el menú lateral para empezar
      </p>
    </div>
  )
}
