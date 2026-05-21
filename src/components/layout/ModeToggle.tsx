'use client'
import { useMode } from '@/hooks/useMode'

export function ModeToggle() {
  const { mode, toggle } = useMode()
  const isInterview = mode === 'interview'

  return (
    <button
      onClick={toggle}
      title={isInterview ? 'Modo entrevista ativo — clique ou pressione E para sair' : 'Modo estudo — clique ou pressione E para entrar no modo entrevista'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px 4px 6px',
        borderRadius: 7,
        border: `1px solid ${isInterview ? 'var(--accent)' : 'var(--border)'}`,
        background: isInterview ? 'var(--accent-soft)' : 'transparent',
        color: isInterview ? 'var(--accent)' : 'var(--fg-muted)',
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        cursor: 'pointer',
        transition: 'border-color .15s, background .15s, color .15s',
        height: 28,
      }}
    >
      <span style={{
        width: 14, height: 14, borderRadius: '50%',
        background: isInterview ? 'var(--accent)' : 'var(--fg-subtle)',
        display: 'grid', placeItems: 'center',
        color: isInterview ? 'white' : 'var(--bg-elev)',
        fontSize: 9,
      }}>
        {isInterview ? '⚡' : '📖'}
      </span>
      <span>{isInterview ? 'Entrevista' : 'Estudo'}</span>
      <kbd style={{
        marginLeft: 2,
        fontSize: 9,
        opacity: 0.6,
        fontFamily: 'var(--font-mono)',
      }}>E</kbd>
    </button>
  )
}
