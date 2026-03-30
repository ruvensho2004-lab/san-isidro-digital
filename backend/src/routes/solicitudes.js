import { Router } from 'express'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const solicitudes = await req.prisma.solicitud.findMany({
      orderBy: { fecha: 'desc' }
    })
    res.json(solicitudes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const solicitud = await req.prisma.solicitud.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    if (!solicitud) return res.status(404).json({ error: 'No encontrada' })
    res.json(solicitud)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { nombre, telefono, tipo, descripcion } = req.body
    const solicitud = await req.prisma.solicitud.create({
      data: { nombre, telefono, tipo, descripcion }
    })
    res.status(201).json(solicitud)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const { estado } = req.body
    const solicitud = await req.prisma.solicitud.update({
      where: { id: parseInt(req.params.id) },
      data: { estado }
    })
    res.json(solicitud)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await req.prisma.solicitud.delete({
      where: { id: parseInt(req.params.id) }
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
