import { Router } from 'express'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const emprendimientos = await req.prisma.emprendimiento.findMany({
      orderBy: { fecha: 'desc' }
    })
    res.json(emprendimientos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { nombre, responsable, categoria, descripcion, estado, inversion } = req.body
    const emprendimiento = await req.prisma.emprendimiento.create({
      data: { nombre, responsable, categoria, descripcion, estado, inversion }
    })
    res.status(201).json(emprendimiento)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const { estado } = req.body
    const emprendimiento = await req.prisma.emprendimiento.update({
      where: { id: parseInt(req.params.id) },
      data: { estado }
    })
    res.json(emprendimiento)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await req.prisma.emprendimiento.delete({
      where: { id: parseInt(req.params.id) }
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
