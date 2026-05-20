/* eslint-disable @typescript-eslint/no-explicit-any */
// Página otimizada para impressão A4 — Cola System Design
// Acesso: /arquitetura/print

const LAYERS = [
  { n:1, name:'Cliente / Storefront', color:'#1d4ed8',
    items:['Storefront VTEX IO', 'Event SDK / Pixel', 'dataLayer / GTM (GA4)', 'Batching + sendBeacon'] },
  { n:2, name:'Coleta / Ingestão', color:'#6d28d9',
    items:['CDN / Edge', 'API Gateway / LB', 'Collector /collect', 'Consent LGPD gate'] },
  { n:3, name:'Streaming / Processamento', color:'#c2410c',
    items:['Kafka (partition por session_id)', 'Stream Processor (Flink)', 'Schema Registry'] },
  { n:4, name:'Armazenamento', color:'#a16207',
    items:['Data Lake — S3 (raw, imutável)', 'OLAP — ClickHouse (hot path)', 'Data Warehouse (cold path)'] },
  { n:5, name:'Consumo', color:'#15803d',
    items:['Dashboards ao vivo', 'BI / Analytics', 'ML / Recomendação', 'A/B Testing'] },
]

const TRANSVERSAL = [
  'CI/CD — GitHub Actions',
  'IaC — Terraform',
  'Observabilidade — logs · métricas · traces · SLO',
  'Segurança & LGPD — consent · PII · retention',
  'Qualidade — Playwright · k6 (carga)',
]

const ESTIMATIVA = [
  ['~15 mi', 'visitantes/mês'],
  ['~20', 'eventos/sessão'],
  ['~300 mi', 'eventos/mês'],
  ['~115/s', 'média'],
  ['~1700/s', 'pico (15× média)'],
]

const TRADEOFFS = [
  { t:'Idempotência', d:'event_id (UUID) gerado no cliente · dedupe no processor com state TTL · resolve at-least-once do broker' },
  { t:'Hot vs Cold path', d:'OLAP em segundos (operação) · Lake → Warehouse em batch (análise) · Lambda/Kappa' },
  { t:'Schema versionado', d:'Schema Registry + data contract · backward compatibility · valida antes de publicar' },
  { t:'Ordenação & relógio', d:'client_timestamp + server_timestamp · event time + watermark de 30s na sessionização' },
  { t:'Resiliência cliente', d:'sendBeacon (sobrevive ao unload) + queue local + retry backoff exponencial' },
  { t:'Escala & pico', d:'Partition por session_id · autoscaling collector · back-pressure no broker' },
  { t:'Amostragem', d:'só sob pico extremo · NUNCA amostrar purchase · sample por hash de session_id' },
  { t:'LGPD', d:'consent gate antes de coletar · anonimização de PII · retention via S3 lifecycle' },
]

const QUESTIONS = [
  'Volume esperado em eventos/segundo no pico (Black Friday)?',
  'Perda de evento é tolerável? Qual latência aceitável?',
  'Eventos alimentam operação em tempo real ou só análise?',
  'Quem consome — marketing, BI, ML, todos?',
  'Restrição de cloud, custo, ou requisito LGPD específico?',
  'Aproveito GTM/GA já existente ou construo do zero?',
]

const DRAW_ORDER = [
  ['0–10 min', 'Requisitos & estimativas — faça as 6 perguntas, estime eventos/s'],
  ['10–20 min', 'Desenho de alto nível — 5 caixas-camada de cima para baixo'],
  ['20–40 min', 'Aprofundar 2–3 pontos — contrato de evento, broker+processor, OLAP'],
  ['40–50 min', 'Camada transversal — CI/CD, IaC, testes E2E + carga, observabilidade'],
  ['50–60 min', 'Trade-offs & gargalos — "se X triplicar, mitigação Y, risco Z"'],
]

const KEYWORDS = [
  { g:'Pipeline', w:'event pipeline · collector · sendBeacon · batching · ingestion' },
  { g:'Streaming', w:'Kafka · partition · back-pressure · Flink · sessionização · watermark · event time' },
  { g:'Confiabilidade', w:'idempotência · event_id · dedupe · schema registry · data contract' },
  { g:'Dados', w:'data lake · OLAP · ClickHouse · warehouse · hot/cold path · Lambda/Kappa' },
  { g:'Frontend / VTEX', w:'VTEX IO · Pixel App · Store Framework · dataLayer · GA4' },
  { g:'Infra & QA', w:'GitHub Actions · Terraform · k6 · Playwright · SLO' },
]

