import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Solicitudes from './pages/Solicitudes'
import RecursosClap from './pages/Recursos_clap'
import Emprendimientos from './pages/Emprendimientos'
import Proyectos from './pages/Proyectos'
import Usuarios from './pages/Usuarios'
import Chatbot from './pages/Chatbot'
import Perfil from './pages/Perfil'
import Gas from './pages/Gas'
import Asambleas from './pages/Asambleas'
import Salud from './pages/Salud'
import Noticias from './pages/Noticias'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  if (!token) {
    window.location.replace('/portal.html')
    return null
  }
  return children
}

function AdminRoute({ children }) {
  const { token, isAdmin } = useAuth()
  return token && isAdmin ? children : <Navigate to="/" />
}

function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="solicitudes" element={<Solicitudes />} />
        <Route path="clap" element={<RecursosClap />} />
        <Route path="gas" element={<Gas />} />
        <Route path="salud" element={<Salud />} />
        <Route path="asambleas" element={<Asambleas />} />
        <Route path="usuarios" element={
          <AdminRoute><Usuarios /></AdminRoute>
        } />
        <Route path="emprendimientos" element={
          <AdminRoute><Emprendimientos /></AdminRoute>
        } />
        <Route path="proyectos" element={
          <AdminRoute><Proyectos /></AdminRoute>
        } />
        <Route path="noticias" element={
          <AdminRoute><Noticias /></AdminRoute>
        } />
        <Route path="perfil" element={<Perfil />} />
        <Route path="chatbot" element={<Chatbot />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
