import { Router } from 'express'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const [solicitudes, clap, emprendimientos, beneficiarios] = await Promise.all([
      req.prisma.solicitud.count({ where: { estado: 'Pendiente' } }),
      req.prisma.recursoClap.count(),
      req.prisma.emprendimiento.count({ where: { estado: 'Activo' } }),
      req.prisma.beneficiario.count()
    ])

    const inversionTotal = await req.prisma.emprendimiento.aggregate({
      _sum: { inversion: true }
    })

    res.json({
      solicitudesActivas: solicitudes,
      recursosClap: clap,
      emprendimientosActivos: emprendimientos,
      beneficiarios,
      inversionTotal: inversionTotal._sum.inversion || 0
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
