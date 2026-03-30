import { Router } from 'express'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const proyectos = await req.prisma.proyecto.findMany({
      orderBy: { fecha: 'desc' }
    })
    res.json(proyectos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { titulo, descripcion, tipo, sector, estado } = req.body
    const proyecto = await req.prisma.proyecto.create({
      data: { titulo, descripcion, tipo, sector, estado }
    })
    res.status(201).json(proyecto)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const { estado } = req.body
    const proyecto = await req.prisma.proyecto.update({
      where: { id: parseInt(req.params.id) },
      data: { estado }
    })
    res.json(proyecto)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await req.prisma.proyecto.delete({
      where: { id: parseInt(req.params.id) }
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
