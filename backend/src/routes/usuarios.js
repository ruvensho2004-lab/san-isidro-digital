import { Router } from 'express'
import { hashPassword } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const usuarios = await req.prisma.usuario.findMany({
      select: { id: true, email: true, rol: true, cedula: true, nombre: true, apellido: true, telefono: true, direccion: true, activo: true, createdAt: true }
    })
    res.json(usuarios)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { email, password, rol, cedula, nombre, apellido, telefono, direccion } = req.body
    if (!email || !password || !cedula || !nombre || !rol) {
      return res.status(400).json({ error: 'Email, password, cédula, nombre y rol son requeridos' })
    }
    const hashed = await hashPassword(password)
    const usuario = await req.prisma.usuario.create({
      data: { email, password: hashed, rol, cedula, nombre, apellido, telefono, direccion }
    })
    const { password: _, ...userWithoutPassword } = usuario
    res.status(201).json(userWithoutPassword)
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El email o cédula ya están registrados' })
    }
    res.status(500).json({ error: error.message })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { activo, rol, telefono, direccion } = req.body
    const data = {}
    if (activo !== undefined) data.activo = activo
    if (rol) data.rol = rol
    if (telefono !== undefined) data.telefono = telefono
    if (direccion !== undefined) data.direccion = direccion

    const usuario = await req.prisma.usuario.update({
      where: { id: parseInt(id) },
      data,
      select: { id: true, email: true, rol: true, cedula: true, nombre: true, apellido: true, telefono: true, direccion: true, activo: true }
    })
    res.json(usuario)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await req.prisma.usuario.delete({ where: { id: parseInt(req.params.id) } })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
