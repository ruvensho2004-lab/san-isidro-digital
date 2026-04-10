import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
const router = Router()

// ENDPOINT PÚBLICO - No requiere autenticación
router.get('/public', async (req, res) => {
  try {
    const records = await req.prisma.noticia.findMany({
      where: { activa: true },
      orderBy: { fecha: 'desc' },
      take: 6 // Mostrar solo las ultimas 6 en el portal
    })
    res.json(records)
  } catch (error) { res.status(500).json({ error: error.message }) }
})

// ENDPOINTS PROTEGIDOS (Requieren estar registrado y ser Admin)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const records = await req.prisma.noticia.findMany({ orderBy: { fecha: 'desc' } })
    res.json(records)
  } catch (error) { res.status(500).json({ error: error.message }) }
})

router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const data = await req.prisma.noticia.create({ data: req.body })
    res.status(201).json(data)
  } catch (error) { res.status(400).json({ error: error.message }) }
})

router.patch('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const data = await req.prisma.noticia.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })
    res.json(data)
  } catch (error) { res.status(400).json({ error: error.message }) }
})

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await req.prisma.noticia.delete({ where: { id: Number(req.params.id) } })
    res.json({ success: true })
  } catch (error) { res.status(400).json({ error: error.message }) }
})

export default router
