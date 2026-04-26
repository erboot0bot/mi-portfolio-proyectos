// src/pages/app/modules/Inventario.jsx
// Placeholder — full implementation in Task 4
import { useOutletContext } from 'react-router-dom'
import ModuleShell from './ModuleShell'

export default function Inventario() {
  const { app, modules } = useOutletContext()
  return (
    <ModuleShell app={app} modules={modules}>
      <div style={{ padding: 32, color: 'var(--text-muted)' }}>
        Inventario — próximamente
      </div>
    </ModuleShell>
  )
}
