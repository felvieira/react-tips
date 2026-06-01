import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const filePath = join(__dirname, '..', 'src', 'data', 'concepts.json')

const existing = JSON.parse(readFileSync(filePath, 'utf-8'))

const newConcepts = [
  {
    "id": 116,
    "emoji": "🔌",
    "title": "Real-time UI: WebSocket vs SSE vs Polling",
    "level": "System Design",
    "color": "#a78bfa",
    "summary": "Quando usar cada tecnologia de comunicação em tempo real. Trade-offs de latência, escala e complexidade.",
    "definition": "WebSocket: protocolo full-duplex sobre TCP — servidor e cliente enviam dados a qualquer momento. Ideal para: chat, jogos, colaboração ao vivo (Google Docs), tracking em tempo real. SSE (Server-Sent Events): canal unidirecional servidor→cliente sobre HTTP. Ideal para: feeds de notícias, dashboards de métricas, status de processamento. Polling: cliente pede periodicamente. Mais simples, mas ineficiente. Long polling melhora ao manter conexão aberta até ter dado.",
    "problem": "Usar WebSocket para um feed de notícias read-only (overkill e mais complexo) ou polling para um app de chat (latência alta, desperdício de requests).",
    "solution": "Decision tree: bidirecional + latência crítica (< 50ms) → WebSocket. Servidor → cliente apenas, fluxo contínuo → SSE. Dados mudam raramente, simplicidade > tudo → polling. O Uber usa WebSocket para posição do motorista (bidirecional, alta frequência), SSE para atualizações de status da corrida (unidirecional).",
    "tip": "SSE tem reconexão automática nativa (EventSource), roda sobre HTTP/2 (multiplexação), e é mais fácil de proxy/firewall do que WebSocket. Prefira SSE quando só o servidor precisa enviar dados. WebSocket puro sem biblioteca (socket.io) exige heartbeat manual para detectar conexões mortas.",
    "questions": [
      {
        "q": "Como detectar e reconectar uma WebSocket desconectada?",
        "a": "Implementar heartbeat: servidor manda ping a cada 30s, cliente responde pong. Se o client não receber ping em 60s, fecha e reabre a conexão com backoff exponencial (1s, 2s, 4s, max 30s). Adicionar reconnect logic no onclose handler. socket.io faz isso por padrão — é um dos motivos de usá-lo."
      },
      {
        "q": "Como o SSE lida com reconexão?",
        "a": "Automaticamente via EventSource API: quando a conexão cai, o browser reconecta em ~3s por padrão e envia o header Last-Event-ID com o ID do último evento recebido. O servidor usa esse ID para retransmitir eventos perdidos. Para isso funcionar, você precisa implementar um ID incremental nos eventos e guardar histórico no servidor."
      },
      {
        "q": "WebSocket escala horizontalmente?",
        "a": "WebSocket é stateful — conexão fica em um servidor específico. Para escalar: usar Redis Pub/Sub ou um message broker (Kafka) como bus compartilhado. Quando evento chega em server A, ele publica no Redis; todos os servidores subscrevem e entregam para seus clientes conectados. Socket.io tem adapter de Redis pronto. Sem isso, sticky sessions são necessárias (pior)."
      }
    ],
    "code": "// SSE — simples, reconexão automática\n// Servidor (Next.js Route Handler)\nexport async function GET() {\n  const stream = new ReadableStream({\n    start(controller) {\n      const send = (data: object) =>\n        controller.enqueue(`data: ${JSON.stringify(data)}\\n\\n`)\n\n      // Posição do motorista a cada 2s\n      const interval = setInterval(async () => {\n        const pos = await getDriverPosition()\n        send({ lat: pos.lat, lng: pos.lng, ts: Date.now() })\n      }, 2000)\n\n      return () => clearInterval(interval) // cleanup\n    }\n  })\n  return new Response(stream, {\n    headers: {\n      'Content-Type': 'text/event-stream',\n      'Cache-Control': 'no-cache',\n      'Connection': 'keep-alive',\n    }\n  })\n}\n\n// Cliente React\nfunction useDriverLocation(rideId: string) {\n  const [pos, setPos] = useState(null)\n\n  useEffect(() => {\n    const es = new EventSource(`/api/ride/${rideId}/position`)\n    es.onmessage = (e) => setPos(JSON.parse(e.data))\n    es.onerror = () => es.close() // EventSource reconecta sozinho\n    return () => es.close()\n  }, [rideId])\n\n  return pos\n}\n\n// WebSocket — bidirecional (chat, colaboração)\nfunction useWebSocket(url: string) {\n  const ws = useRef<WebSocket | null>(null)\n  const [connected, setConnected] = useState(false)\n\n  useEffect(() => {\n    const connect = () => {\n      ws.current = new WebSocket(url)\n      ws.current.onopen = () => setConnected(true)\n      ws.current.onclose = () => {\n        setConnected(false)\n        setTimeout(connect, 2000) // reconectar\n      }\n    }\n    connect()\n    return () => ws.current?.close()\n  }, [url])\n\n  const send = useCallback((msg: object) => {\n    ws.current?.send(JSON.stringify(msg))\n  }, [])\n\n  return { connected, send }\n}"
  },
  {
    "id": 117,
    "emoji": "⚡",
    "title": "Optimistic UI — Resposta Instantânea com Rollback",
    "level": "System Design",
    "color": "#a78bfa",
    "summary": "Atualizar UI antes da resposta do servidor. useOptimistic do React 19, rollback em erro.",
    "definition": "Optimistic UI atualiza a interface imediatamente ao receber a ação do usuário, sem esperar a confirmação do servidor. Se o servidor falhar, a UI faz rollback para o estado anterior. Cria a percepção de resposta instantânea. Usado extensivamente em: likes, follows, reordenar listas (drag-and-drop), send de mensagens, toggle de switches.",
    "problem": "UI que congela esperando confirmação do servidor parece lenta mesmo com boa infraestrutura. Botão de 'curtir' que demora 300ms para responder causa má experiência quando a operação é trivial.",
    "solution": "useOptimistic (React 19) é a forma canônica. Para React 18: setar estado local imediatamente, fazer o request em paralelo, em caso de erro reverter com setQueryData do React Query ou restaurar estado local. O truque: guardar o estado anterior antes de atualizar.",
    "tip": "Nem toda ação deve ser optimistic. Regra: operação é reversível + falha é rara + latência importa → optimistic. Operações financeiras (pagamento), deletar dados permanentemente, ou operações com dependências → esperar confirmação do servidor. O Uber usa optimistic para curtir um motorista mas não para solicitar a corrida.",
    "questions": [
      {
        "q": "Como implementar rollback confiável?",
        "a": "Guardar snapshot do estado anterior: `const prev = queryClient.getQueryData(key)`. No catch da mutation: `queryClient.setQueryData(key, prev)`. Com React Query, useMutation tem callbacks onMutate (salva prev, aplica optimistic), onError (rollback), onSettled (invalida query para buscar dado real). O useOptimistic do React 19 faz isso automaticamente."
      },
      {
        "q": "O que fazer quando o servidor retorna diferente do optimistic?",
        "a": "Na onSettled ou onSuccess, invalidar a query para refetch do dado real: `queryClient.invalidateQueries({ queryKey: key })`. O dado optimistic é substituído pelo dado real. Se o servidor enriquece o dado (ex: adiciona um campo `id` ao item criado), o optimistic temporário some e o real aparece — pode causar um flash visual. Solução: usar um id temporário (uuid) que é substituído pelo id real."
      },
      {
        "q": "Optimistic UI e conflito de edições concorrentes (dois usuários editam o mesmo item)?",
        "a": "Problema clássico de consistency. Abordagens: Last-write-wins (mais simples, pode perder dados), OT (Operational Transformation, Google Docs), CRDT (Conflict-free Replicated Data Types, Figma, Notion). Para maioria dos apps: last-write-wins com timestamp é suficiente. Para colaboração em tempo real em documentos: CRDT com bibliotecas como Yjs ou Automerge."
      }
    ],
    "code": "// React 19 com useOptimistic\nimport { useOptimistic, useTransition } from 'react'\n\nfunction LikeButton({ postId, initialLikes }: { postId: string; initialLikes: number }) {\n  const [optimisticLikes, setOptimisticLikes] = useOptimistic(initialLikes)\n  const [isPending, startTransition] = useTransition()\n\n  const handleLike = async () => {\n    startTransition(async () => {\n      setOptimisticLikes(prev => prev + 1) // atualiza UI imediatamente\n      try {\n        await likePost(postId) // request ao servidor\n      } catch {\n        // useOptimistic reverte automaticamente em caso de erro\n      }\n    })\n  }\n\n  return (\n    <button onClick={handleLike} disabled={isPending}>\n      ❤️ {optimisticLikes}\n    </button>\n  )\n}\n\n// React 18 com React Query — padrão manual\nconst mutation = useMutation({\n  mutationFn: (id: string) => likePost(id),\n  onMutate: async (id) => {\n    await queryClient.cancelQueries({ queryKey: ['post', id] })\n    const prev = queryClient.getQueryData(['post', id]) // snapshot\n    queryClient.setQueryData(['post', id], (old: Post) => ({\n      ...old, likes: old.likes + 1 // optimistic\n    }))\n    return { prev } // contexto para rollback\n  },\n  onError: (err, id, context) => {\n    queryClient.setQueryData(['post', id], context?.prev) // rollback\n  },\n  onSettled: (_, __, id) => {\n    queryClient.invalidateQueries({ queryKey: ['post', id] }) // refetch\n  },\n})"
  },
  {
    "id": 118,
    "emoji": "📶",
    "title": "Offline-First Frontend: Service Worker + Sync",
    "level": "System Design",
    "color": "#a78bfa",
    "summary": "App que funciona sem rede. Cache de assets e dados, fila de ações offline, sync ao reconectar.",
    "definition": "Offline-first é uma estratégia onde o app funciona completamente sem conexão e sincroniza quando a rede volta. Componentes: Service Worker (intercepta requests, serve do cache), Cache API (armazena responses), Background Sync API (enfileira requests para quando a rede voltar), IndexedDB (dados estruturados para o app usar offline). PWA = Progressive Web App combina todos esses.",
    "problem": "Usuário em metrô fecha o app. Volta com Wi-Fi. O carrinho que adicionou offline sumiu. Ou: rede instável faz o app travar em loading enquanto o usuário tem os dados em cache mas o app não usa.",
    "solution": "Estratégia Cache-first para assets estáticos (CSS, JS, imagens). Network-first com fallback para cache para dados dinâmicos. Background Sync para mutations offline (add ao carrinho, like, enviar mensagem). Workbox simplifica a implementação com recipes prontos. Next.js tem `next-pwa` plugin.",
    "tip": "IndexedDB para dados estruturados offline é verboso — use Dexie.js como wrapper. Para sincronização com conflitos: implementar 'tombstone' (registro de deletes), timestamp de última modificação, e resolver conflitos no server-side na sync. O caso mais simples: queue de mutations com retry automático.",
    "questions": [
      {
        "q": "Quais estratégias de cache o Service Worker pode usar?",
        "a": "Cache Only (só cache, sem rede — assets imutáveis com hash no nome). Network Only (sempre rede — dados sensíveis). Cache First (cache → rede se miss — assets estáticos). Network First (rede → cache se offline — dados dinâmicos). Stale-While-Revalidate (cache imediato + rede em background para atualizar — melhor para dados que podem ter um delay). Workbox implementa todas como strategies prontos."
      },
      {
        "q": "Como a Background Sync API funciona?",
        "a": "Registrar um sync tag quando a ação falha por falta de rede: `navigator.serviceWorker.ready.then(sw => sw.sync.register('send-message'))`. O browser chama o evento sync no Service Worker quando a rede volta, mesmo se o app está fechado. O SW processa a fila salva no IndexedDB. Limitação: não é suportado no iOS/Safari — nesses casos, usar o evento online para disparar a sync manualmente."
      },
      {
        "q": "Como atualizar o Service Worker sem bugs de cache stale?",
        "a": "Cache busting: incluir hash no nome dos assets (webpack/Next.js fazem isso automaticamente). Ao deployar novo SW: ele instala mas fica waiting até todas as abas fecharem. Para forçar imediato: `self.skipWaiting()` no install + `clients.claim()` no activate. Versionamento de cache: ao ativar novo SW, deletar caches antigos pelo nome (incluir versão no nome do cache). Workbox tem `precacheAndRoute` que gerencia tudo."
      }
    ],
    "code": "// next.config.ts com next-pwa\nimport withPWA from 'next-pwa'\nexport default withPWA({\n  dest: 'public',\n  runtimeCaching: [\n    {\n      urlPattern: /^https:\\/\\/api\\.*/,\n      handler: 'NetworkFirst',\n      options: { cacheName: 'api-cache', expiration: { maxAgeSeconds: 60 } }\n    },\n    {\n      urlPattern: /\\.(js|css|png|jpg)$/,\n      handler: 'CacheFirst',\n      options: { cacheName: 'static-cache' }\n    }\n  ]\n})\n\n// Fila de mutations offline com Dexie.js (IndexedDB wrapper)\nimport Dexie from 'dexie'\n\nclass OfflineDB extends Dexie {\n  pendingMutations!: Dexie.Table<{ id?: number; type: string; payload: any; ts: number }>\n  constructor() {\n    super('app-offline')\n    this.version(1).stores({ pendingMutations: '++id, type, ts' })\n  }\n}\nconst db = new OfflineDB()\n\nasync function addToCart(item: CartItem) {\n  if (!navigator.onLine) {\n    // Salvar para sync posterior\n    await db.pendingMutations.add({ type: 'ADD_TO_CART', payload: item, ts: Date.now() })\n    return // UI optimistic já foi atualizada antes dessa chamada\n  }\n  await api.post('/cart', item)\n}\n\n// Sync ao voltar online\nwindow.addEventListener('online', async () => {\n  const pending = await db.pendingMutations.toArray()\n  for (const mutation of pending) {\n    try {\n      await processMutation(mutation)\n      await db.pendingMutations.delete(mutation.id!)\n    } catch { break } // parar se falhar\n  }\n})"
  },
  {
    "id": 119,
    "emoji": "🪟",
    "title": "Virtualização de Listas Longas (Windowing)",
    "level": "System Design",
    "color": "#a78bfa",
    "summary": "Renderizar só o que está visível. react-window, react-virtual, TanStack Virtual para listas com milhares de itens.",
    "definition": "Virtualização (windowing) renderiza apenas os elementos visíveis no viewport mais um buffer pequeno. Uma lista de 10.000 items renderiza ~20-30 nós no DOM em vez de 10.000. Dramática redução de memory uso e tempo de renderização inicial. Essencial para: feeds infinitos, tabelas de dados grandes, listas de produtos em e-commerce, logs em tempo real.",
    "problem": "Lista com 1.000 items: 1.000 nós no DOM + 1.000 event listeners + todo o CSS calculado = scroll travado, memory leak, first render lento. Em mobile, 300 items já causam jank visível.",
    "solution": "TanStack Virtual (agnóstico, 2024): calcular posições de todos os itens mas só renderizar os visíveis. react-window: componentes FixedSizeList (itens de altura igual) e VariableSizeList (alturas dinâmicas). Para tabelas: TanStack Table + Virtual. Para scroll infinito: combinar com Intersection Observer para carregar mais quando chega ao fim.",
    "tip": "TanStack Virtual é a escolha moderna (2024) — suporta horizontal, grid, window scroller, e itens de tamanho variável com medição dinâmica. react-window ainda é mais leve e estável para casos simples. O maior desafio de variableSize é medir itens que ainda não foram renderizados — estimateSize() deve ser conservador (tamanho médio real) para evitar jumps de scroll.",
    "questions": [
      {
        "q": "Como virtualizar uma lista com alturas dinâmicas (texto de tamanho variável)?",
        "a": "TanStack Virtual com measureElement: usar um ref no elemento renderizado, o VirtualItem recebe `measureRef` para o virtual item medir após render. Internamente usa ResizeObserver. Passar `estimateSize` como fallback antes de medir. Ou react-window com VariableSizeList + CellMeasurer da react-virtualized. O approach do TanStack é mais moderno e não precisa de ref callback manual."
      },
      {
        "q": "Como combinar virtualização com scroll infinito?",
        "a": "Intersection Observer no último item visível (ou sentinel element após a lista): quando fica visível, disparar fetchNextPage() do React Query infinite query. O virtual list precisa saber o totalCount estimado para calcular o scrollbar. Padrão: `count = hasMore ? items.length + 1 : items.length` — o +1 é um placeholder que, quando fica visível, carrega mais."
      },
      {
        "q": "Virtualização funciona com Drag-and-Drop?",
        "a": "Difícil mas possível. O problema: itens saem do DOM durante o drag, quebrando a animação. Soluções: (1) desativar virtualização durante drag (se lista for pequena o suficiente), (2) usar dnd-kit com estratégia de virtualização específica, (3) manter items do drag 'pinados' no DOM fora da virtual window. @dnd-kit/sortable tem um exemplo com TanStack Virtual."
      }
    ],
    "code": "// TanStack Virtual — moderno, flexible\nimport { useVirtualizer } from '@tanstack/react-virtual'\n\nfunction VirtualList({ items }: { items: Product[] }) {\n  const parentRef = useRef<HTMLDivElement>(null)\n\n  const virtualizer = useVirtualizer({\n    count: items.length,\n    getScrollElement: () => parentRef.current,\n    estimateSize: () => 72, // altura estimada de cada item\n    overscan: 5, // buffer de itens fora do viewport\n  })\n\n  return (\n    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>\n      {/* Container com altura total para o scrollbar */}\n      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>\n        {virtualizer.getVirtualItems().map(virtualItem => (\n          <div\n            key={virtualItem.key}\n            ref={virtualizer.measureElement} // mede altura real\n            style={{\n              position: 'absolute',\n              top: 0,\n              transform: `translateY(${virtualItem.start}px)`,\n              width: '100%',\n            }}\n          >\n            <ProductCard product={items[virtualItem.index]} />\n          </div>\n        ))}\n      </div>\n    </div>\n  )\n}\n\n// Scroll infinito com React Query + TanStack Virtual\nfunction InfiniteProductList() {\n  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({\n    queryKey: ['products'],\n    queryFn: ({ pageParam }) => fetchProducts(pageParam),\n    getNextPageParam: (last) => last.nextCursor,\n  })\n\n  const items = data?.pages.flatMap(p => p.products) ?? []\n\n  // Detectar quando o último item fica visível\n  const lastItemRef = useCallback((node: HTMLDivElement | null) => {\n    if (!node) return\n    const observer = new IntersectionObserver(([entry]) => {\n      if (entry.isIntersecting && hasNextPage) fetchNextPage()\n    })\n    observer.observe(node)\n    return () => observer.disconnect()\n  }, [hasNextPage, fetchNextPage])\n\n  // ... virtualizer setup\n}"
  },
  {
    "id": 120,
    "emoji": "🗺️",
    "title": "Frontend Map Rendering — Mapbox e Performance",
    "level": "System Design",
    "color": "#a78bfa",
    "summary": "Renderizar mapas com milhares de markers. Clustering, virtualização de pins, WebGL e lazy loading de tiles.",
    "definition": "Maps no frontend: Mapbox GL JS (WebGL, performático, customizável), Google Maps (mais popular, mais pesado), Leaflet (simples, menos features). WebGL = renderização na GPU, suporta milhares de markers a 60fps via GeoJSON layers. Clustering: agrupar markers próximos em zoom out. Tile loading lazy: carrega tiles conforme o viewport muda. Crítico para apps de delivery, ride-sharing, logística.",
    "problem": "Usar `<Marker>` do React para 500 pins no mapa = 500 elementos no DOM = jank em zoom/pan. Cada Marker é um overlay HTML, não renderizado pelo WebGL. Resultado: mapa congela.",
    "solution": "Para muitos markers estáticos: GeoJSON Layer no Mapbox (renderizado via WebGL, suporta milhões). Para markers interativos com React: virtualizar, mostrar só os visíveis no viewport. Clustering com supercluster ou Mapbox cluster source. Para 1-10 markers interativos: `<Marker>` HTML está bem. Regra: > 50 markers → GeoJSON/WebGL.",
    "tip": "Lazy loading do bundle do mapa (Mapbox GL JS tem ~250kb gz). Usar dynamic import ou Next.js `dynamic(() => import(...), { ssr: false })`. O mapa precisa de um container com height definido — sem isso, Mapbox renderiza com 0px de altura. Invalidar o mapa com `map.resize()` quando o container muda de tamanho (sidebar abre/fecha, fullscreen).",
    "questions": [
      {
        "q": "Como atualizar a posição de um motorista em tempo real no mapa sem re-renderizar o React?",
        "a": "Guardar referência ao objeto Marker ou Layer do Mapbox e atualizar via API imperativa do Mapbox (sem React re-render). `markerRef.current.setLngLat([lng, lat])` para Markers. Para Source GeoJSON: `map.getSource('drivers').setData(newGeoJSON)` — Mapbox só atualiza os dados na GPU, sem tocar no DOM. Isso mantém animações suaves a 60fps."
      },
      {
        "q": "Como implementar clustering eficiente?",
        "a": "Usar Mapbox Cluster Source: `type: 'geojson', cluster: true, clusterRadius: 50`. Mapbox calcula clusters no worker thread. Para interação: ao clicar num cluster, zoom para mostrar os items individuais com `map.flyTo`. Para clusters customizados em React: supercluster library + calcular clusters no useMemo quando viewport muda (bounds + zoom)."
      },
      {
        "q": "Como lidar com geofences e polígonos no mapa?",
        "a": "Mapbox Fill Layer para polígonos (surge pricing zones, delivery areas). GeoJSON Polygon ou MultiPolygon como source. Para interatividade: `map.on('click', 'geofence-layer', handler)` para detectar clicks. Para verificar se um ponto está dentro de um polígono no cliente: turf.js `booleanPointInPolygon()`. Para polígonos dinâmicos (desenhados pelo usuário): mapbox-gl-draw plugin."
      }
    ],
    "code": "// react-map-gl (wrapper React do Mapbox) com GeoJSON source\nimport Map, { Source, Layer, Marker } from 'react-map-gl'\n\nfunction RideMap({ drivers, surgeZones }: MapProps) {\n  const mapRef = useRef<MapRef>(null)\n\n  // GeoJSON para muitos drivers (renderizado via WebGL)\n  const driversGeoJSON: GeoJSON.FeatureCollection = useMemo(() => ({\n    type: 'FeatureCollection',\n    features: drivers.map(d => ({\n      type: 'Feature',\n      geometry: { type: 'Point', coordinates: [d.lng, d.lat] },\n      properties: { id: d.id, status: d.status }\n    }))\n  }), [drivers])\n\n  // Atualizar posição sem re-render React\n  const updateDriverPosition = useCallback((driverId: string, pos: Position) => {\n    const map = mapRef.current?.getMap()\n    const source = map?.getSource('drivers') as GeoJSON.GeoJSONSource\n    // Atualiza direto no Mapbox (GPU), sem useState\n    source?.setData(driversGeoJSON)\n  }, [driversGeoJSON])\n\n  return (\n    <Map\n      ref={mapRef}\n      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}\n      initialViewState={{ longitude: -46.63, latitude: -23.55, zoom: 13 }}\n      style={{ width: '100%', height: '500px' }}\n    >\n      {/* Drivers como WebGL layer — suporta milhares */}\n      <Source id=\"drivers\" type=\"geojson\" data={driversGeoJSON} cluster clusterRadius={50}>\n        <Layer id=\"clusters\" type=\"circle\" filter={['has', 'point_count']}\n          paint={{ 'circle-color': '#3fb6f0', 'circle-radius': 20 }} />\n        <Layer id=\"driver-points\" type=\"symbol\" filter={['!', ['has', 'point_count']]}\n          layout={{ 'icon-image': 'car-icon' }} />\n      </Source>\n\n      {/* Surge zones como polígono */}\n      <Source id=\"surge\" type=\"geojson\" data={surgeZones}>\n        <Layer id=\"surge-fill\" type=\"fill\"\n          paint={{ 'fill-color': '#fb923c', 'fill-opacity': 0.2 }} />\n      </Source>\n    </Map>\n  )\n}"
  },
  {
    "id": 121,
    "emoji": "🏎️",
    "title": "State Management para Apps Complexos (Ride-sharing)",
    "level": "System Design",
    "color": "#a78bfa",
    "summary": "Gerenciar estado de uma corrida com múltiplas telas, real-time updates, e sincronização entre cliente/servidor.",
    "definition": "Um app de ride-sharing tem estado complexo: estado da corrida (requesting → matching → en-route → arrived → in-ride → completed), posição do motorista (atualiza a cada 2s), histórico de corridas, estado de pagamento, notificações. State management precisa lidar com: atualizações frequentes sem re-renders excessivos, persistência offline, sincronização com servidor, e estado derivado (ETA calculado da posição atual).",
    "problem": "Estado da corrida em useState espalhado em múltiplos componentes: posição do motorista re-renderiza o mapa E o ETA E o header ao mesmo tempo. Ou: store global com todo o estado da corrida causa re-renders em componentes não relacionados.",
    "solution": "Separar estado por frequência de atualização: posição do motorista (alta frequência) em Zustand com selector granular; estado da corrida (baixa frequência) em React Query com SSE; estado de UI (modais, loading) em useState local. Usar Zustand stores por feature. Estado derivado (ETA) calculado com useMemo ou Zustand computed getters.",
    "tip": "O maior erro em apps complexos é um único store global. Separar por domínio: `useRideStore`, `useDriverStore`, `usePaymentStore`. Cada store tem sua frequência de atualização. O mapa só subscreve ao `useDriverStore(s => s.position)` — não re-renderiza quando o status da corrida muda.",
    "questions": [
      {
        "q": "Como evitar re-renders quando a posição do motorista atualiza a cada 2s?",
        "a": "Seletores granulares no Zustand: `const position = useDriverStore(s => s.position)` — só re-renderiza quando `position` muda. O mapa subscreve só à position. O ETA subscreve só ao ETA calculado. O header subscreve só ao status. Sem selector: `useDriverStore()` re-renderiza em qualquer mudança de qualquer campo. Com Jotai: atoms granulares por campo — position atom, status atom, etc."
      },
      {
        "q": "Como sincronizar estado client-side com o servidor em tempo real?",
        "a": "React Query + SSE/WebSocket: o servidor publica eventos; o client subscreve e chama `queryClient.setQueryData` para atualizar o cache imediatamente (sem refetch). A query key é a fonte da verdade: qualquer componente que usa `useQuery(['ride', id])` recebe a atualização. Para mutations: optimistic update (ver concept 117). O benefício: React Query gerencia loading, error, e stale state automaticamente."
      },
      {
        "q": "Como persistir o estado da corrida se o usuário matar o app?",
        "a": "Zustand middleware persist: `create(persist(store, { name: 'ride-state', storage: createJSONStorage(() => localStorage) }))`. Configurar `partialize` para persistir só o necessário (não posições transitórias). Na reabertura do app, verificar com o servidor se a corrida ainda está ativa via API (`GET /ride/current`). Se sim, restaurar estado e reconectar SSE. Se não, limpar estado local."
      }
    ],
    "code": "// Zustand com seletores granulares — evita re-renders\nimport { create } from 'zustand'\nimport { subscribeWithSelector } from 'zustand/middleware'\n\ninterface DriverStore {\n  position: { lat: number; lng: number } | null\n  eta: number | null // em minutos\n  status: 'offline' | 'en-route' | 'arrived'\n  updatePosition: (pos: { lat: number; lng: number }) => void\n}\n\nexport const useDriverStore = create<DriverStore>()(\n  subscribeWithSelector((set, get) => ({\n    position: null,\n    eta: null,\n    status: 'offline',\n    updatePosition: (pos) => set({ position: pos }),\n  }))\n)\n\n// Componentes subscrevem apenas ao que precisam\nfunction DriverMap() {\n  // Só re-renderiza quando position muda\n  const position = useDriverStore(s => s.position)\n  return <MapMarker position={position} />\n}\n\nfunction ETABadge() {\n  // Só re-renderiza quando eta muda\n  const eta = useDriverStore(s => s.eta)\n  return <span>{eta ? `${eta} min` : '—'}</span>\n}\n\n// SSE para atualizar o store em tempo real\nfunction useRideUpdates(rideId: string) {\n  useEffect(() => {\n    const es = new EventSource(`/api/ride/${rideId}/stream`)\n    es.addEventListener('driver-position', (e) => {\n      const pos = JSON.parse(e.data)\n      useDriverStore.getState().updatePosition(pos) // imperativo, sem hook\n    })\n    es.addEventListener('ride-status', (e) => {\n      // atualizar React Query cache\n      queryClient.setQueryData(['ride', rideId], JSON.parse(e.data))\n    })\n    return () => es.close()\n  }, [rideId])\n}"
  },
  {
    "id": 122,
    "emoji": "🔔",
    "title": "Push Notifications Web — Service Worker + Web Push",
    "level": "System Design",
    "color": "#a78bfa",
    "summary": "Notificações mesmo com o app fechado. Web Push API, VAPID keys, e gerenciamento de permissão.",
    "definition": "Web Push Notifications funcionam via Service Worker + Push API + Notification API. Pipeline: usuário concede permissão → browser gera subscription (endpoint + keys) → backend salva a subscription → backend envia push via Web Push Protocol (FCM/WNS) → Service Worker recebe o push event e exibe a notificação, mesmo com o app fechado. VAPID keys autenticam o servidor no envio.",
    "problem": "Pedir permissão de notificação no primeiro carregamento do app (momento errado, usuário rejeita). Ou enviar notificações sem contexto relevante. Uma vez rejeitada a permissão, só o usuário pode reverter manualmente nas configurações do browser.",
    "solution": "Pedir permissão só quando há valor claro para o usuário: após confirmar uma ação que se beneficia de notificação ('sua corrida foi confirmada — quer ser notificado quando o motorista chegar?'). Guardar a subscription no backend por usuário. Para PWA em iOS (14+): Web Push funciona mas o app precisa ser instalado via Add to Homescreen.",
    "tip": "Service Worker para push precisa ser registrado em /sw.js (ou configurar scope). Next.js: usar next-pwa ou criar /public/sw.js manualmente para o push handler. A subscription tem um endpoint único por browser+dispositivo — um usuário em 3 devices tem 3 subscriptions. Ao notificar, iterar sobre todas as subscriptions do usuário.",
    "questions": [
      {
        "q": "Como pedir permissão de push de forma não intrusiva?",
        "a": "Two-step permission: primeiro mostrar uma UI própria explicando o benefício ('receba alertas quando seu pedido sair para entrega'). Só se o usuário clicar em 'Ativar' na UI sua, chamar Notification.requestPermission(). Se o browser perguntar e o usuário aceitar, registrar a subscription. Não chamar requestPermission() direto sem consentimento explícito — cria bad UX e o usuário rejeita por reflexo."
      },
      {
        "q": "Como enviar push notification do backend?",
        "a": "Usar web-push library (Node.js): `webpush.sendNotification(subscription, JSON.stringify(payload))`. O payload tem: title, body, icon, badge, actions, data (para deep link ao clicar). No Service Worker: `self.addEventListener('push', e => { const data = e.data.json(); self.registration.showNotification(data.title, data) })`. Ao clicar: `self.addEventListener('notificationclick', e => { clients.openWindow(e.notification.data.url) })`."
      },
      {
        "q": "Como lidar com subscriptions expiradas?",
        "a": "O endpoint pode expirar (usuário troca browser, reinstala, limpa dados). Ao tentar enviar: web-push retorna 410 Gone — remover a subscription do banco. Implementar o cleanup no catch do sendNotification. Para garantir subscriptions atualizadas: ao montar o app, comparar a subscription atual do browser com a salva no servidor e atualizar se diferente via PUT /api/push-subscription."
      }
    ],
    "code": "// Frontend: solicitar permissão e salvar subscription\nasync function subscribeToPush() {\n  if (!('Notification' in window) || !('serviceWorker' in navigator)) return\n\n  // Primeiro: UI própria com benefício explicado\n  const userAccepted = await showCustomPermissionDialog()\n  if (!userAccepted) return\n\n  const permission = await Notification.requestPermission()\n  if (permission !== 'granted') return\n\n  const registration = await navigator.serviceWorker.ready\n\n  const subscription = await registration.pushManager.subscribe({\n    userVisibleOnly: true,\n    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY\n  })\n\n  // Salvar no backend\n  await fetch('/api/push-subscription', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(subscription)\n  })\n}\n\n// Service Worker: receber e exibir\n// public/sw.js\nself.addEventListener('push', (event) => {\n  const data = event.data?.json() ?? {}\n  event.waitUntil(\n    self.registration.showNotification(data.title ?? 'Nova notificação', {\n      body: data.body,\n      icon: '/icon-192.png',\n      badge: '/badge-72.png',\n      data: { url: data.url },\n      actions: [\n        { action: 'open', title: 'Ver' },\n        { action: 'dismiss', title: 'Ignorar' }\n      ]\n    })\n  )\n})\n\nself.addEventListener('notificationclick', (event) => {\n  event.notification.close()\n  if (event.action === 'open' || !event.action) {\n    event.waitUntil(clients.openWindow(event.notification.data.url))\n  }\n})\n\n// Backend: enviar push (Node.js)\nimport webpush from 'web-push'\nwebpush.setVapidDetails('mailto:dev@app.com', VAPID_PUBLIC, VAPID_PRIVATE)\n\nasync function notifyUser(userId: string, payload: Notification) {\n  const subscriptions = await db.pushSubscriptions.findMany({ where: { userId } })\n  await Promise.allSettled(subscriptions.map(async (sub) => {\n    try {\n      await webpush.sendNotification(sub.data, JSON.stringify(payload))\n    } catch (err: any) {\n      if (err.statusCode === 410) { // Gone — subscription expirada\n        await db.pushSubscriptions.delete({ where: { id: sub.id } })\n      }\n    }\n  }))\n}"
  }
]

const updated = [...existing, ...newConcepts]
writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8')

console.log(`✅ Done!`)
console.log(`   Added: ${newConcepts.length} concepts (IDs ${newConcepts[0].id}–${newConcepts.at(-1).id})`)
console.log(`   Total: ${updated.length} concepts`)
console.log(`   Last ID: ${updated.at(-1).id}`)
