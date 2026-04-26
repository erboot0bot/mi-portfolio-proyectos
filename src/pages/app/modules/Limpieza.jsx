// src/pages/app/modules/Limpieza.jsx
// Placeholder — full implementation in Task 5
import { useOutletContext } from 'react-router-dom'
import ModuleShell from './ModuleShell'

export default function Limpieza() {
  const { app, modules } = useOutletContext()
  return (
    <ModuleShell app={app} modules={modules}>
      <div style={{ padding: 32, color: 'var(--text-muted)' }}>
        Limpieza — próximamente
      </div>
    </ModuleShell>
  )
}
