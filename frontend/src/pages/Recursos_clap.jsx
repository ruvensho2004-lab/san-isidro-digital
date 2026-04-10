import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { exportToExcel, exportToPDF } from '../utils/export'

const TIPOS = ['Caja CLAP Alimentaria', 'Kit de Medicamentos', 'Material Escolar', 'Apoyo Económico']

const columnas = [
  { header: '#', accessor: (_, i) => i + 1 },
  { header: 'Beneficiario', accessor: item => item.nombre },
  { header: 'Cédula', accessor: item => item.cedula },
  { header: 'Tipo', accessor: item => item.tipo },
  { header: 'Cantidad', accessor: item => item.cantidad },
  { header: 'Estado', accessor: item => item.estado },
  { header: 'Pagado', accessor: item => item.pagado ? 'Sí' : 'No' },
  { header: 'Fecha', accessor: item => new Date(item.fecha).toLocaleDateString() },
]

export default function RecursosClap() {
  const [recursos, setRecursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [notif, setNotif] = useState('')
  const [form, setForm] = useState({ nombre: '', cedula: '', tipo: 'Caja CLAP Alimentaria', cantidad: 1, observaciones: '' })
  const { isAdmin } = useAuth()

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const data = await api.clap.list()
      setRecursos(data)
    } catch (e) { mostrarNotif('Error: ' + e.message) }
    finally { setLoading(false) }
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.name === 'cantidad' ? parseInt(e.target.value) : e.target.value }) }

  async function agregar() {
    if (!form.nombre.trim() || !form.cedula.trim()) { mostrarNotif('⚠️ Completa los campos requeridos'); return }
    try {
      await api.clap.create(form)
      setForm({ nombre: '', cedula: '', tipo: 'Caja CLAP Alimentaria', cantidad: 1, observaciones: '' })
      setMostrarForm(false)
      fetchData()
      mostrarNotif('✅ Recurso CLAP registrado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este registro?')) return
    try {
      await api.clap.delete(id)
      fetchData()
      mostrarNotif('✅ Registro eliminado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function actualizarCampo(id, campo, valor) {
    try {
      await api.clap.update(id, { [campo]: valor })
      fetchData()
      mostrarNotif('✅ Registro actualizado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  function mostrarNotif(msg) { setNotif(msg); setTimeout(() => setNotif(''), 3000) }

  function handleExportExcel() {
    exportToExcel(recursos, 'recursos_clap', columnas)
    mostrarNotif('✅ Descargando Excel...')
  }

  function handleExportPDF() {
    exportToPDF(recursos, 'recursos_clap', columnas, 'Reporte de Recursos CLAP')
    mostrarNotif('✅ Descargando PDF...')
  }

  const totalEntregados = recursos.filter(r => r.estado === 'Entregado').reduce((acc, curr) => acc + curr.cantidad, 0)
  const totalPagados = recursos.filter(r => r.pagado).reduce((acc, curr) => acc + curr.cantidad, 0)

  return (
    <div>
      <div style={s.header}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2 style={s.titulo}>📦 Recursos CLAP</h2>
          <div style={s.actions}>
            <button style={s.btnExport} onClick={handleExportExcel}>📊 Excel</button>
            <button style={s.btnExport} onClick={handleExportPDF}>📄 PDF</button>
            {isAdmin && <button style={s.btnPrimary} onClick={() => setMostrarForm(!mostrarForm)}>+ Registrar</button>}
          </div>
        </div>
        <div style={{display:'flex',gap:20,marginTop:10}}>
          <div style={s.statCard}>
            <div style={s.statValue}>{totalEntregados}</div>
            <div style={s.statLabel}>Cajas/Kits Entregados</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statValue}>{totalPagados}</div>
            <div style={s.statLabel}>Cajas/Kits Pagados</div>
          </div>
        </div>
      </div>

      {mostrarForm && isAdmin && (
        <div style={s.panel}>
          <div style={s.panelTitle}>Nuevo Recurso CLAP</div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Nombre *</label>
              <input style={s.input} name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre completo" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Cédula *</label>
              <input style={s.input} name="cedula" value={form.cedula} onChange={handleChange} placeholder="V-12345678" />
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Tipo</label>
              <select style={s.input} name="tipo" value={form.tipo} onChange={handleChange}>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Cantidad</label>
              <input style={s.input} name="cantidad" type="number" min="1" value={form.cantidad} onChange={handleChange} />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Observaciones</label>
            <input style={s.input} name="observaciones" value={form.observaciones} onChange={handleChange} placeholder="Observaciones" />
          </div>
          <button style={s.btnPrimary} onClick={agregar}>Registrar</button>
        </div>
      )}

      <div style={s.panel}>
        {loading ? <div style={s.empty}>Cargando...</div> : recursos.length === 0 ? (
          <div style={s.empty}>Sin recursos</div>
        ) : (
          <table style={s.table}>
            <thead><tr>{['#', 'Beneficiario', 'Cédula', 'Tipo', 'Cant.', 'Estado', 'Pago', 'Fecha', ...(isAdmin ? ['Acciones'] : [])].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {recursos.map((r, i) => (
                <tr key={r.id}>
                  <td style={{ ...s.td, color: '#6b61a0', fontFamily: 'monospace' }}>{String(i + 1).padStart(3, '0')}</td>
                  <td style={s.td}>{r.nombre}</td>
                  <td style={s.td}>{r.cedula}</td>
                  <td style={s.td}>{r.tipo}</td>
                  <td style={s.td}>{r.cantidad}</td>
                  <td style={s.td}>
                    {isAdmin ? (
                      <select style={{...s.tag, background: r.estado === 'Entregado' ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)', color: r.estado === 'Entregado' ? '#34d399' : '#fbbf24'}} value={r.estado} onChange={e => actualizarCampo(r.id, 'estado', e.target.value)}>
                        <option>Pendiente</option>
                        <option>Entregado</option>
                      </select>
                    ) : (
                      <span style={{...s.tag, background: r.estado === 'Entregado' ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)', color: r.estado === 'Entregado' ? '#34d399' : '#fbbf24'}}>{r.estado}</span>
                    )}
                  </td>
                  <td style={s.td}>
                    {isAdmin ? (
                      <button style={{...s.tag, background: r.pagado ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', color: r.pagado ? '#34d399' : '#ef4444'}} onClick={() => actualizarCampo(r.id, 'pagado', !r.pagado)}>
                        {r.pagado ? 'Pagado' : 'Sin Pagar'}
                      </button>
                    ) : (
                      <span style={{...s.tag, background: r.pagado ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', color: r.pagado ? '#34d399' : '#ef4444'}}>
                        {r.pagado ? 'Pagado' : 'Sin Pagar'}
                      </span>
                    )}
                  </td>
                  <td style={s.td}>{new Date(r.fecha).toLocaleDateString()}</td>
                  {isAdmin && <td style={s.td}><button style={s.btnDelete} onClick={() => eliminar(r.id)}>🗑</button></td>}
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
