import { useEffect } from 'react'

const MANIFESTS = {
  shopping: {
    name: 'Lista de la compra — H3nky',
    short_name: 'Lista · H3nky',
    start_url: '/hogar/shopping',
    theme_color: '#4CAF82',
    icon: '/icons/icon-shopping',
  },
  calendar: {
    name: 'Calendario — H3nky',
    short_name: 'Calendario · H3nky',
    start_url: '/hogar/calendar',
    theme_color: '#4A90D9',
    icon: '/icons/icon-calendar',
  },
  menu: {
    name: 'Menú semanal — H3nky',
    short_name: 'Menú · H3nky',
    start_url: '/hogar/menu',
    theme_color: '#E8651A',
    icon: '/icons/icon-menu',
  },
  recipes: {
    name: 'Recetas — H3nky',
    short_name: 'Recetas · H3nky',
    start_url: '/hogar/recipes',
    theme_color: '#9B59B6',
    icon: '/icons/icon-recipes',
  },
}

export function usePWAManifest(moduleKey) {
  useEffect(() => {
    const cfg = MANIFESTS[moduleKey]
    if (!cfg) return

    const manifest = {
      name: cfg.name,
      short_name: cfg.short_name,
      start_url: cfg.start_url,
      display: 'standalone',
      background_color: '#1A1A1A',
      theme_color: cfg.theme_color,
      icons: [
        { src: cfg.icon + '-192.png', sizes: '192x192', type: 'image/png' },
        { src: cfg.icon + '-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    }

    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.getElementById('pwa-manifest')
    const prev = link.href
    link.href = url
    if (prev.startsWith('blob:')) URL.revokeObjectURL(prev)

    document.getElementById('apple-icon').href = cfg.icon + '-192.png'
    document.getElementById('theme-color').content = cfg.theme_color

    const prevTitle = document.title
    document.title = cfg.short_name

    return () => {
      link.href = '/manifest.json'
      document.getElementById('apple-icon').href = '/icons/icon-base-192.png'
      document.getElementById('theme-color').content = '#E8651A'
      document.title = prevTitle
      URL.revokeObjectURL(url)
    }
  }, [moduleKey])
}
