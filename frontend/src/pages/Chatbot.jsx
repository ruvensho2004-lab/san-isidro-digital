import { useState, useRef, useEffect } from 'react'

const respuestas = [
  {
    palabras: ['hola', 'buenas', 'saludos', 'buenos dias', 'buenas tardes', 'buenas noches'],
    resp: '¡Hola! Bienvenido/a al Asistente Virtual de San Isidro Digital 👋\n\nPuedo orientarte sobre:\n• 📋 Solicitudes Ciudadanas\n• 📦 Recursos CLAP\n• 💡 Emprendimientos Sociales\n• 🏘 Proyectos Comunitarios\n• 🎓 Capacitación Técnica\n• ❤️ Salud Comunitaria\n\n¿En qué puedo ayudarte?',
  },
  {
    palabras: ['solicitud', 'tramite', 'trámite', 'peticion', 'petición', 'queja', 'reclamo'],
    resp: '📋 Solicitudes Ciudadanas\n\nPara registrar una solicitud:\n1. Ve al menú → Solicitudes Ciudadanas\n2. Haz clic en "+ Nueva Solicitud"\n3. Completa tu nombre, tipo y descripción\n4. Haz clic en "Registrar Solicitud"\n\nTipos disponibles: Trámite Administrativo, Ayuda Social, Reclamo de Servicio, Información General y Proyecto de Mejora.',
  },
  {
    palabras: ['clap', 'caja', 'alimento', 'comida', 'bolsa', 'beneficio', 'medicamento'],
    resp: '📦 Recursos CLAP\n\nEl programa CLAP ofrece:\n• Caja CLAP Alimentaria\n• Kit de Medicamentos\n• Material Escolar\n• Apoyo Económico\n\nPara registrarte ve al menú → Recursos CLAP y haz clic en "+ Registrar Recurso".\n\nPara más información llama al 0800-SANISIDRO.',
  },
  {
    palabras: ['emprendimiento', 'negocio', 'empresa', 'emprender', 'microempresa'],
    resp: '💡 Emprendimientos Sociales\n\nApoyamos negocios con impacto comunitario en:\n• Alimentos y Bebidas\n• Artesanía\n• Servicios Tecnológicos\n• Salud y Bienestar\n• Educación\n• Agricultura Urbana\n\nVe al menú → Emprendimientos y registra tu proyecto.',
  },
  {
    palabras: ['proyecto', 'comunidad', 'comunitario', 'sector', 'infraestructura', 'obra'],
    resp: '🏘 Proyectos Comunitarios\n\nTipos de proyectos:\n• Infraestructura\n• Ambiente y Ecología\n• Educación Comunitaria\n• Salud Pública\n• Cultura y Recreación\n\nVe al menú → Proyectos Comunitarios y registra tu propuesta.',
  },
  {
    palabras: ['capacitacion', 'capacitación', 'curso', 'taller', 'aprender', 'formacion'],
    resp: '🎓 Capacitación Técnica\n\nOfrecemos tres líneas de formación:\n\n💻 Tecnología Digital\nOfimática, redes sociales, emprendimiento digital\n\n🧵 Oficios y Artesanía\nCostura, carpintería, gastronomía\n\n📊 Gestión y Liderazgo\nAdministración básica, liderazgo comunitario\n\nLos cursos son gratuitos para residentes de San Isidro.',
  },
  {
    palabras: ['salud', 'medico', 'médico', 'doctor', 'emergencia', 'ambulatorio', 'vacuna'],
    resp: '❤️ Salud Comunitaria\n\nPróximas jornadas:\n• Vacunación General — 15 Abril\n• Consulta Odontológica — 22 Abril\n• Taller de Salud Mental — 28 Abril\n\nContactos:\n• Ambulatorio San Isidro: 0212-555-0001\n• Emergencias: 171\n• Línea Social: 0800-SANISIDRO',
  },
  {
    palabras: ['horario', 'atencion', 'atención', 'hora', 'abierto'],
    resp: '🕐 Horarios de Atención\n\nLunes a Viernes: 8:00 AM – 12:00 PM y 2:00 PM – 5:00 PM\nSábados: 8:00 AM – 12:00 PM\nDomingos y feriados: Cerrado\n\nEste portal digital está disponible las 24 horas.',
  },
  {
    palabras: ['requisito', 'documento', 'cedula', 'cédula', 'que necesito', 'qué necesito'],
    resp: '📄 Documentos Requeridos\n\nPara trámites generales:\n• Cédula de identidad (original y copia)\n• Carta de residencia del sector\n\nPara CLAP además:\n• Comprobante de vivienda\n• Constancia de carga familiar\n\nPara emprendimientos:\n• Descripción del proyecto\n• Cédula del responsable',
  },
  {
    palabras: ['gracias', 'muchas gracias', 'perfecto', 'excelente', 'genial'],
    resp: '¡Con mucho gusto! 😊\n\nRecuerda que puedes usar este portal para registrar solicitudes, consultar beneficios e inscribirte en talleres.\n\n¡Que tengas un excelente día! 🌟',
  },
]

