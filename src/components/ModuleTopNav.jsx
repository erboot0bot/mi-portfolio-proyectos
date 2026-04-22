import { useEffect, useRef } from 'react'
import './ModuleTopNav.css'

export default function ModuleTopNav({
  title,
  subtitle,
  leftAction,
  rightAction,
  extraAction,
  tabs,
  activeTab,
  onTabChange,
  scrollRef,
}) {
  const navRef = useRef(null)

  useEffect(() => {
    const target = scrollRef?.current
    if (!target || !navRef.current) return
    const handler = () => {
      navRef.current?.classList.toggle('scrolled', target.scrollTop > 8)
    }
    target.addEventListener('scroll', handler, { passive: true })
    return () => target.removeEventListener('scroll', handler)
  }, [scrollRef])

  return (
    <nav ref={navRef} className="module-top-nav">
      <div className="nav-main-row">
        {leftAction ? (
          <button className="nav-arrow" onClick={leftAction.onClick} aria-label="anterior">
            {leftAction.icon}
          </button>
        ) : <div style={{ width: 40 }} />}

        <div className="nav-center">
          {title && <span className="nav-title">{title}</span>}
          {subtitle && <span className="nav-subtitle">{subtitle}</span>}
        </div>

        {extraAction && (
          <button
            className={`nav-action-btn${extraAction.accent ? ' accent' : ''}`}
            onClick={extraAction.onClick}
          >
            {extraAction.icon}
          </button>
        )}

        {rightAction ? (
          <button
            className={`nav-action-btn${rightAction.accent ? ' accent' : ''}`}
            onClick={rightAction.onClick}
          >
            {rightAction.icon}
          </button>
        ) : <div style={{ width: 40 }} />}
      </div>

      {tabs && tabs.length > 0 && (
        <div className="nav-tabs-row">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`nav-tab${activeTab === t.key ? ' active' : ''}`}
              onClick={() => onTabChange?.(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
