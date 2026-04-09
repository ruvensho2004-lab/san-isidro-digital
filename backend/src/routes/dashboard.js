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

    // Actividad reciente — últimos 5 registros de cada módulo
    const [solicitudesRecientes, clapRecientes, proyectosRecientes] = await Promise.all([
      req.prisma.solicitud.findMany({ orderBy: { fecha: 'desc' }, take: 5, select: { id: true, nombre: true, tipo: true, estado: true, fecha: true } }),
      req.prisma.recursoClap.findMany({ orderBy: { fecha: 'desc' }, take: 5, select: { id: true, nombre: true, tipo: true, fecha: true } }),
      req.prisma.proyecto.findMany({ orderBy: { fecha: 'desc' }, take: 5, select: { id: true, titulo: true, tipo: true, estado: true, fecha: true } }),
    ])

    const actividad = [
      ...solicitudesRecientes.map(s => ({ tipo: 'solicitud', icono: '📋', titulo: s.nombre, subtitulo: s.tipo, estado: s.estado, fecha: s.fecha })),
      ...clapRecientes.map(c => ({ tipo: 'clap', icono: '📦', titulo: c.nombre, subtitulo: c.tipo, estado: null, fecha: c.fecha })),
      ...proyectosRecientes.map(p => ({ tipo: 'proyecto', icono: '🏘', titulo: p.titulo, subtitulo: p.tipo, estado: p.estado, fecha: p.fecha })),
    ]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 8)

    res.json({
      solicitudesActivas: solicitudes,
      recursosClap: clap,
      emprendimientosActivos: emprendimientos,
      beneficiarios,
      inversionTotal: inversionTotal._sum.inversion || 0,
      actividad
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router