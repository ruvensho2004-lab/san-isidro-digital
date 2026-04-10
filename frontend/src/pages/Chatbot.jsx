import { useState, useRef, useEffect } from 'react'
import { api } from '../services/api'

const sugerencias = [
  "📦 Consultar CLAP", 
  "📋 Nueva Solicitud", 
  "🎓 Capacitación", 
  "💡 Emprendimiento", 
  "❤️ Salud"
]

export default function Chatbot() {
  const [mensajes, setMensajes] = useState([
    {
      rol: 'bot',
      texto: '¡Hola! Soy el nuevo Asistente de IA de San Isidro Digital.\n\nHe sido actualizado al potente modelo **Llama-3**. ¿En qué te puedo ayudar hoy? 😊',
    },
  ])
  const [input, setInput] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  
  // Configuracion de IA
  const [personalidad, setPersonalidad] = useState('Empático (Por defecto)')
  const [limiteTexto, setLimiteTexto] = useState('Normal (Equilibrado)')
  const [memoriaContextual, setMemoriaContextual] = useState(true)

  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, escribiendo])

  function enviarBtn(textoFijo) {
    ejecutarEnvio(textoFijo)
  }

  function enviar() {
    ejecutarEnvio(input)
  }

  async function ejecutarEnvio(textoRaw) {
    const texto = textoRaw.trim()
    if (!texto) return
    setInput('')
    setShowConfig(false)

    const nuevosMensajes = [...mensajes, { rol: 'user', texto }]
    setMensajes(nuevosMensajes)
    setEscribiendo(true)

    try {
      const { reply } = await api.ai.chat({
        messages: nuevosMensajes,
        personalidad,
        limiteTexto,
        memoriaContextual
      })
      setMensajes([...nuevosMensajes, { rol: 'bot', texto: reply }])
    } catch (error) {
      setMensajes([...nuevosMensajes, { rol: 'bot', texto: '⚠️ Ha ocurrido un error conectando con el motor Groq Llama-3. Revisa tu consola (CORS) o tu API KEY en el backend.' }])
    }
    
    setEscribiendo(false)
  }

  function handleKey(e) {
    if (e.key === 'Enter') enviar()
  }

  function reiniciarChat() {
    setMensajes([{
      rol: 'bot',
      texto: 'Memoria borrada. Hola de nuevo, soy el Asistente IA de San Isidro. ¿En qué te ayudo?'
    }]);
    setShowConfig(false);
  }

  return (
    <div style={s.wrap}>

      {/* Header Interactivo */}
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={s.botIconGlow}>🤖</div>
          <div>
            <h2 style={s.titulo}>Asistente Inteligente Comunal</h2>
            <div style={s.estadoTxt}><span style={s.dot}></span> Motor Groq (Llama-3) • En Línea</div>
          </div>
        </div>
        <button style={showConfig ? s.btnConfigActive : s.btnConfig} onClick={() => setShowConfig(!showConfig)}>
          ⚙️ Configurar IA
        </button>
      </div>

      {/* Panel de Configuración Real */}
      {showConfig && (
        <div style={s.configPanel}>
          <div style={s.confTitle}>Parámetros del Motor de IA</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={s.confLabel}>Personalidad / Tono</label>
              <select style={s.confSelect} value={personalidad} onChange={e => setPersonalidad(e.target.value)}>
                <option>Empático (Por defecto)</option>
                <option>Formal y Directo</option>
                <option>Informativo Extendido</option>
              </select>
            </div>
            <div>
              <label style={s.confLabel}>Límite de Texto</label>
              <select style={s.confSelect} value={limiteTexto} onChange={e=>setLimiteTexto(e.target.value)}>
                <option>Normal (Equilibrado)</option>
                <option>Corto (Respuestas rápidas)</option>
                <option>Largo (Detallado)</option>
              </select>
            </div>
            <div>
              <label style={s.confLabel}>Memoria Contextual (Chat Tracking)</label>
              <div 
                style={{...s.toggle, cursor:'pointer'}} 
                onClick={() => setMemoriaContextual(!memoriaContextual)}
              >
                {memoriaContextual ? 'Activado' : 'Desactivado'} 
                <span style={{ color: memoriaContextual ? '#34d399' : '#ef4444' }}>{memoriaContextual ? '🟢' : '🔴'}</span>
              </div>
            </div>
            <div>
              <label style={s.confLabel}>Acción Adicional</label>
              <button style={s.btnConfig} onClick={reiniciarChat} style={{width:'100%', borderColor:'#ef4444', color:'#ef4444', background:'transparent'}}>🗑 Borrar Memoria Ahora</button>
            </div>
          </div>
          <button style={s.confSaveBtn} onClick={() => setShowConfig(false)}>Cerrar Panel</button>
        </div>
      )}

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
                <span style={{ ...s.typingDot, animationDelay: '0s' }} />
                <span style={{ ...s.typingDot, animationDelay: '.15s' }} />
                <span style={{ ...s.typingDot, animationDelay: '.3s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Sugerencias Automáticas (Pills) */}
      {!escribiendo && mensajes[mensajes.length - 1]?.rol === 'bot' && (
        <div style={s.suggestionsRow}>
          {sugerencias.map(sug => (
            <button key={sug} style={s.sugBtn} onClick={() => enviarBtn(sug)}>{sug}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={s.inputWrapper}>
        <div style={s.inputDecor}></div>
        <div style={s.inputRow}>
          <input
            style={s.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Hazme una pregunta o escribe una instrucción para la IA..."
            disabled={escribiendo}
          />
          <button style={s.sendBtn} onClick={enviar} disabled={escribiendo || !input.trim()}>
            Enviar ↵
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounceGlow {
          0%, 60%, 100% { transform: translateY(0); box-shadow: none; }
          30% { transform: translateY(-4px); box-shadow: 0 4px 8px rgba(167,139,250,0.5); }
        }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
    </div>
  )
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', position: 'relative' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', background: 'linear-gradient(90deg, rgba(37,32,72,0.8), rgba(30,26,58,0.8))', padding: '16px 24px', borderRadius: 20, border: '1px solid rgba(120,100,255,0.2)', backdropFilter: 'blur(10px)' },
  botIconGlow: { fontSize: 32, textShadow: '0 0 20px rgba(56,189,248,0.8)' },
  titulo: { fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: 4 },
  estadoTxt: { fontSize: '11px', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulseDot 2s infinite', boxShadow: '0 0 8px #34d399' },
  btnConfig: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8e4ff', padding: '8px 16px', borderRadius: 12, cursor: 'pointer', transition: 'all .25s', fontSize: 13, fontWeight: 600 },
  btnConfigActive: { background: 'rgba(124,92,252,0.2)', border: '1px solid var(--accent)', color: '#fff', padding: '8px 16px', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  
  configPanel: { background: '#13102a', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 10 },
  confTitle: { fontSize: 14, fontWeight: 700, color: '#38bdf8', marginBottom: 16, borderBottom: '1px solid rgba(56,189,248,0.1)', paddingBottom: 10 },
  confLabel: { display: 'block', fontSize: 11, color: '#a89fc7', textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 },
  confSelect: { width: '100%', background: '#1e1a3a', border: '1px solid rgba(120,100,255,0.3)', color: '#fff', padding: '10px', borderRadius: 8, fontSize: 13, outline: 'none' },
  toggle: { background: '#1e1a3a', border: '1px solid rgba(120,100,255,0.3)', color: '#fff', padding: '10px', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-between', userSelect: 'none' },
  confSaveBtn: { width: '100%', background: 'linear-gradient(135deg, #0284c7, #38bdf8)', border: 'none', padding: 12, borderRadius: 8, color: '#fff', fontWeight: 700, marginTop: 16, cursor: 'pointer', fontSize: 14 },

  chatBox: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '16px', paddingRight: '8px' },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: '12px' },
  avatarBot: { width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg,#7c5cfc,#38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0, boxShadow: '0 4px 15px rgba(124,92,252,0.3)' },
  avatarUser: { width: '38px', height: '38px', borderRadius: '12px', background: '#252048', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, border: '1px solid rgba(120,100,255,0.2)' },
  bubbleBot: { background: '#1e1a3a', color: '#e8e4ff', padding: '14px 18px', borderRadius: '18px 18px 18px 4px', fontSize: '14px', lineHeight: '1.6', maxWidth: '75%', border: '1px solid rgba(120,100,255,0.15)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
  bubbleUser: { background: 'linear-gradient(135deg,#7c5cfc,#4f3bb8)', color: '#fff', padding: '14px 18px', borderRadius: '18px 18px 4px 18px', fontSize: '14px', lineHeight: '1.6', maxWidth: '75%', boxShadow: '0 4px 15px rgba(124,92,252,0.3)' },
  
  typing: { display: 'flex', gap: '4px', alignItems: 'center', height: '24px' },
  typingDot: { width: '6px', height: '6px', background: '#e8e4ff', borderRadius: '50%', animation: 'bounceGlow 1.4s infinite ease-in-out both' },

  suggestionsRow: { display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px 4px 16px 4px', flexWrap: 'wrap' },
  sugBtn: { background: '#1e1a3a', color: '#a89fc7', border: '1px solid rgba(120,100,255,0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap' },

  inputWrapper: { position: 'relative', marginTop: 'auto' },
  inputDecor: { position: 'absolute', top: '-20px', left: 0, right: 0, height: '20px', background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)', pointerEvents: 'none' },
  inputRow: { display: 'flex', gap: '12px', background: '#13102a', padding: '8px', borderRadius: '16px', border: '1px solid rgba(120,100,255,0.2)', alignItems: 'center' },
  input: { flex: 1, background: 'transparent', border: 'none', color: '#e8e4ff', padding: '12px', fontSize: '14px', outline: 'none' },
  sendBtn: { background: 'linear-gradient(135deg,#38bdf8,#0284c7)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(56,189,248,0.3)' },
}