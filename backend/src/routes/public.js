import { Router } from 'express'

const router = Router()

// GET /api/public/consulta/:cedula
// Busca en Solicitud, RecursoClap y Emprendimiento por número de cédula
router.get('/consulta/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params

    const solicitudes = await req.prisma.solicitud.findMany({
      where: { cedula }
    })

    const clap = await req.prisma.recursoClap.findMany({
      where: { cedula }
    })

    const emprendimientos = await req.prisma.emprendimiento.findMany({
      where: { cedula }
    })

    // Devolvemos todo junto
    res.json({
      solicitudes,
      clap,
      emprendimientos
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/public/contacto
// Recibe un formulario público y crea una Solicitud
router.post('/contacto', async (req, res) => {
  try {
    const { nombre, cedula, telefono, email, tipo, descripcion } = req.body

    // Concatenamos el email dentro de la descripción ya que no hay campo email en Solicitud
    const descExtendida = email ? `Correo: ${email}\n\n${descripcion}` : descripcion

    const nuevaSolicitud = await req.prisma.solicitud.create({
      data: {
        nombre,
        cedula,
        telefono,
        tipo,
        descripcion: descExtendida
      }
    })

    res.status(201).json(nuevaSolicitud)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})
// POST /api/public/chat
// Consulta de la IA publica
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'LLave API ausente en el servidor' });

    // Modificar siempre el System Prompt público por seguridad
    const PUBLIC_PROMPT = 'Eres el Asistente del Portal del Consejo Comunal San Isidro. Debes responder SOLO preguntas relacionadas al portal, trámites comunales, CLAP y servicios locales. Debes ser formal, conciso y orientar a que hagan uso de nuestras interfaces. Si te preguntan algo aleatorio, recuerda tu rol.';
    
    // Quitar todos los system prompt mandados por el frontend por seguridad
    const safeMessages = messages.filter(m => m.role !== 'system');
    // Pre-pender el nuestro
    safeMessages.unshift({ role: 'system', content: PUBLIC_PROMPT });

    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: safeMessages,
        max_tokens: 400
      })
    });

    const data = await resp.json();
    if (!resp.ok) return res.status(400).json({ error: data.error?.message || 'Error AI' });

    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

export default router
