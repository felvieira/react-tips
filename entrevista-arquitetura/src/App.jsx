import React, { useState, useEffect } from 'react';
import {
  Activity, Layers, Route, BookOpen, Play, Pause, RotateCcw,
  ChevronLeft, ChevronRight, Quote, HelpCircle,
  ListChecks, Key, Gauge, Zap, MousePointerClick
} from 'lucide-react';

/* ============================================================
   TRACKING COCKPIT — apoio de System Design para a entrevista
   Grupo SBF (Centauro / Nike) — uso ao vivo, modo console.
   ============================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.ck{font-family:'IBM Plex Sans',ui-sans-serif,sans-serif;-webkit-font-smoothing:antialiased}
.mono{font-family:'IBM Plex Mono',ui-monospace,monospace}
.card{transition:transform .15s cubic-bezier(.2,.7,.3,1),border-color .15s,background .15s,box-shadow .15s;cursor:pointer}
.card:hover{transform:translateY(-3px)}
.btn{transition:filter .14s,transform .1s,background .14s,border-color .14s;cursor:pointer;border:none;outline:none}
.btn:hover{filter:brightness(1.16)}
.btn:active{transform:scale(.96)}
.tab{transition:color .15s,background .15s}
.dot{transition:all .22s cubic-bezier(.2,.7,.3,1);cursor:pointer}
.lk{transition:opacity .14s}.lk:hover{opacity:.7}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes pop{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
@keyframes glow{0%,100%{box-shadow:0 0 0 0 var(--g0)}50%{box-shadow:0 0 26px 3px var(--g1)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
.fu{animation:fadeUp .5s cubic-bezier(.2,.7,.3,1) both}
.pp{animation:pop .34s ease both}
.glow{animation:glow 1.9s ease-in-out infinite}
.blink{animation:blink 1.4s ease-in-out infinite}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-thumb{background:#2b3340;border-radius:8px}
::-webkit-scrollbar-thumb:hover{background:#3a4452}
::-webkit-scrollbar-track{background:transparent}
`;

const C = {
  bg:'#0b0e13', panel:'#12161f', panel2:'#161b26', panel3:'#1b2230',
  border:'#262e3c', borderSoft:'#1f2733', line:'#2c3545',
  text:'#e9ecf3', dim:'#8a93a4', faint:'#5a6373', amber:'#f5b73f',
};

/* ---------- DADOS ---------- */
const LAYERS = [
  { id:'cliente', n:1, name:'Cliente / Storefront', tag:'onde o evento nasce', color:'#3fb6f0',
    comps:[
      { id:'storefront', name:'Storefront VTEX IO', tech:'React · SSR · Store Framework', short:'Storefront',
        what:'A loja Centauro/Nike. Home, PLP, PDP e checkout — todas as páginas onde o usuário gera ações rastreáveis.',
        why:'É a origem do dado. Sem instrumentar a storefront, não existe evento.',
        talk:['SPA/SSR em React via VTEX IO','Cada página é um ponto de captura','Na VTEX uso um Pixel App nativo'] },
      { id:'sdk', name:'Event SDK / Pixel', tech:'biblioteca JS', short:'Event SDK',
        what:'Biblioteca instrumentada na página: escuta cliques, scroll e visualizações e monta o objeto do evento.',
        why:'Centraliza a captura numa única lib — fácil de versionar e manter consistente entre páginas.',
        talk:['Captura padronizada','Conceito nativo VTEX = Pixel App','Já gera o event_id (UUID)'] },
      { id:'datalayer', name:'dataLayer / GTM', tech:'camada de padronização', short:'dataLayer',
        what:'Camada que padroniza todo evento num schema único (ex.: GA4) — nome, parâmetros e contexto.',
        why:'Garante contrato consistente antes do dado sair do browser e desacopla a página das ferramentas de destino.',
        talk:['Schema GA4 como padrão','Server-side tagging reduz exposição de PII'] },
      { id:'batching', name:'Batching + sendBeacon', tech:'envio resiliente', short:'Batching',
        what:'Agrupa eventos em lote e envia com navigator.sendBeacon; mantém fila local com retry.',
        why:'sendBeacon sobrevive ao fechamento da aba; o lote reduz requests; o retry evita perda de evento.',
        talk:['Não perco evento se a aba fechar','Menos requests, menos overhead','Fila local + backoff exponencial'] },
    ]},
  { id:'coleta', n:2, name:'Coleta / Ingestão', tag:'a porta de entrada', color:'#a78bfa',
    comps:[
      { id:'cdn', name:'CDN / Edge', tech:'ponto de entrada', short:'CDN/Edge',
        what:'Recebe o request no PoP mais próximo do usuário.',
        why:'Latência baixa e absorção de tráfego na borda — pode até coletar no edge.',
        talk:['PoP próximo = baixa latência','Absorve picos na borda'] },
      { id:'gateway', name:'API Gateway / LB', tech:'porta protegida', short:'Gateway/LB',
        what:'Distribui carga entre instâncias, termina TLS, aplica rate limiting e barra abuso/DDoS.',
        why:'Protege o collector e garante disponibilidade sob pico.',
        talk:['Rate limit por origem','Termina TLS','Health check + autoscaling'] },
      { id:'collector', name:'Collector  /collect', tech:'endpoint leve', short:'Collector',
        what:'Endpoint HTTP que valida o formato básico, autentica a origem e responde rápido (HTTP 204).',
        why:'Leve de propósito — não processa nada pesado, então aguenta milhões de req/s e escala horizontalmente.',
        talk:['Responde 204 e segue a vida','Stateless = escala horizontal','Só valida e publica'] },
      { id:'consent', name:'Consent / LGPD gate', tech:'checagem legal', short:'Consent LGPD',
        what:'Antes de aceitar o dado, confere o consentimento do usuário.',
        why:'LGPD: sem consentimento, o evento é descartado ou anonimizado. Privacidade desde o design.',
        talk:['Consent-first','Anonimização de PII','Política de retenção definida'] },
    ]},
  { id:'streaming', n:3, name:'Streaming / Processamento', tag:'o coração do sistema', color:'#fb923c',
    comps:[
      { id:'broker', name:'Message Broker', tech:'Kafka · Kinesis · Pub/Sub', short:'Broker (Kafka)',
        what:'Fila durável e particionada que recebe os eventos do collector.',
        why:'Desacopla produtor de consumidor e absorve picos (Black Friday) — se o processamento cair, nada se perde.',
        talk:['Buffer durável','Partição por session_id','Back-pressure controlado','Desacopla produção de consumo'] },
      { id:'processor', name:'Stream Processor', tech:'Flink · Kafka Streams', short:'Processor (Flink)',
        what:'Consome do broker e transforma: enriquece (geo, device), agrupa em sessão, deduplica e filtra bots.',
        why:'Transforma evento cru em evento útil; sessionização e dedupe acontecem aqui, por event time e watermark.',
        talk:['Enrichment: geo, device, user','Sessionização por event time','Dedupe por event_id','Filtro de bot/fraude'] },
      { id:'registry', name:'Schema Registry', tech:'contrato de eventos', short:'Schema Registry',
        what:'Guarda e versiona o contrato (schema) de cada tipo de evento.',
        why:'Garante que uma mudança de formato não quebre os consumidores — evita o "dado podre".',
        talk:['Data contract versionado','Compatibilidade backward','Valida antes de processar'] },
    ]},
  { id:'armazenamento', n:4, name:'Armazenamento', tag:'onde o dado descansa', color:'#eab64a',
    comps:[
      { id:'lake', name:'Data Lake — S3', tech:'fonte da verdade', short:'Data Lake',
        what:'Guarda o evento cru, imutável e barato, em arquivos (Parquet), particionado por data.',
        why:'É a fonte da verdade — permite reprocessar tudo (replay) se um consumidor falhar ou a regra mudar.',
        talk:['Raw, imutável, barato','Replay quando a regra muda','Particionado por data'] },
      { id:'olap', name:'OLAP near-real-time', tech:'ClickHouse · Druid', short:'OLAP',
        what:'Banco analítico colunar otimizado para agregações rápidas.',
        why:'Responde consultas de dashboard em segundos mesmo sobre bilhões de linhas — é o caminho "quente".',
        talk:['Colunar = agregação rápida','Hot path: latência de segundos','Materialized views pré-agregadas'] },
      { id:'warehouse', name:'Data Warehouse', tech:'BigQuery · Redshift', short:'Warehouse',
        what:'Dados modelados (star schema) para análise histórica e BI.',
        why:'Caminho "frio": atualizado em lote, otimizado para análises complexas e treino de ML.',
        talk:['Cold path, batch','Modelagem dimensional','Fonte para BI e ML'] },
    ]},
  { id:'consumo', n:5, name:'Consumo', tag:'quem usa o dado', color:'#34d399',
    comps:[
      { id:'dashboards', name:'Dashboards ao vivo', tech:'tempo real', short:'Dashboards',
        what:'Marketing e produto acompanham o funil de conversão em tempo real.',
        why:'Decisão operacional rápida — detectar uma queda de conversão no momento em que acontece.',
        talk:['Funil ao vivo','Alertas operacionais'] },
      { id:'bi', name:'BI / Analytics', tech:'análise', short:'BI',
        what:'Relatórios, cohort, atribuição de campanha e visão histórica do comportamento de compra.',
        why:'Decisão estratégica baseada em histórico consolidado.',
        talk:['Cohort e retenção','Atribuição multi-touch'] },
      { id:'ml', name:'ML / Recomendação', tech:'inteligência', short:'ML',
        what:'Personalização, ranking de busca e recomendação de produtos a partir do histórico de eventos.',
        why:'Os eventos viram features de modelos — recomendação melhor, mais conversão.',
        talk:['Eventos = features','Recomendação e ranking de busca'] },
      { id:'abtest', name:'A/B Testing', tech:'experimentação', short:'A/B Test',
        what:'Mede o impacto de mudanças e controla feature flags com base nos eventos coletados.',
        why:'Decisão guiada por dado, não por opinião.',
        talk:['Experimentação','Feature flags'] },
    ]},
];

