const API = 'https://san-isidro-digital.onrender.com/api'

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
}
