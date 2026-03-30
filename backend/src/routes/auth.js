import { Router } from 'express'
import { signToken, hashPassword, comparePassword, authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { email, password, rol, cedula, nombre, apellido, telefono, direccion } = req.body
    if (!email || !password || !cedula || !nombre || !rol) {
      return res.status(400).json({ error: 'Email, password, cédula, nombre y rol son requeridos' })
    }
    const hashed = await hashPassword(password)
    const usuario = await req.prisma.usuario.create({
      data: { email, password: hashed, rol, cedula, nombre, apellido, telefono, direccion }
    })
    res.status(201).json({ id: usuario.id, email: usuario.email, rol: usuario.rol, cedula: usuario.cedula, nombre: usuario.nombre, apellido: usuario.apellido, telefono: usuario.telefono, direccion: usuario.direccion })
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El email o cédula ya están registrados' })
    }
    res.status(500).json({ error: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' })
    }
    const usuario = await req.prisma.usuario.findUnique({ where: { email } })
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }
    if (!usuario.activo) {
      return res.status(401).json({ error: 'Usuario desactivado' })
    }
    const valid = await comparePassword(password, usuario.password)
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }
    const token = signToken({ id: usuario.id, email: usuario.email, rol: usuario.rol })
    res.json({ 
      token, 
      usuario: { 
        id: usuario.id, 
        email: usuario.email, 
        rol: usuario.rol, 
        cedula: usuario.cedula,
        nombre: usuario.nombre, 
        apellido: usuario.apellido,
        telefono: usuario.telefono,
        direccion: usuario.direccion
      } 
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/cambiar-password', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    }
    const hashed = await hashPassword(password)
    await req.prisma.usuario.update({
      where: { id: req.user.id },
      data: { password: hashed }
    })
    res.json({ message: 'Contraseña actualizada' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
