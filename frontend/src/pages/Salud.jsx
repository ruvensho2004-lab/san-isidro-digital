import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { exportToExcel, exportToPDF } from '../utils/export'

const PRIORIDADES = { 'Normal': { bg: 'rgba(56,189,248,0.15)', color: '#38bdf8' }, 'Alta': { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' }, 'Emergencia': { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' } }
const ESTADOS = { 'Revisión': { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' }, 'Atendido': { bg: 'rgba(52,211,153,0.15)', color: '#34d399' }, 'Rechazado': { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' } }

const columnas = [
  { header: '#', accessor: (_, i) => i + 1 },
  { header: 'Vulnerable', accessor: item => item.paciente },
  { header: 'Cédula', accessor: item => item.cedula },
  { header: 'Diagnóstico', accessor: item => item.diagnostico },
  { header: 'Requiere', accessor: item => item.ayudaReq },
  { header: 'Estado', accessor: item => item.estado },
]

export default function Salud() {
  const [casos, setCasos] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [notif, setNotif] = useState('')
  const [form, setForm] = useState({ paciente: '', cedula: '', diagnostico: '', ayudaReq: '', prioridad: 'Normal' })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const data = await api.salud.list()
      setCasos(data)
    } catch (e) { mostrarNotif('Error: ' + e.message) }
    finally { setLoading(false) }
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function agregar() {
    if (!form.paciente.trim() || !form.diagnostico.trim()) { mostrarNotif('⚠️ Completa campos obligatorios'); return }
    try {
      await api.salud.create(form)
      setForm({ paciente: '', cedula: '', diagnostico: '', ayudaReq: '', prioridad: 'Normal' })
      setMostrarForm(false)
      fetchData()
      mostrarNotif('✅ Caso de salud registrado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function actualizarCampo(id, campo, valor) {
    try {
      await api.salud.update(id, { [campo]: valor })
      fetchData()
      mostrarNotif('✅ Actualizado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar caso de salud?')) return
    try {
      await api.salud.delete(id)
      fetchData()
      mostrarNotif('✅ Eliminado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  function mostrarNotif(msg) { setNotif(msg); setTimeout(() => setNotif(''), 3000) }

  function handleExportExcel() { exportToExcel(casos, 'salud', columnas); mostrarNotif('✅ Excel Generado') }
  function handleExportPDF() { exportToPDF(casos, 'salud', columnas, 'Casos de Salud Comunitarios'); mostrarNotif('✅ PDF Generado') }

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.titulo}>🚑 Casos de Salud Vulnerable</h2>
        <div style={s.actions}>
          <button style={s.btnExport} onClick={handleExportExcel}>📊 Excel</button>
          <button style={s.btnExport} onClick={handleExportPDF}>📄 PDF</button>
          <button style={s.btnPrimary} onClick={() => setMostrarForm(!mostrarForm)}>+ Registrar Paciente</button>
        </div>
      </div>

      {mostrarForm && (
        <div style={s.panel}>
          <div style={s.panelTitle}>Nuevo Caso Vulnerable</div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Nombre del Paciente *</label>
              <input style={s.input} name="paciente" value={form.paciente} onChange={handleChange} placeholder="Juan Pérez" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Cédula (Opcional)</label>
              <input style={s.input} name="cedula" value={form.cedula} onChange={handleChange} placeholder="V-12345678" />
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Diagnóstico o Condición Médica *</label>
              <input style={s.input} name="diagnostico" value={form.diagnostico} onChange={handleChange} placeholder="Ej: Hipertensión severa" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Prioridad</label>
              <select style={s.input} name="prioridad" value={form.prioridad} onChange={handleChange}>
                <option>Normal</option>
                <option>Alta</option>
                <option>Emergencia</option>
              </select>
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Ayuda Requerida</label>
            <textarea style={{ ...s.input, minHeight: 80, resize: 'vertical' }} name="ayudaReq" value={form.ayudaReq} onChange={handleChange} placeholder="Medicamentos, silla de ruedas, atención médica periódica..." />
          </div>
          <button style={s.btnPrimary} onClick={agregar}>Registrar Paciente</button>
        </div>
      )}

      <div style={s.panel}>
        {loading ? <div style={s.empty}>Cargando...</div> : casos.length === 0 ? <div style={s.empty}>Sin casos registrados</div> : (
          <table style={s.table}>
            <thead><tr>{['#', 'Prioridad', 'Paciente', 'Cédula', 'Diagnóstico', 'Ayuda Rq.', 'Estado', 'Acciones'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {casos.map((c, i) => (
                <tr key={c.id}>
                  <td style={{ ...s.td, color: '#a89fc7', fontFamily: 'monospace' }}>{String(i + 1).padStart(3, '0')}</td>
                  <td style={s.td}>
                    <select style={{ ...s.tag, background: PRIORIDADES[c.prioridad]?.bg, color: PRIORIDADES[c.prioridad]?.color }} value={c.prioridad} onChange={ev => actualizarCampo(c.id, 'prioridad', ev.target.value)}>
                      {Object.keys(PRIORIDADES).map(p => <option key={p}>{p}</option>)}
                    </select>
                  </td>
                  <td style={{...s.td, fontWeight: 600}}>{c.paciente}</td>
                  <td style={s.td}>{c.cedula || 'N/A'}</td>
                  <td style={s.td}>{c.diagnostico}</td>
                  <td style={s.td}>{c.ayudaReq}</td>
                  <td style={s.td}>
                    <select style={{ ...s.tag, background: ESTADOS[c.estado]?.bg, color: ESTADOS[c.estado]?.color }} value={c.estado} onChange={ev => actualizarCampo(c.id, 'estado', ev.target.value)}>
                      {Object.keys(ESTADOS).map(est => <option key={est}>{est}</option>)}
                    </select>
                  </td>
                  <td style={s.td}><button style={s.btnDelete} onClick={() => eliminar(c.id)}>🗑</button></td>
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