const FRASES = [
  'O evento já nasce com event_id (UUID) — idempotência resolvida.',
  'sendBeacon + batching: não perco evento se a aba fechar.',
  'Collector responde 204 e segue a vida — stateless, escala horizontal.',
  'Kafka particionado por session_id desacopla produção de consumo e absorve picos.',
  'Flink faz enrichment, sessionização (event time + watermark) e dedupe (event_id).',
  'Raw imutável no Lake = posso fazer replay quando uma regra mudar.',
  'ClickHouse colunar = agregações em segundos sobre bilhões de linhas.',
  'Se o pico triplicar, gargalo é o processor — mitigo com mais partições e amostrando eventos de baixo valor.',
]

export const metadata = {
  title: 'Cola de System Design — Print',
}

export default function PrintPage() {
  return (
    <>
      <style>{printCSS}</style>
      <div className="print-page">
        {/* HEADER */}
        <div className="print-header">
          <div>
            <h1>System Design — Cola de Entrevista</h1>
            <div className="sub">Tracking de Eventos · Grupo SBF (Centauro / Nike) · 60 min</div>
          </div>
          <div className="print-info">imprima esta página · A4 · 1 folha</div>
        </div>

        {/* ESTIMATIVA */}
        <section className="block">
          <h2>📐 Estimativa de bolso — abra com isto</h2>
          <div className="estimate-grid">
            {ESTIMATIVA.map(([v, label]) => (
              <div key={label} className="estimate">
                <div className="estimate-v">{v}</div>
                <div className="estimate-l">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 5 CAMADAS + TRANSVERSAL */}
        <div className="two-col">
          <section className="block">
            <h2>🏗️ 5 Camadas — desenho em ordem</h2>
            {LAYERS.map(l => (
              <div key={l.n} className="layer">
                <div className="layer-num" style={{ color: l.color }}>0{l.n}</div>
                <div>
                  <div className="layer-name" style={{ color: l.color }}>{l.name}</div>
                  <div className="layer-items">{l.items.join(' · ')}</div>
                </div>
              </div>
            ))}
            <div className="transversal">
              <div className="t-title">Transversal (vale para todas)</div>
              <ul>{TRANSVERSAL.map(t => <li key={t}>{t}</li>)}</ul>
            </div>
          </section>

          <section className="block">
            <h2>❓ 6 perguntas no início (0-10min)</h2>
            <ol>
              {QUESTIONS.map(q => <li key={q}>{q}</li>)}
            </ol>

            <h2 style={{ marginTop: 14 }}>⏱️ Cronograma 60min</h2>
            <table className="schedule">
              <tbody>
                {DRAW_ORDER.map(([t, d]) => (
                  <tr key={t}>
                    <td className="time">{t}</td>
                    <td>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {/* TRADE-OFFS */}
        <section className="block">
          <h2>⚖️ 8 Trade-offs essenciais</h2>
          <div className="tradeoffs">
            {TRADEOFFS.map(t => (
              <div key={t.t} className="tradeoff">
                <div className="t-name">{t.t}</div>
                <div className="t-desc">{t.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FRASES PRONTAS */}
        <section className="block">
          <h2>💬 Frases prontas — solte ao desenhar</h2>
          <ul className="frases">
            {FRASES.map(f => <li key={f}>{f}</li>)}
          </ul>
        </section>

        {/* PALAVRAS-CHAVE */}
        <section className="block">
          <h2>🔑 Palavras-chave por categoria</h2>
          <div className="kw">
            {KEYWORDS.map(k => (
              <div key={k.g} className="kw-row">
                <div className="kw-g">{k.g}</div>
                <div className="kw-w">{k.w}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="print-footer">
          react-tips · github.com/felvieira/react-tips · gerado para uso pré-entrevista
        </div>
      </div>
    </>
  )
}

const printCSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;700&family=IBM+Plex+Sans:wght@400;600;700&display=swap');

body { background: white !important; }

.print-page {
  font-family: 'IBM Plex Sans', sans-serif;
  color: #1a1a1a;
  background: white;
  max-width: 210mm;
  margin: 0 auto;
  padding: 14mm 12mm;
  font-size: 10pt;
  line-height: 1.35;
}

.print-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  border-bottom: 2px solid #1a1a1a;
  padding-bottom: 8px; margin-bottom: 14px;
}
.print-header h1 {
  font-size: 18pt; font-weight: 700; margin: 0; letter-spacing: -0.5px;
}
.print-header .sub {
  font-size: 9pt; color: #555; margin-top: 2px;
}
.print-info {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 8pt; color: #888;
}

.block {
  margin-bottom: 12px;
  break-inside: avoid;
}
.block h2 {
  font-size: 11pt; font-weight: 700; margin-bottom: 6px;
  padding-bottom: 3px;
  border-bottom: 1px solid #ddd;
}

.two-col {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
}

/* Estimativa */
.estimate-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px;
  background: #fff7e0; border: 1px solid #f5b73f; border-radius: 6px;
  padding: 8px 10px;
}
.estimate { text-align: center; }
.estimate-v { font-family: 'IBM Plex Mono'; font-size: 13pt; font-weight: 700; color: #b45309; }
.estimate-l { font-size: 8pt; color: #555; }

/* Camadas */
.layer {
  display: flex; gap: 10px; align-items: flex-start;
  margin-bottom: 7px;
}
.layer-num {
  font-family: 'IBM Plex Mono'; font-size: 16pt; font-weight: 700;
  min-width: 28px; line-height: 1;
}
.layer-name {
  font-weight: 700; font-size: 10pt;
}
.layer-items {
  font-family: 'IBM Plex Mono'; font-size: 8.5pt; color: #333;
  margin-top: 2px;
}
.transversal {
  margin-top: 10px;
  border-left: 3px solid #ec4899;
  padding-left: 10px;
}
.t-title {
  font-weight: 700; font-size: 10pt; color: #ec4899; margin-bottom: 4px;
}
.transversal ul {
  margin: 0; padding-left: 16px;
}
.transversal li {
  font-family: 'IBM Plex Mono'; font-size: 8.5pt; margin: 1px 0;
}

/* Perguntas */
.block ol {
  margin: 0; padding-left: 18px;
}
.block ol li {
  font-size: 9pt; margin: 2px 0; line-height: 1.4;
}

/* Cronograma */
.schedule {
  width: 100%; border-collapse: collapse; font-size: 9pt;
}
.schedule .time {
  font-family: 'IBM Plex Mono'; font-weight: 700; color: #0369a1;
  padding: 2px 6px 2px 0; white-space: nowrap; vertical-align: top;
}
.schedule td {
  padding: 2px 0; vertical-align: top;
}

/* Trade-offs */
.tradeoffs {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 14px;
}
.tradeoff {
  font-size: 8.5pt; line-height: 1.4;
}
.t-name {
  font-weight: 700; color: #c2410c;
}
.t-desc {
  color: #333;
}

/* Frases */
.frases {
  margin: 0; padding-left: 18px;
  columns: 2; column-gap: 14px;
}
.frases li {
  font-size: 9pt; margin: 3px 0; line-height: 1.35;
  break-inside: avoid;
}

/* Palavras-chave */
.kw {
  display: flex; flex-direction: column; gap: 3px;
}
.kw-row {
  display: grid; grid-template-columns: 110px 1fr; gap: 8px;
  font-size: 9pt;
}
.kw-g {
  font-family: 'IBM Plex Mono'; font-weight: 700;
  color: #6d28d9; text-transform: uppercase; font-size: 8pt;
}
.kw-w {
  font-family: 'IBM Plex Mono'; font-size: 8.5pt; color: #1a1a1a;
}

.print-footer {
  margin-top: 10px;
  padding-top: 6px;
  border-top: 1px solid #ddd;
  font-family: 'IBM Plex Mono'; font-size: 7.5pt; color: #999;
  text-align: center;
}

/* Hide everything outside the print page */
@media screen {
  body { background: #e5e5e5 !important; }
  .print-page {
    background: white;
    margin: 20px auto;
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  }
}

@media print {
  body { margin: 0; }
  .print-page {
    margin: 0; padding: 10mm;
    box-shadow: none;
    max-width: none;
  }
  @page { margin: 0; size: A4; }
}
`
