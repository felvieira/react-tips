import { readFileSync, writeFileSync } from 'fs'

const existing = JSON.parse(readFileSync('./src/data/concepts.json', 'utf8'))

const newConcepts = [
  {
    id: 112, emoji: '🛍️', title: 'Shopify Hydrogen — Framework React',
    level: 'System Design', color: '#34d399',
    summary: 'Framework headless do Shopify baseado em Remix. Storefront customizada com performance otimizada.',
    definition: 'Hydrogen é o framework React/Remix oficial do Shopify para construir storefronts headless. Roda nativamente em Oxygen (CDN edge do Shopify) ou em qualquer host (Vercel, Netlify). Diferente de temas Liquid: você controla todo o front-end com React/TypeScript moderno, mas continua conectado ao backend Shopify (produtos, checkout, customer). Stack: Remix + React Server Components (Hydrogen v2+) + Tailwind + GraphQL Storefront API.',
    problem: 'Temas Liquid tradicionais limitam UX: cada loja parece igual, performance depende do tema, customização avançada é difícil. Headless puro (Next.js direto) exige reinventar todo o cliente Storefront API + carrinho + checkout.',
    solution: 'Hydrogen: SDK de componentes prontos (`<ProductProvider>`, `<CartProvider>`, `<Money>`, `<Image>`), client GraphQL otimizado, server caching, integrações nativas com Shopify Checkout. Você ganha velocidade do headless sem perder o ecossistema Shopify (apps, payments, analytics).',
    tip: 'Hydrogen v2 (lançado 2023) migrou para Remix + RSC. Esqueça tutoriais pré-2023 — o Hydrogen v1 era diferente. Use Hydrogen + Oxygen para deploy edge global por default. Se já está no Vercel, dá para deployar lá também, mas perde algumas otimizações de cache.',
    questions: [
      { q: 'Hydrogen vs Next.js para Shopify: qual escolher?', a: 'Hydrogen: componentes Shopify prontos (Money, Image, ProductProvider), client GraphQL otimizado, deploy nativo no Oxygen com cache no edge, integração com Shopify Checkout sem código. Next.js: você implementa tudo do zero mas tem flexibilidade total e ecossistema React maior. Para storefront pura: Hydrogen. Para app híbrido com mais que loja: Next.js com SDK Storefront.' },
      { q: 'O que é Oxygen?', a: 'Oxygen é o hosting edge do Shopify para Hydrogen. Roda em workers globais (similar Cloudflare). Inclui cache automático de queries GraphQL, deploy via GitHub integration, e previews por branch. Gratuito para lojas Shopify Plus. Não obrigatório — Hydrogen também roda em Vercel/Netlify/Cloudflare Workers.' },
      { q: 'Como funciona o checkout no Hydrogen?', a: 'Hydrogen NÃO implementa o checkout — você redireciona para o checkout hospedado do Shopify (com domínio próprio configurado). Vantagem: PCI compliance, fraud detection, payment methods já configurados. Desvantagem: você perde controle visual da última etapa. Para checkout customizado completo, precisa Shopify Plus + Checkout Extensibility.' }
    ],
    code: `// app/routes/products.$handle.tsx (Hydrogen v2 + Remix)
import { json, type LoaderArgs } from '@shopify/remix-oxygen'
import { useLoaderData } from '@remix-run/react'
import { Image, Money, ProductProvider } from '@shopify/hydrogen'

const PRODUCT_QUERY = \`#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id title descriptionHtml
      featuredImage { url altText width height }
      priceRange { minVariantPrice { amount currencyCode } }
      variants(first: 100) { nodes { id title availableForSale } }
    }
  }
\`

export async function loader({ params, context }: LoaderArgs) {
  const { product } = await context.storefront.query(PRODUCT_QUERY, {
    variables: { handle: params.handle },
    cache: context.storefront.CacheLong(), // cache no edge
  })
  if (!product) throw new Response('Not found', { status: 404 })
  return json({ product })
}

export default function Product() {
  const { product } = useLoaderData<typeof loader>()
  return (
    <ProductProvider data={product}>
      <Image data={product.featuredImage} sizes="(max-width: 768px) 100vw, 50vw" />
      <h1>{product.title}</h1>
      <Money data={product.priceRange.minVariantPrice} />
      {/* AddToCart pode usar useCart() hook do Hydrogen */}
    </ProductProvider>
  )
}`
  },
  {
    id: 113, emoji: '🧱', title: 'Shopify Liquid — Template Engine',
    level: 'System Design', color: '#34d399',
    summary: 'Linguagem de template dos temas Shopify. Sintaxe simples, lógica restrita por segurança.',
    definition: 'Liquid é a linguagem de template criada pelo Shopify e usada em todos os temas tradicionais (Dawn, Debut, etc.). Sintaxe: `{{ output }}` para imprimir variáveis, `{% logic %}` para tags. Object-oriented com objects (product, cart, customer), filters (money, json, default), e tags (if, for, assign, section). Renderiza no servidor da Shopify — você não controla onde nem como.',
    problem: 'Não dá pra rodar JavaScript arbitrário em Liquid (não há `eval`, não há acesso a APIs externas, fetch é limitado). Loops têm limite de 50 iterações em algumas tags. Performance ruim em listas grandes. Difícil testar localmente sem CLI/ngrok.',
    solution: 'Para customização simples (header, footer, página de produto): Liquid é suficiente e rápido de desenvolver. Para lógica complexa: combinar Liquid (estrutura) + JS no cliente (interatividade) + Section Rendering API (re-renderizar sections via fetch). Para algo realmente customizado: migrar para Hydrogen.',
    tip: 'Section Rendering API é o "secret weapon" do Liquid: você faz `fetch("/products/x?sections=cart-drawer")` e o Shopify retorna o HTML rendezido daquela section. Permite atualizações dinâmicas (ex: cart drawer) sem SPA, mantendo o tema Liquid.',
    questions: [
      { q: 'O que são Sections e Blocks em Liquid?', a: 'Sections: blocos modulares reutilizáveis (hero, product-grid, testimonials). Configuráveis pelo merchant no theme editor via schema JSON. Blocks: itens dentro de sections, repetíveis e ordenáveis. Ex: section "image-with-text" pode ter blocks "heading", "text", "button". Tudo declarativo, zero deploy para mudanças visuais — merchant faz no admin.' },
      { q: 'Como debugar Liquid?', a: 'Use `{{ object | json }}` para serializar e ver o conteúdo. Liquid não tem stack trace — erros silenciam. Shopify CLI tem hot reload local com `shopify theme dev`. Use comment tags `{% comment %} ... {% endcomment %}` para isolar problemas. Para perfil: aba Network do DevTools (templates renderizam server-side).' },
      { q: 'Quando usar Liquid Online Store 2.0 vs Hydrogen?', a: 'OS 2.0 (Liquid moderno com Sections Everywhere, App Blocks, Metaobjects): merchants mantêm controle no theme editor, time pequeno, prazo curto, customização média. Hydrogen: time React experiente, performance crítica, controle total do front, marca premium com identidade visual forte. OS 2.0 é o caminho default; Hydrogen quando OS 2.0 não basta.' }
    ],
    code: `{% comment %} sections/product-info.liquid {% endcomment %}
{% comment %} Schema configurável no theme editor {% endcomment %}
{% schema %}
{
  "name": "Product Info",
  "settings": [
    { "type": "checkbox", "id": "show_vendor", "label": "Mostrar marca", "default": true },
    { "type": "select", "id": "heading_size", "label": "Tamanho do título",
      "options": [
        { "value": "h2", "label": "Médio" },
        { "value": "h1", "label": "Grande" }
      ], "default": "h1" }
  ],
  "blocks": [
    { "type": "title", "name": "Título", "limit": 1 },
    { "type": "price", "name": "Preço", "limit": 1 }
  ]
}
{% endschema %}

{%- assign product = product -%}

<div class="product-info" itemscope itemtype="https://schema.org/Product">
  {%- for block in section.blocks -%}
    {%- case block.type -%}
      {%- when 'title' -%}
        {% if section.settings.show_vendor %}
          <p class="vendor">{{ product.vendor | escape }}</p>
        {% endif %}
        <{{ section.settings.heading_size }} itemprop="name">
          {{ product.title | escape }}
        </{{ section.settings.heading_size }}>

      {%- when 'price' -%}
        <p class="price" itemprop="price" content="{{ product.price | money_without_currency }}">
          {{ product.price | money }}
          {%- if product.compare_at_price > product.price -%}
            <s>{{ product.compare_at_price | money }}</s>
          {%- endif -%}
        </p>
    {%- endcase -%}
  {%- endfor -%}
</div>

{%- comment -%} Section Rendering API: fetch GET /products/{handle}?sections=product-info {%- endcomment -%}`
  },
  {
    id: 114, emoji: '🎨', title: 'Shopify Polaris — Design System',
    level: 'System Design', color: '#34d399',
    summary: 'Design system oficial do Shopify para apps embedded. Componentes React acessíveis e consistentes.',
    definition: 'Polaris é o design system do Shopify, usado em todos os apps internos e no admin. Lib React com 80+ componentes (Button, TextField, DataTable, Modal, Page, Card, ResourceList) seguindo padrão visual Shopify. Inclui tokens (cores, espacamento, tipografia), padrões de UX documentados, e regras de acessibilidade WCAG 2.1 AA. Apps embedded (que rodam no admin via iframe) devem usar Polaris para parecer nativos.',
    problem: 'App customizado dentro do admin Shopify com visual inconsistente confunde o merchant (parece mockado). Implementar componentes acessíveis do zero é caro. Atualizações de UX do Shopify quebram apps que não seguem o padrão.',
    solution: 'Usar Polaris React: instalar `@shopify/polaris`, envolver app com `<AppProvider i18n={...}>`, usar componentes prontos. Tokens via `@shopify/polaris-tokens` para usar em CSS customizado. Quando precisar de algo não previsto, usar primitivos (`<Box>`, `<BlockStack>`, `<InlineStack>`) que respeitam os tokens.',
    tip: 'Polaris não é para storefront — é para o admin do merchant. Se você está construindo a loja vista pelo cliente final, use Hydrogen UI ou tema Liquid. Polaris é onde merchants configuram apps, vêem dashboards, gerenciam produtos.',
    questions: [
      { q: 'Polaris vs Material UI vs Chakra para app Shopify?', a: 'Polaris é o único que se integra ao visual do admin Shopify nativamente. Se seu app é embedded, USE POLARIS — sem alternativa razoável. Material UI ou Chakra fariam o app parecer "fora do lugar". Se seu app é externo (não embedded), aí qualquer DS serve, mas Polaris ainda é boa escolha para merchants familiarizados.' },
      { q: 'Como funciona o sistema de tokens do Polaris?', a: 'Tokens são valores semânticos exportados como CSS vars: `--p-color-bg-surface`, `--p-text-heading-md-font-size`, `--p-space-400`. Você usa no CSS customizado e eles seguem o tema (light/dark/contrast) automaticamente. Tokens existem em camadas: primitivos (gray-100) → semânticos (color-bg-fill) → componentes (button-bg).' },
      { q: 'Como fazer App Bridge + Polaris?', a: 'App Bridge: SDK do Shopify para apps embedded se comunicarem com o admin (navegação, modais, redirects). Polaris: UI dos componentes. Funcionam juntos: App Bridge controla o "chrome" (topbar, navigation) e Polaris os componentes internos. `<AppProvider linkComponent={ShopifyLink}>` substitui `<a>` por navegação client-side do Shopify.' }
    ],
    code: `// app.tsx — Embedded Shopify app com Polaris + App Bridge
import { AppProvider, Page, Card, Button, TextField, BlockStack } from '@shopify/polaris'
import '@shopify/polaris/build/esm/styles.css'
import enTranslations from '@shopify/polaris/locales/en.json'
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react'
import { useState } from 'react'

export default function App({ host, apiKey }: { host: string; apiKey: string }) {
  return (
    <AppBridgeProvider config={{ host, apiKey, forceRedirect: true }}>
      <AppProvider i18n={enTranslations}>
        <Settings />
      </AppProvider>
    </AppBridgeProvider>
  )
}

function Settings() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await fetch('/api/settings', { method: 'POST', body: JSON.stringify({ name }) })
    setLoading(false)
  }

  return (
    <Page
      title="Configurações"
      primaryAction={{ content: 'Salvar', onAction: handleSave, loading }}
      backAction={{ content: 'Apps', url: '/' }}
    >
      <Card>
        <BlockStack gap="400">
          <TextField
            label="Nome da loja"
            value={name}
            onChange={setName}
            autoComplete="off"
            helpText="Exibido em emails de confirmação"
          />
          <Button onClick={handleSave} loading={loading} variant="primary">
            Salvar alterações
          </Button>
        </BlockStack>
      </Card>
    </Page>
  )
}`
  },
  {
    id: 115, emoji: '📡', title: 'Shopify Web Pixel API — Tracking Moderno',
    level: 'System Design', color: '#34d399',
    summary: 'API sandboxed para coletar eventos da loja Shopify. Substituta moderna de ScriptTag.',
    definition: 'Web Pixel API é a forma moderna de instrumentar tracking em lojas Shopify (substituiu ScriptTag em 2023). Você cria um app pixel que roda em um sandbox isolado (Web Worker), recebe eventos pré-definidos da Shopify (`product_viewed`, `cart_updated`, `checkout_completed`), e despacha para seu collector. Vantagens: performance (não bloqueia main thread), segurança (sandboxado), confiabilidade (Shopify garante o ciclo de vida do evento mesmo em checkout).',
    problem: 'ScriptTag (legado): injetava `<script>` no global da loja — podia conflitar com tema, quebrar com mudanças, e era cancelado pelo browser no unload da página de checkout (perda de eventos de purchase). Performance ruim em mobile (script bloqueia).',
    solution: 'Web Pixel app instalado pelo merchant, roda em sandbox isolado. Eventos vêm pré-formatados do Shopify (schema padronizado). Inclui `checkout_completed` que dispara confiavelmente após purchase. Você só implementa o handler: receber evento → enviar para seu collector com batching/retry.',
    tip: 'Em 2025, Web Pixel é a única forma oficial e suportada de instrumentar tracking em lojas Shopify novas. Para lojas legadas usando GTM ou analytics injetados via theme.liquid: migrar para Web Pixel reduz perda de eventos em ~5-10% (especialmente no checkout). Cada pixel é instalado como app pelo merchant.',
    questions: [
      { q: 'Quais eventos a Web Pixel API expõe?', a: 'Standard events: page_viewed, product_viewed, collection_viewed, search_submitted, product_added_to_cart, cart_viewed, checkout_started, checkout_address_info_submitted, checkout_contact_info_submitted, checkout_shipping_info_submitted, checkout_payment_info_submitted, checkout_completed. Schema unificado (event_name, timestamp, data). DOM events customizados: você pode emitir manualmente via `analytics.publish()`.' },
      { q: 'Como funciona o sandbox do Web Pixel?', a: 'O código do pixel roda em um iframe ou Web Worker isolado — sem acesso ao DOM da loja, sem acesso a outras Web Pixels, sem `window` global. APIs disponíveis: `analytics.subscribe(event, handler)`, `fetch` (com CSP restrita), `localStorage` próprio do sandbox. Resultado: pixel não consegue corromper a loja nem se intrometer em outros pixels.' },
      { q: 'Como migrar de ScriptTag para Web Pixel?', a: '1) Criar um app Shopify do tipo `web_pixel_extension`. 2) Implementar o handler subscribing aos eventos relevantes. 3) Merchant instala o app no admin. 4) Decomissionar o ScriptTag antigo (remover do app, ele se desinstala automaticamente). Resultados: ~5-10% mais eventos capturados, especialmente em checkout. Custo: migração leva 1-2 sprints dependendo da complexidade do tracking atual.' }
    ],
    code: `// extensions/tracker/src/index.ts
// Web Pixel app — roda em sandbox isolado
import { register } from '@shopify/web-pixels-extension'

register(({ analytics, browser, settings }) => {
  const collectorUrl = settings.collector_url
  const apiKey = settings.api_key

  // Fila local com batching
  const queue: any[] = []
  let timer: any = null

  const flush = () => {
    if (queue.length === 0) return
    const batch = queue.splice(0)
    browser.sendBeacon(collectorUrl, JSON.stringify({ apiKey, events: batch }))
    timer = null
  }

  const enqueue = (event: any) => {
    queue.push({
      event_id: crypto.randomUUID(),
      timestamp: event.timestamp,
      name: event.name,
      data: event.data,
    })
    if (queue.length >= 10) flush()
    else if (!timer) timer = setTimeout(flush, 3000)
  }

  // Eventos de produto
  analytics.subscribe('product_viewed', enqueue)
  analytics.subscribe('product_added_to_cart', enqueue)
  analytics.subscribe('collection_viewed', enqueue)

  // Eventos de checkout (CRÍTICOS — flush imediato)
  analytics.subscribe('checkout_started', e => { enqueue(e); flush() })
  analytics.subscribe('checkout_completed', e => { enqueue(e); flush() })

  // Custom event opcional
  analytics.subscribe('custom_event', enqueue)
})

// extensions/tracker/shopify.extension.toml
// type = "web_pixel_extension"
// name = "Custom Tracker"
// settings = [
//   { key = "collector_url", type = "url" },
//   { key = "api_key", type = "string" }
// ]`
  }
]

const all = [...existing, ...newConcepts]
writeFileSync('./src/data/concepts.json', JSON.stringify(all, null, 2))
console.log('Total:', all.length, '· Added:', newConcepts.length)
