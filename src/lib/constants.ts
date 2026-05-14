// ── Shared constants ──────────────────────────────────────────────────────────
// Single source of truth for level → hue mapping.
// Used by AppSidebar, ConceptPageClient, QuestionsClient.

export const DOMAIN_HUES: Record<string, number> = {
  // Original React / Next.js levels
  'Performance': 150,
  'React 18': 220,
  'Next.js RSC': 190,
  'Padrão': 280,
  'Segurança': 0,
  'Hooks': 250,
  'Next.js': 190,
  'Fundamentos': 60,
  'DevTools': 200,
  'Padrões': 300,
  // Frontend expanded
  'Básico FE': 60,
  'Intermediário FE': 220,
  'Avançado FE': 300,
  'Avançado': 290,
  // Domain sections
  'Design System': 30,
  'Microfrontend': 160,
  'Observabilidade': 50,
  'Estado Global': 260,
  'Testing': 150,
  'Acessibilidade': 280,
  'Carreira': 40,
  'Arquitetura': 200,
  'Corporativo': 35,
  // IA
  'IA Básico': 290,
  'IA Avançado': 270,
}

// localStorage key names — single source of truth
export const STORAGE_KEYS = {
  progress: 'react-tips-progress',
  focus:    'react-tips-focus',
  apiKey:   'react-tips-openrouter-key',
  theme:    'react-tips-theme',
} as const
