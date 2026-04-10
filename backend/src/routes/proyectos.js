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
    const { titulo, descripcion, tipo, sector, estado, presupuesto } = req.body
    const proyecto = await req.prisma.proyecto.create({
      data: { titulo, descripcion, tipo, sector, estado, presupuesto }
    })
    res.status(201).json(proyecto)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const { estado, titulo, descripcion, tipo, sector, presupuesto } = req.body
    const data = {}
    if (estado !== undefined) data.estado = estado
    if (titulo !== undefined) data.titulo = titulo
    if (descripcion !== undefined) data.descripcion = descripcion
    if (tipo !== undefined) data.tipo = tipo
    if (sector !== undefined) data.sector = sector
    if (presupuesto !== undefined) data.presupuesto = presupuesto

    const proyecto = await req.prisma.proyecto.update({
      where: { id: parseInt(req.params.id) },
      data
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
