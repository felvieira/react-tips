import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'React Interview Deck — Prepare-se para entrevistas Senior e Staff',
  description:
    'Mais de 97 conceitos, 144 perguntas, glossário completo e cockpits de System Design — tudo em português, no ritmo que você precisar.',
}

const stats = [
  { value: '97', label: 'conceitos' },
  { value: '144+', label: 'perguntas' },
  { value: '47', label: 'termos no glossário' },
  { value: '2', label: 'cockpits System Design' },
]

const features = [
  {
    emoji: '📚',
    title: 'Conceitos organizados',
    desc: 'De hooks básicos a arquitetura Staff-level. Cada conceito com definição, problema/solução, exemplos e Q&As.',
  },
  {
    emoji: '🃏',
    title: 'Flashcard mode',
    desc: 'Modo estudo ou modo entrevista. Revele a resposta quando estiver pronto.',
  },
  {
    emoji: '✅',
    title: 'Progresso pessoal',
    desc: 'Marque o que já domina e o que precisa revisar. Progresso salvo localmente.',
  },
  {
    emoji: '🔍',
    title: 'Busca instantânea',
    desc: 'Cmd+K para buscar qualquer conceito ou termo do glossário.',
  },
  {
    emoji: '🏗️',
    title: 'System Design',
    desc: 'Cockpits para entrevistas de System Design (Tracking, Uber/ride-sharing) com diagramas interativos.',
  },
  {
    emoji: '🤖',
    title: 'Assistente IA',
    desc: 'Chat técnico com IA para tirar dúvidas sobre React, Next.js e arquitetura (OpenRouter, BYOK).',
  },
]

const quickLinks = [
  { label: 'Conceitos', href: '/concepts/1', emoji: '📚' },
  { label: 'Perguntas', href: '/questions', emoji: '🃏' },
  { label: 'Glossário', href: '/glossary', emoji: '📖' },
  { label: 'Revisão rápida', href: '/revisao', emoji: '⚡' },
  { label: 'System Design', href: '/arquitetura', emoji: '🏗️' },
]

export default function LandingPage() {
  return (
    <div
      style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '48px 24px 80px',
        fontFamily: 'var(--font-sans)',
        color: 'var(--fg)',
      }}
    >
      {/* ── Hero ── */}
      <section style={{ textAlign: 'center', marginBottom: 64 }}>
        {/* Badge */}
        <div
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 99,
            border: '1px solid var(--border)',
            background: 'var(--bg-sunken)',
            color: 'var(--fg-muted)',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
            marginBottom: 24,
          }}
        >
          React · Next.js · TypeScript · System Design
        </div>

        <h1
          style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: '0 0 16px',
            color: 'var(--fg)',
          }}
        >
          Prepare-se para entrevistas
          <br />
          <span style={{ color: 'var(--accent)' }}>Senior e Staff</span>
        </h1>

        <p
          style={{
            fontSize: 18,
            color: 'var(--fg-muted)',
            lineHeight: 1.6,
            maxWidth: 560,
            margin: '0 auto 32px',
          }}
        >
          Mais de 97 conceitos, 144 perguntas, glossário completo e cockpits de
          System Design — tudo em português, no ritmo que você precisar.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 40,
          }}
        >
          <Link
            href="/concepts/1"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '12px 24px',
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
          >
            Começar agora →
          </Link>
          <Link
            href="/questions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '12px 24px',
              border: '1px solid var(--border)',
              background: 'var(--bg-elev)',
              color: 'var(--fg)',
              borderRadius: 8,
              fontWeight: 500,
              fontSize: 15,
              textDecoration: 'none',
            }}
          >
            Ver perguntas de entrevista
          </Link>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 4,
                padding: '6px 14px',
                background: 'var(--accent-soft)',
                borderRadius: 6,
                fontSize: 13,
              }}
            >
              <span style={{ fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                {s.value}
              </span>
              <span style={{ color: 'var(--fg-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ── */}
      <section style={{ marginBottom: 64 }}>
        <h2
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--fg-subtle)',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          O que está incluído
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                padding: '18px 20px',
                border: '1px solid var(--border)',
                borderRadius: 10,
                background: 'var(--bg-elev)',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{f.emoji}</div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 6,
                  color: 'var(--fg)',
                }}
              >
                {f.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick access ── */}
      <section>
        <h2
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--fg-subtle)',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          Acesso rápido
        </h2>
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--bg-elev)',
                color: 'var(--fg)',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <span>{l.emoji}</span>
              {l.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
