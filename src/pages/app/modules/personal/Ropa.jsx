import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const CATEGORIAS = ['camiseta','pantalon','chaqueta','abrigo','calzado','accesorio','otro']
const TEMPORADAS = ['todo_año','verano','invierno','entretiempo']
const TEMP_LABEL = { todo_año:'Todo el año', verano:'Verano', invierno:'Invierno', entretiempo:'Entretiempo' }
const TEMP_COLOR = { todo_año:'var(--text-muted)', verano:'#f59e0b', invierno:'#3b82f6', entretiempo:'#22c55e' }
const BLANK_P = { nombre:'', categoria:'camiseta', color:'', marca:'', temporada:'todo_año', en_trastero:false }
const BLANK_W = { nombre:'', marca:'', precio_aprox:'', url:'' }

export default function Ropa() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'personal'
  const [tab, setTab] = useState('armario')
  const [prendas, setPrendas] = useState(() => demoRead(appType, 'ropa_prendas') ?? [])
  const [tallas, setTallas]   = useState(() => { const r = demoRead(appType, 'ropa_tallas'); return (r && !Array.isArray(r)) ? r : {} })
  const [wishlist, setWishlist]= useState(() => demoRead(appType, 'ropa_wishlist') ?? [])
  const [filtroTemp, setFiltroTemp] = useState('todas')
  const [showPF, setShowPF] = useState(false)
  const [pForm, setPForm]   = useState(BLANK_P)
  const [showWF, setShowWF] = useState(false)
  const [wForm, setWForm]   = useState(BLANK_W)
  const [editingTalla, setEditingTalla] = useState(null)

  const saveP = (n) => { setPrendas(n); demoWrite(appType, 'ropa_prendas', n) }
  const saveT = (n) => { setTallas(n);  demoWrite(appType, 'ropa_tallas', n) }
  const saveW = (n) => { setWishlist(n);demoWrite(appType, 'ropa_wishlist', n) }

  const addPrenda = (e) => { e.preventDefault(); if (!pForm.nombre.trim()) return; saveP([...prendas, { ...pForm, id: crypto.randomUUID() }]); setPForm(BLANK_P); setShowPF(false) }
  const addWish   = (e) => { e.preventDefault(); if (!wForm.nombre.trim()) return; saveW([...wishlist, { ...wForm, id: crypto.randomUUID(), precio_aprox: parseFloat(wForm.precio_aprox)||0 }]); setWForm(BLANK_W); setShowWF(false) }

  const prendasFiltradas = filtroTemp === 'todas' ? prendas : prendas.filter(p => p.temporada === filtroTemp)
  const tabBtn = (id, label) => <button onClick={() => setTab(id)} style={{ padding:'0.5rem 1rem', border: tab===id?'none':'1px solid var(--border)', borderRadius:8, cursor:'pointer', fontWeight:600, background: tab===id?'var(--accent)':'var(--bg-card)', color: tab===id?'#fff':'var(--text-muted)' }}>{label}</button>
  const inp = { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, padding:'0.5rem 0.75rem', color:'var(--text)', width:'100%', boxSizing:'border-box' }

  return (
    <div style={{ padding:'1.5rem', maxWidth:680 }}>
      <h2 style={{ margin:'0 0 1.25rem' }}>Ropa</h2>
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem' }}>
        {tabBtn('armario','👕 Armario')}{tabBtn('tallas','Tallas')}{tabBtn('wishlist','Wishlist')}
      </div>

      {tab === 'armario' && (
        <div>
          <div style={{ display:'flex', gap:'0.4rem', marginBottom:'1rem', flexWrap:'wrap' }}>
            {['todas',...TEMPORADAS].map(t => <button key={t} onClick={() => setFiltroTemp(t)} style={{ padding:'0.3rem 0.75rem', borderRadius:6, cursor:'pointer', fontSize:'0.8rem', border:'1px solid var(--border)', background: filtroTemp===t?'var(--accent)':'transparent', color: filtroTemp===t?'#fff':'var(--text-muted)' }}>{t==='todas'?'Todas':TEMP_LABEL[t]}</button>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'0.75rem', marginBottom:'1rem' }}>
            {prendasFiltradas.map(p => (
              <div key={p.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'0.75rem', opacity: p.en_trastero?0.65:1, position:'relative' }}>
                <div style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:'0.25rem' }}>{p.nombre}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{p.marca}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{p.color} · {p.categoria}</div>
                <div style={{ display:'flex', gap:'0.3rem', marginTop:'0.4rem', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'0.7rem', padding:'0.1rem 0.4rem', borderRadius:4, background:'var(--border)', color: TEMP_COLOR[p.temporada]??'var(--text-muted)', fontWeight:600 }}>{TEMP_LABEL[p.temporada]}</span>
                  {p.en_trastero && <span style={{ fontSize:'0.7rem', padding:'0.1rem 0.4rem', borderRadius:4, background:'var(--border)', color:'var(--text-faint)' }}>trastero</span>}
                </div>
                <button onClick={() => saveP(prendas.filter(x => x.id!==p.id))} style={{ position:'absolute', top:6, right:6, background:'none', border:'none', cursor:'pointer', color:'var(--text-faint)', fontSize:'0.8rem' }}>✕</button>
              </div>
            ))}
          </div>
          {prendasFiltradas.length === 0 && <p style={{ color:'var(--text-muted)', textAlign:'center' }}>Sin prendas.</p>}
          {!showPF ? <button onClick={() => setShowPF(true)} style={{ width:'100%', padding:'0.75rem', background:'transparent', border:'1px dashed var(--border)', borderRadius:10, color:'var(--text-muted)', cursor:'pointer' }}>+ Añadir prenda</button>
          : (
            <form onSubmit={addPrenda} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              <input placeholder="Nombre" value={pForm.nombre} onChange={e => setPForm(f=>({...f,nombre:e.target.value}))} required style={inp} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                <select value={pForm.categoria} onChange={e => setPForm(f=>({...f,categoria:e.target.value}))} style={inp}>{CATEGORIAS.map(c=><option key={c} value={c}>{c}</option>)}</select>
                <select value={pForm.temporada} onChange={e => setPForm(f=>({...f,temporada:e.target.value}))} style={inp}>{TEMPORADAS.map(t=><option key={t} value={t}>{TEMP_LABEL[t]}</option>)}</select>
                <input placeholder="Color" value={pForm.color} onChange={e => setPForm(f=>({...f,color:e.target.value}))} style={inp} />
                <input placeholder="Marca" value={pForm.marca} onChange={e => setPForm(f=>({...f,marca:e.target.value}))} style={inp} />
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.9rem', color:'var(--text-muted)', cursor:'pointer' }}>
                <input type="checkbox" checked={pForm.en_trastero} onChange={e => setPForm(f=>({...f,en_trastero:e.target.checked}))} /> En el trastero
              </label>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button type="submit" style={{ flex:1, padding:'0.6rem', background:'var(--accent)', border:'none', borderRadius:8, color:'#fff', fontWeight:600, cursor:'pointer' }}>Añadir</button>
                <button type="button" onClick={() => { setShowPF(false); setPForm(BLANK_P) }} style={{ padding:'0.6rem 1rem', background:'none', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-muted)', cursor:'pointer' }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === 'tallas' && (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1.25rem' }}>
          {Object.entries(tallas).map(([tipo, valor]) => (
            <div key={tipo} style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'0.75rem' }}>
              <span style={{ width:100, fontWeight:500, textTransform:'capitalize', color:'var(--text-muted)' }}>{tipo}</span>
              {editingTalla === tipo
                ? <input autoFocus defaultValue={valor} onBlur={e => { saveT({...tallas,[tipo]:e.target.value}); setEditingTalla(null) }} onKeyDown={e => { if(e.key==='Enter'){saveT({...tallas,[tipo]:e.target.value}); setEditingTalla(null)} }} style={{ background:'var(--bg-card)', border:'1px solid var(--accent)', borderRadius:6, padding:'0.3rem 0.6rem', color:'var(--text)', width:80 }} />
                : <span style={{ fontFamily:'var(--font-mono)', fontWeight:600, cursor:'pointer' }} onClick={() => setEditingTalla(tipo)}>{valor}</span>
              }
            </div>
          ))}
          <p style={{ fontSize:'0.8rem', color:'var(--text-faint)', marginTop:'0.5rem' }}>Haz clic en una talla para editarla.</p>
        </div>
      )}

      {tab === 'wishlist' && (
        <div>
          {wishlist.map(w => (
            <div key={w.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'0.75rem 1rem', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600 }}>{w.nombre}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{w.marca}{w.precio_aprox ? ` · ~${w.precio_aprox} €` : ''}</div>
              </div>
              <button onClick={() => saveW(wishlist.filter(x=>x.id!==w.id))} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-faint)' }}>🗑</button>
            </div>
          ))}
          {wishlist.length === 0 && <p style={{ color:'var(--text-muted)', textAlign:'center' }}>Wishlist vacía.</p>}
          {!showWF ? <button onClick={() => setShowWF(true)} style={{ width:'100%', padding:'0.75rem', background:'transparent', border:'1px dashed var(--border)', borderRadius:10, color:'var(--text-muted)', cursor:'pointer' }}>+ Añadir a wishlist</button>
          : (
            <form onSubmit={addWish} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                <input placeholder="Prenda deseada" value={wForm.nombre} onChange={e => setWForm(f=>({...f,nombre:e.target.value}))} required style={inp} />
                <input placeholder="Marca" value={wForm.marca} onChange={e => setWForm(f=>({...f,marca:e.target.value}))} style={inp} />
              </div>
              <input type="number" step="0.01" min="0" placeholder="Precio aprox. (€)" value={wForm.precio_aprox} onChange={e => setWForm(f=>({...f,precio_aprox:e.target.value}))} style={inp} />
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button type="submit" style={{ flex:1, padding:'0.6rem', background:'var(--accent)', border:'none', borderRadius:8, color:'#fff', fontWeight:600, cursor:'pointer' }}>Añadir</button>
                <button type="button" onClick={() => { setShowWF(false); setWForm(BLANK_W) }} style={{ padding:'0.6rem 1rem', background:'none', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-muted)', cursor:'pointer' }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}
      <p style={{ marginTop:'1.5rem', fontSize:'0.8rem', color:'var(--text-faint)', textAlign:'center' }}>💡 Demo — los cambios se guardan en esta sesión</p>
    </div>
  )
}
