import { Router } from 'express'
const router = Router()

router.get('/', async (req, res) => {
  try {
    const records = await req.prisma.gasComunal.findMany({ orderBy: { fecha: 'desc' } })
    res.json(records)
  } catch (error) { res.status(500).json({ error: error.message }) }
})

router.post('/', async (req, res) => {
  try {
    const data = await req.prisma.gasComunal.create({ data: req.body })
    res.status(201).json(data)
  } catch (error) { res.status(400).json({ error: error.message }) }
})

router.patch('/:id', async (req, res) => {
  try {
    const data = await req.prisma.gasComunal.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })
    res.json(data)
  } catch (error) { res.status(400).json({ error: error.message }) }
})

router.delete('/:id', async (req, res) => {
  try {
    await req.prisma.gasComunal.delete({ where: { id: Number(req.params.id) } })
    res.json({ success: true })
  } catch (error) { res.status(400).json({ error: error.message }) }
})

export default router