const TRANSVERSAL = { id:'transversal', name:'Camada Transversal', tag:'vale para todas as etapas', color:'#fb7185',
  comps:[
    { id:'cicd', name:'CI/CD', tech:'GitHub Actions',
      what:'Pipeline que faz build, lint, testes e deploy automatizado de cada serviço do pipeline de dados.',
      why:'Deploy confiável e frequente — cada serviço entra em produção sem passo manual.' },
    { id:'iac', name:'IaC', tech:'Terraform',
      what:'Toda a infra — broker, buckets S3, clusters OLAP — descrita em código, versionada e reproduzível.',
      why:'Nada de clique manual no console: ambientes idênticos, auditáveis e fáceis de recriar.' },
    { id:'obs', name:'Observabilidade', tech:'logs · métricas · traces',
      what:'Logs estruturados, métricas, tracing distribuído e alertas, com um SLO definido por serviço.',
      why:'Você precisa saber em segundos se um evento parou de chegar ou se a latência subiu.' },
    { id:'sec', name:'Segurança & LGPD', tech:'consentimento · PII',
      what:'Gestão de consentimento, anonimização/pseudonimização de PII e política de retenção de dados.',
      why:'Tracking lida com dado pessoal — privacidade é requisito, não enfeite.' },
    { id:'qa', name:'Qualidade', tech:'Playwright · k6',
      what:'Testes E2E do fluxo de eventos e testes de carga que simulam o pico de Black Friday.',
      why:'Garante que o pipeline aguenta o pico antes de o pico chegar.' },
  ]};

