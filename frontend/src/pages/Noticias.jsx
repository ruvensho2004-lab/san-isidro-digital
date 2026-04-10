import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function Noticias() {
  const [noticias, setNoticias] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [notif, setNotif] = useState('')
  const [form, setForm] = useState({ titulo: '', contenido: '', tipo: 'General' })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const data = await api.noticias.list()
      setNoticias(data)
    } catch (e) { mostrarNotif('Error: ' + e.message) }
    finally { setLoading(false) }
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function agregar() {
    if (!form.titulo.trim() || !form.contenido.trim()) { mostrarNotif('⚠️ Completa los campos'); return }
    try {
      await api.noticias.create({...form, activa: true})
      setForm({ titulo: '', contenido: '', tipo: 'General' })
      setMostrarForm(false)
      fetchData()
      mostrarNotif('✅ Noticia publicada en el portal')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function toggleActiva(id, activa) {
    try {
      await api.noticias.update(id, { activa: !activa })
      fetchData()
      mostrarNotif('✅ Estado actualizado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta noticia por completo?')) return
    try {
      await api.noticias.delete(id)
      fetchData()
      mostrarNotif('✅ Eliminado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  function mostrarNotif(msg) { setNotif(msg); setTimeout(() => setNotif(''), 3000) }

  return (
    <div>
      <div style={s.header}>
        <div>
          <h2 style={s.titulo}>📰 Cartelera de Noticias</h2>
          <div style={{fontSize: 13, color: '#a89fc7', marginTop: 4}}>Gestión de las publicaciones que aparecen en el portal público</div>
        </div>
        <button style={s.btnPrimary} onClick={() => setMostrarForm(!mostrarForm)}>+ Publicar Noticia</button>
      </div>

      {mostrarForm && (
        <div style={s.panel}>
          <div style={s.panelTitle}>Nueva Publicación Pública</div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Título (Titular de la Noticia) *</label>
              <input style={s.input} name="titulo" value={form.titulo} onChange={handleChange} placeholder="¡Gran jornada este fin de semana!" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Clasificación</label>
              <select style={s.input} name="tipo" value={form.tipo} onChange={handleChange}>
                <option>General</option>
                <option>Salud</option>
                <option>Asamblea</option>
                <option>Alerta</option>
                <option>Trámites</option>
              </select>
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Contenido de la Noticia *</label>
            <textarea style={{ ...s.input, minHeight: 120, resize: 'vertical' }} name="contenido" value={form.contenido} onChange={handleChange} placeholder="Detalla la información al público..." />
          </div>
          <button style={s.btnPrimary} onClick={agregar}>Publicar Ahora</button>
        </div>
      )}

      <div style={s.gridNoticias}>
        {loading ? <div style={s.empty}>Cargando...</div> : noticias.length === 0 ? <div style={s.empty}>Sin noticias.</div> : (
          noticias.map((n) => (
            <div key={n.id} style={{...s.cardNoticia, border: n.activa ? '1px solid #e1e7e4' : '1px dashed #cbd5e1', opacity: n.activa ? 1 : 0.6 }}>
               <div style={s.noticiaHeader}>
                 <span style={{...s.tag, background: n.tipo === 'Asamblea' ? 'rgba(147,51,234,0.15)' : n.tipo === 'Salud' ? 'rgba(56,189,248,0.15)' : n.tipo === 'Alerta' ? 'rgba(239,68,68,0.15)' : 'rgba(100,116,139,0.15)', color: n.tipo === 'Asamblea' ? '#a855f7' : n.tipo === 'Salud' ? '#38bdf8' : n.tipo === 'Alerta' ? '#ef4444' : '#a89fc7'}}>{n.tipo}</span>
                 <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{new Date(n.fecha).toLocaleDateString()}</span>
               </div>
               <div style={s.noticiaTitle}>{n.titulo}</div>
               <div style={s.noticiaContent}>{n.contenido}</div>
               <div style={s.noticiaFooter}>
                 <button style={{...s.btnSec, color: n.activa ? '#34d399' : '#a89fc7', background: n.activa ? 'rgba(52,211,153,0.15)' : '#252048', border: n.activa ? 'none' : '1px solid #cbd5e1'}} onClick={() => toggleActiva(n.id, n.activa)}>
                   {n.activa ? '👁 Visible' : '🚫 Oculta'}
                 </button>
                 <button style={s.btnDelete} onClick={() => eliminar(n.id)}>🗑</button>
               </div>
            </div>
          ))
        )}
      </div>
      {notif && <div style={s.notif}>{notif}</div>}
    </div>
  )
}

const s = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 },
  titulo: { fontSize: 22, fontWeight: 700, color: '#e8e4ff' },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  btnPrimary: { background: 'linear-gradient(135deg, #7c5cfc, #4f3bb8)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 10px rgba(124,92,252,0.3)' },
  btnExport: { background: '#252048', color: '#a89fc7', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnCancelar: { background: 'transparent', color: '#a89fc7', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 10, padding: '10px 18px', fontSize: 13, cursor: 'pointer' },
  btnEdit: { background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', borderRadius: 6, cursor: 'pointer', fontSize: 13, padding: '4px 8px' },
  btnDelete: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 },
  panel: { background: '#1e1a3a', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 16, padding: 22, marginBottom: 16, overflowX: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  panelTitle: { fontSize: 16, fontWeight: 700, color: '#e8e4ff', marginBottom: 16 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#a89fc7', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: { width: '100%', background: '#13102a', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 10, color: '#e8e4ff', fontSize: 13, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 500 },
  th: { textAlign: 'left', padding: '10px 14px', color: '#a89fc7', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(120,100,255,0.18)', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', color: '#e8e4ff', borderBottom: '1px solid rgba(120,100,255,0.08)', fontSize: 13 },
  empty: { textAlign: 'center', color: '#6b61a0', padding: 30 },
  notif: { position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#252048', border: '1px solid #7c5cfc', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#e8e4ff', zIndex: 9999, boxShadow: '0 10px 25px rgba(0,0,0,0.4)' },
  statCard: { background: '#252048', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 12, padding: '12px 20px', minWidth: 150 },
  statValue: { fontSize: 24, fontWeight: 700, color: '#e8e4ff', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#a89fc7', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 },
  tag: { padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', outline:'none' }
}
