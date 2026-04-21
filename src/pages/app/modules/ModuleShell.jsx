import { NavLink, useParams } from 'react-router-dom'
import './ModuleShell.css'

export default function ModuleShell({ project, modules, sidebarExtra, children }) {
  const { slug } = useParams()

  return (
    <div className="module-shell">
      <aside className="module-shell-sidebar">
        <div className="module-shell-logo">
          <span>{project.icon}</span>
          <span className="module-shell-logo-name">{project.name}</span>
        </div>

        <nav className="module-shell-nav">
          {(modules ?? []).map(m => (
            <NavLink
              key={m.path}
              to={`/app/projects/${slug}/${m.path}`}
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