const JOURNEY = [
  { layer:'cliente', comp:'storefront', title:'Usuário clica em "Adicionar ao carrinho"',
    detail:'Na página de produto (PDP) da Centauro, o usuário dispara uma ação de e-commerce. É o nascimento do evento.',
    say:'Vou seguir um único evento de add_to_cart por todo o sistema.' },
  { layer:'cliente', comp:'sdk', title:'O SDK captura e monta o evento',
    detail:'O Event SDK monta o objeto: event_id (UUID), client_timestamp, SKU, preço e id do usuário/sessão.',
    say:'O evento já nasce com um event_id único — é o que garante idempotência mais à frente.' },
  { layer:'cliente', comp:'batching', title:'Envio em lote, resiliente',
    detail:'O evento entra numa fila local; em lote, o sendBeacon o envia para /collect através da CDN — e resiste até ao fechamento da aba.',
    say:'Uso sendBeacon e batching para não perder evento e reduzir o número de requests.' },
  { layer:'coleta', comp:'collector', title:'O Collector valida e responde rápido',
    detail:'Valida o formato, autentica a origem, checa o consentimento LGPD e responde HTTP 204. Não processa nada pesado.',
    say:'O collector é leve de propósito — só valida e devolve 204, então escala horizontalmente.' },
  { layer:'streaming', comp:'broker', title:'Publicação no broker',
    detail:'O collector publica o evento no Kafka, particionado por session_id. A partir daqui o dado é durável.',
    say:'Publico no Kafka — agora o dado está seguro; se algo cair adiante, é só reprocessar.' },
  { layer:'streaming', comp:'processor', title:'Processamento do stream',
    detail:'O Stream Processor enriquece (geo, device), agrupa em sessão por event time e descarta duplicados pelo event_id.',
    say:'Aqui faço enrichment, sessionização e dedupe — o event_id resolve qualquer reenvio.' },
  { layer:'armazenamento', comp:'lake', title:'Persistência: cru e agregado',
    detail:'O evento cru vai para o Data Lake (S3, imutável); a versão agregada vai para o ClickHouse (OLAP).',
    say:'Gravo o cru no lake como fonte da verdade e o agregado no OLAP para o caminho quente.' },
  { layer:'consumo', comp:'dashboards', title:'Consulta em tempo real',
    detail:'Um dashboard consulta o ClickHouse e mostra "carrinhos na última hora" em segundos.',
    say:'O time de marketing vê o funil ao vivo — latência de segundos, não de horas.' },
  { layer:'armazenamento', comp:'warehouse', title:'Caminho frio: batch para o Warehouse',
    detail:'De madrugada, um job batch leva os dados do Lake ao Data Warehouse, para BI e treino de modelos de ML.',
    say:'O caminho frio alimenta BI e ML — análise histórica, sem pressa.' },
];

const TRADEOFFS = [
  { t:'Idempotência', d:'Cada evento carrega um event_id (UUID). Reenvios são descartados no processor — resolve o "entrega ao menos uma vez" do broker.' },
  { t:'Hot path vs Cold path', d:'Caminho quente (OLAP, segundos) para operação; caminho frio (Lake → Warehouse, batch) para análise. Arquitetura Lambda/Kappa.' },
  { t:'Schema versionado', d:'Schema Registry + data contract. Eventos evoluem; o contrato não pode quebrar para trás. Compatibilidade backward.' },
  { t:'Ordenação & relógio', d:'Registre client_timestamp e server_timestamp. Eventos chegam fora de ordem — use event time e watermarks na sessionização.' },
  { t:'Resiliência de coleta', d:'sendBeacon + fila local + retry com backoff. O evento não se perde mesmo se a rede ou a aba falharem.' },
  { t:'Escala & pico', d:'Partição por session_id, autoscaling do collector e back-pressure. Black Friday é o caso de carga de referência.' },
  { t:'Amostragem', d:'Sob pico extremo, amostre eventos de baixo valor para proteger o pipeline. Nunca amostre purchase.' },
  { t:'Privacidade / LGPD', d:'Consentimento antes de coletar, anonimização de PII, retenção definida e server-side tagging.' },
];

const QUESTIONS = [
  'Qual o volume esperado? Quantos eventos/segundo no pico (Black Friday)?',
  'Perda de evento é tolerável? Qual a latência aceitável entre o clique e o dado disponível?',
  'Os eventos alimentam operação em tempo real ou só análise posterior?',
  'Quem consome o dado — marketing, BI, ML, todos?',
  'Há restrição de cloud, de custo ou requisito específico de LGPD?',
  'Aproveito o GTM/GA já existente ou construo do zero?',
];

