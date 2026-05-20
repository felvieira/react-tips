// FlowDiagram — diagramas SVG estilo Excalidraw (hand-drawn feel)
// Reutilizável em conceitos e no Cockpit. Sem dependências externas.

interface Box {
  id: string
  x: number
  y: number
  w?: number
  h?: number
  label: string
  sub?: string
  color?: string
  stack?: string // tech stack abaixo do label
}

interface Arrow {
  from: string
  to: string
  label?: string
  dashed?: boolean
  curve?: number // -1 left, 0 straight, 1 right
}

interface FlowDiagramProps {
  boxes: Box[]
  arrows: Arrow[]
  width?: number
  height?: number
  bg?: string
  title?: string
}

// Excalidraw-like hand-drawn font (uses Caveat from Google Fonts as fallback to system)
const HAND_FONT = "'Caveat', 'Comic Sans MS', cursive"
const MONO_FONT = "'IBM Plex Mono', ui-monospace, monospace"

const DEFAULT_BOX_W = 140
const DEFAULT_BOX_H = 60

export function FlowDiagram({
  boxes, arrows, width = 900, height = 500, bg = 'transparent', title,
}: FlowDiagramProps) {
  // Resolve box positions and dimensions
  const resolved = boxes.map((b) => ({
    ...b,
    w: b.w ?? DEFAULT_BOX_W,
    h: b.h ?? DEFAULT_BOX_H,
    color: b.color ?? '#3fb6f0',
  }))
  const boxMap = new Map(resolved.map((b) => [b.id, b]))

  return (
    <div style={{
      width: '100%',
      maxWidth: width,
      margin: '0 auto',
      background: bg === 'transparent' ? 'oklch(0.97 0.005 240)' : bg,
      borderRadius: 12,
      padding: 16,
      border: '1px solid oklch(0.88 0.005 240)',
    }}>
      {title && (
        <div style={{
          fontFamily: HAND_FONT,
          fontSize: 22,
          fontWeight: 700,
          color: '#1a1a1a',
          marginBottom: 8,
          textAlign: 'center',
        }}>{title}</div>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <defs>
          {/* Arrow head — slightly chunky to look hand-drawn */}
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#1a1a1a" />
          </marker>
          {/* Slightly rough rectangle filter — simulates pen stroke variance */}
          <filter id="rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" />
            <feDisplacementMap in="SourceGraphic" scale="1.5" />
          </filter>
        </defs>

        {/* Arrows first so they go behind boxes */}
        {arrows.map((a, i) => {
          const from = boxMap.get(a.from)
          const to = boxMap.get(a.to)
          if (!from || !to) return null

          // Compute connection points (edge to edge, simplest)
          const x1 = from.x + from.w / 2
          const y1 = from.y + from.h / 2
          const x2 = to.x + to.w / 2
          const y2 = to.y + to.h / 2

          // Adjust to box edges
          const dx = x2 - x1
          const dy = y2 - y1
          const ang = Math.atan2(dy, dx)
          const sx = x1 + Math.cos(ang) * (from.w / 2 + 2)
          const sy = y1 + Math.sin(ang) * (from.h / 2 + 2)
          const ex = x2 - Math.cos(ang) * (to.w / 2 + 8)
          const ey = y2 - Math.sin(ang) * (to.h / 2 + 8)

          // Curve control point
          const curve = a.curve ?? 0
          const mx = (sx + ex) / 2
          const my = (sy + ey) / 2
          const perpX = -Math.sin(ang) * 30 * curve
          const perpY = Math.cos(ang) * 30 * curve
          const cx = mx + perpX
          const cy = my + perpY

          const path = curve === 0
            ? `M ${sx} ${sy} L ${ex} ${ey}`
            : `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`

          return (
            <g key={i}>
              <path
                d={path}
                fill="none"
                stroke="#1a1a1a"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeDasharray={a.dashed ? '5 4' : undefined}
                markerEnd="url(#arrowhead)"
              />
              {a.label && (
                <text
                  x={cx}
                  y={cy - 6}
                  textAnchor="middle"
                  fontFamily={HAND_FONT}
                  fontSize="13"
                  fill="#1a1a1a"
                  style={{ pointerEvents: 'none' }}
                >
                  {a.label}
                </text>
              )}
            </g>
          )
        })}

        {/* Boxes on top */}
        {resolved.map((b) => (
          <g key={b.id}>
            {/* Shadow / depth */}
            <rect
              x={b.x + 3}
              y={b.y + 3}
              width={b.w}
              height={b.h}
              rx={8}
              fill="oklch(0.85 0.005 240 / 0.4)"
            />
            {/* Box */}
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={8}
              fill="white"
              stroke={b.color}
              strokeWidth={2}
            />
            {/* Top accent strip */}
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={4}
              rx={2}
              fill={b.color}
            />
            {/* Label */}
            <text
              x={b.x + b.w / 2}
              y={b.y + (b.sub || b.stack ? 24 : b.h / 2 + 5)}
              textAnchor="middle"
              fontFamily={HAND_FONT}
              fontSize="17"
              fontWeight="700"
              fill="#1a1a1a"
            >
              {b.label}
            </text>
            {b.sub && (
              <text
                x={b.x + b.w / 2}
                y={b.y + 42}
                textAnchor="middle"
                fontFamily={HAND_FONT}
                fontSize="13"
                fill="#555"
              >
                {b.sub}
              </text>
            )}
            {b.stack && (
              <text
                x={b.x + b.w / 2}
                y={b.y + b.h - 8}
                textAnchor="middle"
                fontFamily={MONO_FONT}
                fontSize="9"
                fill={b.color}
                fontWeight="600"
              >
                {b.stack}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESETS — diagramas prontos para reaproveitar
// ─────────────────────────────────────────────────────────────────────────────

// Visão geral — Cliente → Coleta → Streaming → Storage → Consumo
export const TRACKING_OVERVIEW: FlowDiagramProps = {
  title: 'Pipeline de Tracking — 5 Camadas',
  width: 900,
  height: 280,
  boxes: [
    { id: 'client',  x:  20, y: 100, label: 'Cliente',       sub: 'storefront',     stack: 'VTEX IO', color: '#3fb6f0' },
    { id: 'collect', x: 200, y: 100, label: 'Coleta',        sub: 'collector',      stack: '/collect', color: '#a78bfa' },
    { id: 'stream',  x: 380, y: 100, label: 'Streaming',     sub: 'broker+proc',    stack: 'Kafka·Flink', color: '#fb923c' },
    { id: 'store',   x: 560, y:  40, label: 'Hot Path',      sub: 'OLAP',           stack: 'ClickHouse', color: '#eab64a' },
    { id: 'lake',    x: 560, y: 170, label: 'Cold Path',     sub: 'Lake → Warehouse', stack: 'S3·BigQuery', color: '#eab64a' },
    { id: 'cons',    x: 740, y: 100, label: 'Consumo',       sub: 'dash·BI·ML',     stack: '', color: '#34d399' },
  ],
  arrows: [
    { from: 'client',  to: 'collect', label: 'sendBeacon' },
    { from: 'collect', to: 'stream',  label: 'Kafka' },
    { from: 'stream',  to: 'store',   curve: -0.6, label: 'agregado' },
    { from: 'stream',  to: 'lake',    curve: 0.6, label: 'raw' },
    { from: 'store',   to: 'cons',    curve: -0.6 },
    { from: 'lake',    to: 'cons',    curve: 0.6 },
  ],
}

// Cliente em detalhe — captura → dataLayer → batching → envio
export const CLIENT_LAYER: FlowDiagramProps = {
  title: 'Camada Cliente — captura ao envio',
  width: 800,
  height: 220,
  boxes: [
    { id: 'user',     x:  20, y:  80, label: 'Usuário',     sub: 'click PDP', stack: '', color: '#3fb6f0', w: 110 },
    { id: 'storefront', x: 170, y:  80, label: 'Storefront', sub: 'PDP', stack: 'VTEX IO', color: '#3fb6f0' },
    { id: 'sdk',      x: 340, y:  80, label: 'Event SDK',    sub: 'monta evento', stack: 'event_id UUID', color: '#3fb6f0' },
    { id: 'queue',    x: 510, y:  80, label: 'Queue',        sub: 'batching', stack: 'localStorage', color: '#3fb6f0' },
    { id: 'beacon',   x: 670, y:  80, label: 'sendBeacon',   sub: '→ /collect', stack: 'CDN edge', color: '#3fb6f0' },
  ],
  arrows: [
    { from: 'user',       to: 'storefront' },
    { from: 'storefront', to: 'sdk',      label: 'event' },
    { from: 'sdk',        to: 'queue' },
    { from: 'queue',      to: 'beacon',   label: 'batch 20' },
  ],
}

// Streaming em detalhe — broker + processor com hot/cold
export const STREAMING_LAYER: FlowDiagramProps = {
  title: 'Streaming — broker + processor',
  width: 850,
  height: 320,
  boxes: [
    { id: 'in',       x:  20, y: 140, label: 'Collector',    sub: 'incoming', stack: '/collect', color: '#a78bfa' },
    { id: 'broker',   x: 200, y: 140, label: 'Kafka',        sub: 'partition by session_id', stack: 'durable buffer', color: '#fb923c', w: 170 },
    { id: 'flink',    x: 440, y: 140, label: 'Flink',        sub: 'enrich+dedupe+session', stack: 'event-time + watermark', color: '#fb923c', w: 180 },
    { id: 'lake',     x: 690, y:  50, label: 'Lake',         sub: 'raw, imutável', stack: 'S3 · Parquet', color: '#eab64a' },
    { id: 'olap',     x: 690, y: 240, label: 'OLAP',         sub: 'agregado', stack: 'ClickHouse', color: '#eab64a' },
  ],
  arrows: [
    { from: 'in',     to: 'broker',  label: 'publish' },
    { from: 'broker', to: 'flink',   label: 'consume' },
    { from: 'flink',  to: 'lake',    curve: -0.7, label: 'cold path' },
    { from: 'flink',  to: 'olap',    curve: 0.7,  label: 'hot path' },
  ],
}
