import { NavLink, useNavigate } from 'react-router-dom'

export default function BottomNav({ modules }) {
  const navigate = useNavigate()

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <style>{`.bnav-scroll::-webkit-scrollbar{display:none}`}</style>
      <div
        className="bnav-scroll"
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <button
          onClick={() => navigate('/apps')}
          style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            padding: '8px 14px',
            border: 'none',
            background: 'none',
            color: 'var(--text-faint)',
            cursor: 'pointer',
            borderRight: '1px solid var(--border)',
            minWidth: 52,
          }}
        >
          <span style={{ fontSize: 16 }}>⬅️</span>
          <span style={{ fontSize: 9, fontWeight: 500 }}>Apps</span>
        </button>

        {modules.map(m => (
          <NavLink
            key={m.path}
            to={m.path}
            style={({ isActive }) => ({
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              padding: '8px 14px',
              textDecoration: 'none',
              minWidth: 56,
              color: isActive ? 'var(--accent)' : 'var(--text-faint)',
              borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'color 0.15s, border-color 0.15s',
            })}
          >
            <span style={{ fontSize: 20 }}>{m.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 500, whiteSpace: 'nowrap' }}>{m.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
