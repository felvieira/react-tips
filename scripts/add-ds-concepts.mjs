import { readFileSync, writeFileSync } from 'fs'

const existing = JSON.parse(readFileSync('./src/data/concepts.json', 'utf8'))

const newConcepts = [

  // ── DESIGN SYSTEMS ────────────────────────────────────────────────────────
  {
    id: 61, emoji: '🎨', title: 'Design System — Fundamentos',
    level: 'Design System', color: '#fb923c',
    summary: 'Tokens, componentes, documentação e governança. Por que um DS existe e quando não criar um.',
    definition: 'Um Design System é a fonte única de verdade para UI: tokens de design (cores, tipografia, espaçamento), componentes reutilizáveis, padrões de interação, e documentação. Resolve inconsistência visual entre times, acelera desenvolvimento (componentes prontos) e facilita mudanças de tema. Não é só uma lib de componentes — inclui processo, governança e documentação.',
    problem: 'Times diferentes implementam o mesmo botão de 5 formas diferentes. Mudar a cor primária da marca exige alterar 300 arquivos. Novos devs não sabem quais componentes existem. Design e código ficam dessincronizados.',
    solution: 'Design Tokens (CSS custom properties ou JSON) como fonte de verdade para valores visuais. Componentes que consomem tokens, nunca hardcode. Documentação com Storybook. Processo de contribuição claro. Versionamento semântico para breaking changes.',
    tip: 'Não crie um Design System antes de ter produto estável. Um DS prematuro engessa decisões de produto. Comece com tokens + uns 10 componentes base. Cresça sob demanda. "Pave the cowpaths" — pavimente os caminhos que o time já usa.',
    questions: [
      { q: 'Qual a diferença entre Design Tokens e variáveis CSS?', a: 'Design Tokens são a camada semântica: --color-primary em vez de --blue-500. Permitem rebranding completo sem tocar nos componentes — só os tokens mudam. Variáveis CSS são o mecanismo; tokens são o padrão. W3C Design Tokens Community Group está padronizando o formato JSON.' },
      { q: 'Quando um DS próprio vale o investimento?', a: 'Vale quando: múltiplos produtos compartilham identidade visual, time de design+dev dedicado, produto estável (não MVP). Não vale quando: startup validando produto, time pequeno, UI não é diferencial. Alternativa: customizar um DS existente (shadcn/ui, Radix, Chakra).' },
      { q: 'Como lidar com breaking changes no DS?', a: 'Versionamento semântico (semver): MAJOR para breaking changes de API, MINOR para novos componentes, PATCH para bugfixes. Codemods para migração automática. Período de deprecation com warnings antes de remover. Changelog detalhado com exemplos de migração.' }
    ],
    code: `// Design Tokens como CSS custom properties
:root {
  /* Primitivos — não usar diretamente */
  --blue-500: oklch(0.55 0.2 250);
  --blue-600: oklch(0.48 0.2 250);

  /* Semânticos — usar nos componentes */
  --color-primary:        var(--blue-500);
  --color-primary-hover:  var(--blue-600);
  --color-bg:             oklch(0.99 0 0);
  --color-text:           oklch(0.15 0 0);
  --color-border:         oklch(0.88 0 0);

  --space-1: 4px;  --space-2: 8px;
  --space-4: 16px; --space-8: 32px;

  --radius-sm: 4px; --radius-md: 8px; --radius-full: 9999px;

  --text-sm: 12px; --text-base: 14px; --text-lg: 16px;
}

/* Tema escuro — só muda os semânticos */
[data-theme="dark"] {
  --color-bg:    oklch(0.14 0 0);
  --color-text:  oklch(0.95 0 0);
  --color-border: oklch(0.3 0 0);
}

/* Componente consome tokens, nunca hardcode */
.btn-primary {
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
}`
  },

  {
    id: 62, emoji: '🧱', title: 'Componentização Avançada',
    level: 'Design System', color: '#fb923c',
    summary: 'Atomic Design, componentes compostos, API de componentes limpa e variantes com CVA.',
    definition: 'Componentização eficaz segue princípios: Single Responsibility (um componente, uma responsabilidade), Open/Closed (extensível sem modificar), e interface mínima (poucas props obrigatórias). Atomic Design organiza componentes em Atoms (Button, Input), Molecules (FormField = Label + Input + Error), Organisms (LoginForm), Templates, e Pages. CVA (class-variance-authority) gerencia variantes sem if/else.',
    problem: 'Componentes com 30 props booleanas (isLarge, isSmall, isPrimary, isSecondary, isDanger...). Props que mudam comportamento de forma imprevisível. Impossível entender o componente sem ler todo o código.',
    solution: 'Variantes como strings (variant="primary" | "secondary" | "danger") em vez de booleanos. Compound components para composição flexível. CVA para gerenciar classes de variantes. Slots/children para extensibilidade sem proliferação de props.',
    tip: 'A API de um componente é seu contrato com o consumidor. Adicionar prop é fácil; remover é breaking change. Prefira interface mínima — se não tem caso de uso claro, não adicione a prop. "You can always add, never remove."',
    questions: [
      { q: 'Booleano vs string para variantes de componente?', a: 'String é melhor: variant="primary" | "secondary" é auto-documentável, mutuamente exclusivo por definição, e extensível sem breaking change. Booleanos (isPrimary, isSecondary) podem ser combinados de formas inválidas e ficam verbosos com muitas variantes.' },
      { q: 'O que é o padrão de Compound Components?', a: 'Componentes que cooperam via Context implícito: <Select><Select.Trigger/><Select.Content><Select.Item/></Select.Content></Select>. O pai gerencia estado, filhos consomem via useContext. Radix UI, shadcn/ui e Headless UI usam esse padrão extensivamente.' },
      { q: 'Como documentar componentes efetivamente?', a: 'Storybook com stories para cada variante e estado (default, hover, focus, disabled, error, loading). Controls para props interativas. Docs automáticos via JSDoc/TSDoc. Testes de acessibilidade com @storybook/addon-a11y. Stories servem como spec executável.' }
    ],
    code: `// CVA para variantes sem if/else
import { cva, type VariantProps } from 'class-variance-authority'

const button = cva(
  'inline-flex items-center font-medium rounded transition-colors focus:outline-none focus:ring-2',
  {
    variants: {
      variant: {
        primary:   'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        danger:    'bg-red-600 text-white hover:bg-red-700',
        ghost:     'text-gray-600 hover:bg-gray-100',
      },
      size: {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-2',
        lg: 'text-base px-4 py-3',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={button({ variant, size, className })} {...props} />
}

// Uso
<Button variant="danger" size="lg">Deletar</Button>
<Button variant="ghost">Cancelar</Button>`
  },

  {
    id: 63, emoji: '📖', title: 'Storybook & Documentação de UI',
    level: 'Design System', color: '#fb923c',
    summary: 'Storybook como ferramenta de desenvolvimento isolado, documentação viva e testes visuais.',
    definition: 'Storybook é um workshop para desenvolver, documentar e testar componentes em isolamento. Cada Story representa um estado específico do componente. Funciona como: 1) Ambiente de desenvolvimento (sem precisar de back-end). 2) Documentação viva (auto-gerada de TypeScript). 3) Testes visuais (Chromatic, Percy). 4) Playground para design colaborar com dev.',
    problem: 'Desenvolver um componente que depende de 5 providers, dados da API e estado da aplicação. Ou descobrir que o componente quebra num estado específico só em produção. Ou design não ter como verificar se a implementação bate com o Figma.',
    solution: 'Storybook para desenvolver em isolamento com mock de dados. Stories para cada estado relevante (empty, loading, error, populated, edge cases). Chromatic para testes de regressão visual automáticos (detecta mudanças de pixel).',
    tip: 'Escreva stories enquanto desenvolve, não depois. Stories forçam você a pensar na API do componente antes de implementar. Se é difícil escrever uma story, provavelmente o componente tem acoplamento excessivo.',
    questions: [
      { q: 'Diferença entre Story e teste de componente?', a: 'Story é documentação e desenvolvimento visual — mostra como o componente parece em diferentes estados. Teste (Jest/RTL) verifica comportamento e lógica. São complementares: stories para visual, testes para funcional. Storybook pode executar testes de acessibilidade automáticos via addon.' },
      { q: 'Como fazer testes de regressão visual?', a: 'Chromatic (do time do Storybook): faz screenshot de cada story em cada commit e compara com baseline. Detecta mudanças visuais não intencionais automaticamente. Alternativas: Percy, Playwright (screenshot testing), ou Happo. Essencial em DS para garantir que mudança de token não quebre componentes.' },
      { q: 'Como organizar stories em projetos grandes?', a: 'Hierarquia: Componentes/Atoms/Button.stories.tsx. Usar tags para filtrar (is:new, status:deprecated). Stories por estado: Default, Hover (play function), Disabled, Loading, Error. Usar argTypes para documentar props com descrições e controles interativos.' }
    ],
    code: `// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],           // gera documentação automática
  argTypes: {
    variant: {
      description: 'Estilo visual do botão',
      control: { type: 'select' },
    },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: { children: 'Salvar', variant: 'primary' },
}

export const Danger: Story = {
  args: { children: 'Deletar', variant: 'danger' },
}

export const Loading: Story = {
  args: { children: 'Salvando...', disabled: true },
}

// Teste de interação com play function
export const ClickTest: Story = {
  args: { children: 'Clicar' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button'))
    await expect(canvas.getByRole('button')).toHaveFocus()
  },
}`
  },

  // ── MICROFRONTENDS & MONOREPO ──────────────────────────────────────────────
  {
    id: 64, emoji: '🔀', title: 'Monorepo — Turborepo & Nx',
    level: 'Microfrontend', color: '#34d399',
    summary: 'Gerenciar múltiplos apps e packages no mesmo repositório com build caching e pipeline inteligente.',
    definition: 'Monorepo é um repositório único com múltiplos projetos/packages. Benefícios: compartilhamento de código fácil (UI lib, utils), uma versão de cada dependência, refatorações atômicas entre packages, CI/CD unificado. Turborepo e Nx adicionam: build caching (só rebuilda o que mudou), task pipeline (ordem de execução), e remote caching (compartilhar cache entre CI runs).',
    problem: 'Times com múltiplos repos ficam dessincronizados (UI lib na v1 em um app, v2 em outro). Refatoração que afeta 3 apps exige 3 PRs. Mudança no package compartilhado não é testada contra todos os consumers antes do merge.',
    solution: 'Monorepo com Turborepo: packages/ui (design system), packages/utils (helpers), apps/web (Next.js), apps/dashboard (Next.js). Pipeline: build depende de ^build dos deps. Cache: outputs em .turbo. Remote cache: Vercel Remote Cache ou self-hosted.',
    tip: 'Monorepo não é Monólito. Cada app ainda faz deploy independente. O monorepo resolve apenas o problema de coordenação de código e builds. Comece com Turborepo — menor curva de aprendizado. Use Nx para projetos com build graph muito complexo ou necessidade de plugins.',
    questions: [
      { q: 'Turborepo vs Nx: qual escolher?', a: 'Turborepo: simples, zero config, melhor para JS/TS puro, excelente caching, opinionado mas flexível. Nx: mais features (generators, plugins, affected), melhor para workspaces grandes e diversificados (Go, Java, etc.), mais complexo. Para maioria dos projetos Next.js/React, Turborepo é suficiente.' },
      { q: 'Como funciona o build caching no Turborepo?', a: 'Turborepo faz hash de inputs (arquivos de source + env vars + dependências) e outputs (dist/, .next/). Se o hash não mudou, retorna o cache em vez de rebuildar. Remote cache compartilha esse resultado entre máquinas — dev e CI compartilham cache.' },
      { q: 'Como lidar com versionamento de packages internos no monorepo?', a: 'Opções: 1) Sem versão (workspace:*) — sempre a versão mais recente, ideal para apps no mesmo repo. 2) Versão semântica — quando packages são publicados no npm. Changesets automatiza o versionamento: gera changelogs e bumps de versão baseados em changesets commitados.' }
    ],
    code: `// turbo.json — pipeline de tasks
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],   // build deps primeiro
      "outputs": [".next/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}

// package.json raiz
{
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "test": "turbo test",
    "lint": "turbo lint"
  }
}

// Estrutura
apps/
  web/          # Next.js app principal
  dashboard/    # Next.js admin
packages/
  ui/           # Design System
  utils/        # Helpers compartilhados
  config/       # ESLint, TS config compartilhados
  tsconfig/`
  },

  {
    id: 65, emoji: '🏢', title: 'Micro-Frontends — Module Federation',
    level: 'Microfrontend', color: '#34d399',
    summary: 'Dividir o frontend em apps independentes com deploy separado. Module Federation no Webpack/Vite.',
    definition: 'Micro-frontends dividem um app grande em apps menores independentes, cada um com seu próprio deploy, bundle e time. Module Federation (Webpack 5 / Vite) permite que apps exponham e consumam módulos remotamente em runtime — sem precisar rebuildar o host. Shell app (host) carrega remote apps dinamicamente. Single-SPA é uma alternativa de orquestração.',
    problem: 'App monolítico de frontend que 5 times editam simultaneamente. Deploy de qualquer feature exige testar e deployar o app inteiro. Times ficam esperando uns pelos outros para fazer release.',
    solution: 'Shell app (host) que define layout e navegação. Remote apps (team-a, team-b) que expõem componentes ou rotas via Module Federation. Cada remote faz deploy independente. O shell carrega remotes em runtime pelo URL do manifesto.',
    tip: 'Micro-frontends têm custo alto: duplicação de React no bundle, complexidade de integração, compartilhamento de estado entre apps. Só justifica quando o problema de coordenação de times é real e documentado. Para a maioria dos apps, monorepo com módulos resolve o problema sem a complexidade.',
    questions: [
      { q: 'Diferença entre Module Federation e iframes?', a: 'iframes: isolamento total (CSS, JS não vazam), mas integração ruim (comunicação via postMessage, performance, acessibilidade). Module Federation: apps compartilham o mesmo DOM e podem compartilhar libs (React singleton), integração nativa mas sem isolamento. Iframes para conteúdo realmente isolado (widgets, third-party).' },
      { q: 'Como compartilhar estado entre micro-frontends?', a: 'Evitar estado compartilhado muda o design. Opções: 1) Custom events (window.dispatchEvent) — simples mas frágil. 2) Shared store (Zustand singleton compartilhado). 3) URL como fonte de verdade (query params). 4) Backend-driven state (polling/websocket). A melhor solução é não precisar compartilhar.' },
      { q: 'Como garantir que versões de React não conflitem?', a: 'Module Federation: declarar React e ReactDOM como singleton: true e requiredVersion em shared. Isso garante que apenas uma instância de React roda, mesmo com múltiplos remotes. Sem singleton, cada remote carrega sua própria cópia e hooks quebram (viola Rules of Hooks entre instâncias).' }
    ],
    code: `// webpack.config.js do Shell (host)
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    teamA: 'teamA@https://team-a.example.com/remoteEntry.js',
    teamB: 'teamB@https://team-b.example.com/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18' },
    'react-dom': { singleton: true, requiredVersion: '^18' },
  },
})

// webpack.config.js do Remote (team-a)
new ModuleFederationPlugin({
  name: 'teamA',
  filename: 'remoteEntry.js',
  exposes: {
    './CheckoutPage': './src/pages/CheckoutPage',
    './CartWidget':   './src/components/CartWidget',
  },
  shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
})

// No shell: carregar remote dinamicamente
const CheckoutPage = React.lazy(() => import('teamA/CheckoutPage'))

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <CheckoutPage />
    </Suspense>
  )
}`
  },

  // ── OBSERVABILIDADE ───────────────────────────────────────────────────────
  {
    id: 66, emoji: '📊', title: 'Observabilidade em Frontend',
    level: 'Observabilidade', color: '#facc15',
    summary: 'Error tracking (Sentry), RUM (Real User Monitoring), logs estruturados e Core Web Vitals em produção.',
    definition: 'Observabilidade front-end cobre: 1) Error Tracking (Sentry, Bugsnag): capturar e agrupar exceções JS com stack trace e contexto do usuário. 2) RUM (Real User Monitoring): métricas reais de performance de usuários reais (Vercel Analytics, Datadog RUM). 3) Session Replay (LogRocket, FullStory): replay de sessões para reproduzir bugs. 4) Logs estruturados: enviar eventos ao backend. 5) Feature flags: rollout gradual com observação de impacto.',
    problem: 'Bug em produção que não aparece em dev. Reclamação de usuário "o site está lento" sem dados para investigar. Não saber qual % dos usuários está experimentando um erro.',
    solution: 'Sentry para error tracking (instalar em _app.tsx / layout.tsx). Vercel Analytics ou web-vitals para Core Web Vitals de usuários reais. Breadcrumbs de navegação para contexto de bugs. Source maps no Sentry para stack traces legíveis.',
    tip: 'Instale Sentry no dia 1 de produção. Erros JS silenciosos são invisíveis sem error tracking. Configurar alertas para erros novos e aumentos de taxa de erro. Source maps são obrigatórios — sem eles, stack traces são inúteis em código minificado.',
    questions: [
      { q: 'Como fazer source maps sem expor código em produção?', a: 'Fazer upload dos source maps para o Sentry mas não servir para o browser. next.config.ts: `sentry: { hideSourceMaps: true }`. Ou configurar SOURCEMAP_SENTINEL=false para omitir a referência no bundle. O Sentry usa os maps internamente para mapear erros, mas não os expõe ao público.' },
      { q: 'O que é RUM e como difere do Lighthouse?', a: 'Lighthouse: medição em ambiente controlado (lab data), não reflete usuários reais. RUM: coleta métricas do browser de usuários reais em campo (field data) — inclui variações de dispositivo, rede, e localização geográfica. Core Web Vitals no Google Search Console são field data via Chrome User Experience Report (CrUX).' },
      { q: 'Como correlacionar erro no frontend com log no backend?', a: 'Correlation ID: o front envia um ID único em cada request (header X-Correlation-ID). O backend loga com esse ID. Quando um erro ocorre no frontend, o Sentry captura o correlation ID como contexto — facilita achar o log do servidor que corresponde ao erro do cliente.' }
    ],
    code: `// Sentry no Next.js App Router
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,      // 10% de transactions
  replaysOnErrorSampleRate: 1, // 100% de sessões com erro
  integrations: [
    Sentry.replayIntegration({ maskAllText: true }), // privacidade
  ],
})

// Web Vitals — reportar para analytics
export function reportWebVitals(metric) {
  // Enviar para Vercel Analytics, DataDog, ou custom
  if (metric.name === 'LCP' && metric.value > 2500) {
    Sentry.captureMessage('LCP above threshold', {
      level: 'warning',
      extra: { value: metric.value, url: window.location.href },
    })
  }
}

// Contexto de usuário para melhor debug
Sentry.setUser({ id: user.id, email: user.email })`
  },

  {
    id: 67, emoji: '🔍', title: 'Logs, Traces e Alertas no Frontend',
    level: 'Observabilidade', color: '#facc15',
    summary: 'Logs estruturados, distributed tracing do browser ao servidor, e alertas inteligentes.',
    definition: 'Logs estruturados (JSON) são pesquisáveis e analisáveis — melhor que console.log livre. Distributed tracing rastreia um request do clique do usuário até o banco de dados: o frontend emite um trace span, o backend o continua, gerando um grafo causal completo. OpenTelemetry é o padrão aberto para instrumentação. Alertas baseados em anomalia (spike de erros) são melhores que threshold fixo.',
    problem: 'Erro no frontend: não sabe se o problema está no cliente, na API, ou no banco. Logs de console em produção que não aparecem em nenhuma ferramenta. Alertas que disparam toda hora por threshold muito baixo (alert fatigue).',
    solution: 'OpenTelemetry no frontend para traces distribuídos. Log structured events (não strings) para ferramentas de observabilidade. Sentry com performance monitoring para ver spans. Alertas baseados em % de aumento (não valor absoluto) para reduzir falsos positivos.',
    tip: 'Prefira eventos de negócio a logs técnicos: "checkout_failed" com {reason, amount, userId} é mais útil que "Error: 400 Bad Request". Eventos de negócio alimentam dashboards de produto e debug ao mesmo tempo.',
    questions: [
      { q: 'O que é OpenTelemetry e como usar no frontend?', a: 'Padrão aberto para instrumentação (traces, metrics, logs). @opentelemetry/sdk-trace-web instrumenta o browser. Trace inicia no clique do usuário, o span HTTP propaga via headers (traceparent), o backend continua o trace. Resultado: timeline completo do click ao banco no Jaeger, DataDog, ou Grafana Tempo.' },
      { q: 'Como evitar enviar dados sensíveis para ferramentas de observabilidade?', a: 'Sentry: beforeSend hook para filtrar/sanitizar eventos antes de enviar. SessionReplay: maskAllText: true mascara todo texto. Configurar allowUrls para ignorar erros de extensões do browser. Nunca logar tokens, senhas ou dados pessoais — PII (Personally Identifiable Information) em logs viola LGPD/GDPR.' },
      { q: 'O que é error boundary e como integrar com Sentry?', a: 'Error Boundary captura erros de render em React e evita que o app inteiro quebre. Integrar com Sentry: Sentry.ErrorBoundary component como wrapper — captura automaticamente o erro, a stack, e os props do componente que falhou. Permite mostrar fallback UI para o usuário enquanto o erro é reportado.' }
    ],
    code: `// Log estruturado — não console.log
function logEvent(name: string, data: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') {
    // Enviar para DataDog, Axiom, etc.
    fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify({ name, data, timestamp: Date.now(),
        url: window.location.href, userId: getUser()?.id }),
    })
  } else {
    console.log('[Event]', name, data)
  }
}

// Usar eventos de negócio
logEvent('checkout_started', { cartValue: 99.90, itemCount: 3 })
logEvent('payment_failed', { reason: 'insufficient_funds', amount: 99.90 })

// Error Boundary com Sentry
import * as Sentry from '@sentry/nextjs'

function App() {
  return (
    <Sentry.ErrorBoundary
      fallback={<ErrorPage />}
      onError={(error, componentStack) => {
        // contexto adicional automático
        console.error('Boundary caught:', error)
      }}
    >
      <AppContent />
    </Sentry.ErrorBoundary>
  )
}

// Feature flag com observabilidade
const { isEnabled } = useFeatureFlag('new-checkout')
if (isEnabled) {
  logEvent('new_checkout_viewed', { userId })
}`
  },

  // ── GERENCIAMENTO DE ESTADO ────────────────────────────────────────────────
  {
    id: 68, emoji: '🗃️', title: 'Redux Toolkit — Guia Moderno',
    level: 'Estado Global', color: '#818cf8',
    summary: 'createSlice, RTK Query, Immer por padrão. Redux sem boilerplate em 2025.',
    definition: 'Redux Toolkit (RTK) é a forma oficial e moderna de usar Redux — elimina 80% do boilerplate original. createSlice cria actions e reducer juntos com Immer (mutação sintática, imutabilidade real). RTK Query é uma solução completa de data fetching integrada: cache, invalidação, otimismo, e polling sem configuração manual.',
    problem: 'Redux "clássico" com actions, action creators, action types constantes, reducers com switch/case, normalização manual — centenas de linhas de boilerplate para uma feature simples.',
    solution: 'createSlice para estado de UI. RTK Query para estado de servidor (substitui React Query para projetos já em Redux). configureStore com middleware automático. DevTools integradas sem configuração.',
    tip: 'Se está começando um projeto novo em 2025 sem Redux legacy, use Zustand + React Query. RTK vale quando: já tem Redux na codebase, time conhece Redux, ou precisa do ecossistema Redux (devtools avançadas, middleware específico).',
    questions: [
      { q: 'O que o Immer faz no createSlice?', a: 'Immer usa Proxy para interceptar mutações: você escreve `state.count++` e Immer produz um novo objeto imutável por baixo. Isso elimina o spread manual (`...state, count: state.count + 1`). Mais legível, menos propenso a bugs de imutabilidade.' },
      { q: 'RTK Query vs React Query: qual escolher?', a: 'RTK Query: integra ao store Redux (cache acessível via state), devtools do Redux mostram requests, bom para projetos já em Redux. React Query: independente, mais features (infinite query, offline, mutations), melhor ecosystem. Para projetos novos sem Redux: React Query. Para projetos Redux: RTK Query faz sentido.' },
      { q: 'Como estruturar slices em projetos grandes?', a: 'Uma slice por feature/domínio: authSlice, cartSlice, uiSlice. Separar estado de UI (modais, loading local) de estado de servidor (que deve estar no React Query/RTK Query). Evitar "god slice" com tudo junto. Combinar com Feature-Sliced Design: cada feature tem sua slice e api.' }
    ],
    code: `// createSlice — reducer + actions juntos
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] as CartItem[], isOpen: false },
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      state.items.push(action.payload)  // Immer: mutação segura
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.id !== action.payload)
    },
    toggleCart(state) { state.isOpen = !state.isOpen },
  },
})

export const { addItem, removeItem, toggleCart } = cartSlice.actions

// RTK Query — data fetching integrado
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Product'],
  endpoints: (build) => ({
    getProducts: build.query<Product[], void>({
      query: () => '/products',
      providesTags: ['Product'],
    }),
    addProduct: build.mutation<Product, Partial<Product>>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: ['Product'], // auto-refetch após mutation
    }),
  }),
})

export const { useGetProductsQuery, useAddProductMutation } = productsApi`
  },

  {
    id: 69, emoji: '🔮', title: 'Context API — Padrões e Limitações',
    level: 'Estado Global', color: '#818cf8',
    summary: 'Context para dados estáveis, splitting por frequência, e o padrão Provider + hook customizado.',
    definition: 'Context API é nativa do React — sem dependências externas. Ideal para dados que: mudam raramente (tema, idioma, usuário logado), ou precisam ser acessados em muitos níveis de profundidade sem prop drilling. Limitação crítica: qualquer mudança no value re-renderiza TODOS os consumers, mesmo que não usem o valor que mudou.',
    problem: 'Context com objeto grande onde qualquer campo muda frequentemente: todos os consumers re-renderizam a cada mudança. Difícil otimizar sem usar libs extras. Acesso direto ao Context espalhado no código em vez de hooks customizados.',
    solution: 'Splitting: um Context por frequência de atualização (AuthContext separado de ThemeContext). Memoizar value com useMemo. Sempre expor via hook customizado (useAuth()) em vez de useContext(AuthContext) direto — facilita troca de implementação. Para estado frequente, Zustand.',
    tip: 'O padrão correto: Context armazena o valor, hook customizado encapsula o acesso. `export function useTheme() { return useContext(ThemeContext) }`. Isso permite trocar a implementação interna sem mudar todos os consumers.',
    questions: [
      { q: 'Como otimizar Context para evitar re-renders?', a: 'Splitting: separar contextos por frequência (AuthContext, ThemeContext, UIContext). Memoizar o value: `const value = useMemo(() => ({ user, logout }), [user])`. Para seletores (só ouvir parte do context), usar use-context-selector lib. Mas se o estado muda frequentemente, Zustand é a solução certa.' },
      { q: 'Context API pode substituir Redux?', a: 'Para estado simples e raramente atualizado, sim. Para estado complexo com muitas atualizações, não — sem o conceito de seletor, todos os consumers re-renderizam. Context não tem devtools, middleware, ou estrutura para mutations complexas. Use Context para DI (dependency injection) de valores estáveis, Redux/Zustand para estado dinâmico.' },
      { q: 'O que é o padrão Compound + Context?', a: 'Compound Components que compartilham estado via Context: o componente pai cria um Context privado, filhos consomem. Ex: <Accordion> cria um Context com {openIndex, setOpenIndex}. <Accordion.Item> consome via useContext interno. Usuário não precisa gerenciar estado — a API é declarativa.' }
    ],
    code: `// Padrão: Context + hook customizado
interface AuthContextValue {
  user: User | null
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback(async (credentials) => {
    const user = await authApi.login(credentials)
    setUser(user)
  }, [])

  const logout = useCallback(() => setUser(null), [])

  // useMemo evita novo objeto a cada render
  const value = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook customizado — nunca expor o Context diretamente
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}

// Context splitting — frequências separadas
<ThemeProvider>      {/* muda raramente */}
  <AuthProvider>     {/* muda ao login/logout */}
    <UIProvider>     {/* muda por interação */}
      <App />
    </UIProvider>
  </AuthProvider>
</ThemeProvider>`
  },

  {
    id: 70, emoji: '🐻', title: 'Zustand — Guia Completo',
    level: 'Estado Global', color: '#818cf8',
    summary: 'Store simples, seletores, middleware (persist, devtools, immer), e padrões avançados.',
    definition: 'Zustand é uma lib minimalista de estado global (1kb). Store é criado com create(), actions ficam no mesmo objeto que o estado, seletores evitam re-renders desnecessários. Middleware: persist (localStorage automático), devtools (Redux DevTools), immer (mutação sintática). Sem Provider, sem boilerplate, sem Context.',
    problem: 'Redux para uma funcionalidade simples exige: types, actions, reducers, selectors, thunks — 100 linhas para guardar um boolean. Context API com re-render de todos os consumers.',
    solution: 'Zustand: create() com estado e actions inline. Seletor para consumir só o que precisa (previne re-render). persist middleware para persistir no localStorage com uma linha. devtools para debugging com Redux DevTools.',
    tip: 'Seletores são críticos: `useStore(s => s.count)` re-renderiza só quando count muda. `useStore()` sem seletor re-renderiza quando qualquer parte do store muda. Sempre use seletor granular.',
    questions: [
      { q: 'Como dividir uma store Zustand grande?', a: 'Slice pattern: criar múltiplas slices e combinar: `create<State>()((...args) => ({ ...createAuthSlice(...args), ...createCartSlice(...args) }))`. Ou criar stores separadas por domínio — Zustand não tem store única obrigatória, ao contrário do Redux.' },
      { q: 'Como persistir estado com Zustand?', a: 'Middleware persist: `create(persist((set) => ({ count: 0, inc: () => set(s => ({count: s.count+1})) }), { name: "counter-storage" }))`. Persiste no localStorage por padrão. Customizar storage (sessionStorage, IndexedDB), partializar quais campos persistir, e migrar state entre versões.' },
      { q: 'Zustand funciona com Server Components?', a: 'Não diretamente — Zustand é client-side (usa window/browser APIs). Inicializar store com dados do servidor via prop do Client Component ou via useHydrateAtoms (Jotai). No Next.js App Router: criar uma instância por request no servidor usando a forma funcional do create.' }
    ],
    code: `import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  total: number
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        items: [],

        addItem: (item) => set(state => {
          state.items.push(item) // Immer: mutação segura
        }),

        removeItem: (id) => set(state => {
          state.items = state.items.filter(i => i.id !== id)
        }),

        get total() {
          return get().items.reduce((s, i) => s + i.price, 0)
        },
      })),
      { name: 'cart-storage' } // persist config
    ),
    { name: 'CartStore' } // devtools name
  )
)

// Consumir com seletor granular
function CartBadge() {
  // ✅ só re-renderiza quando items.length muda
  const count = useCartStore(s => s.items.length)
  return <span>{count}</span>
}

function AddButton({ item }) {
  // ✅ actions são estáveis (referência não muda)
  const addItem = useCartStore(s => s.addItem)
  return <button onClick={() => addItem(item)}>Adicionar</button>
}`
  },

  {
    id: 71, emoji: '⚛️', title: 'Jotai — Estado Atômico',
    level: 'Estado Global', color: '#818cf8',
    summary: 'Atoms independentes, estado derivado com atomFamily, e integração com React Suspense.',
    definition: 'Jotai é um gerenciador de estado atômico: cada atom é um pedaço independente de estado. Diferente do Zustand (um store), Jotai é bottom-up — componentes se subscrevem a atoms específicos. Atoms derivados (computed): atom((get) => get(aAtom) + get(bAtom)). atomFamily para atoms dinâmicos por ID. Integração nativa com Suspense para async atoms.',
    problem: 'Zustand/Redux com um store global: qualquer componente pode escrever qualquer parte do estado acidentalmente. Estado muito granular exige muitos seletores. Atoms async com loading state manual.',
    solution: 'Jotai: cada atom é isolado. Componente só pode acessar atoms que importa explicitamente. Atom derivado é automaticamente memoizado. loadable() para async atoms sem Suspense. atomFamily para coleções (atom por ID de produto).',
    tip: 'Jotai brilha para estado de UI muito granular e independente: abrir/fechar de N dropdowns, hover state de N items em lista, configurações por item. Onde Zustand tem um store centralizado, Jotai tem atoms distribuídos pelos componentes.',
    questions: [
      { q: 'Jotai vs Zustand: quando escolher cada um?', a: 'Zustand: estado de domínio centralizado (cart, auth, produtos), quando você quer uma "fonte única de verdade" explícita. Jotai: estado granular de UI, atoms por ID (editando item específico), estado que é naturalmente derivado de outros. Muitos devs usam Zustand para domínio e Jotai para UI granular.' },
      { q: 'Como funciona atom derivado no Jotai?', a: 'atom((get) => derivação): lê outros atoms via get(), Jotai rastreia dependências automaticamente. Quando qualquer atom lido mudar, o derivado recalcula. Equivalente a useMemo mas global — qualquer componente pode ler o derivado sem recalcular.' },
      { q: 'Jotai funciona com SSR/Next.js?', a: 'Sim, com Provider e useHydrateAtoms para inicializar atoms com dados do servidor: `useHydrateAtoms([[userAtom, serverUser]])`. Sem Provider, atoms são globais (singleton) — problemático em SSR onde múltiplas requests compartilhariam estado. Com Provider por request, cada request tem seu próprio scope.' }
    ],
    code: `import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomFamily, loadable } from 'jotai/utils'

// Atom primitivo
const countAtom = atom(0)

// Atom derivado (read-only)
const doubleAtom = atom((get) => get(countAtom) * 2)

// Atom leitura+escrita com lógica
const incrementAtom = atom(
  (get) => get(countAtom),
  (get, set, by: number = 1) => set(countAtom, get(countAtom) + by)
)

// atomFamily — atom por ID
const productAtom = atomFamily((id: string) =>
  atom(async () => {
    const res = await fetch(\`/api/products/\${id}\`)
    return res.json()
  })
)

// Async atom com Suspense
const userAtom = atom(async () => {
  const res = await fetch('/api/user')
  return res.json()
})

function UserName() {
  const user = useAtomValue(userAtom) // Suspense automático
  return <span>{user.name}</span>
}

// Granularidade: cada item tem seu próprio atom
function TodoItem({ id }: { id: string }) {
  const [todo, setTodo] = useAtom(todoAtomFamily(id))
  // só re-renderiza quando ESTE todo muda
  return <input value={todo.text} onChange={e => setTodo({...todo, text: e.target.value})} />
}`
  },
]

const all = [...existing, ...newConcepts]
writeFileSync('./src/data/concepts.json', JSON.stringify(all, null, 2))
console.log('Total:', all.length)
console.log('Added:', newConcepts.length, 'concepts')
console.log('New levels:', [...new Set(newConcepts.map(c => c.level))].join(', '))
