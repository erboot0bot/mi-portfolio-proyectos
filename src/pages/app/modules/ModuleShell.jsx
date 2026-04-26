// src/pages/app/modules/ModuleShell.jsx
import { NavLink } from 'react-router-dom'
import './ModuleShell.css'

export default function ModuleShell({ app, modules, sidebarExtra, children }) {
  return (
    <div className="module-shell">
      <aside className="module-shell-sidebar">
        <div className="module-shell-logo">
          <span>{app.icon}</span>
          <span className="module-shell-logo-name">{app.name}</span>
        </div>

        <nav className="module-shell-nav">
          {(modules ?? []).map(m => (
            <NavLink
              key={m.path}
              to={`/app/hogar/${m.path}`}
              className={({ isActive }) =>
                `module-shell-nav-item${isActive ? ' active' : ''}`
              }
            >
              <span className="module-shell-nav-icon">{m.icon}</span>
              {m.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ flex: 1 }} />
        {sidebarExtra}
      </aside>

      <div className="module-shell-content">
        {children}
      </div>
    </div>
  )
}
