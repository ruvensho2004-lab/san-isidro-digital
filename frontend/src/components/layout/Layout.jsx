import { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⊞', section: 'Atención Comunal' },
  { to: '/solicitudes', label: 'Solicitudes', icon: '📋', section: 'Atención Comunal' },
  { to: '/clap', label: 'Recursos CLAP', icon: '📦', section: 'Atención Comunal' },
  { to: '/gas', label: 'Gas Comunal', icon: '🛢️', section: 'Atención Comunal' },
  { to: '/salud', label: 'Casos Médicos', icon: '🚑', section: 'Atención Comunal' },
  { to: '/asambleas', label: 'Asambleas', icon: '🏛️', section: 'Organización' },
  { to: '/proyectos', label: 'Proyectos', icon: '🏘', section: 'Organización', adminOnly: true },
  { to: '/emprendimientos', label: 'Emprendimientos', icon: '💡', section: 'Organización', adminOnly: true },
  { to: '/noticias', label: 'Cartelera', icon: '📰', section: 'Difusión', adminOnly: true },
  { to: '/usuarios', label: 'Usuarios y Censo', icon: '👥', section: 'Admin', adminOnly: true },
]

export default function Layout() {
  const navigate = useNavigate()
  const { user, logout, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const filteredItems = navItems.filter(i => !i.adminOnly || isAdmin)
  const sections = [...new Set(filteredItems.map(i => i.section))]

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-layout" style={{ display: 'flex', height: '100vh', background: '#0d0b1a', color: '#e8e4ff', fontFamily: "'Sora', sans-serif" }}>
      {/* Sidebar Dark/Purple */}
      <aside className={`app-sidebar ${menuOpen ? 'open' : ''}`} style={{ width: 260, background: '#13102a', borderRight: '1px solid rgba(120,100,255,0.18)', display: 'flex', flexDirection: 'column', flexShrink: 0, boxShadow: '2px 0 10px rgba(0,0,0,0.2)', zIndex: 50 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #7c5cfc, #38bdf8)' }} />
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(120,100,255,0.18)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, #7c5cfc, #4f3bb8)', borderRadius: 12, padding: '10px 14px', marginBottom: 0, boxShadow: '0 4px 15px rgba(124,92,252,0.3)', flex: 1 }}>
            <span style={{ fontSize: 24 }}>🏛️</span>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>San Isidro<br/>Digital</div>
          </div>
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#a89fc7', fontSize: 28, cursor: 'pointer', marginLeft: 10 }}>×</button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {sections.map(section => (
            <div key={section} style={{ padding: '12px 12px 4px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#6b61a0', letterSpacing: 1.5, textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>{section}</div>
              {filteredItems.filter(i => i.section === section).map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => { if(window.innerWidth <= 768) setMenuOpen(false) }}
                  end={item.to === '/'}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, cursor: 'pointer', color: '#a89fc7', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all .2s', marginBottom: 2,
                    ...(isActive ? { background: 'linear-gradient(90deg, rgba(124,92,252,0.25), rgba(124,92,252,0.05))', color: '#a78bfa', borderLeft: '3px solid #7c5cfc' } : {})
                  })}
                >
                  <span style={{ width: 18, textAlign: 'center', flexShrink: 0, fontSize: 15 }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: 16 }}>
          <button style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #7c5cfc, #38bdf8)', color: '#fff', fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 8, boxShadow: '0 4px 10px rgba(124,92,252,0.2)' }} onClick={() => navigate('/chatbot')}>
            ✨ Asistente IA
          </button>
          <button style={{ width: '100%', padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(244,114,182,0.3)', background: 'rgba(244,114,182,0.1)', color: '#f472b6', fontSize: 12, fontWeight: 600, cursor: 'pointer' }} onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(120,100,255,0.18)', flexShrink: 0, background: 'rgba(13,11,26,0.8)', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: '#e8e4ff', fontSize: 24, cursor: 'pointer' }}>
              ☰
            </button>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#e8e4ff' }}>San Isidro Digital</div>
              <div className="mobile-hide" style={{ fontSize: 12, color: '#a89fc7', marginTop: 2 }}>Plataforma Integral de Gestión Comunal</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ background: '#1e1a3a', border: '1px solid rgba(120,100,255,0.18)', borderRadius: 20, color: '#e8e4ff', fontSize: 12, fontWeight: 600, padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => navigate('/perfil')}>
              👤 {user?.nombre || 'Administrador'}
            </button>
          </div>
        </div>
        {/* View content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
