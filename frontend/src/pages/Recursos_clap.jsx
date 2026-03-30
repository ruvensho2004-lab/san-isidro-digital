import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const TIPOS = ['Caja CLAP Alimentaria', 'Kit de Medicamentos', 'Material Escolar', 'Apoyo Económico']

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

  function mostrarNotif(msg) { setNotif(msg); setTimeout(() => setNotif(''), 3000) }

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.titulo}>📦 Recursos CLAP</h2>
        {isAdmin && <button style={s.btnPrimary} onClick={() => setMostrarForm(!mostrarForm)}>+ Registrar Recurso</button>}
      </div>

      {mostrarForm && isAdmin && (
        <div style={s.panel}>
          <div style={s.panelTitle}>Nuevo Recurso CLAP</div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Nombre del Beneficiario *</label>
              <input style={s.input} name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre completo" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Cédula *</label>
              <input style={s.input} name="cedula" value={form.cedula} onChange={handleChange} placeholder="V-12345678" />
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Tipo de Recurso</label>
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
            <input style={s.input} name="observaciones" value={form.observaciones} onChange={handleChange} placeholder="Observaciones adicionales" />
          </div>
          <button style={s.btnPrimary} onClick={agregar}>Registrar Recurso</button>
        </div>
      )}

      <div style={s.panel}>
        {loading ? <div style={s.empty}>Cargando...</div> : recursos.length === 0 ? (
          <div style={s.empty}>Sin recursos registrados</div>
        ) : (
          <table style={s.table}>
            <thead><tr>{['#', 'Beneficiario', 'Cédula', 'Recurso', 'Cant.', 'Fecha', ...(isAdmin ? ['Acciones'] : [])].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {recursos.map((r, i) => (
                <tr key={r.id}>
                  <td style={{ ...s.td, color: '#6b61a0', fontFamily: 'monospace' }}>{String(i + 1).padStart(3, '0')}</td>
                  <td style={s.td}>{r.nombre}</td>
                  <td style={s.td}>{r.cedula}</td>
                  <td style={s.td}>{r.tipo}</td>
                  <td style={s.td}>{r.cantidad}</td>
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
  btnDelete: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 },
  empty: { textAlign: 'center', color: '#6b61a0', padding: 30 },
  notif: { position: 'fixed', bottom: 24, right: 24, background: '#252048', border: '1px solid #7c5cfc', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#e8e4ff', zIndex: 9999 },
}
