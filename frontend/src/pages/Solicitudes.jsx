import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const TIPOS = ['Trámite Administrativo', 'Ayuda Social', 'Reclamo de Servicio', 'Información General', 'Proyecto de Mejora']
const ESTADOS = { 'Pendiente': { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' }, 'En Proceso': { bg: 'rgba(56,189,248,0.15)', color: '#38bdf8' }, 'Resuelto': { bg: 'rgba(52,211,153,0.15)', color: '#34d399' } }

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [notif, setNotif] = useState('')
  const [form, setForm] = useState({ nombre: '', telefono: '', tipo: 'Trámite Administrativo', descripcion: '' })
  const [isMobile, setIsMobile] = useState(false)
  const { isAdmin } = useAuth()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const data = await api.solicitudes.list()
      setSolicitudes(data)
    } catch (e) { mostrarNotif('Error: ' + e.message) }
    finally { setLoading(false) }
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function agregar() {
    if (!form.nombre.trim() || !form.descripcion.trim()) { mostrarNotif('⚠️ Completa los campos requeridos'); return }
    try {
      await api.solicitudes.create(form)
      setForm({ nombre: '', telefono: '', tipo: 'Trámite Administrativo', descripcion: '' })
      setMostrarForm(false)
      fetchData()
      mostrarNotif('✅ Solicitud registrada')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function cambiarEstado(id, estado) {
    try {
      await api.solicitudes.update(id, { estado })
      fetchData()
      mostrarNotif('✅ Estado actualizado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta solicitud?')) return
    try {
      await api.solicitudes.delete(id)
      fetchData()
      mostrarNotif('✅ Solicitud eliminada')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  function mostrarNotif(msg) { setNotif(msg); setTimeout(() => setNotif(''), 3000) }

  const s = {
    header: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', marginBottom: 20, gap: isMobile ? 12 : 0 },
    titulo: { fontSize: isMobile ? 16 : 18, fontWeight: 700, color: '#e8e4ff' },
    btnPrimary: { background: 'linear-gradient(135deg,#7c5cfc,#4f3bb8)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 12 : 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,92,252,0.3)' },
    panel: { background: '#1e1a3a', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 16, padding: isMobile ? 14 : 22, marginBottom: 16, overflowX: 'auto' },
    panelTitle: { fontSize: 14, fontWeight: 700, color: '#e8e4ff', marginBottom: 16 },
    formRow: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 0 : 16 },
    formGroup: { marginBottom: isMobile ? 12 : 16 },
    label: { display: 'block', fontSize: 10, fontWeight: 600, color: '#a89fc7', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
    input: { width: '100%', background: '#1a1638', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 10, color: '#e8e4ff', fontFamily: "'Sora', sans-serif", fontSize: 13, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 11 : 13, minWidth: isMobile ? 500 : 'auto' },
    th: { textAlign: 'left', padding: isMobile ? '8px 6px' : '10px 14px', color: '#6b61a0', fontSize: isMobile ? 8 : 10, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(120,100,255,0.18)', whiteSpace: 'nowrap' },
    td: { padding: isMobile ? '10px 6px' : '12px 14px', color: '#e8e4ff', borderBottom: '1px solid rgba(120,100,255,0.06)', fontSize: isMobile ? 11 : 13 },
    tag: { padding: '4px 8px', borderRadius: 6, fontSize: isMobile ? 9 : 11, fontWeight: 600, border: 'none', cursor: 'pointer' },
    btnDelete: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: isMobile ? 14 : 16 },
    empty: { textAlign: 'center', color: '#6b61a0', padding: isMobile ? 20 : 30, fontSize: isMobile ? 12 : 13 },
    notif: { position: 'fixed', bottom: isMobile ? 80 : 24, left: isMobile ? 16 : 'auto', right: isMobile ? 16 : 24, background: '#252048', border: '1px solid #7c5cfc', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#e8e4ff', zIndex: 9999 },
  }

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.titulo}>📋 Solicitudes</h2>
        {isAdmin && <button style={s.btnPrimary} onClick={() => setMostrarForm(!mostrarForm)}>+ Nueva</button>}
      </div>

      {mostrarForm && isAdmin && (
        <div style={s.panel}>
          <div style={s.panelTitle}>Nueva Solicitud</div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Nombre *</label>
              <input style={s.input} name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre completo" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Teléfono</label>
              <input style={s.input} name="telefono" value={form.telefono} onChange={handleChange} placeholder="0412-..." />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Tipo *</label>
            <select style={s.input} name="tipo" value={form.tipo} onChange={handleChange}>
              {TIPOS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Descripción *</label>
            <textarea style={{ ...s.input, minHeight: 80, resize: 'vertical' }} name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Describa..." />
          </div>
          <button style={s.btnPrimary} onClick={agregar}>Registrar</button>
        </div>
      )}

      <div style={s.panel}>
        {loading ? <div style={s.empty}>Cargando...</div> : solicitudes.length === 0 ? (
          <div style={s.empty}>Sin solicitudes</div>
        ) : (
          <table style={s.table}>
            <thead><tr>{['#', 'Ciudadano', 'Tipo', 'Estado', ...(isAdmin ? ['Acciones'] : [])].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {solicitudes.map((sol, i) => (
                <tr key={sol.id}>
                  <td style={{ ...s.td, color: '#6b61a0', fontFamily: 'monospace' }}>{String(i + 1).padStart(3, '0')}</td>
                  <td style={s.td}>{sol.nombre}</td>
                  <td style={s.td}>{sol.tipo}</td>
                  <td style={s.td}>
                    {isAdmin ? (
                      <select style={{ ...s.tag, background: ESTADOS[sol.estado]?.bg || ESTADOS.Pendiente.bg, color: ESTADOS[sol.estado]?.color || ESTADOS.Pendiente.color }} value={sol.estado} onChange={e => cambiarEstado(sol.id, e.target.value)}>
                        {Object.keys(ESTADOS).map(e => <option key={e}>{e}</option>)}
                      </select>
                    ) : (
                      <span style={{ ...s.tag, background: ESTADOS[sol.estado]?.bg || ESTADOS.Pendiente.bg, color: ESTADOS[sol.estado]?.color || ESTADOS.Pendiente.color }}>{sol.estado}</span>
                    )}
                  </td>
                  {isAdmin && <td style={s.td}><button style={s.btnDelete} onClick={() => eliminar(sol.id)}>🗑</button></td>}
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
