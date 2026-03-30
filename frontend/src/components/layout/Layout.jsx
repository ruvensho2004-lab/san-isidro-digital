import { useState, useEffect } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⊞', section: 'Atención Comunal' },
  { to: '/solicitudes', label: 'Solicitudes', icon: '📋', section: 'Atención Comunal' },
  { to: '/clap', label: 'Recursos CLAP', icon: '📦', section: 'Atención Comunal' },
  { to: '/usuarios', label: 'Usuarios', icon: '👥', section: 'Admin', adminOnly: true },
  { to: '/proyectos', label: 'Proyectos', icon: '🏘', section: 'Admin', adminOnly: true },
  { to: '/emprendimientos', label: 'Emprendimientos', icon: '💡', section: 'Admin', adminOnly: true },
]

export default function Layout() {
  const navigate = useNavigate()
  const { user, logout, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const filteredItems = navItems.filter(i => !i.adminOnly || isAdmin)
  const sections = [...new Set(filteredItems.map(i => i.section))]

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const s = {
    shell: { display: 'flex', height: '100vh', background: '#0d0b1a', color: '#e8e4ff', fontFamily: "'Sora', sans-serif" },
    mobileHeader: { display: isMobile ? 'flex' : 'none', position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: 'linear-gradient(180deg,#1a1040 0%,#0d0b1a 100%)', borderBottom: '1px solid rgba(120,100,255,0.18)', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 100 },
    menuBtn: { background: 'transparent', border: 'none', color: '#e8e4ff', fontSize: 24, cursor: 'pointer', padding: 8 },
    mobileLogo: { fontSize: 16, fontWeight: 700, color: '#e8e4ff' },
    perfilBtnSmall: { background: 'transparent', border: 'none', color: '#e8e4ff', fontSize: 20, cursor: 'pointer', padding: 8 },
    sidebar: { width: isMobile ? '100%' : 260, background: 'linear-gradient(180deg,#1a1040 0%,#0d0b1a 100%)', borderRight: '1px solid rgba(120,100,255,0.18)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: isMobile ? 'fixed' : 'relative', left: isMobile ? (menuOpen ? 0 : '-100%') : 0, top: isMobile ? 0 : 'auto', bottom: isMobile ? 0 : 'auto', height: isMobile ? '100vh' : '100%', zIndex: isMobile ? 100 : 'auto', transition: 'left 0.3s ease' },
    sidebarTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#7c5cfc,#38bdf8)' },
    logoArea: { padding: '24px 20px 20px', borderBottom: '1px solid rgba(120,100,255,0.18)' },
    logoBadge: { display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#7c5cfc,#4f3bb8)', borderRadius: 12, padding: '10px 14px', marginBottom: 12, boxShadow: '0 4px 20px rgba(124,92,252,0.3)' },
    logoTitle: { fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.2 },
    nav: { flex: 1, overflowY: 'auto', padding: '8px 0' },
    navSection: { padding: '12px 12px 4px' },
    navLabel: { fontSize: 9, fontWeight: 600, color: '#6b61a0', letterSpacing: 2, textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 },
    navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, cursor: 'pointer', color: '#a89fc7', fontSize: 12.5, fontWeight: 500, textDecoration: 'none', transition: 'all .2s', marginBottom: 2 },
    navItemActive: { background: 'linear-gradient(90deg,rgba(124,92,252,0.25),rgba(124,92,252,0.05))', color: '#a78bfa', borderLeft: '3px solid #7c5cfc' },
    navIcon: { width: 18, textAlign: 'center', flexShrink: 0 },
    sidebarFooter: { padding: 16, display: 'flex', flexDirection: 'column', gap: 8 },
    chatBtn: { width: '100%', padding: 12, borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c5cfc,#38bdf8)', color: '#fff', fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 600 },
    logoutBtn: { background: 'transparent', border: '1px solid rgba(120,100,255,0.3)', borderRadius: 8, color: '#a89fc7', fontSize: 12, padding: '8px 14px', cursor: 'pointer', width: '100%' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99 },
    main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    topbar: { padding: '18px 28px', display: isMobile ? 'none' : 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(120,100,255,0.18)', flexShrink: 0, background: 'rgba(13,11,26,0.8)' },
    pageTitle: { fontSize: 22, fontWeight: 700, color: '#e8e4ff' },
    pageSub: { fontSize: 12, color: '#a89fc7', marginTop: 2 },
    topbarRight: { display: 'flex', alignItems: 'center', gap: 12 },
    perfilBtn: { background: 'rgba(124,92,252,0.15)', border: '1px solid rgba(124,92,252,0.3)', borderRadius: 8, color: '#a78bfa', fontSize: 12, padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
    logoutBtnTop: { background: 'transparent', border: '1px solid rgba(120,100,255,0.3)', borderRadius: 8, color: '#a89fc7', fontSize: 12, padding: '6px 14px', cursor: 'pointer' },
    content: { flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px 28px', paddingTop: isMobile ? '72px' : '24px' },
  }

  return (
    <div style={s.shell}>
      <div style={s.mobileHeader}>
        <button style={s.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
        <div style={s.mobileLogo}>San Isidro</div>
        <button style={s.perfilBtnSmall} onClick={() => navigate('/perfil')}>👤</button>
      </div>

      <aside style={s.sidebar}>
        <div style={s.sidebarTop} />
        <div style={s.logoArea}>
          <div style={s.logoBadge}>
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="rgba(255,255,255,0.1)"/>
              <path d="M7 14h14M14 7v14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="14" cy="14" r="4" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
            </svg>
            <div style={s.logoTitle}>San Isidro<br/>Digital</div>
          </div>
        </div>

        <nav style={s.nav}>
          {sections.map(section => (
            <div key={section} style={s.navSection}>
              <div style={s.navLabel}>{section}</div>
              {filteredItems
                .filter(i => i.section === section)
                .map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    style={({ isActive }) => ({
                      ...s.navItem,
                      ...(isActive ? s.navItemActive : {}),
                    })}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span style={s.navIcon}>{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
            </div>
          ))}
        </nav>

        <div style={s.sidebarFooter}>
          <button style={s.chatBtn} onClick={() => { navigate('/chatbot'); setMenuOpen(false) }}>
            ✨ Asistente Virtual
          </button>
          <button style={s.logoutBtn} onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </aside>

      {menuOpen && <div style={s.overlay} onClick={() => setMenuOpen(false)} />}

      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <div style={s.pageTitle}>San Isidro Digital</div>
            <div style={s.pageSub}>Sistema Integral de Atención Comunal</div>
          </div>
          <div style={s.topbarRight}>
            <button style={s.perfilBtn} onClick={() => navigate('/perfil')}>
              👤 {user?.nombre}
            </button>
            <button style={s.logoutBtnTop} onClick={handleLogout}>Cerrar</button>
          </div>
        </div>
        <div style={s.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
