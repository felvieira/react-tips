import { readFileSync, writeFileSync } from 'fs'

const existing = JSON.parse(readFileSync('./src/data/concepts.json', 'utf8'))

const newConcepts = [
  {
    id: 49, emoji: '🔐', title: 'Formulário de Login — Boas Práticas',
    level: 'Básico FE', color: '#60a5fa',
    summary: 'Controlled inputs, validação client-side, UX de erros, proteção contra brute-force e CSRF.',
    definition: 'Um formulário de login seguro combina: estado controlado via React, validação síncrona antes de chamar a API, tratamento explícito de erros da API (credenciais inválidas vs servidor fora), e proteção via CSRF token ou SameSite cookies. UX: desabilitar botão durante loading, focar no campo de erro, não revelar se email existe.',
    problem: 'Formulários que enviam requisição com campos vazios, expõem se o email existe, não desabilitam o botão durante o request, ou mostram erros técnicos para o usuário.',
    solution: 'Validar client-side antes do fetch, usar estado loading/error explícito, mensagem genérica de erro ("Email ou senha inválidos"), cookie HttpOnly para o token de sessão, e rate limiting no servidor.',
    tip: 'Nunca diga "email não encontrado" — sempre "email ou senha inválidos". Isso evita enumeração de usuários. O erro deve ser o mesmo para email errado e senha errada.',
    questions: [
      { q: 'Como evitar que o botão de submit seja clicado duas vezes?', a: 'Setar um estado `loading: true` no início do submit e `disabled={loading}` no botão. Isso previne double-submit que cria requests duplicados.' },
      { q: 'Onde guardar o token JWT após login?', a: 'HttpOnly cookie (não acessível via JS, protege contra XSS). localStorage é conveniente mas vulnerável a XSS. sessionStorage some ao fechar a tab. Cookie HttpOnly + SameSite=Strict é o padrão de segurança.' },
      { q: 'Como implementar "lembrar de mim"?', a: 'Ajustar o Max-Age do cookie de sessão. Com JWT, emitir um token com expiração longa (7-30 dias) vs curta (1h). O "lembrar" não deve armazenar a senha em lugar nenhum.' }
    ],
    code: `function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Preencha todos os campos')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(form)
    } catch {
      setError('Email ou senha inválidos') // genérico
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={form.email}
        onChange={e => setForm(f => ({...f, email: e.target.value}))} />
      <input type="password" value={form.password}
        onChange={e => setForm(f => ({...f, password: e.target.value}))} />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}`
  },
  {
    id: 50, emoji: '⚡', title: 'Quando usar cada Hook',
    level: 'Básico FE', color: '#60a5fa',
    summary: 'Guia de decisão: useState vs useReducer, useMemo vs useCallback, useEffect vs useLayoutEffect.',
    definition: 'Cada hook tem um caso de uso preciso. useState para 1-2 valores simples. useReducer para estado com múltiplas transições interdependentes. useMemo para cálculo caro ou referência estável de objeto. useCallback para função passada a filho memoizado. useEffect para sincronizar com sistema externo. useLayoutEffect para ler/escrever DOM antes do paint.',
    problem: 'Usar useState para tudo (deveria ser useReducer), useEffect para calcular valores derivados (deveria ser useMemo), ou useCallback em handlers locais sem filho memoizado (overhead puro).',
    solution: 'Seguir o guia de decisão: se você pode calcular o valor durante o render sem side effect, não use useEffect — use useMemo ou calcule direto. Se useEffect atualiza estado baseado em outro estado, provavelmente é useMemo.',
    tip: 'Regra de ouro: se você pode calcular o valor durante o render sem side effect, não use useEffect. Se useEffect atualiza estado baseado em outro estado, provavelmente é useMemo.',
    questions: [
      { q: 'Quando useReducer é melhor que useState?', a: 'Quando você tem 3+ valores de estado que mudam juntos, quando o próximo estado depende do atual de forma complexa, ou quando quer testar a lógica de transição isoladamente.' },
      { q: 'useCallback sempre melhora performance?', a: 'Não. useCallback tem custo (alocação + comparação). Só vale quando a função é passada para filho memoizado com React.memo ou usada como dependência de outro hook. Em handlers locais sem filho memoizado, é puro overhead.' },
      { q: 'Diferença de timing entre useEffect e useLayoutEffect?', a: 'useEffect roda após o browser pintar (assíncrono). useLayoutEffect roda após o commit mas antes do paint (síncrono). Use useLayoutEffect para evitar flash visual ao medir ou reposicionar elementos DOM.' }
    ],
    code: `// ✅ useState: 1-2 valores simples
const [open, setOpen] = useState(false)

// ✅ useReducer: estado complexo com transições
const [state, dispatch] = useReducer(reducer, initialState)

// ✅ useMemo: valor derivado caro ou referência estável
const filtered = useMemo(() => items.filter(pred), [items])

// ✅ useCallback: função passada a filho React.memo
const onSave = useCallback((id) => save(id), [save])

// ✅ useEffect: sincronizar com sistema externo
useEffect(() => {
  const sub = store.subscribe(listener)
  return () => sub.unsubscribe()
}, [])

// ✅ useLayoutEffect: medir DOM antes do paint
useLayoutEffect(() => {
  const { height } = ref.current.getBoundingClientRect()
  setHeight(height) // sem flash visual
}, [])`
  },
  {
    id: 51, emoji: '⏱️', title: 'Debounce vs Throttle vs useMemo',
    level: 'Básico FE', color: '#60a5fa',
    summary: 'Debounce atrasa execução. Throttle limita frequência. useMemo cacheia resultado. Casos de uso distintos.',
    definition: 'Debounce: espera X ms após o último evento antes de executar — ideal para inputs de busca (não chama API a cada tecla). Throttle: executa no máximo 1x a cada X ms — ideal para scroll/resize. useMemo: memoriza o resultado de um cálculo enquanto as dependências não mudam — para cálculos pesados durante render, não para eventos assíncronos.',
    problem: 'Chamar API a cada keystroke (sem debounce), travar o browser com scroll handler sem throttle, ou recalcular uma lista filtrada a cada render quando o input não mudou.',
    solution: 'Debounce para input → API (300-500ms típico). Throttle para scroll/resize (16ms = 60fps). useMemo para filtrar/ordenar listas dentro do render. useTransition para marcar updates pesados como não-urgentes (React 18).',
    tip: 'debounce e throttle são para eventos assíncronos/externos. useMemo é para cálculos síncronos dentro do ciclo de render do React. Não use useEffect + setTimeout para debounce — use useRef ou libs como use-debounce.',
    questions: [
      { q: 'Como implementar debounce sem libs?', a: 'Com useRef para guardar o timer: const timer = useRef(); no handler, clearTimeout(timer.current) e timer.current = setTimeout(() => call(val), 300). O cleanup no useEffect garante cancelar ao desmontar.' },
      { q: 'startTransition substitui debounce?', a: 'Para filtros de lista local sim — startTransition prioriza o input e processa o filtro em background. Para chamadas de API não — startTransition não atrasa o request. Debounce ainda é necessário para reduzir requests de rede.' },
      { q: 'Quando throttle é melhor que debounce?', a: 'Throttle quando quer feedback contínuo mas limitado: scroll infinito, resize handler, tracking de mouse. Debounce quando quer só o valor final: campo de busca, autocomplete, validação de CEP.' }
    ],
    code: `// Debounce para busca com useRef
function SearchInput({ onSearch }) {
  const timer = useRef()
  const handleChange = (e) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onSearch(e.target.value), 300)
  }
  return <input onChange={handleChange} />
}

// Throttle para scroll com passive listener
useEffect(() => {
  let last = 0
  const handler = () => {
    const now = Date.now()
    if (now - last < 100) return
    last = now
    checkScrollPosition()
  }
  window.addEventListener('scroll', handler, { passive: true })
  return () => window.removeEventListener('scroll', handler)
}, [])

// useMemo para cálculo em render
const sorted = useMemo(
  () => items.slice().sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)`
  },
  {
    id: 52, emoji: '🚀', title: 'Lazy Loading & Code Splitting',
    level: 'Intermediário FE', color: '#a78bfa',
    summary: 'Carregar JS só quando necessário. React.lazy + Suspense para componentes. Divisão por rota é o mínimo.',
    definition: 'Code splitting divide o bundle JavaScript em chunks menores carregados sob demanda. React.lazy + Suspense carrega componentes dinamicamente. Next.js faz code splitting por página automaticamente. dynamic() do Next.js é o equivalente com suporte a SSR e opção ssr:false para componentes client-only (mapas, editores, charts pesados).',
    problem: 'Bundle único de 2MB que bloqueia o First Contentful Paint. Usuário baixa código de páginas que nunca vai visitar. Componentes pesados carregados mesmo quando o usuário não os acessa.',
    solution: 'Divisão por rota (automático no Next.js). Lazy loading de componentes pesados com dynamic(). Prefetch de rotas prováveis com Link prefetch. Analisar o bundle com @next/bundle-analyzer para identificar o que pesa mais.',
    tip: 'Em Next.js, todo arquivo em app/ já é um chunk separado. O ganho extra vem de lazy-loading componentes pesados dentro da página: editores (Monaco, Quill), charts (Recharts, D3), mapas (Leaflet), e modais raramente usados.',
    questions: [
      { q: 'Qual a diferença entre React.lazy e next/dynamic?', a: 'React.lazy é padrão do React mas não suporta SSR. next/dynamic é wrapper do Next.js com suporte a SSR e opção ssr: false para componentes que usam APIs do browser. Para Next.js, sempre use dynamic().' },
      { q: 'Como evitar layout shift ao fazer lazy loading?', a: 'Definir dimensões fixas no fallback do Suspense (skeleton com mesmo tamanho do componente real). Sem dimensões fixas, o conteúdo "pula" quando o componente carrega, prejudicando CLS.' },
      { q: 'O que é prefetching e quando usar?', a: 'Pré-carregar chunks de rotas que o usuário provavelmente vai navegar. No Next.js, Link já faz prefetch automático quando o link entra no viewport. Para prefetch manual: router.prefetch("/rota"). Cuidado com over-prefetching em mobile.' }
    ],
    code: `// next/dynamic para componentes pesados
import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,      // editor usa window/document
  loading: () => <Skeleton className="h-64" />
})

const Chart = dynamic(() => import('@/components/Chart'), {
  loading: () => <ChartSkeleton />
})

// React.lazy fora do Next.js
const HeavyModal = React.lazy(() => import('./HeavyModal'))

function App() {
  return (
    <Suspense fallback={<ModalSkeleton />}>
      {isOpen && <HeavyModal />}
    </Suspense>
  )
}

// Analisar bundle:
// ANALYZE=true next build`
  },
  {
    id: 53, emoji: '📡', title: 'Otimizar Chamadas de API',
    level: 'Intermediário FE', color: '#a78bfa',
    summary: 'Deduplicação, caching, stale-while-revalidate, cancelamento com AbortController e race conditions.',
    definition: 'Chamadas de API eficientes evitam requests duplicados, cacheiam respostas, cancelam requests obsoletos, e agrupam múltiplos requests. React Query / SWR implementam todos esses patterns automaticamente. Sem essas libs, é fácil ter race conditions (o request mais lento responde por último), requests duplicados em múltiplos componentes, e estado stale.',
    problem: 'Componente faz fetch, usuário navega, componente desmonta mas o fetch continua e tenta setar estado em componente desmontado. Ou o usuário digita rápido e dois requests competem — o mais lento "vence".',
    solution: 'AbortController para cancelar fetch ao desmontar. Flag `active` para ignorar responses de requests obsoletos. React Query para deduplicação e cache automático. stale-while-revalidate: serve cache imediatamente e revalida em background.',
    tip: 'React Query resolve 90% desses problemas out of the box: deduplicação, cache, stale-while-revalidate, retry automático, cancelamento. Para projetos sem React Query, AbortController + flag de cleanup são o mínimo.',
    questions: [
      { q: 'O que é stale-while-revalidate?', a: 'Servir o dado em cache imediatamente (mesmo que antigo) e em background buscar versão atualizada. Resultado: UI responsiva sem loading spinner, dados frescos chegam silenciosamente. SWR (biblioteca) é nomeada após esse padrão.' },
      { q: 'Como evitar race condition em busca?', a: 'Usar AbortController: no cleanup do useEffect, chamar controller.abort(). Requests cancelados lançam AbortError que deve ser ignorado no catch. Ou flag: let active = true no useEffect, false no cleanup — checar antes de setar estado.' },
      { q: 'Quando usar React Query vs SWR vs fetch manual?', a: 'React Query: apps com estado de servidor complexo (mutations, otimismo, infinite queries). SWR: GET-heavy simples, bundle menor. Fetch manual: requests únicos sem necessidade de cache. Em 2025, React Query é o padrão.' }
    ],
    code: `// Cancelamento com AbortController
useEffect(() => {
  const controller = new AbortController()
  fetch(\`/api/search?q=\${query}\`, { signal: controller.signal })
    .then(r => r.json())
    .then(setResults)
    .catch(err => {
      if (err.name === 'AbortError') return // ignorar cancelamentos
      setError(err)
    })
  return () => controller.abort()
}, [query])

// React Query — automático
const { data, isLoading } = useQuery({
  queryKey: ['search', query],
  queryFn: () => fetch(\`/api/search?q=\${query}\`).then(r => r.json()),
  enabled: query.length > 2,
  staleTime: 30_000,    // 30s em cache
  gcTime: 5 * 60_000,   // 5min no garbage collector
})`
  },
  {
    id: 54, emoji: '🗄️', title: 'Estratégias de Cacheamento',
    level: 'Intermediário FE', color: '#a78bfa',
    summary: 'HTTP cache, React Query staleTime, Next.js fetch cache. Diferentes TTLs por tipo de dado.',
    definition: 'Cacheamento em camadas: CDN/HTTP (Cache-Control headers) para responses do servidor. Next.js fetch cache (revalidate) no Node. React Query / SWR no cliente. Dados estáticos (config, categorias) aguentam cache longo. Dados de usuário não devem ser cacheados em CDN (sem autenticação no CDN).',
    problem: 'Fazer a mesma chamada de API dezenas de vezes por render. Não usar Cache-Control, deixando o browser refazer requests a cada navegação. Ou cache muito agressivo servindo dados desatualizados.',
    solution: 'staleTime no React Query por tipo de dado (30s dinâmicos, 10min referência). HTTP Cache-Control para assets estáticos. Next.js revalidate: 60 para páginas semi-estáticas. CDN só para conteúdo público, nunca para dados autenticados.',
    tip: 'Regra prática: cache agressivo para dados que mudam raramente (categorias, config, países), cache curto para dados frequentes (preços, estoque), sem cache CDN para dados de usuário (perfil, carrinho).',
    questions: [
      { q: 'O que é staleTime no React Query?', a: 'Tempo em ms que um dado é considerado fresco. Durante esse período, nova query com a mesma key retorna o cache sem fetch. Após o staleTime, dados ficam stale mas são servidos do cache enquanto refetch acontece em background.' },
      { q: 'Como invalidar cache após uma mutation?', a: 'queryClient.invalidateQueries({ queryKey: ["users"] }) na callback onSuccess da mutation. Isso marca os dados como stale e dispara refetch automático em todos os componentes que os consomem.' },
      { q: 'Qual a diferença entre cache e estado?', a: 'Estado de servidor (dados da API) deve ficar no React Query / SWR, não em useState + useEffect. Estado de UI (modal aberto, tab ativa) fica em useState. Misturar os dois em useState causa sincronização frágil.' }
    ],
    code: `// React Query com staleTime por tipo
const { data: categories } = useQuery({
  queryKey: ['categories'],
  queryFn: fetchCategories,
  staleTime: 10 * 60_000, // 10 min — muda raramente
})

const { data: prices } = useQuery({
  queryKey: ['prices'],
  queryFn: fetchPrices,
  staleTime: 0,
  refetchInterval: 5000, // polling — muda sempre
})

// Next.js fetch cache no servidor
const config = await fetch('/api/config', {
  next: { revalidate: 3600 } // ISR: revalida a cada 1h
})

const fresh = await fetch('/api/user-data', {
  cache: 'no-store' // SSR: sempre fresco
})`
  },
  {
    id: 55, emoji: '🎯', title: 'Performance: Checklist Completo',
    level: 'Intermediário FE', color: '#a78bfa',
    summary: 'Core Web Vitals, bundle size, render otimizado, imagens, fontes e perceived performance.',
    definition: 'Performance front-end é medida pelos Core Web Vitals: LCP (Largest Contentful Paint < 2.5s), INP (Interaction to Next Paint < 200ms), CLS (Cumulative Layout Shift < 0.1). As otimizações caem em 4 categorias: Network (bundle menor, cache, CDN). Rendering (menos re-renders, virtualização, SSR/SSG). Assets (imagens otimizadas, fontes sem FOIT). Perceived (skeletons, optimistic UI).',
    problem: 'App lento para carregar (LCP alto por bundle grande ou imagens sem otimização), travamentos ao interagir (INP alto por JS pesado na thread principal), ou elementos pulando ao carregar (CLS por imagens sem dimensões).',
    solution: 'LCP: SSR/SSG + imagem hero com priority. INP: React.memo, virtualização, web workers. CLS: sempre definir width/height em imagens. Bundle: code splitting + bundle analyzer. Perceived: skeletons e optimistic UI.',
    tip: 'Medir antes de otimizar. Use Lighthouse (lab) para diagnóstico e CrUX / Vercel Analytics para dados reais. 80% dos problemas são: imagens não otimizadas, bundle grande, e re-renders desnecessários.',
    questions: [
      { q: 'Qual a forma mais impactante de melhorar LCP?', a: 'Imagem hero com priority no next/image (preload), SSR/SSG para o HTML chegar com conteúdo, e CDN para reduzir latência. LCP costuma ser a imagem maior acima do fold.' },
      { q: 'Como identificar re-renders desnecessários?', a: 'React DevTools Profiler: gravar uma interação e identificar componentes que renderizaram sem necessidade. Componentes que sempre re-renderizam quando o pai re-renderiza são candidatos a React.memo.' },
      { q: 'O que é INP e como melhorar?', a: 'Interaction to Next Paint: tempo entre interação do usuário e o próximo frame pintado. Melhorar: mover cálculos pesados para useTransition, web workers, ou dividir tasks longas com setTimeout(fn, 0).' }
    ],
    code: `// 1. Imagem LCP com preload
<Image src="/hero.jpg" priority width={1200} height={600} alt="Hero" />

// 2. Virtualização de lista longa
import { FixedSizeList } from 'react-window'
<FixedSizeList height={600} itemCount={10000} itemSize={50}>
  {Row}
</FixedSizeList>

// 3. Lazy loading de componente pesado
const HeavyChart = dynamic(() => import('./Chart'), { ssr: false })

// 4. React.memo para componente estável
const Row = React.memo(({ item }) => <div>{item.name}</div>)

// 5. useTransition para update pesado
const [isPending, startTransition] = useTransition()
const handleFilter = (val) => {
  setInput(val)                         // urgente
  startTransition(() => setFilter(val)) // não-urgente
}

// 6. Sempre dimensões em imagens (evita CLS)
<img src="..." width={800} height={600} />`
  },
  {
    id: 56, emoji: '🏗️', title: 'Arquitetura Feature-Sliced',
    level: 'Avançado FE', color: '#f472b6',
    summary: 'Organizar por features (vertical slices) em vez de tipo de arquivo. Escalável para times grandes.',
    definition: 'Feature-Sliced Design (FSD) organiza código em camadas: app/ (setup global), pages/ (rotas), widgets/ (blocos de UI compostos), features/ (casos de uso do usuário), entities/ (modelos de negócio), shared/ (utils, UI base). Cada feature é auto-contida: seu próprio store, hooks, componentes e testes. Elimina o problema de pastas gigantes de components/ e utils/ sem critério.',
    problem: 'Projeto com components/, hooks/, utils/ planas que crescem sem critério. Difícil saber qual componente pertence a qual feature. Mudança em uma feature quebra outra por acoplamento acidental.',
    solution: 'Organizar por domínio: src/features/auth/, src/features/cart/. Cada feature tem components, hooks, api e store próprios. Shared/ só para genuinamente reutilizável. Regra de ouro: features não importam de features.',
    tip: 'Não precisa implementar FSD completo desde o início. O passo 1: parar de colocar tudo em components/ e criar pastas por feature. Comece com src/features/[nome]/{components,hooks,api,store}.',
    questions: [
      { q: 'Qual a diferença entre features/ e entities/?', a: 'entities/ contém modelos de negócio puros (User, Product) sem lógica de UI — só tipos, schemas, funções puras. features/ contém casos de uso específicos (auth/login, cart/addItem) com UI e lógica de interação.' },
      { q: 'Como lidar com estado compartilhado entre features?', a: 'Elevar para o nível acima (app/ ou uma entity compartilhada). Se User é usado por auth e profile, o store de User fica em entities/user. Features importam de entities, não umas das outras.' },
      { q: 'FSD funciona com Next.js App Router?', a: 'Sim. O app/ do Next.js fica como esperado. O resto segue FSD em src/. As rotas importam de features/, que importam de entities/, que importam de shared/. A hierarquia de imports é unidirecional.' }
    ],
    code: `src/
├── app/               # Setup: providers, globals
├── pages/ (ou app/)   # Rotas Next.js
├── widgets/           # Blocos compostos de UI
│   └── Navbar/
├── features/          # Casos de uso
│   ├── auth/
│   │   ├── ui/LoginForm.tsx
│   │   ├── api/login.ts
│   │   ├── model/useAuth.ts
│   │   └── index.ts   # public API da feature
│   └── cart/
├── entities/          # Modelos de negócio
│   ├── user/
│   └── product/
└── shared/            # Genuinamente reutilizável
    ├── ui/Button.tsx
    └── lib/formatDate.ts

// Regra: imports só descem na hierarquia
// ✅ features/auth importa de entities/user
// ❌ features/auth importa de features/cart`
  },
  {
    id: 57, emoji: '📁', title: 'Organização de Pastas — Guia Prático',
    level: 'Avançado FE', color: '#f472b6',
    summary: 'Flat vs nested, colocation, e quando criar abstrações. Exemplos por tamanho de projeto.',
    definition: 'A estrutura de pastas deve refletir como o código muda junto, não o tipo de arquivo. Código que muda junto deve ficar junto (colocation). 3 abordagens: Flat por tipo (simples, não escala). Por feature/módulo (escala bem, recomendada para médio-grande). Híbrida (flat no início, move para feature quando crescer).',
    problem: 'Componentes, hooks e testes espalhados em pastas separadas obrigam navegação entre arquivos distantes. components/Button.tsx, hooks/useButton.ts, tests/Button.test.tsx — todos deveriam ficar juntos.',
    solution: 'Colocation: coloque o arquivo perto de onde é usado. Se é usado em um só lugar, coloque junto ao consumidor. Se é usado em 2+ lugares não relacionados, mova para shared/. Para apps médio-grandes: estrutura por feature.',
    tip: 'Não crie abstrações de organização antes de precisar. Comece flat. Quando uma pasta tiver 10+ arquivos, divida por feature. Imports devem apontar para baixo na hierarquia, nunca para cima ou para irmãos de outro domínio.',
    questions: [
      { q: 'Onde colocar componentes usados em um só lugar?', a: 'Junto ao componente que os usa. Se PageDashboard.tsx usa DashboardChart.tsx, coloque em pages/dashboard/DashboardChart.tsx. Só mova para shared/components/ quando for usado em 2+ lugares não relacionados.' },
      { q: 'Como organizar um projeto Next.js App Router?', a: 'app/ para rotas. src/components/ para UI reutilizável. src/features/ para lógica de domínio. src/lib/ para utils. src/hooks/ para hooks reutilizáveis. Evitar barrel exports (index.ts que re-exporta tudo) — causam tree-shaking e imports circulares.' },
      { q: 'Barrel exports (index.ts) valem a pena?', a: 'Para bibliotecas e design systems, sim (public API clara). Para app code, pode gerar imports circulares e prejuízo ao tree-shaking. Evitar re-exports de tudo. Preferir imports diretos no código de aplicação.' }
    ],
    code: `// Projeto pequeno (flat)
src/
├── components/  ├── hooks/  ├── pages/  └── utils/

// Projeto médio (por feature)
src/
├── app/                     # rotas Next.js
├── components/              # UI global (Button, Input, Modal)
├── features/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── LoginForm.test.tsx  # junto com o componente!
│   │   ├── useLoginForm.ts     # junto!
│   │   └── loginApi.ts
│   ├── products/
│   └── checkout/
├── hooks/                   # hooks globais
├── lib/                     # utils globais
└── types/                   # tipos globais

// Colocation: test e hook junto do componente
features/auth/
├── LoginForm.tsx
├── LoginForm.test.tsx
└── useLoginForm.ts`
  },
  {
    id: 58, emoji: '🏛️', title: 'Arquiteturas de Front-End: MPA, SPA, SSR, SSG',
    level: 'Avançado FE', color: '#f472b6',
    summary: 'Quando usar MPA, SPA, SSR, SSG, ISR e micro-frontends. Trade-offs reais por caso de uso.',
    definition: 'MPA: cada página é HTML do servidor. Ótimo SEO, sem JS inicial. SPA: HTML mínimo, toda navegação via JS. Transições rápidas, SEO ruim sem SSR. SSR: HTML renderizado a cada request — bom para SEO e dados frescos. SSG: HTML em build time — perfeito para conteúdo estático, CDN infinito. ISR: SSG com revalidação incremental. App Router do Next.js: Server Components por padrão + Client Components como islands.',
    problem: 'Escolher SPA para e-commerce (ruim para SEO), SSR para dashboard interno (custo sem benefício), ou MPA quando precisam de transições ricas de UI.',
    solution: 'E-commerce público: SSR ou SSG+ISR (SEO + performance). Dashboard interno: SPA (sem SEO, estado complexo). Blog/marketing: SSG (conteúdo estático, CDN). App híbrido: Next.js com SSG para páginas públicas, SSR para dados personalizados, Client Components para interatividade.',
    tip: 'Em 2025, Next.js App Router com Server Components é o padrão: SSR + islands de interatividade com zero configuração. A heurística: SSG onde possível, SSR onde necessário, Client Component só para interatividade.',
    questions: [
      { q: 'Quando usar SSR vs SSG?', a: 'SSG: conteúdo que não muda por usuário (blog, docs, landing page) ou muda raramente (catálogo com ISR). SSR: conteúdo personalizado por usuário (dashboard, feed) ou dados em tempo real (preço, estoque).' },
      { q: 'O que são micro-frontends e quando fazem sentido?', a: 'Dividir o frontend em apps independentes com deploy separado por time. Faz sentido para: organizações grandes com times autônomos, partes com ciclos de release diferentes, ou migração gradual de legado. Custo alto — só justifica em escala real.' },
      { q: 'CSR vs SSR: impacto em SEO?', a: 'CSR puro: Googlebot consegue indexar JS moderno mas outros bots não. Tempo de indexação maior. SSR/SSG: HTML com conteúdo chega direto, todos os bots indexam imediatamente. Para conteúdo público com necessidade de SEO, SSR/SSG é obrigatório.' }
    ],
    code: `// Next.js App Router: misturando arquiteturas por rota

// SSG com ISR (revalida a cada 60s)
const data = await fetch(url, { next: { revalidate: 60 } })

// SSR puro (a cada request)
const data = await fetch(url, { cache: 'no-store' })

// Server Component (padrão) — zero JS enviado ao cliente
async function ProductPage({ params }) {
  const product = await db.product.findUnique(params.id)
  return <ProductDetail product={product} />
}

// Client Component — apenas onde há interatividade
'use client'
function AddToCartButton({ productId }) {
  const { addItem } = useCart()
  return <button onClick={() => addItem(productId)}>Comprar</button>
}

// generateStaticParams: SSG com rotas dinâmicas
export async function generateStaticParams() {
  const products = await getProducts()
  return products.map(p => ({ id: p.id }))
}`
  },
  {
    id: 59, emoji: '🔄', title: 'Gerenciamento de Estado Global',
    level: 'Avançado FE', color: '#f472b6',
    summary: 'Context vs Zustand vs Redux Toolkit vs Jotai. Quando cada um e os trade-offs.',
    definition: 'Nem todo estado precisa ser global. Estado de UI (modal aberto, tab ativa) fica local com useState. Estado compartilhado entre componentes próximos: elevar state. Estado de servidor (dados da API): React Query/SWR — não useState. Apenas estado verdadeiramente global de cliente (tema, preferências, carrinho offline) justifica lib de estado global.',
    problem: 'Context API para estado que muda frequentemente (todos os consumers re-renderizam). Redux boilerplate excessivo. useState com prop drilling profundo. Estado de servidor (lista de produtos) em useState em vez de React Query.',
    solution: 'Zustand: 80% dos casos — simples, performático, sem boilerplate. Redux Toolkit: devtools avançados, ecossistema maduro, teams grandes. Jotai: estado atômico para UI muito granular. Context API: dados que mudam raramente (tema, idioma, user logado).',
    tip: 'A maioria dos apps não precisa de estado global. Antes de adicionar Zustand: (1) elevar estado, (2) composição de componentes, (3) React Query para estado de servidor. Se ainda precisar, Zustand é a escolha padrão em 2025.',
    questions: [
      { q: 'Por que Context API tem problema de performance?', a: 'Todo consumer do Context re-renderiza quando qualquer valor do context muda, mesmo que não use o valor que mudou. Solução: dividir contexts por frequência de atualização. Para estado frequente, Zustand é sempre melhor.' },
      { q: 'Zustand vs Redux Toolkit em 2025?', a: 'Zustand: 1kb, zero boilerplate, API simples. Redux Toolkit: ecossistema maduro, RTK Query integrado, devtools excelentes. A tendência é Zustand + React Query substituir Redux na maioria dos novos projetos.' },
      { q: 'O que é estado derivado e por que não guardá-lo?', a: 'Estado derivado é calculado a partir de outro estado: fullName = firstName + lastName. Guardar ambos cria problema de sincronização. Calcular no render (ou useMemo) garante que nunca ficam dessincronizados.' }
    ],
    code: `// Zustand — store simples e performático
import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  items: [],

  addItem: (item) => set(state => ({
    items: [...state.items, item]
  })),

  removeItem: (id) => set(state => ({
    items: state.items.filter(i => i.id !== id)
  })),

  get total() {
    return get().items.reduce((s, i) => s + i.price, 0)
  },
}))

// Usar com seletor — só re-renderiza se items mudar
const items = useCartStore(state => state.items)
const addItem = useCartStore(state => state.addItem)

// Context API: apenas para dados raramente atualizados
const ThemeContext = createContext('light')
// ✅ tema — muda raramente
// ❌ lista de produtos — use React Query`
  },
  {
    id: 60, emoji: '🔑', title: 'Autenticação — Fluxos e Padrões',
    level: 'Avançado FE', color: '#f472b6',
    summary: 'JWT vs Session, refresh token rotation, proteção de rotas no Next.js Middleware, e OAuth/SSO.',
    definition: 'JWT (stateless): token assinado com informações do usuário, sem consulta ao banco para validar. Session (stateful): ID de sessão no cookie, dados no banco. OAuth/SSO: delegar autenticação para Google, GitHub, etc. No Next.js, Middleware protege rotas no edge antes de renderizar — sem flash de conteúdo para rotas protegidas.',
    problem: 'JWT em localStorage (vulnerável a XSS). Token sem expiração ou sem refresh. Rota protegida verificada só no cliente (usuário vê flash do conteúdo antes do redirect). Sem rotação de refresh token.',
    solution: 'JWT em HttpOnly cookie (protegido de XSS). Access token curto (15min) + refresh token longo (7 dias) com rotação. Proteção de rota no Middleware do Next.js (server-side, sem flash). NextAuth.js abstrai toda essa complexidade.',
    tip: 'Use NextAuth.js / Auth.js para autenticação em Next.js. Implementar JWT + refresh rotation do zero é complexo e sujeito a erros de segurança. NextAuth já suporta 50+ providers OAuth, JWT, sessions e banco.',
    questions: [
      { q: 'JWT vs Session: qual usar?', a: 'JWT: stateless, escala sem banco, bom para microservices. Desvantagem: impossível revogar antes da expiração sem blocklist. Session: stateful, revogação imediata, simples para monólitos. Para apps com logout verdadeiro, sessions são mais seguras.' },
      { q: 'Como proteger rotas no Next.js App Router?', a: 'Middleware.ts na raiz lê o cookie/token e redireciona se não autenticado — roda no edge, antes de qualquer render, sem flash de conteúdo. É a abordagem correta. Verificar no layout.tsx (Server Component) também funciona mas é mais lento.' },
      { q: 'O que é refresh token rotation?', a: 'A cada uso do refresh token, um novo é emitido e o antigo invalidado. Se um refresh token for roubado e usado, a próxima rotação legítima detecta que o token foi consumido e invalida a sessão — proteção contra token theft.' }
    ],
    code: `// middleware.ts — proteção de rota no edge
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req) {
  const token = await getToken({ req })
  const isProtected = req.nextUrl.pathname.startsWith('/dashboard')

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (req.nextUrl.pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}

// NextAuth.js config básico
export const authOptions = {
  providers: [
    GoogleProvider({ clientId, clientSecret }),
    CredentialsProvider({ /* email + senha */ }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.role = user.role
      return token
    }
  }
}`
  }
]

const all = [...existing, ...newConcepts]
writeFileSync('./src/data/concepts.json', JSON.stringify(all, null, 2))
console.log('Total concepts:', all.length)
console.log('New levels added:', [...new Set(newConcepts.map(c => c.level))].join(', '))
