import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { exportToExcel, exportToPDF } from '../utils/export'

const TIPOS = ['Trámite Administrativo', 'Ayuda Social', 'Reclamo de Servicio', 'Información General', 'Proyecto de Mejora']
const ESTADOS = {
  'Pendiente': { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  'En Proceso': { bg: 'rgba(56,189,248,0.15)', color: '#38bdf8' },
  'Resuelto': { bg: 'rgba(52,211,153,0.15)', color: '#34d399' }
}

const columnas = [
  { header: '#', accessor: (_, i) => i + 1 },
  { header: 'Ciudadano', accessor: item => item.nombre },
  { header: 'Tipo', accessor: item => item.tipo },
  { header: 'Descripción', accessor: item => item.descripcion },
  { header: 'Estado', accessor: item => item.estado },
  { header: 'Fecha', accessor: item => new Date(item.fecha).toLocaleDateString() },
]

const formVacio = { nombre: '', telefono: '', tipo: 'Trámite Administrativo', descripcion: '' }

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null) // id del registro en edición
  const [notif, setNotif] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [form, setForm] = useState(formVacio)
  const { isAdmin } = useAuth()

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const data = await api.solicitudes.list()
      setSolicitudes(data)
    } catch (e) { mostrarNotif('Error: ' + e.message) }
    finally { setLoading(false) }
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  function abrirNuevo() {
    setEditando(null)
    setForm(formVacio)
    setMostrarForm(true)
  }

  function abrirEditar(sol) {
    setEditando(sol.id)
    setForm({ nombre: sol.nombre, telefono: sol.telefono || '', tipo: sol.tipo, descripcion: sol.descripcion })
    setMostrarForm(true)
  }

  function cancelar() {
    setMostrarForm(false)
    setEditando(null)
    setForm(formVacio)
  }

  async function guardar() {
    if (!form.nombre.trim() || !form.descripcion.trim()) {
      mostrarNotif('⚠️ Completa los campos requeridos'); return
    }
    try {
      if (editando) {
        await api.solicitudes.update(editando, form)
        mostrarNotif('✅ Solicitud actualizada')
      } else {
        await api.solicitudes.create(form)
        mostrarNotif('✅ Solicitud registrada')
      }
      cancelar()
      fetchData()
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

  function handleExportExcel() {
    exportToExcel(solicitudes, 'solicitudes', columnas)
    mostrarNotif('✅ Descargando Excel...')
  }

  function handleExportPDF() {
    exportToPDF(solicitudes, 'solicitudes', columnas, 'Reporte de Solicitudes')
    mostrarNotif('✅ Descargando PDF...')
  }

  const solicitudesFiltradas = solicitudes.filter(s => {
    const coincideBusqueda = s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.tipo.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    const coincideEstado = filtroEstado === 'Todos' || s.estado === filtroEstado
    return coincideBusqueda && coincideEstado
  })

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.titulo}>📋 Solicitudes</h2>
        <div style={s.actions}>
          <button style={s.btnExport} onClick={handleExportExcel}>📊 Excel</button>
          <button style={s.btnExport} onClick={handleExportPDF}>📄 PDF</button>
          {isAdmin && <button style={s.btnPrimary} onClick={abrirNuevo}>+ Nueva</button>}
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div style={s.filtrosRow}>
        <input
          style={{ ...s.input, flex: 1 }}
          placeholder="🔍 Buscar por nombre, tipo o descripción..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <select style={{ ...s.input, width: 'auto' }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option>Todos</option>
          {Object.keys(ESTADOS).map(e => <option key={e}>{e}</option>)}
        </select>
      </div>

      {mostrarForm && isAdmin && (
        <div style={s.panel}>
          <div style={s.panelTitle}>{editando ? '✏️ Editar Solicitud' : 'Nueva Solicitud'}</div>
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
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={s.btnPrimary} onClick={guardar}>{editando ? 'Guardar Cambios' : 'Registrar'}</button>
            <button style={s.btnCancelar} onClick={cancelar}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={s.panel}>
        {loading ? <div style={s.empty}>Cargando...</div> : solicitudesFiltradas.length === 0 ? (
          <div style={s.empty}>{busqueda || filtroEstado !== 'Todos' ? 'Sin resultados para la búsqueda' : 'Sin solicitudes'}</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>{['#', 'Ciudadano', 'Teléfono', 'Tipo', 'Estado', ...(isAdmin ? ['Acciones'] : [])].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {solicitudesFiltradas.map((sol, i) => (
                <tr key={sol.id}>
                  <td style={{ ...s.td, color: '#6b61a0', fontFamily: 'monospace' }}>{String(i + 1).padStart(3, '0')}</td>
                  <td style={s.td}>
                    <div style={{ fontWeight: 600 }}>{sol.nombre}</div>
                    <div style={{ fontSize: 11, color: '#6b61a0', marginTop: 2 }}>{sol.descripcion.slice(0, 50)}{sol.descripcion.length > 50 ? '...' : ''}</div>
                  </td>
                  <td style={s.td}>{sol.telefono || '—'}</td>
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
                  {isAdmin && (
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={s.btnEdit} onClick={() => abrirEditar(sol)}>✏️</button>
                        <button style={s.btnDelete} onClick={() => eliminar(sol.id)}>🗑</button>
                      </div>
                    </td>
                  )}
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
  titulo: { fontSize: 18, fontWeight: 700, color: '#e8e4ff' },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  filtrosRow: { display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  btnPrimary: { background: 'linear-gradient(135deg,#7c5cfc,#4f3bb8)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,92,252,0.3)' },
  btnExport: { background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnCancelar: { background: 'transparent', color: '#a89fc7', border: '1px solid rgba(120,100,255,0.3)', borderRadius: 10, padding: '10px 18px', fontSize: 13, cursor: 'pointer' },
  btnEdit: { background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 6, cursor: 'pointer', fontSize: 14, padding: '4px 8px' },
  btnDelete: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 },
  panel: { background: '#1e1a3a', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 16, padding: 22, marginBottom: 16, overflowX: 'auto' },
  panelTitle: { fontSize: 14, fontWeight: 700, color: '#e8e4ff', marginBottom: 16 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 10, fontWeight: 600, color: '#a89fc7', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: { width: '100%', background: '#1a1638', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 10, color: '#e8e4ff', fontSize: 13, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 500 },
  th: { textAlign: 'left', padding: '10px 14px', color: '#6b61a0', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(120,100,255,0.18)', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', color: '#e8e4ff', borderBottom: '1px solid rgba(120,100,255,0.06)', fontSize: 13 },
  tag: { padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer' },
  empty: { textAlign: 'center', color: '#6b61a0', padding: 30 },
  notif: { position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#252048', border: '1px solid #7c5cfc', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#e8e4ff', zIndex: 9999 },
}