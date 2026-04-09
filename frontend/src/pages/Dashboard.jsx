import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

const ESTADOS_COLOR = {
  'Pendiente':       { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  'En Proceso':      { bg: 'rgba(56,189,248,0.15)',  color: '#38bdf8' },
  'Resuelto':        { bg: 'rgba(52,211,153,0.15)',  color: '#34d399' },
  'En Planificación':{ bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  'En Curso':        { bg: 'rgba(56,189,248,0.15)',  color: '#38bdf8' },
  'Completado':      { bg: 'rgba(52,211,153,0.15)',  color: '#34d399' },
  'Pausado':         { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  'Activo':          { bg: 'rgba(52,211,153,0.15)',  color: '#34d399' },
  'Inactivo':        { bg: 'rgba(107,97,160,0.15)',  color: '#6b61a0' },
}

function tiempoRelativo(fecha) {
  const diff = (Date.now() - new Date(fecha)) / 1000
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)} días`
  return new Date(fecha).toLocaleDateString()
}

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
    { label: 'Solicitudes', key: 'solicitudesActivas', badge: 'PENDIENTES', color: '#a78bfa', to: '/solicitudes' },
    { label: 'Recursos CLAP', key: 'recursosClap', badge: 'TOTAL', color: '#38bdf8', to: '/clap' },
    { label: 'Emprend.', key: 'emprendimientosActivos', badge: 'ACTIVOS', color: '#f472b6', to: '/emprendimientos' },
    { label: 'Beneficiarios', key: 'beneficiarios', badge: 'TOTAL', color: '#34d399', to: '/beneficiarios' },
  ]

  const modules = [
    { icon: '📋', title: 'Solicitudes Ciudadanas', desc: 'Peticiones y trámites comunitarios', color: 'rgba(124,92,252,0.5)', to: '/solicitudes' },
    { icon: '💡', title: 'Emprendimientos', desc: 'Negocios con impacto social', color: 'rgba(244,114,182,0.5)', to: '/emprendimientos' },
    { icon: '🏘', title: 'Proyectos', desc: 'Mejorar la comunidad', color: 'rgba(52,211,153,0.5)', to: '/proyectos' },
  ]

  const styles = {
    loading: { color: '#a89fc7', textAlign: 'center', padding: 40 },
    error: { color: '#f87171', textAlign: 'center', padding: 40 },
    statsGrid: { display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 10 : 16, marginBottom: 24 },
    statCard: { background: '#1e1a3a', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 16, padding: isMobile ? 14 : 20, textDecoration: 'none', display: 'block', transition: 'border-color .2s', cursor: 'pointer' },
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
    panelTitle: { fontSize: isMobile ? 12 : 14, fontWeight: 700, marginBottom: 16, color: '#e8e4ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    empty: { textAlign: 'center', color: '#6b61a0', fontSize: 12, padding: '20px 0' },
    actividadItem: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(120,100,255,0.08)' },
    actividadIcono: { width: 32, height: 32, borderRadius: 8, background: 'rgba(124,92,252,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 },
    actividadTexto: { flex: 1, minWidth: 0 },
    actividadTitulo: { fontSize: 13, color: '#e8e4ff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    actividadSub: { fontSize: 11, color: '#6b61a0', marginTop: 2 },
    actividadFecha: { fontSize: 10, color: '#6b61a0', flexShrink: 0, marginTop: 2 },
    estadoBadge: { fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 600, marginLeft: 6 },
    impactRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(120,100,255,0.08)' },
    impactLabel: { fontSize: 12, color: '#a89fc7' },
    impactVal: { fontSize: 14, fontWeight: 700, fontFamily: 'monospace' },
  }

  if (loading) return <div style={styles.loading}>Cargando...</div>
  if (error) return <div style={styles.error}>Error: {error}</div>

  const getVal = (key) => stats?.[key] ?? 0
  const actividad = stats?.actividad || []

  return (
    <div>
      {/* Tarjetas de estadísticas */}
      <div style={styles.statsGrid}>
        {cards.map((c, i) => (
          <Link key={i} to={c.to} style={styles.statCard}>
            <div style={styles.statLabel}>{c.label}</div>
            <div style={styles.statRow}>
              <div style={{ ...styles.statNum, color: c.color }}>{getVal(c.key)}</div>
              <div style={styles.statBadge}>{c.badge}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div style={styles.modulesGrid}>
        {modules.map((m, i) => (
          <Link key={i} to={m.to} style={styles.moduleCard}>
            <div style={{ ...styles.moduleIcon, background: `${m.color}22` }}>{m.icon}</div>
            <div style={styles.moduleTitle}>{m.title}</div>
            <div style={styles.moduleDesc}>{m.desc}</div>
          </Link>
        ))}
      </div>

      {/* Actividad reciente + Indicadores */}
      <div style={styles.bottomGrid}>

        {/* Actividad reciente */}
        <div style={styles.panel}>
          <div style={styles.panelTitle}>
            <span>Actividad Reciente</span>
            <span style={{ fontSize: 11, color: '#6b61a0', fontWeight: 400 }}>{actividad.length} registros</span>
          </div>
          {actividad.length === 0 ? (
            <div style={styles.empty}>Sin actividad reciente</div>
          ) : (
            actividad.map((item, i) => {
              const estadoColor = ESTADOS_COLOR[item.estado] || null
              return (
                <div key={i} style={{ ...styles.actividadItem, ...(i === actividad.length - 1 ? { borderBottom: 'none' } : {}) }}>
                  <div style={styles.actividadIcono}>{item.icono}</div>
                  <div style={styles.actividadTexto}>
                    <div style={styles.actividadTitulo}>
                      {item.titulo}
                      {item.estado && estadoColor && (
                        <span style={{ ...styles.estadoBadge, background: estadoColor.bg, color: estadoColor.color }}>
                          {item.estado}
                        </span>
                      )}
                    </div>
                    <div style={styles.actividadSub}>{item.subtitulo}</div>
                  </div>
                  <div style={styles.actividadFecha}>{tiempoRelativo(item.fecha)}</div>
                </div>
              )
            })
          )}
        </div>

        {/* Indicadores de impacto */}
        <div style={styles.panel}>
          <div style={styles.panelTitle}>Indicadores de Impacto</div>
          <div style={styles.impactRow}>
            <div style={styles.impactLabel}>Beneficiarios Totales</div>
            <div style={{ ...styles.impactVal, color: '#38bdf8' }}>{getVal('beneficiarios')}</div>
          </div>
          <div style={styles.impactRow}>
            <div style={styles.impactLabel}>Solicitudes Pendientes</div>
            <div style={{ ...styles.impactVal, color: '#fbbf24' }}>{getVal('solicitudesActivas')}</div>
          </div>
          <div style={styles.impactRow}>
            <div style={styles.impactLabel}>Emprendimientos Activos</div>
            <div style={{ ...styles.impactVal, color: '#f472b6' }}>{getVal('emprendimientosActivos')}</div>
          </div>
          <div style={styles.impactRow}>
            <div style={styles.impactLabel}>Recursos CLAP Entregados</div>
            <div style={{ ...styles.impactVal, color: '#a78bfa' }}>{getVal('recursosClap')}</div>
          </div>
          <div style={{ ...styles.impactRow, borderBottom: 'none' }}>
            <div style={styles.impactLabel}>Inversión Total</div>
            <div style={{ ...styles.impactVal, color: '#34d399' }}>${Number(getVal('inversionTotal')).toLocaleString()}</div>
          </div>
        </div>

      </div>
    </div>
  )
}