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
    const { nombre, telefono, cedula, tipo, descripcion } = req.body
    const solicitud = await req.prisma.solicitud.create({
      data: { nombre, telefono, cedula, tipo, descripcion }
    })
    res.status(201).json(solicitud)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const { estado, nombre, telefono, cedula, tipo, descripcion } = req.body
    
    const dataToUpdate = {}
    if (estado !== undefined) dataToUpdate.estado = estado
    if (nombre !== undefined) dataToUpdate.nombre = nombre
    if (telefono !== undefined) dataToUpdate.telefono = telefono
    if (cedula !== undefined) dataToUpdate.cedula = cedula
    if (tipo !== undefined) dataToUpdate.tipo = tipo
    if (descripcion !== undefined) dataToUpdate.descripcion = descripcion

    const solicitud = await req.prisma.solicitud.update({
      where: { id: parseInt(req.params.id) },
      data: dataToUpdate
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
