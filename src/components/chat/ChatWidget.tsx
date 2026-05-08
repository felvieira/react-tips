'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const STORAGE_KEY = 'react-tips-openrouter-key'

const SUGGESTIONS = [
  'Quando usar useCallback vs useMemo?',
  'Como funciona o RAG na prática?',
  'Diferença entre SSR, SSG e ISR?',
  'Como estruturar um projeto Next.js grande?',
]

function parseMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<strong>$1</strong>')
    .replace(/^## (.+)$/gm, '<strong>$1</strong>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>(\n|$))+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[ulopre])(.+)$/gm, (line) =>
      line.startsWith('<') ? line : `<p>${line}</p>`)
    .replace(/<p><\/p>/g, '')
}

// ── Key setup screen ──────────────────────────────────────────────────────────
function KeySetup({ onSave }: { onSave: (key: string) => void }) {
  const [val, setVal] = useState('')
  const [show, setShow] = useState(false)

  const save = () => {
    const trimmed = val.trim()
    if (!trimmed.startsWith('sk-or-')) return
    localStorage.setItem(STORAGE_KEY, trimmed)
    onSave(trimmed)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', gap: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 32 }}>🔑</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--fg)', marginBottom: 6 }}>
          Configure sua chave OpenRouter
        </div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.6 }}>
          Crie uma chave gratuita em{' '}
          <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            openrouter.ai/keys
          </a>
          {' '}e cole abaixo. A chave fica salva localmente no seu browser.
        </div>
      </div>
      <div style={{ width: '100%', position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          placeholder="sk-or-v1-..."
          style={{
            width: '100%', padding: '9px 40px 9px 12px', fontSize: 12,
            background: 'var(--bg-sunken)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--fg)', fontFamily: 'var(--font-mono)',
            outline: 'none', boxSizing: 'border-box',
          }}
          autoFocus
        />
        <button
          onClick={() => setShow(v => !v)}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', fontSize: 13, padding: 0 }}
        >
          {show ? '🙈' : '👁'}
        </button>
      </div>
      <button
        onClick={save}
        disabled={!val.trim().startsWith('sk-or-')}
        style={{
          width: '100%', padding: '9px 0', borderRadius: 8, border: 'none',
          background: 'var(--accent)', color: 'white', fontWeight: 700,
          fontSize: 12, fontFamily: 'var(--font-mono)', cursor: 'pointer',
          opacity: val.trim().startsWith('sk-or-') ? 1 : 0.4,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}
      >
        Salvar e usar
      </button>
      <div style={{ fontSize: 11, color: 'var(--fg-subtle)', lineHeight: 1.5 }}>
        A chave nunca sai do seu browser — não é enviada para nossos servidores.
      </div>
    </div>
  )
}

// ── Main widget ───────────────────────────────────────────────────────────────
export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasNew, setHasNew] = useState(false)
  const [userKey, setUserKey] = useState<string | null>(null)
  const [showKeySetup, setShowKeySetup] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Load key from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setUserKey(saved)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) {
      setHasNew(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: trimmed }
    const assistantId = (Date.now() + 1).toString()

    setMessages(prev => [...prev, userMsg, { id: assistantId, role: 'assistant', content: '' }])
    setInput('')
    setLoading(true)

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Send user key as header if available — route handler uses it as fallback
          ...(userKey ? { 'x-user-api-key': userKey } : {}),
        },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(body || `HTTP ${res.status}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content ?? ''
            if (delta) {
              fullContent += delta
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: fullContent } : m
              ))
            }
          } catch { /* skip malformed chunks */ }
        }
      }

      if (!open) setHasNew(true)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: `Erro: ${msg}. Verifique sua chave ou tente novamente.` }
          : m
      ))
    } finally {
      setLoading(false)
    }
  }, [messages, loading, open, userKey])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const stop = () => {
    abortRef.current?.abort()
    setLoading(false)
  }

  const clearKey = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUserKey(null)
    setShowKeySetup(true)
  }

  const hasKey = !!userKey

  return (
    <>
      {/* FAB */}
      <button
        className="chat-fab"
        onClick={() => setOpen(v => !v)}
        title="Assistente de IA"
        aria-label="Abrir assistente de IA"
      >
        {hasNew && <span className="chat-fab-badge" />}
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="chat-panel">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-icon">🤖</div>
            <div style={{ flex: 1 }}>
              <div className="chat-header-title">Assistente Técnico</div>
              <div className="chat-header-sub">Kimi K2 · via OpenRouter</div>
            </div>
            {/* Key config button */}
            <button
              onClick={() => setShowKeySetup(v => !v)}
              title={hasKey ? 'Chave configurada — clique para alterar' : 'Configurar chave'}
              style={{
                width: 24, height: 24, display: 'grid', placeItems: 'center',
                borderRadius: 6, background: 'none', border: 'none',
                color: hasKey ? 'var(--accent)' : 'var(--fg-muted)',
                cursor: 'pointer', fontSize: 13, transition: 'background .15s',
              }}
            >
              🔑
            </button>
            <button className="chat-header-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Key setup screen */}
          {showKeySetup ? (
            <>
              <KeySetup onSave={(k) => { setUserKey(k); setShowKeySetup(false) }} />
              {hasKey && (
                <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setShowKeySetup(false)}
                    style={{ flex: 1, padding: '7px 0', fontSize: 11, fontFamily: 'var(--font-mono)', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-sunken)', color: 'var(--fg-muted)', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={clearKey}
                    style={{ flex: 1, padding: '7px 0', fontSize: 11, fontFamily: 'var(--font-mono)', borderRadius: 6, border: '1px solid oklch(0.65 0.16 25 / 0.4)', background: 'oklch(0.65 0.16 25 / 0.08)', color: 'oklch(0.65 0.16 25)', cursor: 'pointer' }}
                  >
                    Remover chave
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* No key configured */}
              {!hasKey ? (
                <div className="chat-empty">
                  <div className="chat-empty-icon">🔑</div>
                  <div className="chat-empty-title">Chave de API necessária</div>
                  <div className="chat-empty-sub">
                    Configure sua chave OpenRouter para usar o assistente. É gratuito para começar.
                  </div>
                  <button
                    onClick={() => setShowKeySetup(true)}
                    style={{ marginTop: 8, padding: '9px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                  >
                    Configurar chave
                  </button>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="chat-messages">
                    {messages.length === 0 ? (
                      <div className="chat-empty">
                        <div className="chat-empty-icon">⚡</div>
                        <div className="chat-empty-title">Tire suas dúvidas técnicas</div>
                        <div className="chat-empty-sub">React, Next.js, TypeScript, IA, arquitetura de software e muito mais.</div>
                        <div className="chat-suggestions">
                          {SUGGESTIONS.map(s => (
                            <button key={s} className="chat-suggestion" onClick={() => sendMessage(s)}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map(msg => (
                          <div key={msg.id} className={`chat-msg ${msg.role}`}>
                            <div
                              className="chat-bubble"
                              dangerouslySetInnerHTML={{
                                __html: parseMarkdown(msg.content) ||
                                  (loading && msg.role === 'assistant' && !msg.content ? '&nbsp;' : msg.content)
                              }}
                            />
                          </div>
                        ))}
                        {loading && messages[messages.length - 1]?.content === '' && (
                          <div className="chat-typing">
                            <span /><span /><span />
                          </div>
                        )}
                      </>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div className="chat-input-row">
                    <textarea
                      ref={inputRef}
                      className="chat-input"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Pergunte sobre React, Next.js, IA... (Enter para enviar)"
                      rows={1}
                      disabled={loading}
                    />
                    {loading ? (
                      <button className="chat-send" onClick={stop} title="Parar geração">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="5" y="5" width="14" height="14" rx="2"/>
                        </svg>
                      </button>
                    ) : (
                      <button
                        className="chat-send"
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim()}
                        title="Enviar"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
