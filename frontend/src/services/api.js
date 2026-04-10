const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API}${path}`, {
    headers,
    ...options,
  })
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    const err = await res.json().catch(() => ({ error: 'Error' }))
    throw new Error(err.error)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  auth: {
    login: (data) => fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  },
  usuarios: {
    list: () => request('/usuarios'),
    create: (data) => request('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/usuarios/${id}`, { method: 'DELETE' }),
  },
  dashboard: () => request('/dashboard'),
  solicitudes: {
    list: () => request('/solicitudes'),
    create: (data) => request('/solicitudes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/solicitudes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/solicitudes/${id}`, { method: 'DELETE' }),
  },
  clap: {
    list: () => request('/clap'),
    create: (data) => request('/clap', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/clap/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/clap/${id}`, { method: 'DELETE' }),
  },
  emprendimientos: {
    list: () => request('/emprendimientos'),
    create: (data) => request('/emprendimientos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/emprendimientos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/emprendimientos/${id}`, { method: 'DELETE' }),
  },
  proyectos: {
    list: () => request('/proyectos'),
    create: (data) => request('/proyectos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/proyectos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/proyectos/${id}`, { method: 'DELETE' }),
  },
  beneficiarios: {
    list: () => request('/beneficiarios'),
    create: (data) => request('/beneficiarios', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/beneficiarios/${id}`, { method: 'DELETE' }),
  },
  gas: {
    list: () => request('/gas'),
    create: (data) => request('/gas', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/gas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/gas/${id}`, { method: 'DELETE' })
  },
  asambleas: {
    list: () => request('/asambleas'),
    create: (data) => request('/asambleas', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/asambleas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/asambleas/${id}`, { method: 'DELETE' })
  },
  salud: {
    list: () => request('/salud'),
    create: (data) => request('/salud', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/salud/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/salud/${id}`, { method: 'DELETE' })
  },
  noticias: {
    listPublic: () => fetch(`${API}/noticias/public`).then(r => r.json()),
    list: () => request('/noticias'),
    create: (data) => request('/noticias', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/noticias/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/noticias/${id}`, { method: 'DELETE' })
  },
  ai: {
    chat: (data) => request('/ai/chat', { method: 'POST', body: JSON.stringify(data) })
  },
  public: {
    chat: (data) => fetch(`${API}/public/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json())
  }
}
