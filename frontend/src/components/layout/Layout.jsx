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

  const filteredItems = navItems.filter(i => !i.adminOnly || isAdmin)
  const sections = [...new Set(filteredItems.map(i => i.section))]

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0d0b1a', color: '#e8e4ff', fontFamily: "'Sora', sans-serif" }}>
      <aside style={{ width: 260, background: 'linear-gradient(180deg,#1a1040 0%,#0d0b1a 100%)', borderRight: '1px solid rgba(120,100,255,0.18)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#7c5cfc,#38bdf8)' }} />
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(120,100,255,0.18)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#7c5cfc,#4f3bb8)', borderRadius: 12, padding: '10px 14px', marginBottom: 12, boxShadow: '0 4px 20px rgba(124,92,252,0.3)' }}>
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="rgba(255,255,255,0.1)"/>
              <path d="M7 14h14M14 7v14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="14" cy="14" r="4" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
            </svg>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>San Isidro<br/>Digital</div>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {sections.map(section => (
            <div key={section} style={{ padding: '12px 12px 4px' }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#6b61a0', letterSpacing: 2, textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>{section}</div>
              {filteredItems.filter(i => i.section === section).map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, cursor: 'pointer', color: '#a89fc7', fontSize: 12.5, fontWeight: 500, textDecoration: 'none', transition: 'all .2s', marginBottom: 2,
                    ...(isActive ? { background: 'linear-gradient(90deg,rgba(124,92,252,0.25),rgba(124,92,252,0.05))', color: '#a78bfa', borderLeft: '3px solid #7c5cfc' } : {})
                  })}
                >
                  <span style={{ width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: 16 }}>
          <button style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c5cfc,#38bdf8)', color: '#fff', fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 600, marginBottom: 8 }} onClick={() => navigate('/chatbot')}>
            ✨ Asistente Virtual
          </button>
          <button style={{ width: '100%', padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(120,100,255,0.3)', background: 'transparent', color: '#a89fc7', fontSize: 12, cursor: 'pointer' }} onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(120,100,255,0.18)', flexShrink: 0, background: 'rgba(13,11,26,0.8)' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#e8e4ff' }}>San Isidro Digital</div>
            <div style={{ fontSize: 12, color: '#a89fc7', marginTop: 2 }}>Sistema Integral de Atención Comunal</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ background: 'rgba(124,92,252,0.15)', border: '1px solid rgba(124,92,252,0.3)', borderRadius: 8, color: '#a78bfa', fontSize: 12, padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => navigate('/perfil')}>
              👤 {user?.nombre}
            </button>
            <button style={{ background: 'transparent', border: '1px solid rgba(120,100,255,0.3)', borderRadius: 8, color: '#a89fc7', fontSize: 12, padding: '6px 14px', cursor: 'pointer' }} onClick={handleLogout}>
              Cerrar
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
