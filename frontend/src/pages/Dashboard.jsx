import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ESTADOS_COLOR = {
  'Pendiente':       { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', icon: '⏳' },
  'En Proceso':      { bg: 'rgba(56,189,248,0.15)', color: '#38bdf8', icon: '⚙️' },
  'Resuelto':        { bg: 'rgba(52,211,153,0.15)', color: '#34d399', icon: '✅' },
  'En Planificación':{ bg: 'rgba(167,139,250,0.15)', color: '#a78bfa', icon: '📅' },
  'En Curso':        { bg: 'rgba(56,189,248,0.15)', color: '#38bdf8', icon: '🚀' },
  'Completado':      { bg: 'rgba(52,211,153,0.15)', color: '#34d399', icon: '🏆' },
  'Activo':          { bg: 'rgba(52,211,153,0.15)', color: '#34d399', icon: '🟢' },
  'Inactivo':        { bg: 'rgba(255,255,255,0.1)', color: '#a89fc7', icon: '⚪' },
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
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState('resumen')
  const [notif, setNotif] = useState('')

  // Config State
  const [sysConfig, setSysConfig] = useState({
    mantenimiento: false,
    registroAbierto: true,
    iaPrompt: 'Eres el Asistente Virtual de San Isidro Digital, un sistema de gestión comunitaria del Consejo Comunal San Isidro en Venezuela...',
    iaNombre: 'Asistente IA Comunal',
    iaModo: 'estricto'
  })

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Cargar config local
    const localConf = localStorage.getItem('san_isidro_config')
    if (localConf) {
      try { setSysConfig(JSON.parse(localConf)) } catch(e) {}
    }

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    api.dashboard()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function mostrarNotif(msg) {
    setNotif(msg)
    setTimeout(() => setNotif(''), 3000)
  }

  function handleConfigChange(e) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setSysConfig({ ...sysConfig, [e.target.name]: value })
  }

  function guardarConfiguracion() {
    localStorage.setItem('san_isidro_config', JSON.stringify(sysConfig))
    mostrarNotif('✅ Configuración guardada en el sistema')
  }

  const cards = [
    { label: 'Solicitudes', key: 'solicitudesActivas', badge: 'PENDIENTES', color: '#a78bfa', to: '/solicitudes', icon: '📋' },
    { label: 'Recursos CLAP', key: 'recursosClap', badge: 'REGISTROS', color: '#38bdf8', to: '/clap', icon: '📦' },
    { label: 'Emprendimientos', key: 'emprendimientosActivos', badge: 'ACTIVOS', color: '#34d399', to: '/emprendimientos', icon: '💡' },
    { label: 'Ciudadanía', key: 'beneficiarios', badge: 'CENSADOS', color: '#f472b6', to: '/usuarios', icon: '👥' },
  ]

  const modules = [
    { icon: '📋', title: 'Solicitudes', desc: 'Atención al ciudadano', to: '/solicitudes' },
    { icon: '📦', title: 'Recursos CLAP', desc: 'Control de distribución', to: '/clap' },
    { icon: '🛢️', title: 'Gas Comunal', desc: 'Inventario de cilindros', to: '/gas' },
    { icon: '🚑', title: 'Salud', desc: 'Casos y operativos', to: '/salud' },
    { icon: '🏛️', title: 'Asambleas', desc: 'Actas y asistencia', to: '/asambleas' },
    { icon: '📰', title: 'Cartelera', desc: 'Noticias públicas', to: '/noticias' },
  ]

  const styles = {
    loading: { color: '#a89fc7', textAlign: 'center', padding: 40 },
    error: { color: '#f472b6', textAlign: 'center', padding: 40 },
    tabsRow: { display: 'flex', gap: 16, borderBottom: '1px solid rgba(120,100,255,0.18)', marginBottom: 24 },
    tabBtn: (active) => ({ background: 'none', border: 'none', padding: '12px 16px', fontSize: 14, fontWeight: active ? 700 : 600, color: active ? '#7c5cfc' : '#a89fc7', borderBottom: active ? '3px solid #7c5cfc' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }),
    
    statsGrid: { display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 20, marginBottom: 30 },
    statCard: { position: 'relative', overflow: 'hidden', background: '#1e1a3a', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 16, padding: isMobile ? 16 : 24, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12, transition: 'all .25s', cursor: 'pointer' },
    statLabel: { fontSize: isMobile ? 11 : 12, color: '#a89fc7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },
    statRow: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 2 },
    statNum: { fontSize: isMobile ? 28 : 34, fontWeight: 800, fontFamily: 'monospace', lineHeight: 1 },
    statBadge: { fontSize: 10, padding: '4px 8px', borderRadius: 6, fontWeight: 700, background: 'rgba(255,255,255,0.05)' },
    
    midGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: isMobile ? 16 : 24, marginBottom: 30 },
    modulesGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 16 },
    moduleCard: { background: '#1e1a3a', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 16, padding: isMobile ? 16 : 20, cursor: 'pointer', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' },
    moduleIcon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontSize: 18, background: 'rgba(124,92,252,0.1)', color: '#a78bfa' },
    moduleTitle: { fontSize: isMobile ? 14 : 14, fontWeight: 700, marginBottom: 4, color: '#e8e4ff' },
    moduleDesc: { fontSize: isMobile ? 11 : 12, color: '#a89fc7', lineHeight: 1.4 },

    panel: { background: '#1e1a3a', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 16, padding: isMobile ? 18 : 24, display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
    panelTitle: { fontSize: isMobile ? 15 : 16, fontWeight: 700, marginBottom: 20, color: '#e8e4ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(120,100,255,0.18)', paddingBottom: 12 },
    panelIcon: { marginRight: 8, fontSize: 18, color: '#7c5cfc' },
    
    quickActionsGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: 12 },
    qBtn: { display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 10, background: '#252048', border: '1px solid rgba(120,100,255,0.18)', padding: '12px 16px', borderRadius: 10, color: '#a89fc7', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all .2s' },
    qBtnIA: { background: 'linear-gradient(135deg, #7c5cfc, #38bdf8)', color: '#fff', border: 'none', boxShadow: '0 4px 10px rgba(124,92,252,0.3)' },

    empty: { textAlign: 'center', color: '#a89fc7', fontSize: 13, padding: '30px 0' },
    actividadItem: { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(120,100,255,0.18)' },
    actividadIcono: { width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
    actividadTexto: { flex: 1, minWidth: 0 },
    actividadTitulo: { fontSize: 13, color: '#e8e4ff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 8 },
    actividadSub: { fontSize: 12, color: '#a89fc7', marginTop: 4 },
    actividadFecha: { fontSize: 11, color: '#6b61a0', flexShrink: 0, marginTop: 4, fontWeight: 500 },
    estadoBadge: { fontSize: 10, padding: '4px 8px', borderRadius: 6, fontWeight: 700 },

    // Config Panel Form
    formRow: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 },
    formGroup: { marginBottom: 16 },
    label: { display: 'block', fontSize: 12, fontWeight: 700, color: '#a89fc7', marginBottom: 8 },
    input: { width: '100%', background: '#13102a', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 10, color: '#e8e4ff', fontSize: 13, padding: '12px 14px', outline: 'none', boxSizing: 'border-box' },
    select: { width: '100%', background: '#13102a', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 10, color: '#e8e4ff', fontSize: 13, padding: '12px 14px', outline: 'none', boxSizing: 'border-box' },
    toggleLabel: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#e8e4ff', fontWeight: 600, cursor: 'pointer' },
    checkbox: { width: 18, height: 18, accentColor: '#7c5cfc', cursor: 'pointer' },
    btnPrimary: { background: 'linear-gradient(135deg, #7c5cfc, #4f3bb8)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 10px rgba(124,92,252,0.3)', marginTop: 10 },
    
    notif: { position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#252048', border: '1px solid #7c5cfc', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#fff', zIndex: 9999, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' },
  }

  if (loading) return <div style={styles.loading}>Cargando entorno comunal...</div>
  if (error) return <div style={styles.error}>Error del sistema: {error}</div>

  const getVal = (key) => stats?.[key] ?? 0
  const actividad = stats?.actividad || []

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Tabs */}
      <div style={styles.tabsRow}>
        <button style={styles.tabBtn(activeTab === 'resumen')} onClick={() => setActiveTab('resumen')}>⚡ Resumen General</button>
        {user?.rol && (user.rol === 'admin' || user.rol === 'administrador') && (
          <button style={styles.tabBtn(activeTab === 'configuracion')} onClick={() => setActiveTab('configuracion')}>⚙️ Configuración del Sistema</button>
        )}
      </div>

      {activeTab === 'resumen' && (
        <>
          {/* Tarjetas Principales */}
          <div style={styles.statsGrid}>
            {cards.map((c, i) => (
              <Link key={i} to={c.to} style={styles.statCard} 
                onMouseOver={(e) => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.transform = 'translateY(-2px)' }} 
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e1e7e4'; e.currentTarget.style.transform = 'none' }}>
                <div style={{ ...styles.statBadge, position: 'absolute', top: 20, right: 20, color: c.color, background: `${c.color}15` }}>{c.badge}</div>
                <div style={styles.statLabel}>{c.label}</div>
                <div style={styles.statRow}>
                  <div style={{ ...styles.statNum, color: '#e8e4ff' }}>{getVal(c.key)}</div>
                </div>
                <div style={{ position: 'absolute', bottom: -15, right: -10, fontSize: 70, opacity: 0.04 }}>{c.icon}</div>
              </Link>
            ))}
          </div>

          <div style={styles.midGrid}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#e8e4ff' }}>Módulos de Gestión</div>
              <div style={styles.modulesGrid}>
                {modules.map((m, i) => (
                  <Link key={i} to={m.to} style={styles.moduleCard} 
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#7c5cfc' }} 
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(120,100,255,0.18)' }}>
                    <div style={styles.moduleIcon}>{m.icon}</div>
                    <div style={styles.moduleTitle}>{m.title}</div>
                    <div style={styles.moduleDesc}>{m.desc}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div style={styles.panel}>
              <div style={styles.panelTitle}>
                <span><span style={styles.panelIcon}>🛠</span> Acciones</span>
              </div>
              <div style={styles.quickActionsGrid}>
                <Link to="/chatbot" style={{ textDecoration: 'none' }}>
                  <button style={{ ...styles.qBtn, ...styles.qBtnIA, width: '100%' }}>✨ Asistente IA Comunal</button>
                </Link>
                <button style={styles.qBtn} onClick={() => window.open('/portal.html', '_blank')}>📰 Ver Portal Público</button>
                <Link to="/solicitudes" style={{ textDecoration: 'none' }}>
                  <button style={styles.qBtn}>📝 Ver Nuevas Solicitudes</button>
                </Link>
              </div>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div style={styles.panel}>
            <div style={styles.panelTitle}>
              <span><span style={styles.panelIcon}>⏱</span> Registro de Actividad Global</span>
              <span style={{ fontSize: 11, color: '#a78bfa', background: 'rgba(167,139,250,0.15)', padding: '4px 10px', borderRadius: 10 }}>Últimos Movimientos</span>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 350, paddingRight: 8 }}>
              {actividad.length === 0 ? (
                <div style={styles.empty}>El sistema no registra actividad reciente.</div>
              ) : (
                actividad.map((item, i) => {
                  const est = ESTADOS_COLOR[item.estado] || { bg:'#f1f5f9', color:'#64748b', icon:'•' }
                  return (
                    <div key={i} style={{ ...styles.actividadItem, ...(i === actividad.length - 1 ? { borderBottom: 'none' } : {}) }}>
                      <div style={{ ...styles.actividadIcono, background: est.bg }}>{est.icon}</div>
                      <div style={styles.actividadTexto}>
                        <div style={styles.actividadTitulo}>
                          {item.titulo}
                          {item.estado && (
                            <span style={{ ...styles.estadoBadge, background: est.bg, color: est.color }}>
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
          </div>
        </>
      )}

      {activeTab === 'configuracion' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Configuración del Portal */}
          <div style={styles.panel}>
            <div style={styles.panelTitle}>
              <span><span style={styles.panelIcon}>🌐</span> Portal Público y Registros</span>
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.toggleLabel}>
                  <input type="checkbox" name="mantenimiento" checked={sysConfig.mantenimiento} onChange={handleConfigChange} style={styles.checkbox}/>
                  Activar Modo Mantenimiento
                </label>
                <div style={{ fontSize: 12, color: '#a89fc7', marginTop: 6, paddingLeft: 28 }}>Muestra una pantalla de "Regresamos pronto" en portal.html</div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.toggleLabel}>
                  <input type="checkbox" name="registroAbierto" checked={sysConfig.registroAbierto} onChange={handleConfigChange} style={styles.checkbox}/>
                  Permitir Nuevos Registros
                </label>
                <div style={{ fontSize: 12, color: '#a89fc7', marginTop: 6, paddingLeft: 28 }}>Habilita los formularios de solicitud desde la web pública</div>
              </div>
            </div>
          </div>

          {/* Configuración del Motor IA */}
          <div style={styles.panel}>
            <div style={styles.panelTitle}>
              <span><span style={styles.panelIcon}>✨</span> Motor de Inteligencia Artificial Comunal</span>
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre del Asistente</label>
                <input style={styles.input} name="iaNombre" value={sysConfig.iaNombre} onChange={handleConfigChange} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nivel de Rigurosidad (Modo)</label>
                <select style={styles.select} name="iaModo" value={sysConfig.iaModo} onChange={handleConfigChange}>
                  <option value="estricto">Estricto Comunal (Solo responde temas censados)</option>
                  <option value="flexible">Flexible (Puede responder temas generales)</option>
                  <option value="offline">Offline Absoluto (Usar respuestas pre-programadas)</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>System Prompt (Instrucción Base de la IA)</label>
              <textarea 
                style={{ ...styles.input, minHeight: 120, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} 
                name="iaPrompt" 
                value={sysConfig.iaPrompt} 
                onChange={handleConfigChange} 
              />
              <div style={{ fontSize: 11, color: '#a89fc7', marginTop: 6 }}>Define el rol, los límites y la forma de responder del Asistente Inteligente en San Isidro Digital.</div>
            </div>
            
            <div>
              <button style={styles.btnPrimary} onClick={guardarConfiguracion}>Guardar Configuraciones</button>
            </div>
          </div>
        </div>
      )}

      {notif && <div style={styles.notif}>{notif}</div>}
    </div>
  )
}