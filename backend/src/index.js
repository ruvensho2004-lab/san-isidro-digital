import express from 'express'
import cors from 'cors'
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

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit()
})
