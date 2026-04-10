import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

const API = 'https://san-isidro-digital.onrender.com/api'

export default function Perfil() {
  const { user, login } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [notif, setNotif] = useState('')
  const [loading, setLoading] = useState(false)

  async function cambiarPassword(e) {
    e.preventDefault()
    if (password !== confirm) {
      setNotif('⚠️ Las contraseñas no coinciden')
      setTimeout(() => setNotif(''), 3000)
      return
    }
    if (password.length < 6) {
      setNotif('⚠️ La contraseña debe tener al menos 6 caracteres')
      setTimeout(() => setNotif(''), 3000)
      return
    }
    setLoading(true)
    try {
      await fetch(`${API}/auth/cambiar-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ password })
      })
      setNotif('✅ Contraseña actualizada correctamente')
      setPassword('')
      setConfirm('')
    } catch (e) {
      setNotif('Error al cambiar contraseña')
    }
    setLoading(false)
    setTimeout(() => setNotif(''), 3000)
  }

  return (
    <div>
      <h2 style={s.titulo}>👤 Mi Perfil</h2>

      <div style={s.grid} className="profile-grid">
        <div style={s.panel}>
          <div style={s.panelTitle}>Datos del Usuario</div>
          <div style={s.infoRow}>
            <span style={s.label}>Nombre</span>
            <span style={s.value}>{user?.nombre} {user?.apellido || ''}</span>
          </div>
          <div style={s.infoRow}>
            <span style={s.label}>Cédula</span>
            <span style={s.value}>{user?.cedula}</span>
          </div>
          <div style={s.infoRow}>
            <span style={s.label}>Email</span>
            <span style={s.value}>{user?.email}</span>
          </div>
          <div style={s.infoRow}>
            <span style={s.label}>Rol</span>
            <span style={{ ...s.tag, background: user?.rol === 'admin' ? 'rgba(167,139,250,0.15)' : 'rgba(52,211,153,0.15)', color: user?.rol === 'admin' ? '#a78bfa' : '#34d399' }}>
              {user?.rol === 'admin' ? 'Administrador' : 'Usuario'}
            </span>
          </div>
          {user?.telefono && (
            <div style={s.infoRow}>
              <span style={s.label}>Teléfono</span>
              <span style={s.value}>{user.telefono}</span>
            </div>
          )}
          {user?.direccion && (
            <div style={s.infoRow}>
              <span style={s.label}>Dirección</span>
              <span style={s.value}>{user.direccion}</span>
            </div>
          )}
        </div>

        <div style={s.panel}>
          <div style={s.panelTitle}>Cambiar Contraseña</div>
          <form onSubmit={cambiarPassword}>
            <div style={s.formGroup}>
              <label style={s.label}>Nueva Contraseña</label>
              <input
                type="password"
                style={s.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Confirmar Contraseña</label>
              <input
                type="password"
                style={s.input}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                required
              />
            </div>
            <button type="submit" style={s.btn} disabled={loading}>
              {loading ? 'Guardando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
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
