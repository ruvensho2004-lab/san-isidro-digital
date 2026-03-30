import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    api.dashboard()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Solicitudes', key: 'solicitudesActivas', badge: 'ACTIVAS', color: '#a78bfa' },
    { label: 'Recursos CLAP', key: 'recursosClap', badge: 'TOTAL', color: '#38bdf8' },
    { label: 'Emprend.', key: 'emprendimientosActivos', badge: 'ACTIVOS', color: '#f472b6' },
    { label: 'Beneficiarios', key: 'beneficiarios', badge: 'TOTAL', color: '#34d399' },
  ]

  const modules = [
    { icon: '📋', title: 'Solicitudes Ciudadanas', desc: 'Peticiones y trámites comunitarios', color: 'rgba(124,92,252,0.5)', to: '/solicitudes' },
    { icon: '💡', title: 'Emprendimientos', desc: 'Negocios inclusivos', color: 'rgba(244,114,182,0.5)', to: '/emprendimientos' },
    { icon: '🏘', title: 'Proyectos', desc: 'Mejorar la comunidad', color: 'rgba(52,211,153,0.5)', to: '/proyectos' },
  ]

  const styles = {
    loading: { color: '#a89fc7', textAlign: 'center', padding: 40 },
    error: { color: '#f87171', textAlign: 'center', padding: 40 },
    statsGrid: { display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 10 : 16, marginBottom: 24 },
    statCard: { background: '#1e1a3a', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 16, padding: isMobile ? 14 : 20 },
    statLabel: { fontSize: isMobile ? 9 : 11, color: '#a89fc7', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    statRow: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' },
    statNum: { fontSize: isMobile ? 24 : 32, fontWeight: 700, fontFamily: 'monospace' },
    statBadge: { fontSize: 8, padding: '2px 6px', borderRadius: 4, fontWeight: 600, background: 'rgba(52,211,153,0.15)', color: '#34d399' },
    modulesGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 10 : 16, marginBottom: 24 },
    moduleCard: { background: '#1e1a3a', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 16, padding: isMobile ? 16 : 22, cursor: 'pointer', textDecoration: 'none', color: 'inherit', display: 'block' },
    moduleIcon: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, fontSize: 18 },
    moduleTitle: { fontSize: isMobile ? 13 : 15, fontWeight: 700, marginBottom: 4, color: '#e8e4ff' },
    moduleDesc: { fontSize: isMobile ? 10 : 12, color: '#a89fc7', lineHeight: 1.5 },
    bottomGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 10 : 16 },
    panel: { background: '#1e1a3a', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 16, padding: isMobile ? 16 : 22 },
    panelTitle: { fontSize: isMobile ? 12 : 14, fontWeight: 700, marginBottom: 12, color: '#e8e4ff' },
    empty: { textAlign: 'center', color: '#6b61a0', fontSize: 12, padding: '20px 0' },
    impactRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(120,100,255,0.08)' },
    impactLabel: { fontSize: 12, color: '#a89fc7' },
    impactVal: { fontSize: 13, fontWeight: 700, fontFamily: 'monospace' },
  }

  if (loading) return <div style={styles.loading}>Cargando...</div>
  if (error) return <div style={styles.error}>Error: {error}</div>

  const getVal = (key) => stats?.[key] ?? 0

  return (
    <div>
      <div style={styles.statsGrid}>
        {cards.map((c, i) => (
          <div key={i} style={styles.statCard}>
            <div style={styles.statLabel}>{c.label}</div>
            <div style={styles.statRow}>
              <div style={{ ...styles.statNum, color: c.color }}>{getVal(c.key)}</div>
              <div style={styles.statBadge}>{c.badge}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.modulesGrid}>
        {modules.map((m, i) => (
          <Link key={i} to={m.to} style={styles.moduleCard}>
            <div style={{ ...styles.moduleIcon, background: `${m.color}22` }}>{m.icon}</div>
            <div style={styles.moduleTitle}>{m.title}</div>
            <div style={styles.moduleDesc}>{m.desc}</div>
          </Link>
        ))}
      </div>

      <div style={styles.bottomGrid}>
        <div style={styles.panel}>
          <div style={styles.panelTitle}>Actividad Reciente</div>
          <div style={styles.empty}>Sin actividad reciente</div>
        </div>
        <div style={styles.panel}>
          <div style={styles.panelTitle}>Indicadores de Impacto</div>
          <div style={styles.impactRow}>
            <div style={styles.impactLabel}>Beneficiarios Totales</div>
            <div style={{ ...styles.impactVal, color: '#38bdf8' }}>{getVal('beneficiarios')}</div>
          </div>
          <div style={styles.impactRow}>
            <div style={styles.impactLabel}>Inversión</div>
            <div style={{ ...styles.impactVal, color: '#fbbf24' }}>${getVal('inversionTotal') || 0}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