const DRAW_ORDER = [
  { t:'0–10 min', h:'Requisitos & estimativas', d:'Faça as perguntas. Estime eventos/s. Defina o que é funcional e não-funcional.' },
  { t:'10–20 min', h:'Desenho de alto nível', d:'As 5 caixas-camada, de cima para baixo. Fluxo claro com setas.' },
  { t:'20–40 min', h:'Aprofundar 2–3 pontos', d:'Contrato de evento, broker + processor e o modelo de dados no OLAP.' },
  { t:'40–50 min', h:'Camada transversal', d:'CI/CD, IaC, testes E2E + carga, observabilidade e SLOs.' },
  { t:'50–60 min', h:'Trade-offs & gargalos', d:'"Se o pico triplicar, o gargalo é X; mitigo com Y." Feche com riscos.' },
];

const KEYWORDS = [
  { g:'Pipeline', w:['event pipeline','collector','sendBeacon','batching','ingestion'] },
  { g:'Streaming', w:['Kafka','partition','back-pressure','Flink','sessionização','watermark','event time'] },
  { g:'Confiabilidade', w:['idempotência','event_id','dedupe','schema registry','data contract'] },
  { g:'Dados', w:['data lake','OLAP','ClickHouse','warehouse','hot/cold path','Lambda/Kappa'] },
  { g:'Frontend / VTEX', w:['VTEX IO','Pixel App','Store Framework','dataLayer','GA4'] },
  { g:'Infra & Qualidade', w:['GitHub Actions','Terraform','k6','Playwright','SLO'] },
];

const PHASES = [
  { s:0, label:'Requisitos & estimativas' },
  { s:600, label:'Desenho de alto nível' },
  { s:1200, label:'Aprofundar componentes' },
  { s:2400, label:'Camada transversal' },
  { s:3000, label:'Trade-offs & gargalos' },
];

/* helpers */
const ALL = LAYERS.flatMap(l => l.comps.map(c => ({ ...c, layerId:l.id, layerColor:l.color, layerName:l.name })));
const findComp = id => ALL.find(c => c.id === id);
const findLayer = id => LAYERS.find(l => l.id === id);
const hex = (h, a) => {
  const n = parseInt(h.slice(1), 16);
  return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
};

/* ---------- TIMER ---------- */
function Timer() {
  const [sec, setSec] = useState(3600);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setSec(s => (s <= 0 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [run]);
  useEffect(() => { if (sec === 0) setRun(false); }, [sec]);

  const elapsed = 3600 - sec;
  const phaseIdx = PHASES.reduce((a, p, i) => (elapsed >= p.s ? i : a), 0);
  const low = sec <= 600;
  const mm = String(Math.floor(sec/60)).padStart(2,'0');
  const ss = String(sec%60).padStart(2,'0');
  const accent = sec === 0 ? '#fb7185' : low ? C.amber : '#3fb6f0';

  return (
    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
      <div style={{ textAlign:'right' }}>
        <div className="mono" style={{ fontSize:11, color:C.faint, letterSpacing:1, textTransform:'uppercase' }}>
          {sec === 0 ? 'Tempo esgotado' : PHASES[phaseIdx].label}
        </div>
        <div style={{ display:'flex', gap:3, marginTop:4, justifyContent:'flex-end' }}>
          {PHASES.map((p,i) => (
            <div key={i} style={{ width:22, height:4, borderRadius:2,
              background: i <= phaseIdx && run || i < phaseIdx ? accent : C.line }} />
          ))}
        </div>
      </div>
      <div className={`mono ${low && run ? 'blink':''}`}
        style={{ fontSize:30, fontWeight:700, letterSpacing:1, color:accent, minWidth:96, textAlign:'center',
          lineHeight:1 }}>
        {mm}:{ss}
      </div>
      <div style={{ display:'flex', gap:6 }}>
        <button className="btn" onClick={() => setRun(r => !r)} aria-label="play/pause"
          style={{ width:38, height:38, borderRadius:10, background: run ? C.panel3 : accent,
            color: run ? C.text : '#0b0e13', display:'grid', placeItems:'center',
            border:`1px solid ${C.border}` }}>
          {run ? <Pause size={17}/> : <Play size={17}/>}
        </button>
        <button className="btn" onClick={() => { setRun(false); setSec(3600); }} aria-label="reset"
          style={{ width:38, height:38, borderRadius:10, background:C.panel3, color:C.dim,
            display:'grid', placeItems:'center', border:`1px solid ${C.border}` }}>
          <RotateCcw size={16}/>
        </button>
      </div>
    </div>
  );
}

/* ---------- TOP BAR ---------- */
function TopBar({ mode, setMode }) {
  const tabs = [
    { id:'mapa', label:'Mapa', icon:Layers, k:'1' },
    { id:'jornada', label:'Jornada', icon:Route, k:'2' },
    { id:'cola', label:'Cola Rápida', icon:BookOpen, k:'3' },
  ];
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:18,
      padding:'14px 22px', borderBottom:`1px solid ${C.border}`, background:C.panel, flexWrap:'wrap' }}>
      <div style={{ display:'flex', alignItems:'center', gap:13 }}>
        <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#3fb6f0,#7048e8)',
          display:'grid', placeItems:'center', boxShadow:`0 0 22px ${hex('#3fb6f0',.35)}` }}>
          <Activity size={22} color="#fff" strokeWidth={2.4}/>
        </div>
        <div>
          <div className="mono" style={{ fontSize:16, fontWeight:700, letterSpacing:1.5, color:C.text }}>
            TRACKING&nbsp;COCKPIT
          </div>
          <div style={{ fontSize:11.5, color:C.faint }}>
            System Design · entrevista Frontend Sr · Grupo SBF
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:5, background:C.panel2, padding:5, borderRadius:13,
        border:`1px solid ${C.border}` }}>
        {tabs.map(t => {
          const on = mode === t.id;
          const Ic = t.icon;
          return (
            <button key={t.id} className="btn tab" onClick={() => setMode(t.id)}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 16px', borderRadius:9,
                background: on ? C.text : 'transparent', color: on ? '#0b0e13' : C.dim,
                fontSize:13.5, fontWeight:600, fontFamily:"'IBM Plex Sans',sans-serif" }}>
              <Ic size={15}/>{t.label}
              <span className="mono" style={{ fontSize:10, opacity:.5,
                border:`1px solid ${on?'#0b0e13':C.line}`, borderRadius:4, padding:'0 4px' }}>{t.k}</span>
            </button>
          );
        })}
      </div>

      <Timer/>
    </div>
  );
}

