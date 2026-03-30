import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API = 'https://san-isidro-digital.onrender.com/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, token } = useAuth()
  const navigate = useNavigate()

  if (token) return <Navigate to="/" />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      login(data.token, data.usuario)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.logo}>🏛️</div>
        <h1 style={s.title}>San Isidro Digital</h1>
        <p style={s.subtitle}>Iniciar Sesión</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Correo electrónico</label>
            <input
              type="email"
              style={s.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@sanisidro.gob.ve"
              required
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Contraseña</label>
            <input
              type="password"
              style={s.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div style={s.error}>{error}</div>}
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Iniciando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0d0b1a 0%, #1a1040 100%)',
    padding: 20,
  },
  card: {
    background: '#1e1a3a',
    border: '1px solid rgba(120,100,255,0.18)',
    borderRadius: 20,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    textAlign: 'center',
  },
  logo: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 700, color: '#e8e4ff', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#a89fc7', marginBottom: 28 },
  form: { textAlign: 'left' },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 11, fontWeight: 600, color: '#a89fc7', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: { width: '100%', background: '#1a1638', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 10, color: '#e8e4ff', fontSize: 14, padding: '12px 14px', outline: 'none', boxSizing: 'border-box' },
  error: { background: 'rgba(248,113,113,0.15)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, textAlign: 'center' },
  btn: { width: '100%', background: 'linear-gradient(135deg,#7c5cfc,#4f3bb8)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
}
