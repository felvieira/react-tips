# Tracking Cockpit 🛰️

Apoio interativo de **System Design** para a entrevista de **Frontend Sênior @ Grupo SBF (Centauro · Nike)**.
Pensado para ficar aberto numa segunda tela e ser consultado *ao vivo* durante a etapa de whiteboard.

App React (Vite), arquivo único, tema escuro estilo "mission control".

---

## Pré-requisitos

- **Node.js 18+** (recomendado 20+)
- npm (vem com o Node)

## Como rodar localmente

```bash
# 1. instalar as dependências
npm install

# 2. modo desenvolvimento (abre em http://localhost:5173)
npm run dev
```

## Build de produção

```bash
# gera a versão otimizada na pasta dist/
npm run build

# serve o build localmente para conferir
npm run preview
```

O conteúdo de `dist/` é estático — dá para hospedar em qualquer lugar
(Vercel, Netlify, GitHub Pages, S3, etc.).

---

## Os 3 modos

| Modo | Atalho | Para que serve |
|------|:------:|----------------|
| **Mapa** | `1` | Arquitetura em 5 camadas + transversal, clicável. O Inspector mostra o que cada componente faz, por que existe e o que falar. |
| **Jornada** | `2` | Caminha pelos 9 passos de um evento `add_to_cart`, do clique ao dashboard. Cada passo traz a fala scriptada. Use `←` / `→`. |
| **Cola Rápida** | `3` | Trade-offs, perguntas de abertura, ordem de desenho e palavras-chave. |

Cronômetro de 60 min no topo, com as 5 fases da entrevista marcadas.

### Atalhos de teclado

- `1` `2` `3` — trocam de modo
- `←` `→` — navegam os passos da Jornada

---

## Estrutura

```
tracking-cockpit/
├── index.html          # entrada HTML
├── package.json        # dependências e scripts
├── vite.config.js      # config do Vite
├── src/
│   ├── main.jsx        # ponto de entrada React
│   ├── App.jsx         # o app inteiro (componente + dados)
│   └── index.css       # resets mínimos
└── README.md
```

Todo o conteúdo (camadas, componentes, jornada, trade-offs) está em
constantes no topo de `src/App.jsx` — fácil de editar e adaptar.

## Stack

- React 18 + Vite 5
- lucide-react (ícones)
- Estilos: inline + tag `<style>` injetada (sem Tailwind, sem dependência de CSS externo)
- Fontes: IBM Plex Sans / IBM Plex Mono (via Google Fonts)