/* ---------- MAPA ---------- */
function ComponentCard({ c, color, selected, onClick, delay }) {
  return (
    <button className="card fu" onClick={onClick}
      style={{ flex:'1 1 190px', minWidth:180, textAlign:'left', borderRadius:13, padding:'13px 14px',
        background: selected ? hex(color,.1) : C.panel2,
        border:`1.6px solid ${selected ? color : C.border}`,
        boxShadow: selected ? `0 0 22px ${hex(color,.22)}` : 'none',
        animationDelay:`${delay}ms` }}>
      <div className="mono" style={{ fontSize:10.5, color, fontWeight:600, textTransform:'uppercase',
        letterSpacing:.6, marginBottom:7 }}>{c.tech}</div>
      <div className="mono" style={{ fontSize:14.5, fontWeight:700, color:C.text, marginBottom:6 }}>{c.name}</div>
      <div style={{ fontSize:11.8, color:C.dim, lineHeight:1.5,
        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
        {c.what}
      </div>
    </button>
  );
}

function LayerRow({ layer, selId, onSelect, idx }) {
  return (
    <div className="fu" style={{ display:'flex', gap:14, animationDelay:`${idx*70}ms` }}>
      <div style={{ width:150, flexShrink:0, borderRadius:13, padding:'14px 14px',
        background: hex(layer.color,.09), border:`1.6px solid ${hex(layer.color,.35)}`,
        display:'flex', flexDirection:'column', justifyContent:'center' }}>
        <div className="mono" style={{ fontSize:26, fontWeight:700, color:layer.color, lineHeight:1 }}>
          {layer.n != null ? `0${layer.n}` : '·'}
        </div>
        <div className="mono" style={{ fontSize:12.5, fontWeight:700, color:C.text, marginTop:8,
          lineHeight:1.3 }}>{layer.name}</div>
        <div style={{ fontSize:10.5, color:C.faint, marginTop:4, fontStyle:'italic' }}>{layer.tag}</div>
      </div>
      <div style={{ flex:1, display:'flex', gap:11, flexWrap:'wrap' }}>
        {layer.comps.map((c,i) => (
          <ComponentCard key={c.id} c={c} color={layer.color}
            selected={selId === c.id} onClick={() => onSelect(c.id, layer)}
            delay={idx*70 + i*55}/>
        ))}
      </div>
    </div>
  );
}

function Inspector({ sel }) {
  if (!sel) {
    return (
      <div style={{ padding:'20px 18px' }}>
        <div className="mono" style={{ fontSize:11, color:C.faint, letterSpacing:1,
          textTransform:'uppercase' }}>Inspector</div>
        <div style={{ display:'flex', alignItems:'center', gap:9, marginTop:14, color:C.dim, fontSize:13 }}>
          <MousePointerClick size={17}/> Clique em um componente para ver o detalhe.
        </div>
        <div style={{ height:1, background:C.borderSoft, margin:'18px 0' }}/>
        <div className="mono" style={{ fontSize:11, color:C.faint, letterSpacing:1,
          textTransform:'uppercase', marginBottom:12 }}>As 5 camadas</div>
        {LAYERS.map(l => (
          <div key={l.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:11 }}>
            <div style={{ width:11, height:11, borderRadius:4, background:l.color, flexShrink:0 }}/>
            <div>
              <div className="mono" style={{ fontSize:12.5, color:C.text, fontWeight:600 }}>
                {l.n}. {l.name}
              </div>
              <div style={{ fontSize:10.5, color:C.faint }}>{l.tag}</div>
            </div>
          </div>
        ))}
        <div style={{ marginTop:6, padding:'12px 13px', borderRadius:11, background:hex(C.amber,.08),
          border:`1px solid ${hex(C.amber,.3)}` }}>
          <div className="mono" style={{ fontSize:10.5, color:C.amber, fontWeight:700, letterSpacing:.6,
            textTransform:'uppercase', display:'flex', alignItems:'center', gap:6 }}>
            <Gauge size={13}/> Estimativa de bolso
          </div>
          <div style={{ fontSize:12, color:C.dim, marginTop:7, lineHeight:1.55 }}>
            Centauro ~15 mi visitantes/mês · ~20 eventos/sessão ≈ <b style={{color:C.text}}>300 mi
            eventos/mês</b> ≈ <b style={{color:C.text}}>~115 eventos/s</b> de média · pico ~15× ≈
            <b style={{color:C.text}}> ~1.700 eventos/s</b>.
          </div>
        </div>
      </div>
    );
  }
  const layer = findLayer(sel.layerId) || TRANSVERSAL;
  const col = sel.layerColor || TRANSVERSAL.color;
  return (
    <div className="pp" style={{ padding:'20px 18px' }}>
      <div className="mono" style={{ fontSize:10.5, color:col, fontWeight:700, letterSpacing:1,
        textTransform:'uppercase' }}>{layer.name}</div>
      <div className="mono" style={{ fontSize:21, fontWeight:700, color:C.text, marginTop:6,
        lineHeight:1.2 }}>{sel.name}</div>
      <div style={{ display:'inline-block', marginTop:10, padding:'4px 10px', borderRadius:7,
        background:hex(col,.12), border:`1px solid ${hex(col,.4)}` }}>
        <span className="mono" style={{ fontSize:11, color:col, fontWeight:600 }}>{sel.tech}</span>
      </div>

      <Section label="O que faz" color={col}>
        <p style={{ fontSize:13, color:C.text, lineHeight:1.62 }}>{sel.what}</p>
      </Section>
      <Section label="Por que existe" color={col}>
        <p style={{ fontSize:13, color:C.dim, lineHeight:1.62 }}>{sel.why}</p>
      </Section>
      {sel.talk && (
        <Section label="Fale isto na entrevista" color={col}>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {sel.talk.map((t,i) => (
              <div key={i} style={{ display:'flex', gap:9, alignItems:'flex-start' }}>
                <Quote size={13} color={col} style={{ flexShrink:0, marginTop:3 }}/>
                <span style={{ fontSize:12.5, color:C.text, lineHeight:1.5 }}>{t}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
function Section({ label, color, children }) {
  return (
    <div style={{ marginTop:18 }}>
      <div className="mono" style={{ fontSize:10.5, color:color, fontWeight:700, letterSpacing:1,
        textTransform:'uppercase', marginBottom:8, display:'flex', alignItems:'center', gap:7 }}>
        <span style={{ width:14, height:2, background:color, display:'inline-block' }}/>{label}
      </div>
      {children}
    </div>
  );
}

function MapaView({ sel, setSel }) {
  return (
    <div style={{ display:'flex', gap:16, padding:20, alignItems:'flex-start', flexWrap:'wrap' }}>
      <div style={{ flex:'1 1 620px', display:'flex', flexDirection:'column', gap:14 }}>
        {LAYERS.map((l,i) => (
          <LayerRow key={l.id} layer={l} idx={i} selId={sel?.id}
            onSelect={(id,lay) => setSel(findComp(id))}/>
        ))}
        {/* transversal */}
        <div className="fu" style={{ display:'flex', gap:14, animationDelay:'420ms' }}>
          <div style={{ width:150, flexShrink:0, borderRadius:13, padding:'14px',
            background:hex(TRANSVERSAL.color,.09), border:`1.6px solid ${hex(TRANSVERSAL.color,.35)}`,
            display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <Zap size={22} color={TRANSVERSAL.color}/>
            <div className="mono" style={{ fontSize:12.5, fontWeight:700, color:C.text, marginTop:8,
              lineHeight:1.3 }}>{TRANSVERSAL.name}</div>
            <div style={{ fontSize:10.5, color:C.faint, marginTop:4, fontStyle:'italic' }}>{TRANSVERSAL.tag}</div>
          </div>
          <div style={{ flex:1, display:'flex', gap:11, flexWrap:'wrap' }}>
            {TRANSVERSAL.comps.map((c,i) => (
              <ComponentCard key={c.id} c={c} color={TRANSVERSAL.color}
                selected={sel?.id === c.id}
                onClick={() => setSel({ ...c, layerId:'transversal', layerColor:TRANSVERSAL.color })}
                delay={420 + i*45}/>
            ))}
          </div>
        </div>
      </div>
      <div style={{ flex:'0 1 340px', minWidth:300, position:'sticky', top:20,
        borderRadius:15, background:C.panel, border:`1px solid ${C.border}`, alignSelf:'flex-start' }}>
        <Inspector sel={sel}/>
      </div>
    </div>
  );
}

/* ---------- JORNADA ---------- */
function MiniMap({ activeComp }) {
  return (
    <div style={{ borderRadius:15, background:C.panel, border:`1px solid ${C.border}`, padding:'16px 15px' }}>
      <div className="mono" style={{ fontSize:11, color:C.faint, letterSpacing:1, textTransform:'uppercase',
        marginBottom:14 }}>Onde estamos no sistema</div>
      <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
        {LAYERS.map((l,li) => {
          const hasActive = l.comps.some(c => c.id === activeComp);
          return (
            <div key={l.id} style={{ display:'flex', gap:10, alignItems:'center', position:'relative' }}>
              <div style={{ width:30, flexShrink:0, textAlign:'center' }}>
                <div className="mono" style={{ fontSize:13, fontWeight:700,
                  color: hasActive ? l.color : C.faint }}>{l.n}</div>
                {li < LAYERS.length-1 && (
                  <div style={{ width:2, height:14, background:C.line, margin:'2px auto 0' }}/>
                )}
              </div>
              <div style={{ flex:1, display:'flex', gap:6, flexWrap:'wrap' }}>
                {l.comps.map(c => {
                  const on = c.id === activeComp;
                  return (
                    <div key={c.id} className={on ? 'glow':''}
                      style={{ padding:'5px 9px', borderRadius:8, fontSize:11,
                        fontFamily:"'IBM Plex Mono',monospace", fontWeight:600,
                        background: on ? hex(l.color,.16) : C.panel2,
                        color: on ? l.color : C.faint,
                        border:`1.4px solid ${on ? l.color : C.borderSoft}`,
                        opacity: on ? 1 : .55, '--g0':hex(l.color,0), '--g1':hex(l.color,.5) }}>
                      {c.short || c.name}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JornadaView({ step, setStep }) {
  const s = JOURNEY[step];
  const layer = findLayer(s.layer);
  const col = layer.color;
  const comp = findComp(s.comp);
  return (
    <div style={{ padding:20 }}>
      {/* progresso */}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18, flexWrap:'wrap' }}>
        <div className="mono" style={{ fontSize:13, color:C.dim, fontWeight:600 }}>
          PASSO <span style={{ color:C.text, fontSize:17 }}>{step+1}</span> / {JOURNEY.length}
        </div>
        <div style={{ flex:1, display:'flex', gap:6, minWidth:200 }}>
          {JOURNEY.map((j,i) => {
            const lc = findLayer(j.layer).color;
            const done = i <= step;
            return (
              <button key={i} className="dot btn" onClick={() => setStep(i)}
                style={{ flex:1, height:8, borderRadius:5, border:'none',
                  background: done ? lc : C.line,
                  transform: i === step ? 'scaleY(1.7)' : 'none' }}/>
            );
          })}
        </div>
        <div className="mono" style={{ fontSize:11, color:C.faint }}>← → navega</div>
      </div>

      <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'stretch' }}>
        {/* passo atual */}
        <div className="pp" key={step} style={{ flex:'1 1 460px', borderRadius:16, background:C.panel,
          border:`1px solid ${C.border}`, padding:'24px 24px', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div className="mono" style={{ fontSize:46, fontWeight:700, color:col, lineHeight:.9 }}>
              {String(step+1).padStart(2,'0')}
            </div>
            <div>
              <div style={{ display:'inline-block', padding:'3px 9px', borderRadius:6,
                background:hex(col,.13), border:`1px solid ${hex(col,.4)}` }}>
                <span className="mono" style={{ fontSize:10.5, color:col, fontWeight:700,
                  textTransform:'uppercase', letterSpacing:.6 }}>{layer.n}. {layer.name}</span>
              </div>
              {comp && <div className="mono" style={{ fontSize:11, color:C.faint, marginTop:5 }}>
                componente: {comp.name}</div>}
            </div>
          </div>

          <div className="mono" style={{ fontSize:21, fontWeight:700, color:C.text, marginTop:18,
            lineHeight:1.3 }}>{s.title}</div>
          <p style={{ fontSize:13.5, color:C.dim, lineHeight:1.66, marginTop:12 }}>{s.detail}</p>

          <div style={{ marginTop:'auto', paddingTop:18 }}>
            <div style={{ borderRadius:13, background:hex(col,.1), border:`1.4px solid ${hex(col,.4)}`,
              padding:'15px 16px' }}>
              <div className="mono" style={{ fontSize:10.5, color:col, fontWeight:700, letterSpacing:1,
                textTransform:'uppercase', display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
                <Quote size={13}/> Diga isto em voz alta
              </div>
              <div style={{ fontSize:14.5, color:C.text, lineHeight:1.55, fontWeight:500 }}>
                “{s.say}”
              </div>
            </div>
          </div>
        </div>

        {/* minimapa */}
        <div style={{ flex:'1 1 320px', minWidth:290 }}>
          <MiniMap activeComp={s.comp}/>
        </div>
      </div>

      {/* navegação */}
      <div style={{ display:'flex', gap:12, marginTop:18 }}>
        <button className="btn" onClick={() => setStep(Math.max(0,step-1))} disabled={step===0}
          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            padding:'14px', borderRadius:12, background:C.panel2, color: step===0?C.faint:C.text,
            border:`1px solid ${C.border}`, fontSize:14, fontWeight:600, fontFamily:"'IBM Plex Sans',sans-serif",
            opacity: step===0?.5:1, cursor: step===0?'default':'pointer' }}>
          <ChevronLeft size={18}/> Anterior
        </button>
        <button className="btn" onClick={() => setStep(Math.min(JOURNEY.length-1,step+1))}
          disabled={step===JOURNEY.length-1}
          style={{ flex:2, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            padding:'14px', borderRadius:12,
            background: step===JOURNEY.length-1 ? C.panel2 : C.text,
            color: step===JOURNEY.length-1 ? C.faint : '#0b0e13',
            border:`1px solid ${C.border}`, fontSize:14, fontWeight:700, fontFamily:"'IBM Plex Sans',sans-serif",
            opacity: step===JOURNEY.length-1?.5:1,
            cursor: step===JOURNEY.length-1?'default':'pointer' }}>
          Próximo passo <ChevronRight size={18}/>
        </button>
      </div>
    </div>
  );
}

/* ---------- COLA RÁPIDA ---------- */
function ColaCard({ children, accent }) {
  return (
    <div style={{ borderRadius:14, background:C.panel, border:`1px solid ${C.border}`,
      padding:'16px 17px', borderTop:`2.5px solid ${accent}` }}>
      {children}
    </div>
  );
}
function ColaHead({ icon:Ic, label, color }) {
  return (
    <div className="mono" style={{ fontSize:12, color, fontWeight:700, letterSpacing:.8,
      textTransform:'uppercase', display:'flex', alignItems:'center', gap:8, marginBottom:13 }}>
      <Ic size={15}/>{label}
    </div>
  );
}
function ColaView() {
  return (
    <div style={{ padding:20 }}>
      {/* estimativa em destaque */}
      <div className="fu" style={{ borderRadius:14, padding:'17px 19px', marginBottom:16,
        background:`linear-gradient(135deg,${hex(C.amber,.13)},${hex('#fb923c',.07)})`,
        border:`1px solid ${hex(C.amber,.34)}` }}>
        <ColaHead icon={Gauge} label="Estimativa de bolso — abra com isto" color={C.amber}/>
        <div style={{ display:'flex', gap:22, flexWrap:'wrap' }}>
          {[['~15 mi','visitantes/mês'],['~20','eventos/sessão'],['~300 mi','eventos/mês'],
            ['~115/s','média'],['~1.700/s','pico (15×)']].map((x,i) => (
            <div key={i}>
              <div className="mono" style={{ fontSize:22, fontWeight:700, color:C.text }}>{x[0]}</div>
              <div style={{ fontSize:11, color:C.dim }}>{x[1]}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16 }}>
        {/* trade-offs */}
        <div className="fu" style={{ animationDelay:'60ms' }}>
          <ColaCard accent="#fb923c">
            <ColaHead icon={Zap} label="Trade-offs para citar" color="#fb923c"/>
            <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
              {TRADEOFFS.map((t,i) => (
                <div key={i}>
                  <div className="mono" style={{ fontSize:12.5, fontWeight:700, color:C.text }}>{t.t}</div>
                  <div style={{ fontSize:12, color:C.dim, lineHeight:1.55, marginTop:3 }}>{t.d}</div>
                </div>
              ))}
            </div>
          </ColaCard>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* perguntas */}
          <div className="fu" style={{ animationDelay:'120ms' }}>
            <ColaCard accent="#3fb6f0">
              <ColaHead icon={HelpCircle} label="Pergunte no início (0–10 min)" color="#3fb6f0"/>
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {QUESTIONS.map((q,i) => (
                  <div key={i} style={{ display:'flex', gap:9, alignItems:'flex-start' }}>
                    <span className="mono" style={{ fontSize:11, color:'#3fb6f0', fontWeight:700,
                      flexShrink:0, marginTop:1 }}>Q{i+1}</span>
                    <span style={{ fontSize:12.3, color:C.text, lineHeight:1.5 }}>{q}</span>
                  </div>
                ))}
              </div>
            </ColaCard>
          </div>

          {/* ordem de desenho */}
          <div className="fu" style={{ animationDelay:'180ms' }}>
            <ColaCard accent="#34d399">
              <ColaHead icon={ListChecks} label="Ordem de desenho no whiteboard" color="#34d399"/>
              <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                {DRAW_ORDER.map((d,i) => (
                  <div key={i} style={{ display:'flex', gap:11 }}>
                    <div style={{ flexShrink:0 }}>
                      <div className="mono" style={{ fontSize:10, color:'#34d399', fontWeight:700 }}>{d.t}</div>
                      <div style={{ width:2, height:'calc(100% - 14px)', background:C.line,
                        margin:'4px auto 0' }}/>
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize:12.5, fontWeight:700, color:C.text }}>{d.h}</div>
                      <div style={{ fontSize:11.8, color:C.dim, lineHeight:1.5, marginTop:2 }}>{d.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ColaCard>
          </div>
        </div>

        {/* palavras-chave */}
        <div className="fu" style={{ animationDelay:'240ms' }}>
          <ColaCard accent="#a78bfa">
            <ColaHead icon={Key} label="Palavras-chave para soltar" color="#a78bfa"/>
            <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
              {KEYWORDS.map((k,i) => (
                <div key={i}>
                  <div className="mono" style={{ fontSize:10.5, color:'#a78bfa', fontWeight:700,
                    letterSpacing:.5, textTransform:'uppercase', marginBottom:6 }}>{k.g}</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {k.w.map((w,j) => (
                      <span key={j} className="mono" style={{ fontSize:11, color:C.text,
                        background:C.panel3, border:`1px solid ${C.border}`, borderRadius:7,
                        padding:'4px 9px' }}>{w}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ColaCard>
        </div>
      </div>
    </div>
  );
}

/* ---------- APP ---------- */
export default function App() {
  const [mode, setMode] = useState('mapa');
  const [sel, setSel] = useState(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const h = (e) => {
      if (['1','2','3'].includes(e.key)) {
        setMode(e.key === '1' ? 'mapa' : e.key === '2' ? 'jornada' : 'cola');
      }
      if (mode === 'jornada') {
        if (e.key === 'ArrowRight') setStep(s => Math.min(JOURNEY.length-1, s+1));
        if (e.key === 'ArrowLeft') setStep(s => Math.max(0, s-1));
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [mode]);

  return (
    <div className="ck" style={{ height:'100vh', display:'flex', flexDirection:'column',
      color:C.text, overflow:'hidden',
      background:`radial-gradient(1200px 620px at 75% -12%, #161d2b, ${C.bg})` }}>
      <style>{CSS}</style>
      <TopBar mode={mode} setMode={setMode}/>
      <div style={{ flex:1, overflowY:'auto' }}>
        {mode === 'mapa' && <MapaView sel={sel} setSel={setSel}/>}
        {mode === 'jornada' && <JornadaView step={step} setStep={setStep}/>}
        {mode === 'cola' && <ColaView/>}
      </div>
    </div>
  );
}
