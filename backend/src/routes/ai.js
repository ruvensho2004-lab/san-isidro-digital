import { Router } from 'express'

const router = Router()

const PERSONALIDADES = {
  'Empático (Por defecto)': 'Eres el Asistente Virtual Oficial del Consejo Comunal San Isidro. Respondes SIEMPRE en un tono extremadamente amable, cálido y servicial. Utilizas emojis alegremente e intentas orientar a los ciudadanos de forma humana y cercana. Tu nombre es "Asistente San Isidro".',
  'Formal y Directo': 'Eres un sistema de Inteligencia Artificial del Consejo Comunal San Isidro. Tu propósito es dar información estrictamente técnica, burocrática y directa. NO utilices rodeos, saludos largos ni emojis bajo ninguna circunstancia. Sé asertivo y claro.',
  'Informativo Extendido': 'Eres el tutor y guía del Consejo Comunal San Isidro. Cuando te pregunten algo, debes de construir respuestas detalladas, dando contexto histórico, beneficios sociales, y explicando el "por qué" de las cosas paso a paso.'
}

const LIMITES = {
  'Normal (Equilibrado)': 500,
  'Corto (Respuestas rápidas)': 150,
  'Largo (Detallado)': 1000
}

router.post('/chat', async (req, res) => {
  try {
    const { messages, personalidad, limiteTexto, memoriaContextual } = req.body;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'LLave API de Groq no configurada en el servidor (GROQ_API_KEY).' });
    }

    const systemPrompt = PERSONALIDADES[personalidad] || PERSONALIDADES['Empático (Por defecto)'];
    const maxTokens = LIMITES[limiteTexto] || LIMITES['Normal (Equilibrado)'];

    let sendMessages = [];
    sendMessages.push({ role: 'system', content: systemPrompt });

    if (memoriaContextual) {
      // Filtrar a formato openAI
      const history = messages.map(m => ({
        role: m.rol === 'bot' ? 'assistant' : 'user', 
        content: m.texto 
      }));
      // Filter out the automatic welcome message to save tokens context
      const filtered = history.filter(m => !m.content.includes('Soy el nuevo Asistente de IA de San Isidro Digital'));
      sendMessages = sendMessages.concat(filtered);
    } else {
      // Solo el ultimo mensaje
      const ultimo = messages[messages.length - 1];
      sendMessages.push({ role: 'user', content: ultimo.texto });
    }

    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: sendMessages,
        max_tokens: maxTokens,
        temperature: personalidad === 'Formal y Directo' ? 0.2 : 0.7
      })
    });

    const data = await resp.json();
    if (!resp.ok) {
      return res.status(400).json({ error: data.error?.message || 'Error con el motor Groq' });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

export default router
