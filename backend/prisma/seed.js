import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@sanisidro.gob.ve'
  const password = 'admin123'
  const nombre = 'Administrador'
  const rol = 'admin'
  const cedula = 'V-00000000'

  const existing = await prisma.usuario.findUnique({ where: { email } })
  if (existing) {
    console.log('Usuario admin ya existe')
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.usuario.create({
    data: { email, password: hashed, nombre, rol, cedula }
  })
  console.log('Usuario admin creado:')
  console.log('  Email:', email)
  console.log('  Password:', password)
  console.log('  (Cambia la contraseña después del primer login)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
