import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const inp = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
const Stars = ({ n }) => <span>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ color: i < n ? '#f59e0b' : 'var(--border)', fontSize: 12 }}>★</span>)}</span>

const TABS = [
  { id: 'videojuegos', label: 'Videojuegos', icon: '🎮', key: 'entretenimiento_videojuegos' },
  { id: 'libros',      label: 'Libros',      icon: '📚', key: 'entretenimiento_libros' },
  { id: 'peliculas',   label: 'Películas',   icon: '🎬', key: 'entretenimiento_peliculas' },
  { id: 'musica',      label: 'Música',      icon: '🎵', key: 'entretenimiento_musica' },
  { id: 'podcasts',    label: 'Podcasts',    icon: '🎙️', key: 'entretenimiento_podcasts' },
]

const ESTADO_LABELS = {
  completado: { label: 'Completado', color: '#22c55e' },
  jugando:    { label: 'Jugando',    color: '#f59e0b' },
  wishlist:   { label: 'Wishlist',   color: '#a855f7' },
  abandonado: { label: 'Abandonado', color: '#ef4444' },
  leido:      { label: 'Leído',      color: '#22c55e' },
  leyendo:    { label: 'Leyendo',    color: '#f59e0b' },
  visto:      { label: 'Visto',      color: '#22c55e' },
  viendo:     { label: 'Viendo',     color: '#f59e0b' },
  siguiendo:  { label: 'Siguiendo',  color: '#38bdf8' },
}

const BLANK_VG  = { titulo: '', plataforma: 'PC', estado: 'wishlist', horas: 0, puntuacion: 0, critica: '' }
const BLANK_LIB = { titulo: '', autor: '', estado: 'wishlist', puntuacion: 0, critica: '', fecha_lectura: null }
const BLANK_PEL = { titulo: '', tipo: 'pelicula', plataforma: '', estado: 'wishlist', puntuacion: 0, critica: '', anio: new Date().getFullYear() }
const BLANK_MUS = { titulo: '', artista: '', anio: new Date().getFullYear(), puntuacion: 0, critica: '' }
const BLANK_POD = { nombre: '', autor: '', estado: 'siguiendo', episodios_guardados: 0, notas: '' }

const BLANK_BY_TAB = { videojuegos: BLANK_VG, libros: BLANK_LIB, peliculas: BLANK_PEL, musica: BLANK_MUS, podcasts: BLANK_POD }

function getTitle(item, tabId) {
  if (tabId === 'podcasts') return item.nombre
  return item.titulo
}
function getSubtitle(item, tabId) {
  if (tabId === 'videojuegos') return `${item.plataforma}${item.horas > 0 ? ` · ${item.horas}h` : ''}`
  if (tabId === 'libros')      return item.autor
  if (tabId === 'peliculas')   return `${item.tipo === 'serie' ? 'Serie' : 'Película'} · ${item.plataforma} · ${item.anio}`
  if (tabId === 'musica')      return `${item.artista} · ${item.anio}`
  if (tabId === 'podcasts')    return item.autor
  return ''
}

