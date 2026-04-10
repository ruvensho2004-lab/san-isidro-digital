import { Router } from 'express'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const recursos = await req.prisma.recursoClap.findMany({
      orderBy: { fecha: 'desc' }
    })
    res.json(recursos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { nombre, cedula, tipo, cantidad, observaciones } = req.body
    const recurso = await req.prisma.recursoClap.create({
      data: { nombre, cedula, tipo, cantidad, observaciones }
    })
    res.status(201).json(recurso)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const { estado, pagado } = req.body
    const data = {}
    if (estado !== undefined) data.estado = estado
    if (pagado !== undefined) data.pagado = pagado

    const recurso = await req.prisma.recursoClap.update({
      where: { id: parseInt(req.params.id) },
      data
    })
    res.json(recurso)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await req.prisma.recursoClap.delete({
      where: { id: parseInt(req.params.id) }
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