function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function responderLocal(texto) {
  const t = normalizar(texto)
  for (const r of respuestas) {
    if (r.palabras.some(p => t.includes(normalizar(p)))) {
      return r.resp
    }
  }
  return 'No encontré información específica sobre eso.\n\nPuedes preguntarme sobre: solicitudes, CLAP, emprendimientos, proyectos, capacitación, salud u horarios.\n\nO visita la sede del Consejo Comunal San Isidro en horario de atención.'
}

export default function Chatbot() {
  const [mensajes, setMensajes] = useState([
    {
      rol: 'bot',
      texto: '¡Hola! Soy el Asistente Virtual de San Isidro Digital.\n\nFunciono sin internet, así que puedo ayudarte siempre. Pregúntame sobre solicitudes, CLAP, emprendimientos, proyectos, capacitación o salud. 😊',
    },
  ])
  const [input, setInput] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, escribiendo])

  function enviar() {
    const texto = input.trim()
    if (!texto) return
    setInput('')

    const nuevosMensajes = [...mensajes, { rol: 'user', texto }]
    setMensajes(nuevosMensajes)
    setEscribiendo(true)

    setTimeout(() => {
      const respuesta = responderLocal(texto)
      setMensajes([...nuevosMensajes, { rol: 'bot', texto: respuesta }])
      setEscribiendo(false)
    }, 800)
  }

  function handleKey(e) {
    if (e.key === 'Enter') enviar()
  }

  return (
    <div style={s.wrap}>

      {/* Header */}
      <div style={s.header}>
        <h2 style={s.titulo}>✨ Asistente Virtual</h2>
        <div style={s.badge}>Sin conexión a internet 🟢</div>
      </div>

      {/* Mensajes */}
      <div style={s.chatBox}>
        {mensajes.map((msg, i) => (
          <div key={i} style={{ ...s.msgRow, justifyContent: msg.rol === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.rol === 'bot' && <div style={s.avatarBot}>🤖</div>}
            <div style={msg.rol === 'user' ? s.bubbleUser : s.bubbleBot}>
              {msg.texto.split('\n').map((linea, j) => (
                <span key={j}>{linea}<br /></span>
              ))}
            </div>
            {msg.rol === 'user' && <div style={s.avatarUser}>👤</div>}
          </div>
        ))}

        {/* Escribiendo */}
        {escribiendo && (
          <div style={{ ...s.msgRow, justifyContent: 'flex-start' }}>
            <div style={s.avatarBot}>🤖</div>
            <div style={s.bubbleBot}>
              <div style={s.typing}>
                <span style={{ ...s.dot, animationDelay: '0s' }} />
                <span style={{ ...s.dot, animationDelay: '.15s' }} />
                <span style={{ ...s.dot, animationDelay: '.3s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={s.inputRow}>
        <input
          style={s.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escribe tu pregunta aquí..."
        />
        <button style={s.sendBtn} onClick={enviar}>➤</button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}

const s = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 130px)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  titulo: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#e8e4ff',
  },
  badge: {
    fontSize: '12px',
    color: '#34d399',
    background: 'rgba(52,211,153,0.1)',
    border: '1px solid rgba(52,211,153,0.3)',
    padding: '4px 12px',
    borderRadius: '20px',
  },
  chatBox: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    paddingBottom: '12px',
  },
  msgRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
  },
  avatarBot: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#7c5cfc,#38bdf8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
  },
  avatarUser: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: '#252048',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
  },
  bubbleBot: {
    background: '#252048',
    border: '1px solid rgba(120,100,255,0.18)',
    borderBottomLeftRadius: '4px',
    borderTopLeftRadius: '14px',
    borderTopRightRadius: '14px',
    borderBottomRightRadius: '14px',
    padding: '12px 16px',
    fontSize: '13px',
    lineHeight: 1.6,
    color: '#e8e4ff',
    maxWidth: '80%',
  },
  bubbleUser: {
    background: 'linear-gradient(135deg,#7c5cfc,#4f3bb8)',
    borderBottomRightRadius: '4px',
    borderTopLeftRadius: '14px',
    borderTopRightRadius: '14px',
    borderBottomLeftRadius: '14px',
    padding: '12px 16px',
    fontSize: '13px',
    lineHeight: 1.6,
    color: '#fff',
    maxWidth: '80%',
  },
  typing: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    padding: '4px 0',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#a78bfa',
    display: 'inline-block',
    animation: 'bounce 0.8s infinite',
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px',
  },
  input: {
    flex: 1,
    background: '#1e1a3a',
    border: '1px solid rgba(120,100,255,0.18)',
    borderRadius: '12px',
    color: '#e8e4ff',
    fontFamily: "'Sora', sans-serif",
    fontSize: '13px',
    padding: '13px 16px',
    outline: 'none',
  },
  sendBtn: {
    background: 'linear-gradient(135deg,#7c5cfc,#38bdf8)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    padding: '0 20px',
    cursor: 'pointer',
    fontSize: '18px',
  },
}