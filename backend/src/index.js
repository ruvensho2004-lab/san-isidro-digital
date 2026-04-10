import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, adminOnly } from './middleware/auth.js'
import authRouter from './routes/auth.js'
import usuariosRouter from './routes/usuarios.js'
import solicitudesRouter from './routes/solicitudes.js'
import clapRouter from './routes/clap.js'
import emprendimientosRouter from './routes/emprendimientos.js'
import proyectosRouter from './routes/proyectos.js'
import beneficiariosRouter from './routes/beneficiarios.js'
import dashboardRouter from './routes/dashboard.js'
import gasRouter from './routes/gas.js'
import asambleasRouter from './routes/asambleas.js'
import saludRouter from './routes/salud.js'
import noticiasRouter from './routes/noticias.js'
import publicRouter from './routes/public.js'
import aiRouter from './routes/ai.js'

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

// Test route
app.get('/api/test', (req, res) => res.json({ok: true}))

// Seed admin user on startup
;(async () => {
  try {
    const existing = await prisma.usuario.findUnique({ where: { email: 'admin@sanisidro.gob.ve' } })
    if (!existing) {
      const hashed = await bcrypt.hash('admin123', 10)
      await prisma.usuario.create({
        data: { email: 'admin@sanisidro.gob.ve', password: hashed, nombre: 'Administrador', rol: 'administrador', cedula: 'V-00000000', activo: true }
      })
      console.log('✅ Admin user created')
    }
  } catch(e) { console.log('Admin seed:', e.message) }
})()

app.use((req, res, next) => {
  req.prisma = prisma
  next()
})

app.use('/api/auth', authRouter)
app.use('/api/usuarios', authMiddleware, adminOnly, usuariosRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/solicitudes', authMiddleware, solicitudesRouter)
app.use('/api/clap', authMiddleware, clapRouter)
app.use('/api/emprendimientos', authMiddleware, adminOnly, emprendimientosRouter)
app.use('/api/proyectos', authMiddleware, adminOnly, proyectosRouter)
app.use('/api/beneficiarios', authMiddleware, adminOnly, beneficiariosRouter)
app.use('/api/dashboard', authMiddleware, dashboardRouter)
app.use('/api/gas', authMiddleware, adminOnly, gasRouter)
app.use('/api/asambleas', authMiddleware, adminOnly, asambleasRouter)
app.use('/api/salud', authMiddleware, adminOnly, saludRouter)
app.use('/api/noticias', noticiasRouter) // auth handled inside specific routes
app.use('/api/public', publicRouter)
app.use('/api/ai', authMiddleware, aiRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit()
})
