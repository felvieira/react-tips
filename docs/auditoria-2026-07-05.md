# Auditoria Técnica — React Interview Deck
**Data:** 2026-07-05 | **Branch:** main | **Último commit:** `4de3343`

---

## Estado atual — o que foi implementado

### ✅ Segurança (commit `20baad8`)
| Item | Status |
|------|--------|
| XSS no ChatWidget — `lang` do code block sanitizado | ✅ resolvido |
| Fallback `msg.content` cru removido do `dangerouslySetInnerHTML` | ✅ resolvido |
| Erro upstream da OpenRouter mascarado (status → mensagem genérica) | ✅ resolvido |
| Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP | ✅ resolvido |

### ✅ Landing page (commit `2a077ff`)
| Item | Status |
|------|--------|
| `src/app/page.tsx` — hero, stats, features grid, quick access | ✅ criado |
| Server component (sem `'use client'`) | ✅ correto |
| Usa variáveis CSS do design system (`var(--accent)`, `var(--fg)`, etc.) | ✅ correto |
| Metadata própria com title e description | ✅ correto |

### ✅ SEO (commit `4de3343`)
| Item | Status |
|------|--------|
| `layout.tsx` — metadata root completa (metadataBase, OG, Twitter card, keywords) | ✅ |
| `concepts/[id]/page.tsx` — `generateMetadata` por conceito | ✅ |
| `glossary/[term]/page.tsx` — `generateMetadata` por termo | ✅ |
| `questions/page.tsx` — metadata estática | ✅ |
| `glossary/page.tsx` — metadata estática | ✅ |
| `arquitetura/page.tsx` — metadata estática melhorada | ✅ |
| `src/app/sitemap.ts` — gera ~181 URLs | ✅ |
| `src/app/robots.ts` — allow `/`, disallow `/api/` | ✅ |
| `favicon.ico` presente em `public/` | ✅ |

---

## Pendências abertas

### 🔴 CRÍTICO

#### 1. Sem rate limiting em `/api/chat`
- **Arquivo:** `src/app/api/chat/route.ts`
- **Problema:** Com `OPENROUTER_API_KEY` configurada no servidor, qualquer visitante anônimo pode fazer POST ilimitado, drenando o saldo da key em minutos.
- **Fix recomendado:** Upstash Ratelimit (Redis) ou token bucket em memória com LRUCache por IP. Alternativa mais simples: operar apenas em modo BYOK (remover `OPENROUTER_API_KEY` do servidor e deixar cada usuário usar sua própria key).
- **Impacto se não corrigir:** Custo financeiro ilimitado se o app for exposto publicamente com key de servidor.

### 🟠 ALTO

#### 2. OG image ausente (`/og-image.png`)
- **Arquivo:** `public/og-image.png` — **não existe**
- **Problema:** `layout.tsx` e `page.tsx` referenciam `/og-image.png` nos metadados OG e Twitter card. Qualquer link compartilhado no LinkedIn/Twitter vai gerar preview quebrado (sem imagem).
- **Fix:** Criar `public/og-image.png` (1200×630px). Pode ser gerado com o script de image generation (`flux-2-flash`) ou via `src/app/opengraph-image.tsx` (OG image dinâmica via Next.js ImageResponse).
- **Impacto:** Share em redes sociais sem preview = perda de CTR orgânico.

#### 3. CVEs pendentes no npm
- **Comando:** `npm audit` → 2 vulnerabilidades
  - `next` — HIGH, fix disponível em `16.2.10` (mesmo minor, sem breaking change)
  - `postcss` — moderate, corrigido via update do next
- **Fix:** `npm update next` → instala `16.2.10`, corrige ambos.
- **Impacto:** Vulnerabilidade de middleware bypass no Next.js (baixo impacto aqui — sem middleware de autenticação, mas é boa prática manter patched).

