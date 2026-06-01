'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  Activity, Layers, Route, BookOpen, Play, Pause, RotateCcw,
  ChevronLeft, ChevronRight, Quote, HelpCircle,
  ListChecks, Key, Gauge, Zap, MousePointerClick
} from 'lucide-react';

/* ============================================================
   UBER COCKPIT — apoio de System Design para a entrevista
   Ride-sharing / FAANG — uso ao vivo, modo console.
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
  { id:'client', n:1, name:'Client / App', tag:'onde o usuário age', color:'#3fb6f0',
    comps:[
      { id:'rn', name:'React Native / PWA', tech:'React Native · Zustand · Service Worker', short:'RN/PWA',
        what:'App nativo ou web. Estado local com Zustand. Offline-first via Service Worker.',
        why:'É a interface do usuário — onde o pedido de corrida começa. Offline-first permite ver histórico sem rede.',
        talk:['Zustand com selectors granulares evita re-renders','Service Worker para cache seletivo (histórico offline)','Optimistic UI nas ações do usuário'] },
      { id:'map', name:'Map Component (Mapbox)', tech:'Mapbox GL · WebGL · GeoJSON', short:'Mapbox',
        what:'Renderiza posição do motorista via WebGL com GeoJSON layer — não React Markers.',
        why:'> 10 markers → GeoJSON layer no WebGL. React Markers causam re-render a cada posição. WebGL aguenta centenas de pontos.',
        talk:['GeoJSON setData atualiza sem React re-render','WebGL layer = performance mesmo com muitos motoristas','Marker HTML só para < 10 elementos interativos'] },
      { id:'optimistic', name:'Optimistic UI', tech:'React Query · rollback', short:'Optimistic UI',
        what:'Ações do usuário atualizam a UI instantaneamente, com rollback automático em caso de erro.',
        why:'Percepção de velocidade: o usuário vê resultado imediato. Usar em ações reversíveis — NUNCA em pagamento.',
        talk:['setQueryData antes do request','onError faz rollback ao estado anterior','Não usar em pagamento ou ações irreversíveis'] },
      { id:'realtime', name:'Real-time Listener', tech:'SSE · WebSocket · EventSource', short:'Real-time',
        what:'SSE para status da corrida (baixa freq), WebSocket para posição do motorista (alta freq, ~500ms).',
        why:'SSE tem reconexão automática — ideal para status. WebSocket para posição pois precisa de baixa latência bidirecional.',
        talk:['SSE: reconexão automática, simples, HTTP','WebSocket: latência < 500ms para tracking','Fallback SSE se WebSocket bloqueado em proxy'] },
    ]},
  { id:'gateway', n:2, name:'API Gateway / BFF', tag:'a porta protegida', color:'#a78bfa',
    comps:[
      { id:'bff', name:'BFF (Backend for Frontend)', tech:'Node.js · GraphQL', short:'BFF',
        what:'Agrega chamadas de múltiplos microserviços em uma resposta otimizada para o cliente.',
        why:'Evita waterfall de requests: em vez de 3 calls sequenciais no client, o BFF faz 1 request paralelo no servidor.',
        talk:['BFF evita waterfall do client','Paralleliza Pricing + Driver + Maps em um request','Trade-off: mais um serviço para manter'] },
      { id:'auth', name:'Auth / JWT', tech:'JWT · HttpOnly Cookie', short:'Auth',
        what:'Valida token em cada request. Refresh token com HttpOnly cookie.',
        why:'Segurança: JWT stateless escala horizontalmente. HttpOnly cookie previne XSS no refresh token.',
        talk:['JWT para autenticação stateless','Refresh token em HttpOnly cookie (imune a XSS)','Revogar tokens via blacklist no Redis'] },
      { id:'ratelimit', name:'Rate Limiting', tech:'Redis · sliding window', short:'Rate Limit',
        what:'Protege contra abuse por usuário/IP com sliding window no Redis.',
        why:'Sem rate limit, um usuário pode fazer flood de pedidos de corrida ou scraping de preços.',
        talk:['Sliding window mais preciso que fixed window','Redis com TTL por chave (user_id ou IP)','Retornar 429 com Retry-After header'] },
      { id:'wsgateway', name:'WebSocket Gateway', tech:'Redis Pub/Sub · horizontal scale', short:'WS Gateway',
        what:'Gerencia conexões WebSocket com Redis Pub/Sub para escala horizontal.',
        why:'WebSocket é stateful — sem Pub/Sub, um evento publicado numa instância não chega ao client em outra.',
        talk:['Redis Pub/Sub desacopla instâncias de WS','Cada instância publica no canal do ride_id','Client recebe via qualquer instância'] },
    ]},
  { id:'services', n:3, name:'Microserviços', tag:'o coração da corrida', color:'#fb923c',
    comps:[
      { id:'ride', name:'Ride Service', tech:'máquina de estados · PostGIS', short:'Ride',
        what:'Máquina de estados da corrida: requesting → matching → en-route → arrived → in-ride → completed.',
        why:'Estado explícito evita corridas em estado inconsistente. Cada transição tem regras de negócio claras.',
        talk:['Máquina de estados: cada transição é explícita','Timeout de 30s para motorista aceitar','Geofence detecta arrived (50m do pickup)'] },
      { id:'driver', name:'Driver Service', tech:'posição · Kafka producer', short:'Driver',
        what:'Gerencia estado e posição dos motoristas. Publica atualizações de posição no Message Broker a cada 2s.',
        why:'Alta frequência de atualizações — desacoplar via Kafka evita que o client sobrecarregue o banco diretamente.',
        talk:['Posição publicada no Kafka a cada 2s','Redis armazena posição atual com TTL 10s','TTL 10s: motorista sumiu = considerado offline'] },
      { id:'pricing', name:'Pricing Service', tech:'surge pricing · fare calculation', short:'Pricing',
        what:'Surge pricing e cálculo de fare em tempo real. Calculado sempre no servidor.',
        why:'NUNCA calcular preço no client — pode ser manipulado. Surge baseado em oferta/demanda por zona geográfica.',
        talk:['Surge calculado no servidor, nunca no client','Algoritmo por zona geográfica (hexágonos H3)','Fare final = distância real + tempo + surge'] },
      { id:'notification', name:'Notification Service', tech:'Web Push · FCM · VAPID', short:'Notifications',
        what:'Orquestra push notifications via Web Push (PWA) e FCM (app nativo).',
        why:'Motorista precisa ser notificado fora do app. Push notification é o canal mais confiável.',
        talk:['VAPID para Web Push (sem SDK proprietário)','FCM para Android/iOS nativo','Timeout de 30s sem aceite → próximo motorista'] },
    ]},
  { id:'data', n:4, name:'Dados & Mensageria', tag:'onde o dado flui e descansa', color:'#eab64a',
    comps:[
      { id:'kafka', name:'Message Broker (Kafka)', tech:'Kafka · partição · durável', short:'Kafka',
        what:'Buffer de eventos de posição (alta frequência). Desacopla Driver Service de consumidores.',
        why:'Alta taxa de atualizações de posição — Kafka absorve o pico e garante que nenhum evento de localização se perde.',
        talk:['Particionado por ride_id ou driver_id','Consumidores independentes: Redis updater, analytics, replay','Durável: pode reprocessar trajetória completa'] },
      { id:'postgis', name:'PostGIS / Postgres', tech:'geoespacial · ST_DWithin · GIST', short:'PostGIS',
        what:'Dados geoespaciais, corridas e usuários. Queries geoespaciais para busca de motoristas em raio.',
        why:'ST_DWithin com índice GIST é a forma eficiente de buscar motoristas dentro de N metros. Sem índice = full scan.',
        talk:['ST_DWithin(driver_pos, pickup, 5000) com índice GIST','Raio de busca: 5km inicial, expande se poucos motoristas','Dados de corrida: tabela imutável, só inserts'] },
      { id:'redis', name:'Redis', tech:'cache · TTL · Pub/Sub', short:'Redis',
        what:'Cache de posições de motoristas (atualiza a cada 2s), sessões e estado de corridas ativas.',
        why:'Leitura de posição em < 1ms. Banco relacional não aguenta milhares de queries de posição por segundo.',
        talk:['TTL 10s nas posições — motorista offline se sumir','Hash por driver_id com lat/lng','Eventual consistency aceitável para posição'] },
      { id:'timeseries', name:'Time Series DB', tech:'InfluxDB · replay · analytics', short:'Time Series',
        what:'Grava todas as posições do motorista durante a corrida para replay e analytics.',
        why:'Permite reconstruir o trajeto exato — usado para contestação de fare e treino de modelos de ETA.',
        talk:['Grava cada posição com timestamp','Replay do trajeto para validação de fare','Base para modelo de ML de ETA'] },
    ]},
  { id:'infra', n:5, name:'Infraestrutura', tag:'o que sustenta tudo', color:'#34d399',
    comps:[
      { id:'cdn', name:'CDN', tech:'assets · map tiles · cache agressivo', short:'CDN',
        what:'Assets estáticos (JS, CSS, map tiles). Cache agressivo com hash nos nomes dos arquivos.',
        why:'Map tiles são a maior parte do payload do app. Cache na borda elimina latência de round-trip ao servidor.',
        talk:['Content-hash nos nomes: cache forever','Map tiles: maior ganho de performance','Stale-while-revalidate para JS/CSS'] },
      { id:'storage', name:'Object Storage (S3)', tech:'S3 · fotos de perfil', short:'S3',
        what:'Fotos de perfil de motoristas e usuários. Upload direto do client via presigned URL.',
        why:'Presigned URL: client faz upload direto no S3, sem passar pelo servidor. Reduz carga e latência.',
        talk:['Presigned URL para upload direto','CloudFront na frente do S3 para leitura','Revalidação de foto via hash no nome'] },
      { id:'observability', name:'Observabilidade', tech:'OpenTelemetry · Prometheus · Loki', short:'Observability',
        what:'Traces distribuídos (OpenTelemetry), métricas (Prometheus) e logs (Loki).',
        why:'Em microserviços, um erro pode cruzar 5 serviços. Trace distribuído é a única forma de achar o gargalo.',
        talk:['trace_id propagado por todos os serviços','SLO: 99.9% matching em < 2s','Alertas em P99 de latência do WebSocket'] },
      { id:'cicd', name:'CI/CD', tech:'GitHub Actions · canary deploy', short:'CI/CD',
        what:'GitHub Actions → staging → canary deploy (10% dos usuários veem a nova versão).',
        why:'Canary reduz blast radius de bugs em produção. 10% afetados em vez de 100%.',
        talk:['Canary: 10% do tráfego na nova versão','Feature flags para rollout gradual','Rollback automático em aumento de erro rate'] },
    ]},
];

const JOURNEY = [
  { layer:'client', comp:'optimistic', title:'Usuário solicita corrida',
    detail:'Usuário define origem e destino. O app faz request ao Ride Service. UI mostra loading optimistic com estimativa de preço calculada localmente.',
    say:'"A primeira ação é optimistic — mostro preço estimado imediatamente sem esperar o servidor."' },
  { layer:'gateway', comp:'bff', title:'BFF agrega dados necessários',
    detail:'BFF chama simultaneamente: Pricing Service (fare), Driver Service (motoristas próximos) e Maps API (ETA). Retorna tudo em uma única resposta.',
    say:'"O BFF evita waterfalls — em vez de 3 requests sequenciais do client, faço 1 request paralelo no servidor."' },
  { layer:'services', comp:'ride', title:'Matching de motorista',
    detail:'Ride Service consulta PostGIS para motoristas em raio de 5km. Algoritmo de matching considera distância, rating e tipo de veículo. Estado muda para matching.',
    say:'"A query geoespacial usa PostGIS: ST_DWithin(driver_position, pickup_point, 5000) com índice GIST."' },
  { layer:'services', comp:'notification', title:'Notificação ao motorista',
    detail:'Notification Service envia push notification ao motorista (Web Push ou FCM). Se não aceitar em 30s, passa para o próximo motorista da fila.',
    say:'"O timeout de 30s é crítico — sem ele, a corrida trava. Implementar máquina de estados com expiração."' },
  { layer:'client', comp:'realtime', title:'Tracking em tempo real começa',
    detail:'Motorista se move. Driver Service recebe posições a cada 2s e publica no Kafka. Stream Processor atualiza Redis. Client recebe via SSE e Mapbox atualiza o pin via GeoJSON setData — sem React re-render.',
    say:'"Atualizo o marker do mapa imperativamente via Mapbox API — não uso setState, evito re-render a cada 2s."' },
  { layer:'services', comp:'ride', title:'Motorista chega ao local',
    detail:'Ride Service detecta geofence (motorista dentro de 50m do pickup). Muda status para arrived. Dispara notificação ao usuário. Inicia timer de espera (2min grátis, depois cobrança).',
    say:'"Geofence detection no servidor — não no client. Checar ST_DWithin entre posição do motorista e pickup a cada update."' },
  { layer:'data', comp:'kafka', title:'Corrida em andamento — posições fluem',
    detail:'Posições continuam fluindo pelo Kafka. Time Series DB grava todas as posições para reconstrução do trajeto. Redis mantém posição atual. Frontend mostra rota em tempo real.',
    say:'"Guardo todas as posições no Time Series para replay — permite calcular o trajeto exato cobrado ao usuário."' },
  { layer:'services', comp:'pricing', title:'Corrida concluída — pagamento',
    detail:'Fare final calculado baseado em distância real + tempo + surge. Payment Service cobra o método salvo. Recibo gerado. Estado muda para completed.',
    say:'"O pagamento é o único step sem optimistic UI — aguardo confirmação real antes de mostrar sucesso."' },
  { layer:'infra', comp:'observability', title:'Dados para analytics e ML',
    detail:'Evento de corrida completa vai para o pipeline de analytics. ML atualiza modelo de surge pricing. Rating do motorista disponível para avaliação.',
    say:'"Cada corrida completa alimenta o modelo de ML de surge pricing — o sistema fica mais preciso com o tempo."' },
];

const TRADEOFFS = [
  { t:'WebSocket vs SSE', d:'SSE para status da corrida (baixa freq, reconexão automática). WebSocket para posição do motorista (alta freq, ~500ms). SSE é HTTP puro — não bloqueia em proxies corporativos.' },
  { t:'Optimistic UI', d:'Usar em likes, ratings, status updates. NUNCA em pagamento ou ações irreversíveis. Rollback automático via React Query onError.' },
  { t:'GeoJSON vs React Markers', d:'> 10 markers → GeoJSON layer (WebGL, sem React re-render). < 10 markers interativos → Marker HTML. Para tracking de motorista: GeoJSON é obrigatório.' },
  { t:'BFF pattern', d:'Evita waterfall de requests no client. Paralleliza Pricing + Driver + Maps. Trade-off: mais um serviço para manter. Vale para mobile onde latência é maior.' },
  { t:'Redis TTL para posições', d:'TTL de 10s — se motorista sumir por 10s, considerado offline. Eventual consistency aceitável. Leitura em < 1ms.' },
  { t:'Canary deploy', d:'10% dos usuários veem nova versão. Feature flags controlam rollout gradual. Rollback automático se error rate aumentar.' },
  { t:'Offline-first seletivo', d:'Corrida não pode ser solicitada offline, mas histórico de corridas sim. Cache seletivo via Service Worker — não cachear tudo.' },
  { t:'Surge pricing server-side', d:'NUNCA calcular no client — pode ser manipulado. Algoritmo por zona geográfica (hexágonos H3). Transparente para o usuário antes de confirmar.' },
];

const QUESTIONS = [
  'Volume de usuários simultâneos no pico? (isso determina o sizing do WebSocket Gateway)',
  'Quais plataformas? React Native, PWA ou ambos?',
  'Há estimativa de motoristas ativos por cidade? (determina escala do tracking)',
  'Dados de posição devem ser armazenados? Por quanto tempo? (compliance + replay de trajeto)',
  'Existe budget de infraestrutura? (managed services vs self-hosted)',
  'Quais são os SLOs? (disponibilidade, latência máxima do tracking, latência do matching)',
];

const DRAW_ORDER = [
  { t:'0–10 min', h:'Requisitos & estimativas', d:'Faça as 6 perguntas. Estime usuários simultâneos. Defina SLOs. Volume de posições/s.' },
  { t:'10–20 min', h:'Arquitetura de alto nível', d:'As 5 camadas de cima para baixo. Fluxo do pedido de corrida com setas.' },
  { t:'20–40 min', h:'Aprofundar: tracking + BFF + geofence', d:'WebSocket vs SSE, PostGIS, Kafka para posições, Redis TTL.' },
  { t:'40–50 min', h:'Infraestrutura', d:'CDN para map tiles, canary deploy, observabilidade com trace distribuído.' },
  { t:'50–60 min', h:'Trade-offs e perguntas do entrevistador', d:'"Se o pico triplicar, o gargalo é o WS Gateway; escalo com Redis Pub/Sub." Feche com riscos.' },
];

const KEYWORDS = [
  { g:'Real-time', w:['WebSocket','SSE','EventSource','Kafka','Redis Pub/Sub','heartbeat','reconnect'] },
  { g:'Geo', w:['PostGIS','ST_DWithin','GIST index','geofence','GeoJSON','Mapbox GL','H3 hexagons'] },
  { g:'Performance', w:['WebGL','GeoJSON layer','optimistic UI','BFF','waterfall','setData'] },
  { g:'Infra', w:['canary deploy','feature flags','CDN','Service Worker','VAPID','Web Push','presigned URL'] },
  { g:'State', w:['Zustand','selector granular','React Query','setQueryData','optimistic','rollback'] },
];

const PHASES = [
  { s:0, label:'Requisitos & estimativas' },
  { s:600, label:'Arquitetura de alto nível' },
  { s:1200, label:'Tracking + BFF + geofence' },
  { s:2400, label:'Infraestrutura' },
  { s:3000, label:'Trade-offs & gargalos' },
];

/* helpers */
const ALL = LAYERS.flatMap((l: any) => l.comps.map((c: any) => ({ ...c, layerId:l.id, layerColor:l.color, layerName:l.name })));
const findComp = (id: string) => ALL.find((c: any) => c.id === id);
const findLayer = (id: string) => LAYERS.find((l: any) => l.id === id);
const hex = (h: string, a: number) => {
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
  const phaseIdx = PHASES.reduce((a: any, p: any, i: number) => (elapsed >= p.s ? i : a), 0);
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
function TopBar({ mode, setMode }: any) {
  const tabs = [
    { id:'mapa', label:'Mapa', icon:Layers, k:'1' },
    { id:'jornada', label:'Jornada', icon:Route, k:'2' },
    { id:'cola', label:'Cola Rápida', icon:BookOpen, k:'3' },
  ];
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:18,
      padding:'14px 22px', borderBottom:`1px solid ${C.border}`, background:C.panel, flexWrap:'wrap' }}>
      <div style={{ display:'flex', alignItems:'center', gap:13 }}>
        <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#3fb6f0,#fb923c)',
          display:'grid', placeItems:'center', boxShadow:`0 0 22px ${hex('#fb923c',.35)}` }}>
          <Activity size={22} color="#fff" strokeWidth={2.4}/>
        </div>
        <div>
          <div className="mono" style={{ fontSize:16, fontWeight:700, letterSpacing:1.5, color:C.text }}>
            UBER&nbsp;COCKPIT
          </div>
          <div style={{ fontSize:11.5, color:C.faint }}>
            System Design · entrevista Frontend Sr · Ride-sharing / FAANG
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:5, background:C.panel2, padding:5, borderRadius:13,
        border:`1px solid ${C.border}` }}>
        {tabs.map((t: any) => {
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

      <a
        href="/arquitetura"
        className="btn"
        title="Voltar ao cockpit principal"
        style={{
          display:'flex', alignItems:'center', gap:6, padding:'7px 12px',
          background:C.panel3, color:C.dim, border:`1px solid ${C.border}`,
          borderRadius:9, fontFamily:"'IBM Plex Sans',sans-serif",
          fontSize:12, fontWeight:600, textDecoration:'none',
        }}
      >
        ← Tracking Cockpit
      </a>

      <Timer/>
    </div>
  );
}

/* ---------- MAPA ---------- */
function ComponentCard({ c, color, selected, onClick, delay }: any) {
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

function LayerRow({ layer, selId, onSelect, idx }: any) {
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
        {layer.comps.map((c: any, i: number) => (
          <ComponentCard key={c.id} c={c} color={layer.color}
            selected={selId === c.id} onClick={() => onSelect(c.id, layer)}
            delay={idx*70 + i*55}/>
        ))}
      </div>
    </div>
  );
}

function Section({ label, color, children }: any) {
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

function Inspector({ sel }: any) {
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
        {LAYERS.map((l: any) => (
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
            Uber ~5 mi corridas/dia · ~500 posições/corrida ≈ <b style={{color:C.text}}>2,5 bi posições/dia</b> ≈
            <b style={{color:C.text}}> ~29.000 posições/s</b> de média · pico ~5× ≈
            <b style={{color:C.text}}> ~145.000 posições/s</b>.
          </div>
        </div>
      </div>
    );
  }
  const layer = findLayer(sel.layerId);
  const col = sel.layerColor || '#3fb6f0';
  return (
    <div className="pp" style={{ padding:'20px 18px' }}>
      <div className="mono" style={{ fontSize:10.5, color:col, fontWeight:700, letterSpacing:1,
        textTransform:'uppercase' }}>{layer?.name ?? ''}</div>
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
            {sel.talk.map((t: string, i: number) => (
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

function MapaView({ sel, setSel }: any) {
  return (
    <div style={{ display:'flex', gap:16, padding:20, alignItems:'flex-start', flexWrap:'wrap' }}>
      <div style={{ flex:'1 1 620px', display:'flex', flexDirection:'column', gap:14 }}>
        {LAYERS.map((l,i) => (
          <LayerRow key={l.id} layer={l} idx={i} selId={sel?.id}
            onSelect={(id: string) => setSel(findComp(id))}/>
        ))}
      </div>
      <div style={{ flex:'0 1 340px', minWidth:300, position:'sticky', top:20,
        borderRadius:15, background:C.panel, border:`1px solid ${C.border}`, alignSelf:'flex-start' }}>
        <Inspector sel={sel}/>
      </div>
    </div>
  );
}

/* ---------- JORNADA ---------- */
function MiniMap({ activeComp }: any) {
  return (
    <div style={{ borderRadius:15, background:C.panel, border:`1px solid ${C.border}`, padding:'16px 15px' }}>
      <div className="mono" style={{ fontSize:11, color:C.faint, letterSpacing:1, textTransform:'uppercase',
        marginBottom:14 }}>Onde estamos no sistema</div>
      <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
        {LAYERS.map((l,li) => {
          const hasActive = l.comps.some((c: any) => c.id === activeComp);
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
                {l.comps.map((c: any) => {
                  const on = c.id === activeComp;
                  return (
                    <div key={c.id} className={on ? 'glow':''}
                      style={{ padding:'5px 9px', borderRadius:8, fontSize:11,
                        fontFamily:"'IBM Plex Mono',monospace", fontWeight:600,
                        background: on ? hex(l.color,.16) : C.panel2,
                        color: on ? l.color : C.faint,
                        border:`1.4px solid ${on ? l.color : C.borderSoft}`,
                        opacity: on ? 1 : .55, ...({'--g0':hex(l.color,0), '--g1':hex(l.color,.5)} as React.CSSProperties) }}>
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

function JornadaView({ step, setStep }: any) {
  const s = JOURNEY[step];
  const layer = findLayer(s.layer)!;
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
            const lc = findLayer(j.layer)!.color;
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
                {s.say}
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
function ColaCard({ children, accent }: any) {
  return (
    <div style={{ borderRadius:14, background:C.panel, border:`1px solid ${C.border}`,
      padding:'16px 17px', borderTop:`2.5px solid ${accent}` }}>
      {children}
    </div>
  );
}
function ColaHead({ icon:Ic, label, color }: any) {
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
          {[['~5 mi','corridas/dia'],['~500','posições/corrida'],['~2,5 bi','posições/dia'],
            ['~29k/s','média'],['~145k/s','pico (5×)']].map((x,i) => (
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
const UBER_COCKPIT_STATE_KEY = 'react-tips-uber-cockpit-state';

export function UberCockpitClient() {
  const [mode, setMode] = useState('mapa');
  const [sel, setSel] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // Restore state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(UBER_COCKPIT_STATE_KEY);
      if (saved) {
        const s = JSON.parse(saved);
        if (s.mode) setMode(s.mode);
        if (s.selId) setSel(findComp(s.selId));
        if (typeof s.step === 'number') setStep(s.step);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Persist state on change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(UBER_COCKPIT_STATE_KEY, JSON.stringify({
      mode, selId: sel?.id ?? null, step,
    }));
  }, [hydrated, mode, sel, step]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
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
      background:`radial-gradient(1200px 620px at 75% -12%, #1a1608, ${C.bg})` }}>
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
