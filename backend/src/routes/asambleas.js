import { Router } from 'express'
const router = Router()

router.get('/', async (req, res) => {
  try {
    const records = await req.prisma.asamblea.findMany({ orderBy: { fecha: 'desc' } })
    res.json(records)
  } catch (error) { res.status(500).json({ error: error.message }) }
})

router.post('/', async (req, res) => {
  try {
    const { motivo, asistentes, acuerdos, vocero, enlaceActa } = req.body
    
    const data = await req.prisma.asamblea.create({ 
      data: { motivo, asistentes: Number(asistentes), acuerdos, vocero, enlaceActa }
    })

    // Automaticamente crear una noticia en la cartelera
    await req.prisma.noticia.create({
      data: {
        titulo: `Acuerdos de Asamblea: ${motivo}`,
        contenido: `Se realizó una asamblea comunitaria con ${asistentes} participantes. Acuerdos principales: ${acuerdos}`,
        tipo: 'Asamblea',
        activa: true
      }
    })

    res.status(201).json(data)
  } catch (error) { res.status(400).json({ error: error.message }) }
})

router.patch('/:id', async (req, res) => {
  try {
    const data = await req.prisma.asamblea.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })
    res.json(data)
  } catch (error) { res.status(400).json({ error: error.message }) }
})

router.delete('/:id', async (req, res) => {
  try {
    await req.prisma.asamblea.delete({ where: { id: Number(req.params.id) } })
    res.json({ success: true })
  } catch (error) { res.status(400).json({ error: error.message }) }
})

export default router
