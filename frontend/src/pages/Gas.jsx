import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { exportToExcel, exportToPDF } from '../utils/export'

const TAMAÑOS = ['10Kg', '18Kg', '27Kg', '43Kg']
const ESTADOS = { 'Pendiente': { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' }, 'Entregado': { bg: 'rgba(52,211,153,0.15)', color: '#34d399' }, 'Vacío': { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' } }

const columnas = [
  { header: '#', accessor: (_, i) => i + 1 },
  { header: 'Responsable', accessor: item => item.responsable },
  { header: 'Cédula', accessor: item => item.cedula },
  { header: 'Cilindro', accessor: item => item.tamano },
  { header: 'Cant.', accessor: item => item.cantidad },
  { header: 'Estado', accessor: item => item.estado },
  { header: 'Pagado', accessor: item => item.pagado ? 'Sí' : 'No' }
]

export default function Gas() {
  const [gas, setGas] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [notif, setNotif] = useState('')
  const [form, setForm] = useState({ responsable: '', cedula: '', tamano: '10Kg', cantidad: 1 })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const data = await api.gas.list()
      setGas(data)
    } catch (e) { mostrarNotif('Error: ' + e.message) }
    finally { setLoading(false) }
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.name === 'cantidad' ? parseInt(e.target.value) : e.target.value }) }

  async function agregar() {
    if (!form.responsable.trim() || !form.cedula.trim()) { mostrarNotif('⚠️ Completa los campos requeridos'); return }
    try {
      await api.gas.create(form)
      setForm({ responsable: '', cedula: '', tamano: '10Kg', cantidad: 1 })
      setMostrarForm(false)
      fetchData()
      mostrarNotif('✅ Cilindro registrado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function actualizarCampo(id, campo, valor) {
    try {
      await api.gas.update(id, { [campo]: valor })
      fetchData()
      mostrarNotif('✅ Actualizado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar registro?')) return
    try {
      await api.gas.delete(id)
      fetchData()
      mostrarNotif('✅ Eliminado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  function mostrarNotif(msg) { setNotif(msg); setTimeout(() => setNotif(''), 3000) }

  function handleExportExcel() { exportToExcel(gas, 'gas_comunal', columnas); mostrarNotif('✅ Excel Generado') }
  function handleExportPDF() { exportToPDF(gas, 'gas_comunal', columnas, 'Registro de Gas Comunal'); mostrarNotif('✅ PDF Generado') }

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.titulo}>🛢️ Control de Gas Comunal</h2>
        <div style={s.actions}>
          <button style={s.btnExport} onClick={handleExportExcel}>📊 Excel</button>
          <button style={s.btnExport} onClick={handleExportPDF}>📄 PDF</button>
          <button style={s.btnPrimary} onClick={() => setMostrarForm(!mostrarForm)}>+ Registrar Cilindro</button>
        </div>
      </div>

      {mostrarForm && (
        <div style={s.panel}>
          <div style={s.panelTitle}>Nuevo Registro de Gas</div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Responsable (Jefe de familia) *</label>
              <input style={s.input} name="responsable" value={form.responsable} onChange={handleChange} placeholder="Nombre completo" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Cédula *</label>
              <input style={s.input} name="cedula" value={form.cedula} onChange={handleChange} placeholder="V-12345678" />
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Tamaño del Cilindro</label>
              <select style={s.input} name="tamano" value={form.tamano} onChange={handleChange}>
                {TAMAÑOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Cantidad</label>
              <input style={s.input} name="cantidad" type="number" min="1" value={form.cantidad} onChange={handleChange} />
            </div>
          </div>
          <button style={s.btnPrimary} onClick={agregar}>Registrar</button>
        </div>
      )}

      <div style={s.panel}>
        {loading ? <div style={s.empty}>Cargando...</div> : gas.length === 0 ? <div style={s.empty}>Sin registros</div> : (
          <table style={s.table}>
            <thead><tr>{['#', 'Responsable', 'Cédula', 'Cilindro', 'Cant.', 'Estado', 'Pago', 'Acciones'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {gas.map((g, i) => (
                <tr key={g.id}>
                  <td style={{ ...s.td, color: '#a89fc7', fontFamily: 'monospace' }}>{String(i + 1).padStart(3, '0')}</td>
                  <td style={s.td}>{g.responsable}</td>
                  <td style={s.td}>{g.cedula}</td>
                  <td style={{...s.td, fontWeight:600}}>{g.tamano}</td>
                  <td style={s.td}>{g.cantidad}</td>
                  <td style={s.td}>
                    <select style={{ ...s.tag, background: ESTADOS[g.estado]?.bg, color: ESTADOS[g.estado]?.color }} value={g.estado} onChange={ev => actualizarCampo(g.id, 'estado', ev.target.value)}>
                      {Object.keys(ESTADOS).map(est => <option key={est}>{est}</option>)}
                    </select>
                  </td>
                  <td style={s.td}>
                    <button style={{...s.tag, background: g.pagado ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', color: g.pagado ? '#34d399' : '#ef4444'}} onClick={() => actualizarCampo(g.id, 'pagado', !g.pagado)}>
                      {g.pagado ? 'Pagado' : 'Deudor'}
                    </button>
                  </td>
                  <td style={s.td}><button style={s.btnDelete} onClick={() => eliminar(g.id)}>🗑</button></td>
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
