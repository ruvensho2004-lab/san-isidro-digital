import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { exportToExcel, exportToPDF } from '../utils/export'

const columnas = [
  { header: '#', accessor: (_, i) => i + 1 },
  { header: 'Motivo / Título', accessor: item => item.motivo },
  { header: 'Asistentes', accessor: item => item.asistentes },
  { header: 'Vocero Resp.', accessor: item => item.vocero },
  { header: 'Fecha', accessor: item => new Date(item.fecha).toLocaleDateString() },
]

export default function Asambleas() {
  const [asambleas, setAsambleas] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [notif, setNotif] = useState('')
  const [form, setForm] = useState({ motivo: '', asistentes: '', acuerdos: '', vocero: '', enlaceActa: '' })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const data = await api.asambleas.list()
      setAsambleas(data)
    } catch (e) { mostrarNotif('Error: ' + e.message) }
    finally { setLoading(false) }
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function agregar() {
    if (!form.motivo.trim() || !form.acuerdos.trim()) { mostrarNotif('⚠️ Completa motivo y acuerdos'); return }
    try {
      await api.asambleas.create(form)
      setForm({ motivo: '', asistentes: '', acuerdos: '', vocero: '', enlaceActa: '' })
      setMostrarForm(false)
      fetchData()
      mostrarNotif('✅ Asamblea y Noticia Pública registradas')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar acta de asamblea?')) return
    try {
      await api.asambleas.delete(id)
      fetchData()
      mostrarNotif('✅ Eliminado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  function mostrarNotif(msg) { setNotif(msg); setTimeout(() => setNotif(''), 3000) }

  function handleExportExcel() { exportToExcel(asambleas, 'asambleas', columnas); mostrarNotif('✅ Excel Generado') }
  function handleExportPDF() { exportToPDF(asambleas, 'asambleas', columnas, 'Registro de Asambleas Comunales'); mostrarNotif('✅ PDF Generado') }

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.titulo}>🏛️ Asambleas y Acuerdos</h2>
        <div style={s.actions}>
          <button style={s.btnExport} onClick={handleExportExcel}>📊 Excel</button>
          <button style={s.btnExport} onClick={handleExportPDF}>📄 PDF</button>
          <button style={s.btnPrimary} onClick={() => setMostrarForm(!mostrarForm)}>+ Subir Acta</button>
        </div>
      </div>

      {mostrarForm && (
        <div style={s.panel}>
          <div style={s.panelTitle}>Registrar Asamblea</div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Motivo de la Asamblea *</label>
              <input style={s.input} name="motivo" value={form.motivo} onChange={handleChange} placeholder="Ej: Elección de voceros" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Cantidad de Asistentes</label>
              <input style={s.input} name="asistentes" type="number" value={form.asistentes} onChange={handleChange} />
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Vocero Responsable</label>
              <input style={s.input} name="vocero" value={form.vocero} onChange={handleChange} placeholder="Nombre del vocero" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Enlace al Acta (PDF/Drive)</label>
              <input style={s.input} name="enlaceActa" value={form.enlaceActa} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Acuerdos Alcanzados * (Esto se publicará en las Noticias)</label>
            <textarea style={{ ...s.input, minHeight: 80, resize: 'vertical' }} name="acuerdos" value={form.acuerdos} onChange={handleChange} placeholder="Resumen de decisiones..." />
          </div>
          <button style={s.btnPrimary} onClick={agregar}>Registrar Asamblea</button>
        </div>
      )}

      <div style={s.panel}>
        {loading ? <div style={s.empty}>Cargando...</div> : asambleas.length === 0 ? <div style={s.empty}>Sin asambleas registradas</div> : (
          <table style={s.table}>
            <thead><tr>{['#', 'Motivo', 'Asistentes', 'Vocero Central', 'Fecha', 'Acta Digital', 'Acciones'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {asambleas.map((a, i) => (
                <tr key={a.id}>
                  <td style={{ ...s.td, color: '#a89fc7', fontFamily: 'monospace' }}>{String(i + 1).padStart(3, '0')}</td>
                  <td style={{...s.td, fontWeight: 600}}>{a.motivo}</td>
                  <td style={s.td}>{a.asistentes}</td>
                  <td style={s.td}>{a.vocero || 'N/A'}</td>
                  <td style={s.td}>{new Date(a.fecha).toLocaleDateString()}</td>
                  <td style={s.td}>
                    {a.enlaceActa ? <a href={a.enlaceActa} target="_blank" rel="noreferrer" style={{color: '#38bdf8', textDecoration: 'none', fontWeight: 600}}>📄 Ver PDF</a> : <span style={{color: '#94a3b8'}}>Sin Acta</span>}
                  </td>
                  <td style={s.td}><button style={s.btnDelete} onClick={() => eliminar(a.id)}>🗑</button></td>
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