#### 4. `ChatWidget` sem lazy load (code-split)
- **Arquivo:** `src/app/layout.tsx:11` + `src/components/chat/ChatWidget.tsx` (368 linhas)
- **Problema:** O chat é importado diretamente no layout root — todo visitante (incluindo crawlers e quem nunca usa o chat) baixa o bundle inteiro do widget.
- **Fix:**
  ```tsx
  // layout.tsx
  import dynamic from 'next/dynamic'
  const ChatWidget = dynamic(() => import('@/components/chat/ChatWidget').then(m => ({ default: m.ChatWidget })), { ssr: false })
  ```
- **Impacto:** Reduz ~10-15KB do bundle inicial de toda página.

#### 5. Payload RSC excessivo no layout root
- **Arquivo:** `src/app/layout.tsx:44-46`
- **Problema:** `getConcepts()` (387KB de JSON) + `getGlossary()` (62KB) são carregados no layout e passados inteiros como props para `GlobalSearch`, `AppSidebar` e `AppTopbar` — client components que recebem e serializam ~450KB no RSC payload de **toda** navegação.
- **Fix parcial:** Passar apenas `{id, title, level}` para sidebar/topbar (projeção de ~10KB). O índice completo do search pode ser carregado via fetch lazy ao abrir o ⌘K.
- **Impacto:** Reduz significativamente o RSC payload em cada transição de página.

#### 6. Loaders sem cache — re-parse Zod em toda chamada
- **Arquivo:** `src/lib/loaders.ts`
- **Problema:** `getConcepts()` e `getGlossary()` executam `z.array(...).parse()` em 387KB + 62KB a cada invocação. São chamados em múltiplos lugares: layout, concept page, generateStaticParams, sitemap — sem memoização.
- **Fix:**
  ```ts
  import { cache } from 'react'
  export const getConcepts = cache((): Concept[] =>
    z.array(ConceptSchema).parse(rawConcepts)
  )
  export const getGlossary = cache((): GlossaryItem[] =>
    z.array(GlossaryItemSchema).parse(rawGlossary)
  )
  ```
  `cache()` do React deduplica por request em server components.
- **Impacto:** Elimina re-parse redundante em cada request.

### 🟡 MÉDIO

#### 7. `CockpitClient` e `UberCockpitClient` — ~600 linhas duplicadas
- **Arquivos:** `src/components/arquitetura/CockpitClient.tsx` (881 linhas), `src/components/arquitetura/UberCockpitClient.tsx` (764 linhas)
- **Problema:** CSS string idêntico, mesmos imports, mesma shell de layout, mesma lógica de tabs/timer/keyboard. Só os dados (conceitos, diagramas, perguntas) diferem.
- **Fix:** Extrair `CockpitShell` parametrizado por config object. Cada cockpit passa seus dados; a shell cuida de toda a UX.
- **Impacto:** DRY, manutenibilidade — qualquer bug corrigido em um hoje precisa ser corrigido manualmente no outro.

#### 8. Google Fonts injetadas via `@import url()` nos Cockpits
- **Arquivos:** `CockpitClient.tsx:17`, `UberCockpitClient.tsx:17`
- **Problema:** Ambos injetam IBM Plex Mono/Sans via `@import url('https://fonts.googleapis.com/...')` em uma string CSS runtime. Isso é render-blocking e bypassa o `next/font` (que usa font-display:swap, preload, self-hosting).
- **Fix:** Adicionar IBM Plex Mono/Sans via `next/font/google` no layout ou passar como variável CSS para os cockpits.

#### 9. `eslint-disable no-explicit-any` nos Cockpits + sem config ESLint
- **Arquivos:** `CockpitClient.tsx:2`, `UberCockpitClient.tsx:2`
- **Problema:** Projeto sem `eslint.config.ts` nem script `lint` no `package.json`. Os cockpits desabilitam a checagem de any no topo do arquivo.
- **Fix:** Adicionar `eslint-config-next` + definir tipos para os dados dos cockpits.

#### 10. `reactStrictMode` ausente em `next.config.ts`
- **Arquivo:** `next.config.ts`
- **Problema:** `reactStrictMode: true` não está configurado. Detecta side effects e uso incorreto de APIs deprecadas em desenvolvimento.
- **Fix:** Adicionar `reactStrictMode: true` ao config.

