import { NextRequest } from 'next/server'

export const runtime = 'edge'

const SYSTEM_PROMPT = `Você é um assistente técnico especializado em desenvolvimento frontend, React, Next.js, TypeScript, e Inteligência Artificial aplicada ao desenvolvimento de software.

Seu papel:
- Tirar dúvidas técnicas de forma clara e objetiva
- Dar exemplos de código quando relevante
- Explicar conceitos com analogias quando útil
- Recomendar boas práticas e padrões modernos (2024/2025)
- Ser direto: ir ao ponto sem rodeios desnecessários

Formatação:
- Use markdown para código (\`\`\`linguagem)
- Use listas para passos ou comparações
- Seja conciso mas completo

Você não deve:
- Inventar APIs que não existem
- Dar conselhos financeiros ou médicos
- Sair do escopo técnico de programação e tecnologia`

export async function POST(req: NextRequest) {
  // Priority: env var (server-side) → user-provided key (from header)
  const apiKey = process.env.OPENROUTER_API_KEY || req.headers.get('x-user-api-key')

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'No API key configured. Add your OpenRouter key in the chat settings.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Basic validation — must start with sk-or-
  if (!apiKey.startsWith('sk-or-')) {
    return new Response(JSON.stringify({ error: 'Invalid API key format. Must start with sk-or-' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: { messages: Array<{ role: string; content: string }> }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { messages } = body
  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'messages array required' }), { status: 400 })
  }

  // Sanitize: only allow user/assistant roles to prevent prompt injection
  const sanitized = messages
    .filter((m): m is { role: 'user' | 'assistant'; content: string } =>
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string' &&
      m.content.length > 0 &&
      m.content.length < 10000
    )
    .slice(-20) // max 20 messages to limit context abuse

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/felvieira/react-tips',
      'X-Title': 'React Interview Deck',
    },
    body: JSON.stringify({
      model: 'moonshotai/kimi-k2',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...sanitized,
      ],
      stream: true,
      max_tokens: 2000,
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return new Response(JSON.stringify({ error: err }), { status: response.status })
  }

  // Stream the response directly
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
