import { useState, useEffect } from 'react'
import { api } from '../services/api'

const ROLES = ['admin', 'usuario']

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [notif, setNotif] = useState('')
  const [form, setForm] = useState({ email: '', password: '', rol: 'usuario', cedula: '', nombre: '', apellido: '', telefono: '', direccion: '' })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const data = await api.usuarios.list()
      setUsuarios(data)
    } catch (e) { mostrarNotif('Error: ' + e.message) }
    finally { setLoading(false) }
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function agregar() {
    if (!form.email || !form.password || !form.cedula || !form.nombre || !form.rol) {
      mostrarNotif('⚠️ Completa los campos requeridos'); return
    }
    try {
      await api.usuarios.create(form)
      setForm({ email: '', password: '', rol: 'usuario', cedula: '', nombre: '', apellido: '', telefono: '', direccion: '' })
      setMostrarForm(false)
      fetchData()
      mostrarNotif('✅ Usuario registrado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function toggleActivo(id, activo) {
    try {
      await api.usuarios.update(id, { activo: !activo })
      fetchData()
      mostrarNotif('✅ Estado actualizado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      await api.usuarios.delete(id)
      fetchData()
      mostrarNotif('✅ Usuario eliminado')
    } catch (e) { mostrarNotif('Error: ' + e.message) }
  }

  function mostrarNotif(msg) { setNotif(msg); setTimeout(() => setNotif(''), 3000) }

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.titulo}>👥 Gestión de Usuarios</h2>
        <button style={s.btnPrimary} onClick={() => setMostrarForm(!mostrarForm)}>+ Nuevo Usuario</button>
      </div>

      {mostrarForm && (
        <div style={s.panel}>
          <div style={s.panelTitle}>Registrar Nuevo Usuario</div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Cédula *</label>
              <input style={s.input} name="cedula" value={form.cedula} onChange={handleChange} placeholder="V-12345678" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Email *</label>
              <input style={s.input} name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Nombre *</label>
              <input style={s.input} name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Apellido</label>
              <input style={s.input} name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido" />
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Teléfono</label>
              <input style={s.input} name="telefono" value={form.telefono} onChange={handleChange} placeholder="0412-123-4567" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Rol *</label>
              <select style={s.input} name="rol" value={form.rol} onChange={handleChange}>
                {ROLES.map(r => <option key={r} value={r}>{r === 'admin' ? 'Administrador' : 'Usuario'}</option>)}
              </select>
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Dirección</label>
            <input style={s.input} name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección completa" />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Contraseña *</label>
            <input style={s.input} name="password" type="password" value={form.password} onChange={handleChange} placeholder="Contraseña inicial" />
          </div>
          <button style={s.btnPrimary} onClick={agregar}>Registrar Usuario</button>
        </div>
      )}

      <div style={s.panel}>
        {loading ? <div style={s.empty}>Cargando...</div> : usuarios.length === 0 ? (
          <div style={s.empty}>No hay usuarios registrados</div>
        ) : (
          <table style={s.table}>
            <thead><tr>{['Cédula', 'Nombre', 'Email', 'Teléfono', 'Rol', 'Estado', 'Acciones'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td style={s.td}>{u.cedula}</td>
                  <td style={s.td}>{u.nombre} {u.apellido}</td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>{u.telefono || '—'}</td>
                  <td style={s.td}>
                    <span style={{ ...s.tag, background: u.rol === 'admin' ? 'rgba(167,139,250,0.15)' : 'rgba(52,211,153,0.15)', color: u.rol === 'admin' ? '#a78bfa' : '#34d399' }}>
                      {u.rol === 'admin' ? 'Admin' : 'Usuario'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <button style={{ ...s.tag, background: u.activo ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)', color: u.activo ? '#34d399' : '#f87171', cursor: 'pointer' }} onClick={() => toggleActivo(u.id, u.activo)}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td style={s.td}><button style={s.btnDelete} onClick={() => eliminar(u.id)}>🗑</button></td>
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
