import { useState, useEffect } from 'react'
import { api } from '../services/api'

const TIPOS = ['Infraestructura', 'Ambiente y Ecología', 'Educación Comunitaria', 'Salud Pública', 'Cultura y Recreación']
const ESTADOS = { 'En Planificación': { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' }, 'En Curso': { bg: 'rgba(56,189,248,0.15)', color: '#38bdf8' }, 'Completado': { bg: 'rgba(52,211,153,0.15)', color: '#34d399' }, 'Pausado': { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' } }

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [notif, setNotif] = useState('')
  const [form, setForm] = useState({ titulo: '', descripcion: '', tipo: 'Infraestructura', sector: '' })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const data = await api.proyectos.list()
      setProyectos(data)
    } catch (e) { mostrarNotif('Error: ' + e.message) }
    finally { setLoading(false) }
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function agregar() {
    if (!form.titulo.trim() || !form.sector.trim()) { mostrarNotif('⚠️ Completa los campos requeridos'); return }
    try {
      await api.proyectos.create(form)
      setForm({ titulo: '', descripcion: '', tipo: 'Infraestructura', sector: '' })
      setMostrarForm(false)
      fetchData()
      mostrarNotif('✅ Proyecto registrado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function cambiarEstado(id, estado) {
    try {
      await api.proyectos.update(id, { estado })
      fetchData()
      mostrarNotif('✅ Estado actualizado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este proyecto?')) return
    try {
      await api.proyectos.delete(id)
      fetchData()
      mostrarNotif('✅ Proyecto eliminado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  function mostrarNotif(msg) { setNotif(msg); setTimeout(() => setNotif(''), 3000) }

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.titulo}>🏘 Proyectos Comunitarios</h2>
        <button style={s.btnPrimary} onClick={() => setMostrarForm(!mostrarForm)}>+ Nuevo Proyecto</button>
      </div>

      {mostrarForm && (
        <div style={s.panel}>
          <div style={s.panelTitle}>Registrar Proyecto</div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Título del Proyecto *</label>
              <input style={s.input} name="titulo" value={form.titulo} onChange={handleChange} placeholder="Nombre del proyecto" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Sector *</label>
              <input style={s.input} name="sector" value={form.sector} onChange={handleChange} placeholder="Sector/Comunidad" />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Tipo de Proyecto</label>
            <select style={s.input} name="tipo" value={form.tipo} onChange={handleChange}>
              {TIPOS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Descripción</label>
            <textarea style={{ ...s.input, minHeight: 90, resize: 'vertical' }} name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Describe el proyecto..." />
          </div>
          <button style={s.btnPrimary} onClick={agregar}>Registrar Proyecto</button>
        </div>
      )}

      <div style={s.panel}>
        {loading ? <div style={s.empty}>Cargando...</div> : proyectos.length === 0 ? (
          <div style={s.empty}>Sin proyectos registrados</div>
        ) : (
          <table style={s.table}>
            <thead><tr>{['#', 'Proyecto', 'Sector', 'Tipo', 'Fecha', 'Estado', 'Acciones'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {proyectos.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ ...s.td, color: '#6b61a0', fontFamily: 'monospace' }}>{String(i + 1).padStart(3, '0')}</td>
                  <td style={s.td}>{p.titulo}</td>
                  <td style={s.td}>{p.sector}</td>
                  <td style={s.td}>{p.tipo}</td>
                  <td style={s.td}>{new Date(p.fecha).toLocaleDateString()}</td>
                  <td style={s.td}>
                    <select style={{ ...s.tag, background: ESTADOS[p.estado]?.bg || ESTADOS['En Planificación'].bg, color: ESTADOS[p.estado]?.color || ESTADOS['En Planificación'].color }} value={p.estado} onChange={ev => cambiarEstado(p.id, ev.target.value)}>
                      {Object.keys(ESTADOS).map(est => <option key={est}>{est}</option>)}
                    </select>
                  </td>
                  <td style={s.td}><button style={s.btnDelete} onClick={() => eliminar(p.id)}>🗑</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {notif && <div style={s.notif}>{notif}</div>}
    </div>
  )
}

const s = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  titulo: { fontSize: 18, fontWeight: 700, color: '#e8e4ff' },
  btnPrimary: { background: 'linear-gradient(135deg,#7c5cfc,#4f3bb8)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,92,252,0.3)' },
  panel: { background: '#1e1a3a', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 16, padding: 22, marginBottom: 16 },
  panelTitle: { fontSize: 14, fontWeight: 700, color: '#e8e4ff', marginBottom: 16 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 11, fontWeight: 600, color: '#a89fc7', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: { width: '100%', background: '#1a1638', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 10, color: '#e8e4ff', fontFamily: "'Sora', sans-serif", fontSize: 13, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 14px', color: '#6b61a0', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '1px solid rgba(120,100,255,0.18)' },
  td: { padding: '12px 14px', color: '#e8e4ff', borderBottom: '1px solid rgba(120,100,255,0.06)' },
  tag: { padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer' },
  btnDelete: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 },
  empty: { textAlign: 'center', color: '#6b61a0', padding: 30 },
  notif: { position: 'fixed', bottom: 24, right: 24, background: '#252048', border: '1px solid #7c5cfc', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#e8e4ff', zIndex: 9999 },
}
