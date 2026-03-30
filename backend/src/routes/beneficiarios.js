import { Router } from 'express'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const beneficiarios = await req.prisma.beneficiario.findMany({
      orderBy: { fecha: 'desc' }
    })
    res.json(beneficiarios)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { nombre, cedula, telefono, direccion } = req.body
    const beneficiario = await req.prisma.beneficiario.create({
      data: { nombre, cedula, telefono, direccion }
    })
    res.status(201).json(beneficiario)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await req.prisma.beneficiario.delete({
      where: { id: parseInt(req.params.id) }
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