#### 11. BYOK key em `localStorage` (janela de exposição desnecessária)
- **Arquivo:** `src/components/chat/ChatWidget.tsx:46`
- **Problema:** A API key do usuário persiste em `localStorage` indefinidamente e é acessível por qualquer JS da página. Com o XSS já corrigido o risco caiu, mas `sessionStorage` (apagado ao fechar a aba) seria mais seguro para uma credential.
- **Mitigação:** Trocar `localStorage` por `sessionStorage` para o storage da key — usuário precisaria colar novamente a cada sessão, mas é aceitável para uma credencial.

#### 12. `metadata` ausente em páginas restantes
- **Arquivos:**
  - `src/app/arquitetura/uber/page.tsx` — sem metadata
  - `src/app/arquitetura/print/page.tsx` — sem metadata (mas é página auxiliar de impressão, menos crítico)
- **Fix:** Adicionar `export const metadata: Metadata = { title: '...', description: '...' }` em cada uma.

#### 13. README genérico (boilerplate create-next-app)
- **Arquivo:** `README.md`
- **Problema:** Não descreve o projeto, não lista features, não documenta como rodar, não menciona a stack. Prejudica contribuições e visibilidade no GitHub.
- **Fix:** Documentar propósito, stack, como rodar dev/build/docker, variáveis de ambiente, arquitetura de dados.

#### 14. `docker-compose.yaml` sem `ports` e sem referência a env file
- **Arquivo:** `docker-compose.yaml`
- **Problema:** Container sobe mas não expõe porta. `OPENROUTER_API_KEY` não é documentada no compose — operador precisa injetar manualmente sem referência.
- **Fix:** Adicionar `ports: ["3000:3000"]` e `env_file: .env.local` (ou documentar como env var).

### 🟢 BÔNUS / CONVERSÃO

#### 15. Sem JSON-LD / Schema.org
- **Problema:** Páginas de conceito e perguntas são candidatos naturais a rich snippets Google (`FAQPage`, `Article`, `BreadcrumbList`). Não há nenhum JSON-LD implementado.
- **Fix:** Adicionar `<script type="application/ld+json">` via componente server em `ConceptPage` e `QuestionsPage`.
- **Impacto:** Potencial de aparecer como FAQ snippet no Google para buscas de entrevista React.

#### 16. Sem mecanismo de retenção fora do localStorage
- **Problema:** Progresso do usuário fica apenas no browser. Se trocar de máquina, perde tudo. Sem email capture, sem newsletter.
- **Fix potencial:** Export de progresso em JSON (simples, sem backend), ou integração de email com service gratuito (Resend).

#### 17. Sem share de progresso
- **Problema:** "Dominei 72/97 conceitos de React" é conteúdo viral natural para o público-alvo (devs em processo de entrevista). Não há CTA para compartilhar.
- **Fix:** Botão "Compartilhar progresso" que gera URL com estado encoded ou imagem OG dinâmica.

---

## Resumo executivo

| Categoria | Implementado | Pendente |
|-----------|-------------|---------|
| Segurança | XSS, error masking, security headers | Rate limiting `/api/chat` |
| SEO | metadata, OG tags, sitemap, robots, generateMetadata | OG image (`/og-image.png`), JSON-LD |
| Conversão | Landing page real | Share de progresso, email capture |
| Performance | — | lazy ChatWidget, cache loaders, payload RSC reduzido |
| Clean code | — | Refactor Cockpits (600 linhas duplicadas), ESLint |
| Deps | — | `npm update next` (fix CVEs HIGH+moderate) |

### Ordem de ataque recomendada
1. `npm update next` — 1 comando, fix 2 CVEs
2. `public/og-image.png` — sem isso links compartilhados ficam sem preview
3. Rate limiting em `/api/chat` — risco financeiro se key de servidor estiver configurada
4. `cache()` nos loaders — 2 linhas, elimina re-parse redundante
5. lazy `ChatWidget` — 1 linha, reduz bundle de toda página
6. `reactStrictMode: true` — 1 linha
7. Refactor Cockpits — maior esforço, menor urgência
8. JSON-LD + share de progresso — alto impacto de conversão a médio prazo
