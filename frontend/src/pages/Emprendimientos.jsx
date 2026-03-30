import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { exportToExcel, exportToPDF } from '../utils/export'

const CATEGORIAS = ['Alimentos y Bebidas', 'Artesanía', 'Servicios Tecnológicos', 'Salud y Bienestar', 'Educación', 'Agricultura Urbana']
const ESTADOS = { 'Activo': { bg: 'rgba(52,211,153,0.15)', color: '#34d399' }, 'Inactivo': { bg: 'rgba(107,97,160,0.15)', color: '#6b61a0' }, 'En Desarrollo': { bg: 'rgba(56,189,248,0.15)', color: '#38bdf8' } }

const columnas = [
  { header: '#', accessor: (_, i) => i + 1 },
  { header: 'Emprendimiento', accessor: item => item.nombre },
  { header: 'Responsable', accessor: item => item.responsable },
  { header: 'Categoría', accessor: item => item.categoria },
  { header: 'Inversión', accessor: item => `$${item.inversion || 0}` },
  { header: 'Estado', accessor: item => item.estado },
]

export default function Emprendimientos() {
  const [emprendimientos, setEmprendimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [notif, setNotif] = useState('')
  const [form, setForm] = useState({ nombre: '', responsable: '', categoria: 'Alimentos y Bebidas', descripcion: '', inversion: '' })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const data = await api.emprendimientos.list()
      setEmprendimientos(data)
    } catch (e) { mostrarNotif('Error: ' + e.message) }
    finally { setLoading(false) }
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.name === 'inversion' ? parseFloat(e.target.value) || null : e.target.value }) }

  async function agregar() {
    if (!form.nombre.trim() || !form.responsable.trim()) { mostrarNotif('⚠️ Completa los campos requeridos'); return }
    try {
      await api.emprendimientos.create(form)
      setForm({ nombre: '', responsable: '', categoria: 'Alimentos y Bebidas', descripcion: '', inversion: '' })
      setMostrarForm(false)
      fetchData()
      mostrarNotif('✅ Emprendimiento registrado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function cambiarEstado(id, estado) {
    try {
      await api.emprendimientos.update(id, { estado })
      fetchData()
      mostrarNotif('✅ Estado actualizado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este emprendimiento?')) return
    try {
      await api.emprendimientos.delete(id)
      fetchData()
      mostrarNotif('✅ Emprendimiento eliminado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  function mostrarNotif(msg) { setNotif(msg); setTimeout(() => setNotif(''), 3000) }

  function handleExportExcel() {
    exportToExcel(emprendimientos, 'emprendimientos', columnas)
    mostrarNotif('✅ Descargando Excel...')
  }

  function handleExportPDF() {
    exportToPDF(emprendimientos, 'emprendimientos', columnas, 'Reporte de Emprendimientos')
    mostrarNotif('✅ Descargando PDF...')
  }

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.titulo}>💡 Emprendimientos</h2>
        <div style={s.actions}>
          <button style={s.btnExport} onClick={handleExportExcel}>📊 Excel</button>
          <button style={s.btnExport} onClick={handleExportPDF}>📄 PDF</button>
          <button style={s.btnPrimary} onClick={() => setMostrarForm(!mostrarForm)}>+ Nuevo</button>
        </div>
      </div>

      {mostrarForm && (
        <div style={s.panel}>
          <div style={s.panelTitle}>Registrar Emprendimiento</div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Nombre *</label>
              <input style={s.input} name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Responsable *</label>
              <input style={s.input} name="responsable" value={form.responsable} onChange={handleChange} placeholder="Responsable" />
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Categoría</label>
              <select style={s.input} name="categoria" value={form.categoria} onChange={handleChange}>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Inversión ($)</label>
              <input style={s.input} name="inversion" type="number" value={form.inversion} onChange={handleChange} placeholder="0.00" />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Descripción</label>
            <textarea style={{ ...s.input, minHeight: 90, resize: 'vertical' }} name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Describe..." />
          </div>
          <button style={s.btnPrimary} onClick={agregar}>Registrar</button>
        </div>
      )}

      <div style={s.panel}>
        {loading ? <div style={s.empty}>Cargando...</div> : emprendimientos.length === 0 ? (
          <div style={s.empty}>Sin emprendimientos</div>
        ) : (
          <table style={s.table}>
            <thead><tr>{['#', 'Nombre', 'Responsable', 'Categoría', 'Estado', 'Acciones'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {emprendimientos.map((e, i) => (
                <tr key={e.id}>
                  <td style={{ ...s.td, color: '#6b61a0', fontFamily: 'monospace' }}>{String(i + 1).padStart(3, '0')}</td>
                  <td style={s.td}>{e.nombre}</td>
                  <td style={s.td}>{e.responsable}</td>
                  <td style={s.td}>{e.categoria}</td>
                  <td style={s.td}>
                    <select style={{ ...s.tag, background: ESTADOS[e.estado]?.bg || ESTADOS.Activo.bg, color: ESTADOS[e.estado]?.color || ESTADOS.Activo.color }} value={e.estado} onChange={ev => cambiarEstado(e.id, ev.target.value)}>
                      {Object.keys(ESTADOS).map(est => <option key={est}>{est}</option>)}
                    </select>
                  </td>
                  <td style={s.td}><button style={s.btnDelete} onClick={() => eliminar(e.id)}>🗑</button></td>
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
  header: { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 12, marginBottom: 20 },
  titulo: { fontSize: 18, fontWeight: 700, color: '#e8e4ff' },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  btnPrimary: { background: 'linear-gradient(135deg,#7c5cfc,#4f3bb8)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,92,252,0.3)' },
  btnExport: { background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  panel: { background: '#1e1a3a', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 16, padding: 22, marginBottom: 16, overflowX: 'auto' },
  panelTitle: { fontSize: 14, fontWeight: 700, color: '#e8e4ff', marginBottom: 16 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 10, fontWeight: 600, color: '#a89fc7', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: { width: '100%', background: '#1a1638', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 10, color: '#e8e4ff', fontSize: 13, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 },
  th: { textAlign: 'left', padding: '10px 14px', color: '#6b61a0', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(120,100,255,0.18)', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', color: '#e8e4ff', borderBottom: '1px solid rgba(120,100,255,0.06)' },
  tag: { padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer' },
  btnDelete: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 },
  empty: { textAlign: 'center', color: '#6b61a0', padding: 30 },
  notif: { position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#252048', border: '1px solid #7c5cfc', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#e8e4ff', zIndex: 9999 },
}