function AddForm({ tabId, onSave, onCancel }) {
  const [form, setForm] = useState({ ...BLANK_BY_TAB[tabId] })
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  function handleSubmit(e) {
    e.preventDefault()
    const title = tabId === 'podcasts' ? form.nombre : form.titulo
    if (!title?.trim()) return
    onSave({ id: crypto.randomUUID(), ...form })
  }

  const commonFields = (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      <button type="button" onClick={onCancel} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>Cancelar</button>
      <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
    </div>
  )

  if (tabId === 'videojuegos') return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12, display: 'grid', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
        <input placeholder="Título *" value={form.titulo} onChange={f('titulo')} required style={inp} />
        <input placeholder="Plataforma" value={form.plataforma} onChange={f('plataforma')} style={inp} />
        <select value={form.estado} onChange={f('estado')} style={inp}>
          {['wishlist','jugando','completado','abandonado'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {commonFields}
    </form>
  )
  if (tabId === 'libros') return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12, display: 'grid', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
        <input placeholder="Título *" value={form.titulo} onChange={f('titulo')} required style={inp} />
        <input placeholder="Autor" value={form.autor} onChange={f('autor')} style={inp} />
        <select value={form.estado} onChange={f('estado')} style={inp}>
          {['wishlist','leyendo','leido','abandonado'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {commonFields}
    </form>
  )
  if (tabId === 'peliculas') return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12, display: 'grid', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8 }}>
        <input placeholder="Título *" value={form.titulo} onChange={f('titulo')} required style={inp} />
        <select value={form.tipo} onChange={f('tipo')} style={inp}><option value="pelicula">Película</option><option value="serie">Serie</option></select>
        <input placeholder="Plataforma" value={form.plataforma} onChange={f('plataforma')} style={inp} />
        <select value={form.estado} onChange={f('estado')} style={inp}>
          {['wishlist','viendo','visto','abandonado'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {commonFields}
    </form>
  )
  if (tabId === 'musica') return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12, display: 'grid', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
        <input placeholder="Álbum *" value={form.titulo} onChange={f('titulo')} required style={inp} />
        <input placeholder="Artista" value={form.artista} onChange={f('artista')} style={inp} />
        <input type="number" placeholder="Año" value={form.anio} onChange={f('anio')} style={inp} />
      </div>
      {commonFields}
    </form>
  )
  if (tabId === 'podcasts') return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12, display: 'grid', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
        <input placeholder="Nombre *" value={form.nombre} onChange={f('nombre')} required style={inp} />
        <input placeholder="Autor" value={form.autor} onChange={f('autor')} style={inp} />
      </div>
      {commonFields}
    </form>
  )
  return null
}

export default function Entretenimiento() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'ocio'
  const [activeTab, setActiveTab] = useState('videojuegos')
  const [data, setData] = useState(() => {
    const d = {}
    TABS.forEach(t => { d[t.id] = demoRead(appType, t.key) ?? [] })
    return d
  })
  const [showAdd, setShowAdd] = useState(false)
  const [filtro, setFiltro] = useState('todos')

  const tab = TABS.find(t => t.id === activeTab)
  const items = data[activeTab] ?? []

  function saveTab(tabId, next) {
    setData(d => ({ ...d, [tabId]: next }))
    const tabMeta = TABS.find(t => t.id === tabId)
    demoWrite(appType, tabMeta.key, next)
  }

  function addItem(item) {
    saveTab(activeTab, [...items, item])
    setShowAdd(false)
  }

  const ACTIVE_STATES = { videojuegos: 'jugando', libros: 'leyendo', peliculas: 'viendo', podcasts: 'siguiendo' }
  const DONE_STATES   = { videojuegos: 'completado', libros: 'leido', peliculas: 'visto' }

  const filtered = items.filter(item => {
    if (filtro === 'activos') return item.estado === ACTIVE_STATES[activeTab]
    if (filtro === 'wishlist') return item.estado === 'wishlist'
    if (filtro === 'completados') return item.estado === DONE_STATES[activeTab]
    return true
  })

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700 }}>🎬 Entretenimiento</h2>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', borderBottom: '1px solid var(--border)', marginBottom: 16, paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setFiltro('todos'); setShowAdd(false) }} style={{ padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500, color: activeTab === t.id ? 'var(--accent)' : 'var(--text-muted)', background: 'none', border: 'none', borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['todos', 'activos', 'wishlist', 'completados'].map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: filtro === f ? 700 : 500, color: filtro === f ? '#fff' : 'var(--text-muted)', background: filtro === f ? 'var(--accent)' : 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer' }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(v => !v)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Añadir</button>
      </div>

      {showAdd && <AddForm tabId={activeTab} onSave={addItem} onCancel={() => setShowAdd(false)} />}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>{tab?.icon}</p>
          <p style={{ fontSize: 14 }}>Sin {tab?.label.toLowerCase()} en esta categoría</p>
        </div>
      ) : filtered.map(item => {
        const title    = getTitle(item, activeTab)
        const subtitle = getSubtitle(item, activeTab)
        const est      = ESTADO_LABELS[item.estado]
        return (
          <div key={item.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
                {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                {est && <span style={{ fontSize: 10, color: est.color, fontWeight: 600, whiteSpace: 'nowrap' }}>● {est.label}</span>}
                {item.puntuacion > 0 && <Stars n={item.puntuacion} />}
              </div>
            </div>
            {item.critica && <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{item.critica}</p>}
          </div>
        )
      })}
    </div>
  )
}
