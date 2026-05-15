import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const BLANK_C  = { titulo:'', plataforma:'', progreso:0, fecha_limite:'', estado:'activo' }
const BLANK_I  = { idioma:'', nivel:'A1', metodo:'', objetivo:'' }
const BLANK_CE = { nombre:'', entidad:'', fecha:'', estado:'en_progreso' }
const NIVELES  = ['A1','A2','B1','B2','C1','C2','Nativo']

export default function Formacion() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'personal'
  const [tab, setTab]       = useState('cursos')
  const [cursos, setCursos] = useState(() => demoRead(appType, 'formacion_cursos') ?? [])
  const [idiomas, setIdiomas]= useState(() => demoRead(appType, 'formacion_idiomas') ?? [])
  const [certs, setCerts]   = useState(() => demoRead(appType, 'formacion_certificaciones') ?? [])
  const [showCF, setShowCF] = useState(false); const [cForm, setCForm] = useState(BLANK_C)
  const [showIF, setShowIF] = useState(false); const [iForm, setIForm] = useState(BLANK_I)
  const [showCeF, setShowCeF] = useState(false); const [ceForm, setCeForm] = useState(BLANK_CE)

  const saveCursos = (n) => { setCursos(n); demoWrite(appType,'formacion_cursos',n) }
  const saveIdiomas= (n) => { setIdiomas(n);demoWrite(appType,'formacion_idiomas',n) }
  const saveCerts  = (n) => { setCerts(n);  demoWrite(appType,'formacion_certificaciones',n) }

  const addCurso = (e) => { e.preventDefault(); if(!cForm.titulo.trim()) return; saveCursos([...cursos,{...cForm,id:crypto.randomUUID(),progreso:Number(cForm.progreso)}]); setCForm(BLANK_C); setShowCF(false) }
  const addIdioma= (e) => { e.preventDefault(); if(!iForm.idioma.trim()) return; saveIdiomas([...idiomas,{...iForm,id:crypto.randomUUID()}]); setIForm(BLANK_I); setShowIF(false) }
  const addCert  = (e) => { e.preventDefault(); if(!ceForm.nombre.trim()) return; saveCerts([...certs,{...ceForm,id:crypto.randomUUID()}]); setCeForm(BLANK_CE); setShowCeF(false) }

  const tabBtn = (id, label) => <button onClick={() => setTab(id)} style={{ padding:'0.5rem 1rem', border: tab===id?'none':'1px solid var(--border)', borderRadius:8, cursor:'pointer', fontWeight:600, background: tab===id?'var(--accent)':'var(--bg-card)', color: tab===id?'#fff':'var(--text-muted)' }}>{label}</button>
  const inp = { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, padding:'0.5rem 0.75rem', color:'var(--text)', width:'100%', boxSizing:'border-box' }

  return (
    <div style={{ padding:'1.5rem', maxWidth:680 }}>
      <h2 style={{ margin:'0 0 1.25rem' }}>Formación</h2>
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem' }}>
        {tabBtn('cursos','📚 Cursos')}{tabBtn('idiomas','Idiomas')}{tabBtn('certificaciones','Certificaciones')}
      </div>

      {tab === 'cursos' && (
        <div>
          {cursos.map(c => (
            <div key={c.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem', marginBottom:'0.75rem', opacity: c.estado==='completado'?0.75:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600 }}>{c.titulo}</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:2 }}>{c.plataforma}{c.fecha_limite && <span style={{ marginLeft:'0.75rem' }}>📅 {c.fecha_limite}</span>}</div>
                </div>
                <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                  <span style={{ fontSize:'0.75rem', padding:'0.2rem 0.5rem', borderRadius:6, fontWeight:600, background: c.estado==='completado'?'#22c55e22':'var(--accent)22', color: c.estado==='completado'?'#22c55e':'var(--accent)' }}>{c.estado}</span>
                  <button onClick={() => saveCursos(cursos.filter(x=>x.id!==c.id))} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-faint)', fontSize:'0.9rem' }}>🗑</button>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{ flex:1, background:'var(--border)', borderRadius:999, height:8, overflow:'hidden' }}>
                  <div style={{ width:`${c.progreso}%`, height:'100%', background: c.estado==='completado'?'#22c55e':'var(--accent)', borderRadius:999 }} />
                </div>
                <span style={{ fontSize:'0.85rem', fontFamily:'var(--font-mono)', fontWeight:600, minWidth:40, textAlign:'right', color:'var(--text-muted)' }}>{c.progreso} %</span>
              </div>
            </div>
          ))}
          {cursos.length === 0 && <p style={{ color:'var(--text-muted)', textAlign:'center' }}>Sin cursos.</p>}
          {!showCF ? <button onClick={() => setShowCF(true)} style={{ width:'100%', padding:'0.75rem', background:'transparent', border:'1px dashed var(--border)', borderRadius:10, color:'var(--text-muted)', cursor:'pointer' }}>+ Añadir curso</button>
          : (
            <form onSubmit={addCurso} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              <input placeholder="Título del curso" value={cForm.titulo} onChange={e => setCForm(f=>({...f,titulo:e.target.value}))} required style={inp} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                <input placeholder="Plataforma" value={cForm.plataforma} onChange={e => setCForm(f=>({...f,plataforma:e.target.value}))} style={inp} />
                <select value={cForm.estado} onChange={e => setCForm(f=>({...f,estado:e.target.value}))} style={inp}>
                  <option value="activo">Activo</option><option value="completado">Completado</option><option value="pausado">Pausado</option>
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                <div>
                  <label style={{ fontSize:'0.75rem', color:'var(--text-muted)', display:'block', marginBottom:3 }}>Progreso: {cForm.progreso}%</label>
                  <input type="range" min="0" max="100" value={cForm.progreso} onChange={e => setCForm(f=>({...f,progreso:Number(e.target.value)}))} style={{ width:'100%' }} />
                </div>
                <div>
                  <label style={{ fontSize:'0.75rem', color:'var(--text-muted)', display:'block', marginBottom:3 }}>Fecha límite</label>
                  <input type="date" value={cForm.fecha_limite} onChange={e => setCForm(f=>({...f,fecha_limite:e.target.value}))} style={inp} />
                </div>
              </div>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button type="submit" style={{ flex:1, padding:'0.6rem', background:'var(--accent)', border:'none', borderRadius:8, color:'#fff', fontWeight:600, cursor:'pointer' }}>Añadir</button>
                <button type="button" onClick={() => { setShowCF(false); setCForm(BLANK_C) }} style={{ padding:'0.6rem 1rem', background:'none', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-muted)', cursor:'pointer' }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === 'idiomas' && (
        <div>
          {idiomas.map(i => (
            <div key={i.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'1rem' }}>
              <span style={{ fontSize:'2rem' }}>🌍</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600 }}>{i.idioma}</div>
                <div style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>Nivel: <strong>{i.nivel}</strong> → Objetivo: <strong>{i.objetivo}</strong></div>
                {i.metodo && <div style={{ fontSize:'0.8rem', color:'var(--text-faint)', marginTop:2 }}>Método: {i.metodo}</div>}
              </div>
              <button onClick={() => saveIdiomas(idiomas.filter(x=>x.id!==i.id))} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-faint)' }}>🗑</button>
            </div>
          ))}
          {idiomas.length === 0 && <p style={{ color:'var(--text-muted)', textAlign:'center' }}>Sin idiomas.</p>}
          {!showIF ? <button onClick={() => setShowIF(true)} style={{ width:'100%', padding:'0.75rem', background:'transparent', border:'1px dashed var(--border)', borderRadius:10, color:'var(--text-muted)', cursor:'pointer' }}>+ Añadir idioma</button>
          : (
            <form onSubmit={addIdioma} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.5rem' }}>
                <input placeholder="Idioma" value={iForm.idioma} onChange={e => setIForm(f=>({...f,idioma:e.target.value}))} required style={inp} />
                <select value={iForm.nivel} onChange={e => setIForm(f=>({...f,nivel:e.target.value}))} style={inp}>{NIVELES.map(n=><option key={n} value={n}>{n}</option>)}</select>
                <select value={iForm.objetivo} onChange={e => setIForm(f=>({...f,objetivo:e.target.value}))} style={inp}>{NIVELES.map(n=><option key={n} value={n}>{n}</option>)}</select>
              </div>
              <input placeholder="Método de aprendizaje" value={iForm.metodo} onChange={e => setIForm(f=>({...f,metodo:e.target.value}))} style={inp} />
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button type="submit" style={{ flex:1, padding:'0.6rem', background:'var(--accent)', border:'none', borderRadius:8, color:'#fff', fontWeight:600, cursor:'pointer' }}>Añadir</button>
                <button type="button" onClick={() => { setShowIF(false); setIForm(BLANK_I) }} style={{ padding:'0.6rem 1rem', background:'none', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-muted)', cursor:'pointer' }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === 'certificaciones' && (
        <div>
          {certs.map(c => (
            <div key={c.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'1rem' }}>
              <span style={{ fontSize:'2rem' }}>{c.estado==='obtenida'?'🏆':'📋'}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600 }}>{c.nombre}</div>
                <div style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>{c.entidad}{c.fecha ? ` · ${c.fecha}` : ''}</div>
              </div>
              <span style={{ fontSize:'0.75rem', padding:'0.2rem 0.5rem', borderRadius:6, fontWeight:600, background: c.estado==='obtenida'?'#22c55e22':'#f59e0b22', color: c.estado==='obtenida'?'#22c55e':'#f59e0b' }}>
                {c.estado==='obtenida'?'Obtenida':'En progreso'}
              </span>
              <button onClick={() => saveCerts(certs.filter(x=>x.id!==c.id))} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-faint)' }}>🗑</button>
            </div>
          ))}
          {certs.length === 0 && <p style={{ color:'var(--text-muted)', textAlign:'center' }}>Sin certificaciones.</p>}
          {!showCeF ? <button onClick={() => setShowCeF(true)} style={{ width:'100%', padding:'0.75rem', background:'transparent', border:'1px dashed var(--border)', borderRadius:10, color:'var(--text-muted)', cursor:'pointer' }}>+ Añadir certificación</button>
          : (
            <form onSubmit={addCert} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                <input placeholder="Nombre certificación" value={ceForm.nombre} onChange={e => setCeForm(f=>({...f,nombre:e.target.value}))} required style={inp} />
                <input placeholder="Entidad" value={ceForm.entidad} onChange={e => setCeForm(f=>({...f,entidad:e.target.value}))} style={inp} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                <div><label style={{ fontSize:'0.75rem', color:'var(--text-muted)', display:'block', marginBottom:3 }}>Fecha obtención</label><input type="date" value={ceForm.fecha} onChange={e => setCeForm(f=>({...f,fecha:e.target.value}))} style={inp} /></div>
                <select value={ceForm.estado} onChange={e => setCeForm(f=>({...f,estado:e.target.value}))} style={inp}>
                  <option value="en_progreso">En progreso</option><option value="obtenida">Obtenida</option>
                </select>
              </div>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button type="submit" style={{ flex:1, padding:'0.6rem', background:'var(--accent)', border:'none', borderRadius:8, color:'#fff', fontWeight:600, cursor:'pointer' }}>Añadir</button>
                <button type="button" onClick={() => { setShowCeF(false); setCeForm(BLANK_CE) }} style={{ padding:'0.6rem 1rem', background:'none', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-muted)', cursor:'pointer' }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}
      <p style={{ marginTop:'1.5rem', fontSize:'0.8rem', color:'var(--text-faint)', textAlign:'center' }}>💡 Demo — los cambios se guardan en esta sesión</p>
    </div>
  )
}
