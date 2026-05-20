import { readFileSync, writeFileSync } from 'fs'

const existing = JSON.parse(readFileSync('./src/data/concepts.json', 'utf8'))

const newConcepts = [
  {
    id: 104, emoji: '🛰️', title: 'System Design — Tracking de Eventos (Visão Geral)',
    level: 'System Design', color: '#3fb6f0',
    summary: '5 camadas: Cliente, Coleta, Streaming, Armazenamento, Consumo. O caso de estudo clássico do Grupo SBF.',
    definition: 'Sistema de tracking captura eventos do usuário (cliques, page views, add_to_cart, purchase) no browser e os entrega para análise em tempo real e histórica. Arquitetura em 5 camadas + transversal: (1) Cliente — storefront + Event SDK + dataLayer + batching. (2) Coleta — CDN + Gateway + Collector + Consent LGPD. (3) Streaming — Kafka + Flink + Schema Registry. (4) Armazenamento — Data Lake (S3) + OLAP (ClickHouse) + Warehouse. (5) Consumo — Dashboards + BI + ML + A/B test. Transversal — CI/CD, IaC, Observabilidade, Segurança/LGPD, QA.',
    problem: 'E-commerce precisa medir tudo: conversão, funil, atribuição, recomendação. Sem dado, marketing trabalha no escuro e produto não sabe o que mover. Mas o volume é alto: Centauro tem ~115 eventos/s média e ~1700/s no pico de Black Friday — qualquer pipeline ingênuo cai.',
    solution: 'Pipeline desacoplado: cliente → broker (Kafka) → processor (Flink) → armazenamento (Lake + OLAP). Broker absorve picos, processor enriquece e deduplica, armazenamento separa hot path (OLAP) de cold path (Warehouse). event_id (UUID) garante idempotência em qualquer ponto.',
    tip: 'Comece pela estimativa de bolso: ~15 mi visitantes/mês × 20 eventos/sessão = 300 mi eventos/mês = 115/s média = ~1700/s no pico. Isso dimensiona toda a conversa: que broker, quantas partições, qual OLAP. Estimativa primeiro, arquitetura depois.',
    questions: [
      { q: 'Qual a primeira pergunta a fazer ao entrevistador?', a: 'Volume esperado em eventos/segundo no pico (Black Friday). Tudo dimensiona a partir disso. Em seguida: perda de evento é tolerável? Latência aceitável? Quem consome — marketing, BI, ML? Cloud preferida? LGPD?' },
      { q: 'Qual a ordem de desenho no whiteboard (60 min)?', a: '0-10min: requisitos + estimativas. 10-20min: 5 caixas-camada de cima para baixo com setas. 20-40min: aprofundar 2-3 pontos (contrato de evento, broker+processor, modelo OLAP). 40-50min: camada transversal (CI/CD, observabilidade, SLO). 50-60min: trade-offs e gargalos.' },
      { q: 'Hot path vs cold path: o que é?', a: 'Hot path: caminho quente em segundos para operação (Kafka → Flink → ClickHouse → Dashboard). Cold path: caminho frio em batch para análise histórica (Lake → Warehouse → BI/ML). Arquitetura Lambda/Kappa. Dois caminhos para necessidades diferentes.' }
    ],
    code: `// Pipeline completo de tracking — visão de alto nível

// 1. Cliente
window.track('add_to_cart', {
  event_id: crypto.randomUUID(),      // idempotência
  client_timestamp: Date.now(),
  sku: 'NIK-123', price: 299.90,
  session_id: getSession(),
})

// 2. Envio resiliente (sendBeacon + batching)
const batch = queue.flush()
navigator.sendBeacon('/collect', JSON.stringify(batch))

// 3. Collector (Node/Go) — leve, escala horizontal
app.post('/collect', async (req, res) => {
  if (!hasConsent(req)) return res.status(204).end()
  await kafka.produce('events.raw', req.body, {
    partition: hash(req.body.session_id),
  })
  res.status(204).end()  // responde rápido
})

// 4. Stream processor (Flink) — enrich + dedupe + session
events.raw
  .keyBy(e => e.session_id)
  .process(new EnrichEvents())       // geo, device, user
  .filter(e => !seen.contains(e.event_id))  // dedupe
  .window(SessionWindows.withGap(30min))    // sessionização
  .sink(s3Lake, clickHouseOlap)

// 5. Consumo — query no OLAP
SELECT count(*) FROM events
WHERE event_name = 'add_to_cart'
  AND timestamp > now() - INTERVAL 1 HOUR`
  },
  {
    id: 105, emoji: '📡', title: 'System Design — Camada Cliente (Event SDK)',
    level: 'System Design', color: '#3fb6f0',
    summary: 'Event SDK, dataLayer (GA4), batching + sendBeacon, Pixel App da VTEX IO. Onde o evento nasce.',
    definition: 'A camada cliente é onde o evento é capturado. Componentes: (1) Storefront VTEX IO — React/SSR via Store Framework. (2) Event SDK / Pixel App — biblioteca que escuta cliques, scroll, page views e monta o objeto do evento já com event_id (UUID). (3) dataLayer / GTM — padroniza num schema único (GA4) antes de sair do browser. (4) Batching + sendBeacon — agrupa em lote, mantém fila local com retry, envia com navigator.sendBeacon que sobrevive ao fechamento da aba.',
    problem: 'Cada página instrumentando do seu jeito gera schema inconsistente. Eventos perdidos quando o usuário fecha a aba antes do request terminar. fetch() bloqueia o unload da página. Volume de requests excessivo se enviar um por evento.',
    solution: 'SDK centralizado padroniza captura. dataLayer padroniza schema (GA4). sendBeacon não bloqueia unload — sobrevive ao fechamento. Batching reduz requests (10-30 eventos por lote). Fila local com backoff exponencial garante entrega mesmo se a rede oscilar.',
    tip: 'Na VTEX IO o conceito nativo é Pixel App — uma extensão que escuta eventos da storefront. Use o Pixel App em vez de instrumentar manualmente. event_id (UUID) gerado no cliente é crítico para idempotência depois.',
    questions: [
      { q: 'Por que sendBeacon e não fetch?', a: 'sendBeacon é assíncrono, não bloqueia o unload da página e o browser garante o envio mesmo se a aba fechar. fetch() durante unload é cancelado pelo browser. Para purchase event (crítico), sendBeacon evita perda quando o usuário fecha a aba após confirmar compra.' },
      { q: 'O que é o dataLayer e por que padronizar?', a: 'dataLayer é uma camada intermediária (geralmente injetada pelo GTM) onde todo evento passa antes de sair do browser. Padronizar no schema GA4 desacopla a página das ferramentas de destino — você troca o GA por outra ferramenta sem mexer no código da página.' },
      { q: 'Como funciona batching no cliente?', a: 'Fila local em memória (com persistência em sessionStorage para sobreviver a navegação). Flush em 3 triggers: tamanho máximo (ex: 20 eventos), tempo máximo (ex: 5s) e antes do unload (com sendBeacon). Retry com backoff exponencial se o request falhar.' }
    ],
    code: `// Event SDK — instrumentação na storefront VTEX IO
class EventSDK {
  private queue: Event[] = []
  private timer: ReturnType<typeof setTimeout> | null = null

  track(name: string, params: Record<string, unknown>) {
    this.queue.push({
      event_id: crypto.randomUUID(),
      event_name: name,
      client_timestamp: Date.now(),
      session_id: this.session(),
      user_id: this.user(),
      ...params,
    })
    this.scheduleFlush()
  }

  private scheduleFlush() {
    if (this.queue.length >= 20) return this.flush()
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), 5000)
    }
  }

  private flush() {
    if (this.queue.length === 0) return
    const batch = this.queue.splice(0)
    if (this.timer) { clearTimeout(this.timer); this.timer = null }

    // sendBeacon não bloqueia o unload da página
    const blob = new Blob([JSON.stringify(batch)], { type: 'application/json' })
    const ok = navigator.sendBeacon('/collect', blob)
    if (!ok) this.queue.unshift(...batch)  // retry
  }
}

// Hook no unload — garantia final
window.addEventListener('pagehide', () => sdk.flush())`
  },
  {
    id: 106, emoji: '🚪', title: 'System Design — Camada de Coleta (Collector)',
    level: 'System Design', color: '#a78bfa',
    summary: 'CDN/Edge, Gateway/LB, Collector /collect, LGPD gate. A porta de entrada.',
    definition: 'A camada de coleta recebe os eventos do cliente e os entrega ao broker. Componentes: (1) CDN/Edge — recebe no PoP mais próximo do usuário. (2) API Gateway / LB — termina TLS, rate limiting, autoscaling. (3) Collector — endpoint HTTP /collect que valida formato, autentica origem, e responde 204 rapidamente. (4) Consent LGPD gate — antes de aceitar o evento, confere consentimento; sem consentimento, descarta ou anonimiza.',
    problem: 'Collector que faz muito (enriquecimento, persistência, query) não aguenta milhões de req/s. Sem rate limit, abuso/DDoS derruba o sistema. Sem consent gate, viola LGPD.',
    solution: 'Collector leve de propósito: valida formato básico, autentica, checa consent, publica no broker, responde 204. Nada de processar dado pesado. Stateless = escala horizontal. Rate limit no Gateway por origem. Consent é regra de negócio que vai antes de qualquer escrita.',
    tip: 'O collector responde 204 (No Content) em vez de 200. Não precisa retornar nada — apenas confirmar recebimento. Menos bytes, menos latência. Idealmente o p99 do collector é < 50ms.',
    questions: [
      { q: 'Por que o collector deve responder 204 rápido?', a: 'O cliente está esperando para liberar a fila local. Quanto mais rápido o collector responde, menos memória do browser fica ocupada com a fila e menor a chance de perder evento se a aba fechar. 204 (No Content) é o status correto: recebido com sucesso, sem body de resposta.' },
      { q: 'Como o collector escala horizontalmente?', a: 'Stateless: não guarda nada localmente, todo evento vai para o broker (Kafka). Atrás de um Load Balancer com autoscaling baseado em CPU/requests. Cada instância é idêntica e descartável. Se uma cai, o LB redireciona para outra sem perda.' },
      { q: 'Como implementar consent LGPD no collector?', a: 'Cookie de consent enviado no request. Se ausente ou negado: descarta evento (response 204 mesmo assim, sem persistir). Se parcial: anonimiza PII (hash do user_id, remove IP). Política de retenção: dados crus expiram em N dias automaticamente no S3 via lifecycle policy.' }
    ],
    code: `// Collector em Node.js — exemplo
import express from 'express'
import { Kafka } from 'kafkajs'

const app = express()
const kafka = new Kafka({ brokers: ['kafka:9092'] })
const producer = kafka.producer()

app.post('/collect', async (req, res) => {
  // 1. Validação leve
  const events = req.body
  if (!Array.isArray(events)) return res.status(400).end()

  // 2. Consent LGPD
  if (!hasConsent(req.cookies)) {
    return res.status(204).end()  // aceita mas descarta
  }

  // 3. Autenticação por origem
  const origin = req.headers.origin
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).end()
  }

  // 4. Enriquecimento mínimo (server timestamp, IP geo)
  const enriched = events.map(e => ({
    ...e,
    server_timestamp: Date.now(),
    geo: lookupGeo(req.ip),
  }))

  // 5. Publica no Kafka (particiona por session_id)
  await producer.send({
    topic: 'events.raw',
    messages: enriched.map(e => ({
      key: e.session_id,
      value: JSON.stringify(e),
    })),
  })

  res.status(204).end()  // responde rápido
})`
  },
  {
    id: 107, emoji: '🌊', title: 'System Design — Streaming (Kafka + Flink)',
    level: 'System Design', color: '#fb923c',
    summary: 'Broker (Kafka) para durabilidade, Stream Processor (Flink) para enrich/dedupe/sessionização. O coração.',
    definition: 'Camada de streaming é onde o evento vira útil. Componentes: (1) Message Broker (Kafka/Kinesis/Pub-Sub) — fila durável particionada, absorve picos. (2) Stream Processor (Flink/Kafka Streams) — consome do broker, enriquece (geo, device, user), agrupa em sessão por event time, deduplica por event_id, filtra bots. (3) Schema Registry — guarda e versiona o contrato de cada evento.',
    problem: 'Sem broker, queda do processor = perda de evento. Sem dedupe, evento reenviado conta duplicado nas métricas. Sem event time, eventos fora de ordem (latência de rede) caem na sessão errada. Sem schema versionado, mudança de formato quebra consumers em produção.',
    solution: 'Kafka particionado por session_id — eventos da mesma sessão na mesma partição, ordem preservada por sessão. Flink processa por event_time com watermarks (tolera atraso). Dedupe por event_id usando state (RocksDB local do Flink). Schema Registry valida cada evento antes de publicar — compatibility check garante backward.',
    tip: 'Partição por session_id (não por user_id) — sessões são naturalmente isoladas, e session_id distribui melhor. event_id resolve o problema "exatamente uma vez" das filas: o broker entrega ao menos uma vez, o processor descarta duplicados.',
    questions: [
      { q: 'Por que Kafka particionado por session_id e não por user_id?', a: 'Session_id distribui melhor (mais valores únicos), evita hot partition (um usuário muito ativo concentrando tráfego), e preserva ordem por sessão — que é o que importa para sessionização. user_id seria útil se você precisasse processar tudo do usuário junto, mas sessões são naturalmente isoladas.' },
      { q: 'O que é watermark no Flink?', a: 'Sinal que diz "todos os eventos com timestamp < X já chegaram (com 95% de certeza)". Permite fechar janelas de sessionização tolerando eventos atrasados. Watermark agressivo = janelas fecham cedo, perde eventos atrasados. Watermark conservador = latência maior mas captura tudo.' },
      { q: 'Como funciona dedupe por event_id no Flink?', a: 'State backend (RocksDB) guarda event_ids já vistos com TTL (ex: 1h). Cada evento entrante consulta o state. Se já existe, descarta. TTL evita crescimento infinito. RocksDB local = rápido (sem rede). Para dedupe global cross-partition, usar partição por event_id_prefix.' }
    ],
    code: `// Flink job — enrichment + dedupe + sessionização
import { StreamExecutionEnvironment } from '@apache/flink'

const env = StreamExecutionEnvironment.getExecutionEnvironment()

env.fromSource(kafkaSource('events.raw'))
  // Watermark: tolera atraso de 30s
  .assignTimestampsAndWatermarks(
    WatermarkStrategy
      .forBoundedOutOfOrderness(Duration.ofSeconds(30))
      .withTimestampAssigner((e: Event) => e.client_timestamp)
  )
  // Enriquecimento (geo do IP, device parsing)
  .map(enrichEvent)
  // Dedupe por event_id (state TTL 1h)
  .keyBy(e => e.event_id)
  .process(new DedupeFunction(Duration.ofHours(1)))
  // Sessionização: sessão fecha após 30min de inatividade
  .keyBy(e => e.session_id)
  .window(EventTimeSessionWindows.withGap(Time.minutes(30)))
  .aggregate(new SessionAggregator())
  // Saída em dois caminhos
  .addSink(s3LakeSink)       // cold path: raw → Lake
  .addSink(clickHouseSink)   // hot path: agregado → OLAP

// Schema Registry valida antes de publicar
const schema = registry.getSchema('events.raw', 'latest')
if (!schema.validate(event)) {
  metrics.increment('schema_violation')
  return  // descarta evento inválido
}`
  },
  {
    id: 108, emoji: '🗄️', title: 'System Design — Armazenamento (Lake + OLAP + Warehouse)',
    level: 'System Design', color: '#eab64a',
    summary: 'Data Lake (S3) para raw, OLAP (ClickHouse) para hot path, Warehouse (BigQuery) para cold path.',
    definition: 'Camada de armazenamento separa dois caminhos por SLA. (1) Data Lake (S3) — evento cru, imutável, barato, em Parquet particionado por data. Fonte da verdade. (2) OLAP (ClickHouse/Druid) — banco colunar otimizado para agregação rápida. Hot path: query de dashboard em segundos sobre bilhões de linhas. (3) Data Warehouse (BigQuery/Redshift) — dados modelados (star schema) para BI e ML. Cold path: atualizado em batch, otimizado para análises complexas.',
    problem: 'Guardar tudo num único banco SQL não escala (bilhões de linhas, latência alta). Sem raw imutável, mudança de regra de negócio significa perder histórico. Sem OLAP, dashboard demora minutos. Sem warehouse, BI/ML pesado mata o sistema operacional.',
    solution: 'Lambda/Kappa architecture: Lake é a fonte da verdade (raw), OLAP é o cache quente (agregado), Warehouse é a análise pesada (modelado). Se uma regra muda, replay do Lake recria os outros dois. ClickHouse com materialized views pré-agrega; warehouse alimenta-se de batch noturno do Lake.',
    tip: 'Particionamento é tudo: no Lake, particione por data (year=2026/month=05/day=20). No ClickHouse, ORDER BY (event_date, event_name) — alinha I/O sequencial. Materialized views no ClickHouse para agregações comuns (eventos por hora, por SKU) — query roda em ms.',
    questions: [
      { q: 'Por que ClickHouse e não Postgres para OLAP?', a: 'ClickHouse é colunar: armazena cada coluna separadamente, otimizado para agregação (count, sum, avg) sobre bilhões de linhas. Postgres é row-based: ótimo para OLTP (uma linha por vez) mas lento para analytics. ClickHouse comprime ~10x mais e roda agregações 100-1000x mais rápido em datasets grandes.' },
      { q: 'O que é Lambda Architecture?', a: 'Dois caminhos paralelos: speed layer (stream processing, segundos de latência, aproximado) e batch layer (reprocessamento periódico, exato). Query layer combina os dois. Resolve o trade-off entre latência e correção. Kappa simplifica: só stream processing, com replay para recalcular.' },
      { q: 'Por que evento cru imutável no Lake?', a: 'Replay: se você descobrir um bug no processor depois de 6 meses, pode reprocessar todos os eventos crus do Lake e regerar OLAP/Warehouse com a regra corrigida. Sem o raw, esses 6 meses de dados estão corrompidos para sempre. Imutável + barato (Parquet em S3) = garantia futura.' }
    ],
    code: `-- ClickHouse: tabela de eventos para hot path
CREATE TABLE events_olap (
  event_date Date,
  event_name LowCardinality(String),
  event_id UUID,
  session_id String,
  user_id String,
  sku String,
  price Decimal(10,2),
  device LowCardinality(String),
  -- ...
  timestamp DateTime64
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_name, session_id)
TTL event_date + INTERVAL 90 DAY;

-- Materialized view pré-agregada (atualiza ao inserir)
CREATE MATERIALIZED VIEW events_hourly
ENGINE = SummingMergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, hour, event_name)
AS SELECT
  event_date,
  toHour(timestamp) AS hour,
  event_name,
  count() AS events,
  uniq(session_id) AS sessions
FROM events_olap
GROUP BY event_date, hour, event_name;

-- Query do dashboard (roda em ms)
SELECT hour, events, sessions
FROM events_hourly
WHERE event_date = today()
  AND event_name = 'add_to_cart'
ORDER BY hour;`
  },
  {
    id: 109, emoji: '⚖️', title: 'System Design — Trade-offs Essenciais',
    level: 'System Design', color: '#fb923c',
    summary: 'Idempotência, hot/cold path, schema versioning, ordenação, escala, amostragem, privacidade.',
    definition: 'Trade-offs centrais que toda entrevista de System Design cobra: (1) Idempotência via event_id (UUID) — broker entrega "ao menos uma vez", processor descarta duplicados. (2) Hot path vs cold path — Lambda/Kappa. (3) Schema versionado — backward compatibility, registry. (4) Ordenação e relógio — client_timestamp + server_timestamp, event time + watermark. (5) Resiliência de coleta — sendBeacon + queue local + retry exponencial. (6) Escala e pico — partition + autoscaling + back-pressure. (7) Amostragem — só sob pico extremo, nunca em purchase. (8) Privacidade/LGPD — consent first, anonimização, retenção.',
    problem: 'Entrar em uma entrevista de System Design sem ter esses trade-offs prontos é entrar para perder. O entrevistador vai cutucar: "e se o pico triplicar?", "e se o evento for reenviado?", "e se o schema mudar?". Sem resposta pronta para cada um, demonstra falta de experiência.',
    solution: 'Memorize os 7 trade-offs com a fórmula: "Problema → Solução → Por quê". Ex: "Eventos chegam fora de ordem? → event time + watermark. Por quê? Porque client clock não é confiável, mas o processor pode tolerar atraso N e ainda agrupar corretamente".',
    tip: 'Termine cada parte da arquitetura mencionando o trade-off antes do entrevistador perguntar. "Aqui uso Kafka com partição por session_id — isso desacopla produtor de consumidor e absorve picos. Trade-off: ordem só é garantida por sessão, não global."',
    questions: [
      { q: 'O que é idempotência e como garantir?', a: 'Idempotência = mesma operação aplicada N vezes tem o mesmo efeito de 1 vez. Em tracking: event_id (UUID gerado no cliente) é a chave. Broker pode entregar 2x se a confirmação se perder; processor consulta state (RocksDB) e descarta se já viu esse event_id. TTL no state evita crescimento infinito.' },
      { q: 'Quando amostrar eventos?', a: 'Só sob pico extremo (Black Friday picando 5x acima do esperado). Amostre eventos de baixo valor primeiro: page_view, scroll. NUNCA amostre purchase, add_to_cart, ou qualquer evento que vire métrica de receita. Amostragem com hash do session_id para que análise por sessão ainda seja válida.' },
      { q: 'Qual a diferença entre at-least-once e exactly-once?', a: 'At-least-once: broker garante entrega, mas pode duplicar se a confirmação se perder. Implementação simples e robusta — Kafka padrão. Exactly-once: nenhuma duplicação possível. Custosa: precisa de transações distribuídas. Em tracking, at-least-once + idempotência (event_id) = efeito de exactly-once a custo baixo.' }
    ],
    code: `// Os 7 trade-offs com solução prática

// 1. Idempotência → event_id (UUID) + dedupe no processor
// 2. Hot path vs Cold path → ClickHouse + Lake/Warehouse
// 3. Schema versionado → Confluent Schema Registry
// 4. Ordenação → event_time + watermark + client+server timestamps
// 5. Resiliência cliente → sendBeacon + queue + backoff
// 6. Escala → partition by session_id + autoscale + back-pressure
// 7. Amostragem → só sob pico, NUNCA purchase
// 8. LGPD → consent first + anonimização + retention policy

// Frases prontas para a entrevista:
const TALKING_POINTS = {
  pico: "Se o pico triplicar, o gargalo é o processor. Mitigo aumentando partições (scale Flink) e ativando amostragem em eventos de baixo valor.",
  duplicacao: "Reenvio é normal — broker entrega at-least-once. event_id resolve: dedupe no processor com state TTL de 1h.",
  schemaEvolution: "Schema Registry valida compatibilidade backward antes de publicar. Se o novo campo é opcional, OK. Se renomeia, exige campo deprecation antes.",
  ordenacao: "Eventos chegam fora de ordem. Uso event_time + watermark de 30s. Eventos atrasados > 30s vão para um side-output para análise.",
  blackFriday: "Provisionamento por capacidade do pico, não da média. Autoscale do collector + back-pressure do Kafka. Teste de carga com k6 simulando 5x o pico esperado.",
}`
  },
  {
    id: 110, emoji: '🎤', title: 'System Design — Como Conduzir a Entrevista',
    level: 'System Design', color: '#34d399',
    summary: 'Ordem de desenho em 60 min, perguntas para fazer no início, palavras-chave para soltar, frases prontas.',
    definition: 'O System Design Interview tem 60 minutos. Estrutura: (0-10) Requisitos + estimativas — faça perguntas, pegue volume, defina funcional vs não-funcional. (10-20) Desenho de alto nível — 5 caixas-camada de cima para baixo com setas claras. (20-40) Aprofundar 2-3 pontos — contrato de evento, broker+processor, modelo OLAP. (40-50) Camada transversal — CI/CD, IaC, testes E2E + carga, observabilidade, SLOs. (50-60) Trade-offs e gargalos — "se X triplicar, mitigação Y; risco Z".',
    problem: 'Candidatos sem framework saem desenhando direto: pulam estimativas, fazem perguntas tarde demais, esquecem camada transversal, terminam sem falar trade-off. Resultado: entrevistador conclui "fala de tecnologia mas não pensa em arquitetura".',
    solution: 'Siga a ordem cronológica. Anote o tempo. Termine cada parte com "antes de continuar, alguma pergunta?". Use palavras-chave específicas (não genéricas): "Kafka particionado por session_id" > "uma fila". "ClickHouse com materialized view" > "um banco de analytics". Mostre vocabulário.',
    tip: 'Faça as 6 perguntas iniciais antes de desenhar nada: volume? perda tolerável? latência? consumidores? cloud preferida? GTM/GA existente? Mesmo que o entrevistador não responda tudo, você demonstrou raciocínio estruturado em 1 minuto. Isso vale ouro.',
    questions: [
      { q: 'Quais as 6 perguntas obrigatórias no início?', a: '(1) Volume esperado em eventos/segundo no pico (Black Friday)? (2) Perda de evento é tolerável e qual a latência aceitável? (3) Operação em tempo real ou só análise posterior? (4) Quem consome — marketing, BI, ML, todos? (5) Restrição de cloud, custo ou requisito LGPD? (6) Aproveito GTM/GA existente ou construo do zero?' },
      { q: 'Quais palavras-chave demonstram senioridade?', a: 'Pipeline: event pipeline, collector, sendBeacon, batching, ingestion. Streaming: Kafka, partition, back-pressure, Flink, sessionização, watermark, event time. Confiabilidade: idempotência, event_id, dedupe, schema registry, data contract. Dados: data lake, OLAP, ClickHouse, hot/cold path, Lambda/Kappa. Frontend/VTEX: VTEX IO, Pixel App, dataLayer, GA4. Infra: GitHub Actions, Terraform, k6, Playwright, SLO.' },
      { q: 'Como fechar a entrevista de forma forte?', a: '"Resumindo os trade-offs: (1) Para resiliência, sendBeacon + idempotência por event_id. (2) Hot path em ClickHouse (segundos), cold path em Lake/Warehouse (batch). (3) Schema Registry para evolução sem quebrar. Se o pico triplicar, o gargalo é o processor; mitigação: scale Flink + amostrar eventos de baixo valor. Riscos: schema drift, perda de evento em rede instável, custo do OLAP em alta cardinalidade."' }
    ],
    code: `// Cronograma de 60 minutos no whiteboard

// ── 0-10 min: REQUISITOS + ESTIMATIVAS ────────────────────────
// Faça as 6 perguntas. Anote no canto:
// • Volume: ~115/s média, ~1700/s pico
// • Latência: dashboard em segundos
// • LGPD: consent obrigatório
// • Stack: VTEX IO + AWS

// ── 10-20 min: DESENHO DE ALTO NÍVEL ──────────────────────────
// 5 caixas-camada, setas claras
// [Cliente] → [Coleta] → [Streaming] → [Armazenamento] → [Consumo]
//                                            ↑
//                                  [Transversal: CI/CD, Obs, LGPD]

// ── 20-40 min: APROFUNDAR 3 PONTOS ────────────────────────────
// 1. Contrato de evento (event_id, schema GA4)
// 2. Broker + Processor (Kafka partition + Flink dedupe + session)
// 3. Modelo OLAP (ClickHouse + materialized view)

// ── 40-50 min: CAMADA TRANSVERSAL ─────────────────────────────
// • CI/CD: GitHub Actions
// • IaC: Terraform
// • Observabilidade: logs + métricas + traces + SLO
// • Testes: Playwright E2E + k6 carga (simula 5x pico)
// • Segurança: consent + anonimização + retention

// ── 50-60 min: TRADE-OFFS + GARGALOS ──────────────────────────
// "Se o pico triplicar, gargalo é Flink. Mitigo com mais partições.
//  Risco: schema drift. Mitigo com Registry + alerta.
//  Custo do OLAP cresce com cardinalidade — TTL de 90 dias."`
  },
  {
    id: 111, emoji: '🏪', title: 'VTEX IO & Shopify ThemeExtension',
    level: 'System Design', color: '#34d399',
    summary: 'Store Framework, blocos, Pixel App, ThemeExtension do Shopify. O stack provável do Grupo SBF.',
    definition: 'VTEX IO é a plataforma de desenvolvimento da VTEX para storefronts. Store Framework permite construir páginas como composição de blocos React com schema declarativo. Pixel App é a extensão nativa para captura de eventos. ThemeExtension (Shopify) é o equivalente: extensões que se conectam a um tema sem modificar o código base — usadas para adicionar widgets, blocos personalizados, ou tracking.',
    problem: 'Storefront de e-commerce precisa ser performático (Core Web Vitals), customizável por marca (Centauro vs Nike), instrumentado para tracking, e seguro contra XSS (conteúdo de terceiros). Sem framework, cada marca reinventa.',
    solution: 'VTEX IO: cada componente é um app versionado, instalável por loja. Layout é JSON (interfaces de bloco). Pixel App captura eventos sem modificar componentes. SSR + edge cache para LCP rápido. Shopify ThemeExtension: blocos plug-and-play que aparecem no theme editor — merchant ativa sem código. Para tracking: app embed que injeta script no head.',
    tip: 'Na entrevista, ao falar de VTEX, mencione: Store Framework (composição declarativa), Pixel App (nativo para tracking), Render Server (SSR otimizado). Para Shopify: ThemeExtension blocks, app embeds, scriptTag legacy vs Web Pixel API moderna.',
    questions: [
      { q: 'Como implementar scroll infinito em e-commerce?', a: 'IntersectionObserver no último item da lista para detectar visibilidade próxima do fim. Quando dispara, fetch da próxima página. Estado paginado em useState/useReducer. Throttle no observer para não disparar múltiplos requests. Skeleton enquanto carrega. Track view_item_list para cada batch carregado.' },
      { q: 'Como instrumentar tracking em VTEX IO sem modificar a storefront?', a: 'Pixel App: você cria uma app de tipo "pixel" que recebe eventos do VTEX Store via window.vtex events. Não toca em componentes existentes — só escuta. Vantagem: instalação por loja sem rebuild da storefront, fácil de A/B testar duas implementações.' },
      { q: 'Shopify ThemeExtension vs ScriptTag: qual usar?', a: 'ThemeExtension app blocks: moderno, declarativo, merchant ativa no theme editor, performático. ScriptTag: legacy, injeta script no global, sem controle do merchant. Para tracking moderno em Shopify: usar Web Pixel API (sandbox seguro, performance otimizada) em vez de ScriptTag.' }
    ],
    code: `// VTEX IO Pixel App — captura nativa de eventos
import { canUseDOM } from 'vtex.render-runtime'

window.addEventListener('message', (e) => {
  if (!e.data || e.origin !== window.origin) return

  // Eventos da VTEX Store disparam neste channel
  const { eventName, ...data } = e.data

  if (eventName === 'vtex:productView') {
    track('view_item', {
      sku: data.product.sku,
      price: data.product.price,
    })
  }

  if (eventName === 'vtex:addToCart') {
    track('add_to_cart', {
      sku: data.items[0].id,
      quantity: data.items[0].quantity,
      price: data.items[0].sellingPrice,
    })
  }

  if (eventName === 'vtex:orderPlaced') {
    track('purchase', {
      transaction_id: data.order.orderId,
      value: data.order.value,
      items: data.order.items,
    })
  }
})

// Shopify ThemeExtension — block declaration
// shopify/blocks/tracker.liquid
{% schema %}
{
  "name": "Tracking Block",
  "target": "section",
  "settings": [
    { "type": "text", "id": "endpoint", "label": "Collector URL" }
  ]
}
{% endschema %}

// IntersectionObserver para scroll infinito
const sentinelRef = useRef(null)
useEffect(() => {
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !loading) fetchNextPage()
  }, { rootMargin: '500px' })  // antecipa
  if (sentinelRef.current) obs.observe(sentinelRef.current)
  return () => obs.disconnect()
}, [loading])`
  }
]

const all = [...existing, ...newConcepts]
writeFileSync('./src/data/concepts.json', JSON.stringify(all, null, 2))
console.log('Total:', all.length, '· New:', newConcepts.length)
