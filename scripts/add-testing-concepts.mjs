import { readFileSync, writeFileSync } from 'fs'

const existing = JSON.parse(readFileSync('./src/data/concepts.json', 'utf8'))

const newConcepts = [
  {
    id: 72,
    emoji: '🧪',
    title: 'Testing — RTL e Jest',
    level: 'Testing',
    color: '#4ade80',
    summary: 'Testar comportamento, não implementação. getByRole, userEvent, e o que não testar.',
    definition:
      'React Testing Library testa o que o usuário vê e faz, não internals do componente. Queries por role/label/text (acessíveis) em vez de class/id (frágeis). userEvent simula interação real (tipo, clica, tabula). Jest para asserções e mocks. Regra de ouro: se você refatorar sem mudar comportamento, os testes não devem quebrar.',
    problem:
      "Testes que testam implementação: `expect(wrapper.state('count')).toBe(1)`. Quebram a cada refatoração mesmo sem bug. Ou testes que só testam se o componente renderiza sem erro — não têm valor.",
    solution:
      'Testar pelo ponto de vista do usuário: renderizar, interagir como o usuário faria, assertar o que o usuário vê. Queries de prioridade: getByRole > getByLabelText > getByPlaceholderText > getByText > getByTestId.',
    tip: 'Se você só consegue testar usando getByTestId, é um sinal que o componente não tem semântica acessível. data-testid é o último recurso — geralmente indica falta de role ou label.',
    questions: [
      {
        q: 'getByRole vs getByTestId — qual usar?',
        a: 'getByRole é sempre preferível: testa acessibilidade junto com funcionalidade, é mais resiliente a refatorações, e força semântica HTML correta. getByTestId só quando não há alternativa (componente de terceiro sem role semântico). Hierarquia: Role > LabelText > PlaceholderText > Text > TestId.',
      },
      {
        q: 'Como testar um form submit?',
        a: "Preencher campos com userEvent.type(), submeter com userEvent.click() no botão ou userEvent.keyboard('{Enter}'). Assertar o que acontece: mensagem de sucesso aparece, campo de erro aparece, função de callback foi chamada com os valores corretos.",
      },
      {
        q: 'O que NÃO testar com RTL?',
        a: 'Internals do componente (state, métodos privados), props que não afetam a UI visível, detalhes de implementação do CSS. Deixar para testes unitários puros: lógica de negócio pura, helpers, reducers — sem React, só Jest.',
      },
    ],
    code: `// ✅ Testar comportamento, não implementação
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

test('mostra erro ao submeter vazio', async () => {
  const user = userEvent.setup()
  render(<LoginForm onLogin={jest.fn()} />)

  await user.click(screen.getByRole('button', { name: /entrar/i }))

  expect(screen.getByRole('alert')).toHaveTextContent('Preencha todos os campos')
})

test('chama onLogin com credenciais corretas', async () => {
  const user = userEvent.setup()
  const onLogin = jest.fn()
  render(<LoginForm onLogin={onLogin} />)

  await user.type(screen.getByLabelText(/email/i), 'user@test.com')
  await user.type(screen.getByLabelText(/senha/i), 'secret')
  await user.click(screen.getByRole('button', { name: /entrar/i }))

  expect(onLogin).toHaveBeenCalledWith({
    email: 'user@test.com', password: 'secret'
  })
})

// ❌ Evitar: testa implementação
test('estado muda ao digitar', () => {
  const { rerender } = render(<LoginForm />)
  // Não acesse state interno — teste o que o usuário vê
})`,
  },
  {
    id: 73,
    emoji: '🎭',
    title: 'Mocking com MSW (Mock Service Worker)',
    level: 'Testing',
    color: '#4ade80',
    summary: 'Interceptar requests no nível da rede com MSW. Sem axios-mock, sem jest.mock de fetch.',
    definition:
      'MSW (Mock Service Worker) intercepta requisições HTTP no nível de rede usando Service Worker (browser) ou interceptors Node.js (para Jest/Vitest). Vantagem sobre jest.mock(fetch): o componente usa exatamente o mesmo código de produção, só a rede é mockada. Funciona com qualquer lib HTTP (fetch, axios, ky) sem mudar o código de produção.',
    problem:
      "jest.mock('../api/users') acopla os testes à implementação da camada de API. Se você trocar fetch por axios, todos os mocks quebram. E você não testa o código HTTP real.",
    solution:
      'MSW define handlers por URL/método. Em testes, usa setupServer() do msw/node. O componente faz fetch normalmente, o MSW intercepta antes de chegar à rede e retorna o mock. Mesmo handler pode ser usado em Storybook e no browser de dev.',
    tip: 'MSW é a forma moderna de mock de API. Um handler.ts compartilhado entre testes, Storybook e dev server elimina duplicação de mocks. Defina cenários de erro explicitamente: server.use(http.get(\'/api/users\', () => HttpResponse.error())).',
    questions: [
      {
        q: 'MSW vs jest.mock vs axios-mock-adapter?',
        a: 'MSW intercepta na camada de rede — o mais realista. jest.mock mocka módulos inteiros (acopla à implementação). axios-mock-adapter só funciona com Axios. MSW funciona independente de qual lib HTTP o componente usa e não requer mudança no código de produção.',
      },
      {
        q: 'Como testar estados de erro com MSW?',
        a: "server.use() para sobrescrever um handler em um teste específico: server.use(http.get('/api/users', () => new HttpResponse(null, { status: 500 }))). Depois do teste, o handler original volta (server.resetHandlers() no afterEach).",
      },
      {
        q: 'MSW funciona com React Query?',
        a: 'Sim — e é a combinação ideal. O componente usa useQuery normalmente, o MSW intercepta o fetch do React Query, e você testa o componente completo incluindo loading/error/success states sem mock nenhum no código de produção.',
      },
    ],
    code: `// handlers.ts — compartilhado entre testes, Storybook, dev
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ])
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 3, ...body }, { status: 201 })
  }),
]

// setup nos testes (Jest/Vitest)
import { setupServer } from 'msw/node'
const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Sobrescrever para cenário de erro em teste específico
test('mostra erro quando API falha', async () => {
  server.use(
    http.get('/api/users', () => new HttpResponse(null, { status: 500 }))
  )
  render(<UserList />)
  expect(await screen.findByText(/erro ao carregar/i)).toBeInTheDocument()
})`,
  },
  {
    id: 74,
    emoji: '🎭',
    title: 'E2E com Playwright',
    level: 'Testing',
    color: '#4ade80',
    summary: 'Testes de ponta a ponta que rodam no browser real. Flaky-free com auto-wait e locators.',
    definition:
      'Playwright é a ferramenta líder de testes E2E em 2025: multi-browser (Chrome, Firefox, WebKit), auto-wait nativo (não precisa de sleep/waitFor manuais), locators que imitam RTL (getByRole, getByLabel), e um modo de debug visual excelente (UI mode, trace viewer). Testa o sistema completo: frontend + API real ou mockada.',
    problem:
      'Testes E2E flaky por races de timing (await sleep(1000)), seletores frágeis (CSS classes que mudam), e não saber onde está o bug quando o teste falha.',
    solution:
      'Auto-wait do Playwright: toda action aguarda o elemento estar pronto. Locators semânticos (getByRole) em vez de CSS. Trace viewer para debug: gravação completa do teste com screenshots, network e console. Page Object Model para organizar seletores reutilizáveis.',
    tip: 'Não teste tudo com E2E — é o topo da pirâmide. E2E para fluxos críticos de negócio: login, checkout, onboarding. Para componentes isolados: RTL. Para API: testes de integração. A regra: se quebrar isso, a empresa perde dinheiro → E2E. Se não → RTL ou unitário.',
    questions: [
      {
        q: 'Playwright vs Cypress: qual escolher em 2025?',
        a: 'Playwright: multi-browser real, mais rápido, melhor para apps React/Next.js modernos, auto-wait mais confiável, gratuito sem limitações. Cypress: melhor DX para debug em tempo real (vê o app enquanto o teste roda), hot reload, mais fácil para iniciantes. Para projetos novos: Playwright. Para times já em Cypress: não migrate sem necessidade.',
      },
      {
        q: 'Como evitar testes flaky no Playwright?',
        a: 'Nunca use page.waitForTimeout(n) — use locators com auto-wait. Nunca confie em animações concluídas — await expect(locator).toBeVisible(). Para network: use page.waitForResponse() ou mock com page.route(). Isole o estado: cada teste começa limpo (beforeEach com login via API, não UI).',
      },
      {
        q: 'O que é Page Object Model?',
        a: "Padrão para encapsular seletores e ações de uma página em uma classe. Em vez de page.locator('.login-btn') espalhado nos testes, você cria LoginPage com loginPage.submit(). Facilita manutenção: quando o seletor muda, muda em um lugar só.",
      },
    ],
    code: `// tests/login.spec.ts
import { test, expect } from '@playwright/test'

test('fluxo de login completo', async ({ page }) => {
  await page.goto('/login')

  // Locators semânticos — como RTL
  await page.getByLabel('Email').fill('user@test.com')
  await page.getByLabel('Senha').fill('secret123')
  await page.getByRole('button', { name: 'Entrar' }).click()

  // Auto-wait — sem sleep, sem waitFor manual
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})

// Mock de API com page.route()
test('mostra erro quando API falha', async ({ page }) => {
  await page.route('/api/auth', route =>
    route.fulfill({ status: 401, body: 'Unauthorized' })
  )
  await page.goto('/login')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('alert')).toContainText('Email ou senha inválidos')
})

// Page Object Model
class LoginPage {
  constructor(private page: Page) {}
  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email)
    await this.page.getByLabel('Senha').fill(password)
    await this.page.getByRole('button', { name: 'Entrar' }).click()
  }
}`,
  },
  {
    id: 75,
    emoji: '♿',
    title: 'Acessibilidade (a11y) — Guia Prático',
    level: 'Acessibilidade',
    color: '#a78bfa',
    summary: 'WCAG 2.1 AA, roles semânticos, gerenciamento de foco e como testar. O que toda entrevista Senior cobra.',
    definition:
      'Acessibilidade web garante que pessoas com deficiências (visual, motora, cognitiva, auditiva) possam usar o produto. WCAG 2.1 AA é o padrão de mercado — 4 princípios: Perceptível, Operável, Compreensível, Robusto. No React: HTML semântico primeiro, ARIA só quando necessário, gerenciamento de foco em SPAs, e testes automatizados com axe-core para pegar 30-40% dos problemas.',
    problem:
      'Modal que abre mas o foco não vai para dentro dele. Formulário com inputs sem label. Botão que é na verdade uma div sem role nem teclado. Menu dropdown que não fecha com Escape. Carousel que não pode ser pausado.',
    solution:
      'HTML semântico: button, nav, main, header, footer em vez de div. Labels em todos os inputs. Gerenciar foco em modais (focus trap). Suporte a teclado em componentes customizados. Skip links para navegação por teclado. Testar com axe-core e keyboard-only navigation.',
    tip: 'Regra de ouro: se você pode fazer com HTML semântico, não use ARIA. ARIA bem feito melhora a a11y. ARIA mal feito piora. A primeira pergunta é sempre: posso usar o elemento HTML nativo? button, select, input type=checkbox — todos têm comportamento acessível built-in.',
    questions: [
      {
        q: 'Como gerenciar foco em um modal?',
        a: 'Ao abrir: mover foco para o primeiro elemento focável dentro do modal (ou para o elemento com autofocus). Trap de foco: Tab circula dentro do modal, não escapa. Ao fechar: retornar foco para o elemento que abriu o modal. Usar Radix UI, Headless UI ou @radix-ui/react-focus-scope que implementam isso corretamente.',
      },
      {
        q: 'Diferença entre aria-label e aria-labelledby?',
        a: 'aria-label: texto direto para o elemento. Usar quando não há texto visível associado: `<button aria-label=\'Fechar modal\'>✕</button>`. aria-labelledby: referencia o ID de outro elemento como label. `<dialog aria-labelledby=\'dialog-title\'>`. Prefira aria-labelledby quando há texto visível — evita duplicação e mantém sync.',
      },
      {
        q: 'Como testar acessibilidade?',
        a: 'Automático: axe-core (@testing-library/jest-axe, @axe-core/playwright) pega ~30-40% dos problemas. Manual: navegar apenas com teclado (Tab, Shift+Tab, Enter, Space, Escape, setas). Screen reader: NVDA (Windows), VoiceOver (Mac/iOS), TalkBack (Android). Lighthouse a11y score > 90 como baseline.',
      },
    ],
    code: `// ✅ HTML semântico — sem ARIA desnecessário
<nav aria-label="Navegação principal">
  <ul>
    <li><a href="/about">Sobre</a></li>
  </ul>
</nav>

<main>
  <form onSubmit={handleSubmit}>
    {/* Label explícita — não use placeholder como label */}
    <label htmlFor="email">Email</label>
    <input id="email" type="email" aria-describedby="email-hint" />
    <div id="email-hint">Usaremos apenas para contato</div>
  </form>
</main>

// ✅ Modal com focus trap (Radix Dialog)
import * as Dialog from '@radix-ui/react-dialog'

<Dialog.Root>
  <Dialog.Trigger>Abrir</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content aria-describedby="dialog-desc">
      {/* Foco vai aqui ao abrir, fica preso aqui, volta ao Trigger ao fechar */}
      <Dialog.Title>Confirmar ação</Dialog.Title>
      <Dialog.Description id="dialog-desc">Esta ação é irreversível.</Dialog.Description>
      <Dialog.Close>Cancelar</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

// ✅ Teste automatizado com axe
import { axe } from 'jest-axe'
test('sem violações de a11y', async () => {
  const { container } = render(<LoginForm />)
  expect(await axe(container)).toHaveNoViolations()
})`,
  },
  {
    id: 76,
    emoji: '💬',
    title: 'Perguntas Comportamentais Técnicas',
    level: 'Carreira',
    color: '#f59e0b',
    summary: 'STAR para tech: bug difícil, decisão técnica controversa, dívida técnica, conflito de opinião.',
    definition:
      'Perguntas comportamentais em entrevistas senior avaliam como você age em situações reais. O método STAR (Situação, Tarefa, Ação, Resultado) estrutura respostas de forma convincente. Em tech: bug que levou dias para resolver, decisão de arquitetura que você tomou e defendeu, momento que discordou de tech lead, como priorizou dívida técnica vs features.',
    problem:
      "Responder de forma vaga ('trabalhei em equipe', 'resolvi problemas') ou longa demais sem estrutura. Não ter exemplos concretos preparados. Falar mal de colegas ou empresa anterior.",
    solution:
      'Preparar 5-6 histórias STAR versáteis que cobrem: liderança técnica, resolução de conflito, bug complexo, aprendizado rápido, erro que cometeu e o que aprendeu, melhoria de processo. Adaptar a mesma história para diferentes perguntas.',
    tip: 'Nunca fale mal de empresa/colega anterior — soa amador. Transforme fraquezas em aprendizados: \'cometi o erro X, aprendi Y, agora faço Z diferente\'. Tenha métricas quando possível: \'reduzi o tempo de build de 8min para 2min\' é mais convincente que \'melhorei o pipeline\'.',
    questions: [
      {
        q: 'Me fala de um bug difícil que você resolveu.',
        a: 'Use STAR: Situação (bug em produção afetando 10% dos usuários), Tarefa (investigar e corrigir em 4h), Ação (adicionei logging, reproduzi localmente, identifiquei race condition no useEffect, corrigi com cleanup function e AbortController), Resultado (resolvido em 3h, adicionei teste de regressão que pega esse padrão).',
      },
      {
        q: 'Como você lida com dívida técnica?',
        a: "Mostrar que você é pragmático: nem 'reescrevemos tudo' nem 'nunca pagamos'. Resposta ideal: 'categorizo por impacto e risco, documento como tech debt, proponho reservar 20% do sprint para dívida crítica, e argumento ROI para o PM quando a dívida bloqueia features'. Ter exemplo concreto de quando priorizou e quando não priorizou.",
      },
      {
        q: 'Você já discordou de uma decisão técnica? Como resolveu?',
        a: "Mostrar maturidade: não cedeu por pressão, mas também não foi inflexível. 'Apresentei dados e alternativas, ouvi as razões do outro lado, tentamos a abordagem deles com um prazo de reavaliação, e quando os problemas que previ apareceram, propus revisão sem \"eu disse\". A decisão final foi mais equilibrada que a minha proposta original.'",
      },
    ],
    code: `// Template STAR para histórias técnicas
SITUAÇÃO: contexto específico (empresa, produto, momento)
  → Evitar: "Em um projeto antigo..."
  → Preferir: "No e-commerce X, durante a Black Friday de 2024..."

TAREFA: sua responsabilidade específica
  → "Eu fui responsável por..."
  → Não "nós" — a entrevista é sobre você

AÇÃO: o que VOCÊ fez (3-5 passos concretos)
  → Ferramentas, decisões, trade-offs considerados
  → "Primeiro investiguei X, depois Y, optei por Z porque..."

RESULTADO: impacto mensurável
  → "Reduzimos o tempo de resposta de 800ms para 200ms"
  → "Zero incidentes relacionados nos 6 meses seguintes"
  → "O padrão foi adotado pelo time todo"

// 5 histórias para preparar:
// 1. Bug complexo que você resolveu
// 2. Decisão de arquitetura que você defendeu
// 3. Conflito técnico e como resolveu
// 4. Aprendizado rápido de tecnologia nova
// 5. Melhoria de processo que você propôs`,
  },
  {
    id: 77,
    emoji: '🤝',
    title: 'O que Perguntar ao Entrevistador',
    level: 'Carreira',
    color: '#f59e0b',
    summary: 'Perguntas que mostram senioridade, avaliam fit técnico e cultural, e revelam red flags da empresa.',
    definition:
      'As perguntas ao final da entrevista são tão importantes quanto as respostas. Mostram curiosidade, pensamento estratégico, e que você avalia a empresa tanto quanto ela te avalia. Divididas em: processo técnico (como vocês trabalham), cultura de engenharia (qualidade, débito, testes), crescimento (expectativas, aprendizado), e red flags (turnover, incidentes, prazo).',
    problem:
      "Dizer 'não tenho perguntas' (soa desinteressado) ou perguntar só sobre salário e benefícios (foco errado para entrevista técnica). Perguntas genéricas que qualquer candidato faria.",
    solution:
      "Perguntas específicas que mostram que você pesquisou a empresa e pensa sobre qualidade técnica. Dividir em: 'preciso saber antes de aceitar' e 'me ajuda a entender a cultura'. Adaptar ao nível: para senior, perguntar sobre arquitetura e autonomia; para staff, sobre influência em decisões de produto.",
    tip: "A melhor pergunta é específica e mostra que você fez homework: 'Vi no blog de vocês que migraram de Redux para Zustand — quais desafios encontraram?' Também: perguntas sobre o dia-a-dia real revelam mais que perguntas sobre valores da empresa.",
    questions: [
      {
        q: 'Quais perguntas nunca devem faltar?',
        a: "'Como é o processo de code review de vocês?' (revela cultura de qualidade). 'Qual foi o maior incidente técnico recente e como foi tratado?' (revela maturidade em incident response). 'Como fica o equilíbrio entre features novas e dívida técnica?' (revela pressão de produto vs qualidade). 'O que te faria sair desta empresa?' (revela red flags que o entrevistador não diria diretamente).",
      },
      {
        q: 'Como identificar red flags nas respostas?',
        a: "'Não temos muito tempo para testes' = pressão de prazo crônica. 'Temos muita liberdade, cada um faz do jeito que quer' = falta de processo. 'Estamos em hypergrowth' sem mencionar sustentabilidade = potencial burnout. Evasivas sobre turnover recente. Não conseguir citar uma melhoria de processo no último ano.",
      },
      {
        q: 'Perguntas diferentes por nível da vaga?',
        a: 'Júnior/Pleno: foco em mentoria, onboarding, ciclos de feedback, oportunidade de aprendizado. Senior: autonomia técnica, influência em decisões de arquitetura, tamanho do time, qual a maior dívida técnica. Staff/Principal: roadmap técnico, relação eng/produto, como decisões de plataforma são tomadas.',
      },
    ],
    code: `// Banco de perguntas por categoria

// 🔧 Processo técnico
"Como é o processo de code review? PR pequenos ou grandes?"
"Qual é o ciclo de deploy? Quantos deploys por semana?"
"Usam feature flags? Como gerenciam rollouts?"
"Como é o processo de incident response?"

// 🏗️ Qualidade e dívida
"Qual a cobertura de testes atualmente? É um objetivo do time?"
"Como vocês equilibram novas features vs dívida técnica?"
"Qual foi a última grande refatoração? Como foi o processo?"

// 📈 Crescimento
"O que um engenheiro senior precisa fazer para chegar a staff aqui?"
"Como são os ciclos de feedback e performance review?"
"Tem budget para conferências/cursos/livros?"

// 🚨 Red flags (perguntar de forma sutil)
"Como foi o último grande incidente? O que mudou depois?"
"Qual é o turnover no time de engenharia?"
"O que você mudaria se pudesse?"  // ao entrevistador
"Por que a posição está aberta agora?"`,
  },
  {
    id: 78,
    emoji: '🏗️',
    title: 'System Design para Frontend',
    level: 'Arquitetura',
    color: '#fb923c',
    summary: 'Como estruturar uma entrevista de system design focada em frontend: componentes, estado, performance.',
    definition:
      'System design frontend avalia como você pensa em escala: componentes reutilizáveis, gerenciamento de estado global, comunicação com APIs, caching, performance, acessibilidade e deploy. Diferente do backend, o foco é em UX e responsividade. As perguntas típicas: "Como você construiria o Feed do Twitter?", "Projete um autocomplete", "Como você faria uma grid de imagens infinita?".',
    problem:
      'Candidatos focam demais em código e esquecem de discutir trade-offs, escalabilidade e decisões de arquitetura. Ou o oposto: ficam muito abstratos sem demonstrar conhecimento técnico concreto.',
    solution:
      'Framework para responder: 1) Clarificar requisitos (funcional e não-funcional), 2) Estimativas (usuários, requests, tamanho de dados), 3) High-level design (componentes principais), 4) Deep dive (o que o entrevistador pedir), 5) Trade-offs e melhorias.',
    tip: 'Em frontend system design, sempre mencione: renderização (CSR/SSR/SSG), estado (local vs global vs server state), performance (lazy loading, code splitting, caching), acessibilidade e testes. Demonstra que você pensa além do código feliz.',
    questions: [
      {
        q: 'Como projetaria um autocomplete escalável?',
        a: 'Debounce de 200-300ms para reduzir requests. Cache de resultados anteriores (Map ou React Query cache). Cancelamento de request anterior com AbortController. Virtualização da lista se muitos resultados. Acessibilidade: aria-combobox, aria-listbox, navegação com setas. Highlight do match no texto.',
      },
      {
        q: 'Como projetaria um infinite scroll de imagens?',
        a: 'IntersectionObserver para detectar quando o usuário chega ao fim. React Query com useInfiniteQuery para gerenciar paginação e cache. Virtualização (react-virtual ou react-window) para não manter todos os itens no DOM. Skeleton loading por placeholder. Otimização de imagens: lazy loading nativo, WebP, tamanhos responsivos.',
      },
      {
        q: 'Qual a diferença entre CSR, SSR e SSG?',
        a: 'CSR: renderiza no browser, TTI alto, ruim para SEO. SSR: renderiza no servidor por request, TTFB maior mas TTI menor, bom para SEO e dados dinâmicos. SSG: renderiza no build, TTFB mínimo, ótimo para conteúdo estático ou com revalidação (ISR). Escolha: SEO crítico + dados dinâmicos = SSR; SEO + dados estáticos = SSG; app autenticado sem SEO = CSR.',
      },
    ],
    code: `// Autocomplete com debounce + cache + cancelamento
function useAutocomplete(query: string) {
  return useQuery({
    queryKey: ['autocomplete', query],
    queryFn: async ({ signal }) => {
      const res = await fetch(\`/api/search?q=\${query}\`, { signal })
      return res.json()
    },
    enabled: query.length > 1,
    staleTime: 5 * 60 * 1000, // cache por 5min
  })
}

// Infinite scroll com IntersectionObserver
function useInfiniteScroll(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) callback() },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [callback])

  return ref
}

// Uso com React Query infinite
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['images'],
  queryFn: ({ pageParam = 1 }) => fetchImages(pageParam),
  getNextPageParam: (last) => last.nextPage,
})
const loaderRef = useInfiniteScroll(() => {
  if (hasNextPage) fetchNextPage()
})`,
  },
  {
    id: 79,
    emoji: '🔒',
    title: 'Segurança no Frontend',
    level: 'Segurança',
    color: '#f87171',
    summary: 'XSS, CSRF, CSP, tokens JWT, e as vulnerabilidades que entrevistas senior sempre cobram.',
    definition:
      'Segurança frontend cobre as principais vulnerabilidades: XSS (Cross-Site Scripting), CSRF (Cross-Site Request Forgery), injeção de conteúdo, e vazamento de dados sensíveis. React já previne a maioria dos XSS por default (escapa HTML automaticamente), mas dangerouslySetInnerHTML, eval() e href dinâmico são vetores de ataque que exigem atenção.',
    problem:
      'dangerouslySetInnerHTML com input do usuário não sanitizado. JWT armazenado em localStorage (acessível por XSS). URLs dinâmicas sem validação de protocolo: href={user.website} permite javascript: URLs.',
    solution:
      'Nunca confiar em input do usuário. Sanitizar HTML com DOMPurify antes de dangerouslySetInnerHTML. Armazenar tokens sensíveis em httpOnly cookies (inacessíveis via JS). Validar URLs: só http/https. Content Security Policy para bloquear scripts inline.',
    tip: "Regra de ouro: tudo que vem do servidor ou do usuário é dado não confiável até prova em contrário. React sanitiza {expression} mas não sanitiza dangerouslySetInnerHTML, atributos href/src dinâmicos, e código executado via eval/Function.",
    questions: [
      {
        q: 'Por que não armazenar JWT em localStorage?',
        a: 'localStorage é acessível por qualquer JavaScript na página. Se houver qualquer XSS (mesmo em dependência de terceiro), o atacante lê o token e o usa em outro lugar. httpOnly cookies não são acessíveis por JS — mesmo com XSS o atacante não consegue ler o valor. Tradeoff: httpOnly cookies requerem proteção CSRF (SameSite=Strict ou token CSRF).',
      },
      {
        q: 'O que é Content Security Policy?',
        a: "CSP é um header HTTP que define de onde recursos podem ser carregados e se scripts inline são permitidos. `Content-Security-Policy: default-src 'self'; script-src 'self' cdn.example.com` bloqueia scripts de outros domínios e inline. Previne XSS porque mesmo que o atacante injete <script>, o browser bloqueia a execução.",
      },
      {
        q: 'Como React previne XSS por default?',
        a: "Todo {expression} em JSX é escapado automaticamente: <div>{userInput}</div> transforma < em &lt; e > em &gt;. Nunca executa como HTML. A exceção é dangerouslySetInnerHTML={{__html: content}} — aí é responsabilidade do dev sanitizar com DOMPurify antes. Outro vetor: <a href={url}> — validar que url começa com http:// ou https://, nunca javascript:.",
      },
    ],
    code: `// ❌ Vulnerável a XSS
<div dangerouslySetInnerHTML={{ __html: userComment }} />
<a href={user.website}>Visitar</a> // javascript: URL

// ✅ Sanitizar antes de renderizar HTML
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userComment)
}} />

// ✅ Validar URLs
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}
<a href={isSafeUrl(user.website) ? user.website : '#'}>Visitar</a>

// ✅ Tokens em httpOnly cookie (não localStorage)
// No servidor:
res.cookie('token', jwt, {
  httpOnly: true,   // inacessível para JS
  secure: true,     // só HTTPS
  sameSite: 'strict' // proteção CSRF
})

// No cliente: o cookie é enviado automaticamente
// fetch('/api/data', { credentials: 'include' })`,
  },
  {
    id: 80,
    emoji: '📦',
    title: 'Bundle Size e Code Splitting',
    level: 'Performance',
    color: '#818cf8',
    summary: 'Analisar bundle, lazy loading de rotas e componentes, e tree shaking. JS que o usuário nunca vê.',
    definition:
      'Bundle size impacta diretamente o tempo de carregamento inicial. Cada KB extra de JS = mais download + parse + compile antes de qualquer interação. As principais estratégias: code splitting por rota (lazy + Suspense), dynamic imports para componentes pesados, tree shaking (eliminar código não usado), e análise de bundle para identificar os maiores culpados.',
    problem:
      "Bundle inicial com todo o código da app: páginas que o usuário pode nunca visitar, bibliotecas inteiras importadas quando só um método é usado (`import _ from 'lodash'` = 70KB), e componentes pesados (editores, gráficos) carregados na home.",
    solution:
      'React.lazy + Suspense para code splitting por rota e componente. Dynamic import para carregar sob demanda. Importações granulares: `import { debounce } from lodash-es` em vez de `import _ from lodash`. Analisar com @next/bundle-analyzer ou rollup-plugin-visualizer.',
    tip: "Metrica importante: First Load JS do Next.js (mostrado no build). Objetivo: < 100KB para rota inicial. Inspecione com `next build` — rotas marcadas com ○ (static) têm menor bundle. Dependências > 10KB sem uso crítico na home são candidatas a dynamic import.",
    questions: [
      {
        q: 'Como funciona tree shaking?',
        a: "Bundlers (Webpack, Rollup, Vite) analisam imports estáticos e eliminam código não referenciado. Funciona com ES modules (import/export). Não funciona com CommonJS (require). Por isso `import { debounce } from 'lodash-es'` (ES module) é tree-shakeable, mas `import _ from 'lodash'` (CJS) importa tudo. Verificar se a lib tem sideEffects: false no package.json.",
      },
      {
        q: 'Qual a diferença entre lazy loading de rota e de componente?',
        a: 'Rota: `const Dashboard = lazy(() => import(\'./Dashboard\'))` — carrega o chunk da rota só quando o usuário navega para ela. Componente: mesmo padrão mas para componentes pesados dentro de uma rota (ex: editor de texto, mapa, gráfico complexo). Ambos precisam de `<Suspense fallback={<Loading />}>` em volta.',
      },
      {
        q: 'Como identificar o que está aumentando o bundle?',
        a: 'Next.js: `ANALYZE=true next build` com @next/bundle-analyzer — gera treemap visual. Vite: rollup-plugin-visualizer. Procurar: dependências grandes importadas inteiras, duplicação (mesma lib em versões diferentes), código de desenvolvimento incluído em prod. Ferramentas: bundlephobia.com para checar tamanho antes de instalar.',
      },
    ],
    code: `// ✅ Code splitting por rota
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  )
}

// ✅ Dynamic import de componente pesado
function Editor() {
  const [MonacoEditor, setMonaco] = useState(null)

  const loadEditor = async () => {
    const { default: Monaco } = await import('@monaco-editor/react')
    setMonaco(() => Monaco)
  }

  return MonacoEditor
    ? <MonacoEditor value={code} />
    : <button onClick={loadEditor}>Abrir editor</button>
}

// ✅ Importação granular (tree-shakeable)
import { debounce } from 'lodash-es' // ✅ só debounce
// import _ from 'lodash'            // ❌ 70KB inteiros`,
  },
  {
    id: 81,
    emoji: '🔄',
    title: 'Concurrent Features do React 18',
    level: 'Avançado',
    color: '#22d3ee',
    summary: 'useTransition, useDeferredValue, Suspense para data fetching. O que é renderização concorrente.',
    definition:
      'React 18 introduziu renderização concorrente: o React pode pausar, retomar e abandonar renderizações. Isso permite priorizar atualizações urgentes (digitação, clique) sobre não-urgentes (atualização de lista filtrada). useTransition marca updates como não-urgentes. useDeferredValue adia o processamento de um valor. Suspense para data fetching permite mostrar fallback enquanto aguarda dados.',
    problem:
      'Filtrar uma lista grande enquanto o usuário digita trava a UI: cada keystroke dispara re-render de toda a lista filtrada. O input fica lento e a UX ruim.',
    solution:
      'useTransition: marca a atualização da lista como transição (não-urgente). O input atualiza imediatamente, a lista filtra quando há tempo. isPending indica que há transição em andamento para mostrar indicador visual.',
    tip: 'useTransition é para quando VOCÊ controla o estado. useDeferredValue é para quando você recebe um valor como prop ou de outra source e não pode adicionar startTransition na origem. Em geral: prefira useTransition. Use useDeferredValue quando não tem acesso ao setter.',
    questions: [
      {
        q: 'Qual a diferença entre useTransition e useDeferredValue?',
        a: 'useTransition: você controla quando o update é não-urgente — wrapping o setState com startTransition. useDeferredValue: você recebe um valor e cria uma versão "atrasada" dele — útil quando não controla a origem do update (prop de pai, etc). Ambos usam a mesma mecânica de concorrência.',
      },
      {
        q: 'O que é Suspense para data fetching?',
        a: 'Permite que um componente "suspenda" sua renderização até que os dados estejam prontos, mostrando o fallback do Suspense mais próximo. React Query e SWR têm suporte experimental. Com Next.js App Router: `use(promise)` ou React Server Components fazem fetch suspense-aware nativamente. Simplifica loading states: um `<Suspense>` cobre múltiplos componentes filhos.',
      },
      {
        q: 'Quando NÃO usar useTransition?',
        a: 'Para updates de input controlado — o valor do input deve ser sempre síncrono. Para animações — use CSS ou Framer Motion. Para feedback imediato que o usuário espera ser instantâneo. useTransition é para cálculos pesados que podem ser adiados, não para tudo.',
      },
    ],
    code: `// useTransition — filtro de lista pesada sem travar input
import { useState, useTransition } from 'react'

function SearchPage({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState(items)
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value) // urgente — input atualiza imediatamente

    startTransition(() => {
      // não-urgente — pode ser interrompido por nova digitação
      setFiltered(items.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      ))
    })
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <List items={filtered} />
    </>
  )
}

// useDeferredValue — quando não controla o setter
function FilteredList({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query)
  // deferredQuery fica "atrás" de query durante digitação rápida
  const filtered = useMemo(
    () => items.filter(i => i.name.includes(deferredQuery)),
    [deferredQuery]
  )
  return <List items={filtered} />
}`,
  },
  {
    id: 82,
    emoji: '🌐',
    title: 'React Server Components (RSC)',
    level: 'Avançado',
    color: '#22d3ee',
    summary: 'O que são RSC, quando usar Server vs Client Components, e como pensar a fronteira.',
    definition:
      "React Server Components rodam exclusivamente no servidor: sem hydration, sem JS enviado ao cliente, acesso direto a banco/filesystem/variáveis de ambiente. Client Components ('use client') têm interatividade, hooks de estado e efeitos. No Next.js App Router, todos os componentes são Server por padrão. A fronteira server/client é onde você adiciona 'use client'.",
    problem:
      "Marcar tudo como 'use client' por hábito derrota o propósito dos RSC. Ou o oposto: tentar usar useState em Server Components e não entender o erro.",
    solution:
      "Regra: mova 'use client' para as folhas da árvore. Componentes de layout, listas, tabelas — Server. Componentes com interação (formulários, toggles, modais) — Client. Server Components podem passar dados como props para Client Components, mas não o contrário.",
    tip: "Server Components não têm: useState, useEffect, event handlers, Browser APIs. Client Components têm tudo isso. Dúvida: o componente precisa reagir a input do usuário ou mudança de estado no browser? 'use client'. Só renderiza dados estáticos? Server.",
    questions: [
      {
        q: 'Qual a vantagem real dos Server Components?',
        a: 'Zero JS enviado ao cliente para componentes puramente de apresentação. Acesso direto a banco sem API intermediária. Fetch de dados no servidor = sem loading state, sem useEffect, sem race conditions. Secrets do servidor nunca expostos. Bundle menor = melhor performance.',
      },
      {
        q: "Posso importar um Server Component dentro de um 'use client'?",
        a: "Não diretamente — o boundary 'use client' transforma tudo abaixo em client. Mas você pode passar Server Components como children ou props para Client Components: `<ClientWrapper>{children}</ClientWrapper>` onde children é um Server Component. O padrão correto é passar como prop, não importar.",
      },
      {
        q: 'Como fazer fetch de dados em RSC?',
        a: "Diretamente no componente com async/await — Server Components podem ser async: `async function Page() { const data = await db.query(...); return <List data={data} /> }`. No Next.js, o fetch é automaticamente deduplicado e cacheado. Para revalidação: `fetch(url, { next: { revalidate: 60 } })` ou `revalidatePath()`.",
      },
    ],
    code: `// ✅ Server Component — sem JS no cliente, fetch direto
// app/products/page.tsx (Server Component por default)
async function ProductsPage() {
  // Acesso direto ao banco — sem API, sem useEffect
  const products = await db.product.findMany({ where: { active: true } })

  return (
    <main>
      <h1>Produtos</h1>
      {/* ProductCard é Server Component — zero hydration */}
      {products.map(p => <ProductCard key={p.id} product={p} />)}

      {/* AddToCartButton precisa de estado — é Client */}
      <AddToCartButton productId={products[0].id} />
    </main>
  )
}

// ✅ Client Component na folha da árvore
// components/AddToCartButton.tsx
'use client'
import { useState } from 'react'

export function AddToCartButton({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false)

  return (
    <button onClick={() => {
      addToCart(productId)
      setAdded(true)
    }}>
      {added ? '✓ Adicionado' : 'Adicionar ao carrinho'}
    </button>
  )
}

// ✅ Passando Server Component como children para Client
function ClientLayout({ children }: { children: React.ReactNode }) {
  'use client'
  const [open, setOpen] = useState(false)
  return <div>{open && children}</div>
}
// children pode ser um Server Component!`,
  },
  {
    id: 83,
    emoji: '🔁',
    title: 'Patterns Avançados de Composição',
    level: 'Avançado',
    color: '#22d3ee',
    summary: 'Compound Components, Render Props, Controlled/Uncontrolled. Patterns de biblioteca nível senior.',
    definition:
      'Patterns de composição avançados permitem criar APIs de componentes flexíveis e reutilizáveis. Compound Components: múltiplos componentes que compartilham estado implícito via Context (como `<Select><Option>` do HTML). Render Props: componente passa dados para filhos via função. Controlled/Uncontrolled: componente aceita valor externo ou gerencia internamente. Headless Components: lógica sem UI (Radix, Headless UI).',
    problem:
      'Componentes com prop drilling excessivo, ou com 15 props booleanas para customização. APIs rígidas que não se adaptam a casos de uso ligeiramente diferentes.',
    solution:
      'Compound Components para componentes com múltiplas partes relacionadas. Controlled pattern para dar ao pai controle sobre o estado. Default uncontrolled com possibilidade de controle externo (como inputs HTML). Context interno para comunicação entre sub-componentes.',
    tip: "Headless UI libraries (Radix, Headless UI, React Aria) são o padrão moderno: toda a lógica e acessibilidade sem estilos. Você traz seus estilos. Isso é o 'headless pattern' levado ao extremo. Para componentes próprios: prefira Compound Components sobre prop drilling quando há mais de 2-3 partes relacionadas.",
    questions: [
      {
        q: 'O que são Compound Components?',
        a: 'Grupo de componentes que trabalham juntos com estado compartilhado implícito via Context. Exemplo: `<Tabs>`, `<Tabs.List>`, `<Tabs.Tab>`, `<Tabs.Panel>`. O Tabs gerencia qual tab está ativa, os filhos consomem via Context sem precisar de props. API mais natural para o consumidor — parece HTML nativo.',
      },
      {
        q: 'Controlled vs Uncontrolled — qual padrão usar?',
        a: "Uncontrolled por default (mais fácil de usar), controlled quando necessário (máximo controle). O padrão 'semi-controlled' aceita value + onChange (controlled) OU defaultValue (uncontrolled). Internamente usa useState com valor inicial de defaultValue. Se value prop aparece, o componente passa a ser controlled. Exatamente como inputs HTML.",
      },
      {
        q: 'Quando Render Props ainda é relevante?',
        a: "Com hooks, muitos casos de render props foram substituídos por custom hooks. Mas render props ainda têm vantagem quando o componente precisa controlar O QUE renderiza (não só fornecer lógica). Ex: componente de virtualização que controla quais itens são visíveis. React Query usava render props, migrou para hooks — mas `children as function` ainda aparece em componentes de UI complexos.",
      },
    ],
    code: `// Compound Components com Context implícito
const TabsContext = createContext<TabsContextValue | null>(null)

function Tabs({ children, defaultValue }: TabsProps) {
  const [active, setActive] = useState(defaultValue)
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div role="tablist">{children}</div>
    </TabsContext.Provider>
  )
}

Tabs.Tab = function Tab({ value, children }: TabProps) {
  const { active, setActive } = useContext(TabsContext)!
  return (
    <button
      role="tab"
      aria-selected={active === value}
      onClick={() => setActive(value)}
    >
      {children}
    </button>
  )
}

Tabs.Panel = function Panel({ value, children }: PanelProps) {
  const { active } = useContext(TabsContext)!
  return active === value ? <div role="tabpanel">{children}</div> : null
}

// Uso — API natural
<Tabs defaultValue="overview">
  <Tabs.Tab value="overview">Visão Geral</Tabs.Tab>
  <Tabs.Tab value="details">Detalhes</Tabs.Tab>
  <Tabs.Panel value="overview"><Overview /></Tabs.Panel>
  <Tabs.Panel value="details"><Details /></Tabs.Panel>
</Tabs>

// Controlled/Uncontrolled pattern
function Toggle({ value, defaultValue = false, onChange }: ToggleProps) {
  const [internal, setInternal] = useState(defaultValue)
  const isControlled = value !== undefined
  const checked = isControlled ? value : internal

  function handleChange() {
    if (!isControlled) setInternal(v => !v)
    onChange?.(!checked)
  }
  return <button onClick={handleChange}>{checked ? 'ON' : 'OFF'}</button>
}`,
  },
]

const all = [...existing, ...newConcepts]
writeFileSync('./src/data/concepts.json', JSON.stringify(all, null, 2))
console.log('Total:', all.length)
