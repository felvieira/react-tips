import { readFileSync, writeFileSync } from 'fs'

const existing = JSON.parse(readFileSync('./src/data/concepts.json', 'utf8'))

const newConcepts = [

  // ── COMPORTAMENTAL CORPORATIVO ────────────────────────────────────────────
  {
    id: 98,
    emoji: '🤝',
    title: 'Comportamental — Relações e Conflitos',
    level: 'Corporativo',
    color: '#fb923c',
    summary: 'Colega desengajado, conflito interpessoal, divergência de ideias e colaboração em time.',
    definition: 'Questões comportamentais sobre relações testam inteligência emocional, assertividade e colaboração. O avaliador quer ver: você confronta problemas diretamente (não foge, não delega prematuramente), age com empatia (não expõe publicamente), e busca síntese em vez de "ganhar" o conflito. A regra de ouro: diálogo direto e privado antes de qualquer escalada.',
    problem: 'Candidatos tendem a escolher respostas que soam proativas mas são na verdade inadequadas: levar para o grupo (exposição), reportar ao gestor antes de tentar (escalada prematura), ou ignorar esperando o tempo resolver (omissão).',
    solution: 'Sempre que há conflito interpessoal: 1) conversa direta e privada primeiro, 2) tom curioso e não acusatório ("o que está acontecendo?"), 3) escalada só se a conversa direta não resolver. Em divergências de processo: buscar síntese que preserve o melhor de cada visão, não "vencer" o argumento.',
    tip: 'A resposta de maturidade quase sempre é: conversa direta + privada + tom leve. Fuja das extremidades: nem retaliação passivo-agressiva, nem escalar para o gestor sem tentar antes.',
    questions: [
      {
        q: 'Um colega participa das reuniões mas não contribui. O que você faz?',
        a: '✅ Busca entender diretamente após a reunião, com tom informal. Aborda a pessoa em particular, com curiosidade e sem julgamento. ❌ Não reporta à liderança antes de tentar (escalada prematura). ❌ Não pergunta no grupo (exposição pública). ❌ Não mantém distância "por respeito" (omissão).'
      },
      {
        q: 'Um colega ignora suas contribuições e avança sozinho nos projetos. Como resolve?',
        a: '✅ Chama para conversar diretamente e entende o que está acontecendo. Confronta o problema de frente, sem audiência, sem retaliação. ❌ "O tempo acerta" = evitação. ❌ "Fazer o mesmo com ele" = passivo-agressivo. ❌ Escalar para o gestor sem ter tentado = escalada prematura.'
      },
      {
        q: 'Você e um colega têm visões opostas sobre um processo importante. Como resolve?',
        a: '✅ Constrói com ele um novo modelo que preserve o melhor das duas ideias. Síntese > disputa. ❌ Buscar dados para provar que sua ideia é melhor = ego disfarçado de rigor. ❌ Votar no time = democracia não resolve mérito técnico. ❌ Ceder para não perder tempo = falsa eficiência com ressentimento acumulado.'
      }
    ],
    code: `// Framework para conflitos interpessoais

PASSO 1 — Conversa direta e privada
  "Posso falar contigo depois da reunião?"
  Tom: curioso, não acusatório
  "Percebi X acontecendo, queria entender melhor"

PASSO 2 — Escutar antes de concluir
  Não assuma má-fé. Pode ser contexto que você não vê.
  "O que está acontecendo do seu lado?"

PASSO 3 — Buscar síntese ou acordo
  Em conflito de processo: "O que tem de bom nas duas visões?"
  Em conflito de comportamento: "Como podemos trabalhar diferente?"

PASSO 4 — Escalar se necessário
  Só depois de tentar a conversa direta
  "Conversei com X, mas continua impactando. Preciso de ajuda."

❌ Nunca antes do passo 1:
  - Reportar ao gestor
  - Falar com outros colegas
  - Expor no grupo
  - Retaliar`
  },

  {
    id: 99,
    emoji: '🎯',
    title: 'Comportamental — Priorização e Entregas',
    level: 'Corporativo',
    color: '#fb923c',
    summary: '5 urgências simultâneas, meta coletiva em risco, gestor imprevisível e ambiguidade de prioridades.',
    definition: 'Questões de priorização testam se você tem sistema próprio de gestão ou depende de outros para organizar. O avaliador quer ver: renegociação proativa (não finge que consegue tudo), blocos de foco (não multitarefa), comunicação antecipada (não surpresa no prazo), e orientação a resultado coletivo (não só a sua parte).',
    problem: 'Erros comuns: tentar equilibrar tudo ao mesmo tempo (multitarefa = tudo mal feito), priorizar por visibilidade política (não por impacto real), delegar antes de organizar, ou sair entregando por ordem de chegada sem critério.',
    solution: 'Quando há sobrecarga: 1) mapear e ranquear por impacto, 2) comunicar proativamente quais prazos precisam ser renegociados, 3) trabalhar em blocos sequenciais de foco, 4) atualizar stakeholders sobre o status. Quando a meta coletiva está em risco: propor redistribuição de esforços.',
    tip: 'Renegociar prazo não é fraqueza — é maturidade. Surpresa no deadline é que é problema. Avise cedo, propague contexto, trabalhe de forma focada e sequencial.',
    questions: [
      {
        q: 'Você tem 5 demandas urgentes na mesma semana. O que faz?',
        a: '✅ Renegocia prazos, define blocos de foco e avisa o time sobre sua organização. Os 3 pilares: renegociação (expectativas alinhadas), blocos de foco (execução profunda, não multitarefa), comunicação proativa. ❌ Tentar equilibrar todas = cinco coisas mal feitas. ❌ Priorizar pela visibilidade = jogo político, não impacto real.'
      },
      {
        q: 'Sua parte do projeto está pronta mas a equipe vai perder a meta. O que faz?',
        a: '✅ Sugere redistribuir esforços para salvar o todo. Mentalidade de time: não se acomoda ao terminar a parte própria, pensa no resultado coletivo. ❌ Tentar compensar sozinho = martírio ineficiente. ❌ Só comunicar que terminou = faz o mínimo quando o time precisa de mais. ❌ "Respeitar os limites dos outros" nessa situação = desengajamento disfarçado.'
      },
      {
        q: 'Seu gestor muda prioridades com frequência. Como você se mantém produtivo?',
        a: '✅ Cria rituais próprios para manter estabilidade e revisar entregas mesmo com o cenário mutável. Autogestão: não depende do gestor para ter clareza, constrói seu próprio sistema de revisão periódica e critérios de priorização. ❌ "Faz o que der" = sem critério nem ownership. ❌ Só avisar e aguardar = paralisa esperando o gestor resolver.'
      }
    ],
    code: `// Sistema de priorização sob pressão

MATRIZ DE IMPACTO vs URGÊNCIA:
  Alto impacto + urgente    → FAZ AGORA
  Alto impacto + não urgente → AGENDA (bloco de foco)
  Baixo impacto + urgente   → DELEGA ou RENEGOCIA
  Baixo impacto + não urgente → ELIMINA ou POSTERGA

COMUNICAÇÃO PROATIVA (template):
  "Recebi X demandas com o mesmo prazo.
   Minha proposta de prioridade: [A, B, C].
   D e E precisam ser renegociados — posso entregar em [data].
   Isso funciona para vocês?"

RITUAIS DE AUTOGESTÃO:
  - Revisão diária de 10min: o que move o resultado hoje?
  - Blocos de 90min sem interrupção para tarefas complexas
  - Weekly pessoal: o que estava planejado vs o que aconteceu?
  - Critérios fixos: se duas coisas são "urgentes", qual tem maior impacto?`
  },

  {
    id: 100,
    emoji: '🚀',
    title: 'Comportamental — Crescimento e Adaptação',
    level: 'Corporativo',
    color: '#fb923c',
    summary: 'Vaga de liderança, área nova, fracasso em projeto, ideia inovadora e crise sem gestor.',
    definition: 'Questões de crescimento testam autoconsciência, resiliência e proatividade. O avaliador quer ver: ambição declarada sem arrogância, aprendizado rápido por imersão, accountability sem drama pós-fracasso, e inovação validada empiricamente antes de escalar. O padrão recorrente: agir + aprender + comunicar, nunca fugir ou fingir.',
    problem: 'Erros comuns: candidatura impulsiva sem autoconsciência (arrogância), esperar ser reconhecido passivamente, guardar ideias para "o momento certo" (procrastinação elegante), ou apresentar proposta não testada direto para a liderança.',
    solution: 'Para crescimento: declarar interesse ao gestor + perguntar o que falta desenvolver. Para fracasso: analisar, compartilhar aprendizado, seguir em frente. Para inovação: validar informalmente com colegas → prototipar pequeno → coletar feedback → só então apresentar para cima.',
    tip: 'O ciclo de inovação interna é: conversa informal → protótipo mínimo → feedback → dados → apresentação para liderança. Nunca pule etapas. "Já testei" é a resposta que a liderança quer ouvir.',
    questions: [
      {
        q: 'Surgiu uma vaga de liderança júnior. Você está há pouco tempo na empresa. O que faz?',
        a: '✅ Fala com gestor sobre o interesse e pergunta o que precisa desenvolver para estar pronto. Os 3 elementos: ambição declarada + autoconsciência (pode não estar pronto) + orientação a desenvolvimento. ❌ Candidatar imediatamente = arrogância sem contexto. ❌ Esperar ser reconhecido = passividade. ❌ "Não arriscar" = autossabotagem.'
      },
      {
        q: 'Você foi alocado em área nova com linguagem e processos diferentes. Como age?',
        a: '✅ Pergunta para líder e time, observa, aprende rápido e se adapta pelo contexto. As 3 virtudes: humildade para perguntar + observação ativa + aprendizado por imersão. ❌ Solicitar treinamento formal = paralisia em contexto temporário. ❌ Replicar processos anteriores = arrogância metodológica. ❌ Disfarçar insegurança = bloqueia o aprendizado.'
      },
      {
        q: 'Você liderou um projeto com baixo impacto apesar do muito esforço. O que faz depois?',
        a: '✅ Analisa o que poderia ter feito diferente, compartilha com o time e segue em frente. Os 3 pilares: accountability (olha para dentro), aprendizado coletivo (compartilha, não guarda), resiliência (segue, não rumina). ❌ Focar nos resultados alcançados = spin defensivo. ❌ Analisar só fatores externos = fuga de responsabilidade. ❌ Passar por cima = zero aprendizado.'
      },
      {
        q: 'Você teve uma ideia que pode otimizar um processo importante. O que faz?',
        a: '✅ Valida informalmente com colegas, prototipa versão pequena e coleta feedback. O ciclo lean: testa → mede → aprende → chega para cima com dados. ❌ Guardar para "o momento certo" = procrastinação com nome bonito. ❌ Apresentar direto para a liderança sem teste = aposta sem evidência. ❌ Escrever documento minucioso sem validação = over-engineering antes de qualquer dado.'
      },
      {
        q: 'No domingo, um sistema crítico cai. Seu gestor está indisponível. O que faz?',
        a: '✅ Notifica imediatamente todos os envolvidos, aguarda instruções e não interfere sem autorização. Os 3 princípios: urgência (notifica imediatamente), limite de autonomia (não age sem ok em sistema crítico), responsabilidade coletiva (não some). ❌ Buscar alternativas sem autorização = pode transformar queda em perda de dados. ❌ Esperar segunda-feira = sistema fora o domingo inteiro é impacto real.'
      }
    ],
    code: `// Padrões de resposta para crescimento profissional

// Para vaga de liderança:
"Fiquei sabendo da vaga e tenho muito interesse.
 Sei que estou há pouco tempo, então queria entender:
 quais competências você enxerga como críticas para
 essa posição e o que eu ainda precisaria desenvolver?"

// Para novo contexto / área nova:
SEMANA 1: perguntar, observar, documentar
  - "Como funciona X aqui?"
  - "Qual é o maior desafio atual do time?"
  - Não importar processos anteriores sem entender o contexto

// Para fracasso em projeto (retrospectiva):
"O que funcionou: [A, B]
 O que mudaria: [C, D, E]
 O que vou fazer diferente: [ação concreta]"
 → Compartilhar com o time, não guardar

// Para inovação:
ETAPA 1: "Fulano, tive uma ideia — faz sentido pra você?"
ETAPA 2: protótipo mínimo em 1-2 dias
ETAPA 3: teste com 2-3 pessoas impactadas
ETAPA 4: "Testei com X, resultado foi Y, proposta é Z"
          → Agora sim vai para a liderança com dados`
  },

  // ── RACIOCÍNIO LÓGICO ─────────────────────────────────────────────────────
  {
    id: 101,
    emoji: '🧩',
    title: 'Lógica — Proposições e Modus Tollens',
    level: 'Corporativo',
    color: '#818cf8',
    summary: 'Contrapositiva, modus tollens, enfraquecimento de argumento e cadeia lógica com negação.',
    definition: 'Questões de lógica proposicional testam se você consegue raciocinar com se/então sem se deixar enganar pela intuição. As armadilhas mais comuns: confundir a direta (P→Q) com a recíproca (Q→P), não aplicar modus tollens (¬Q→¬P), e aceitar conclusões mais fracas quando a lógica permite uma mais forte. Regras essenciais: contrapositiva é sempre equivalente à proposição original; modus tollens encadeia negações de trás para frente.',
    problem: 'A intuição frequentemente leva à conclusão errada. Se "todo gestor joga xadrez", a tentação é concluir "quem joga xadrez é gestor" — mas isso é a recíproca, não necessariamente verdadeira. O modus tollens é o antídoto: use a negação do consequente para negar o antecedente.',
    solution: 'Para qualquer cadeia P→Q→R com ¬R dado: aplicar modus tollens de trás para frente. ¬R→¬Q→¬P. Para enfraquecimento de argumento: apresentar um contraexemplo direto à premissa central. Para contrapositiva: P→Q equivale exatamente a ¬Q→¬P.',
    tip: 'Modus tollens em cadeia: se a contratação não aconteceu (¬C), então a verba não foi liberada (¬V), então o plano não foi aprovado (¬P). Sempre trabalhe de trás para frente com as negações.',
    questions: [
      {
        q: 'O argumento diz: "Se participou da reunião, então foi convidado." Qual afirmação enfraquece esse argumento?',
        a: '✅ "Um colaborador participou de uma reunião sem convite prévio." — contraexemplo direto que quebra a premissa universal P→C. ❌ "Alguns recusaram convites" = fala de C→não participou, não afeta a regra. ❌ "Todos os convidados participaram" = fala do sentido inverso (C→P), não contradiz P→C.'
      },
      {
        q: 'Plano→Verba→Contratação. Dado: contratação não foi feita. O que é necessariamente verdadeiro?',
        a: '✅ "O plano não foi aprovado." — modus tollens em cadeia: ¬Contratação → ¬Verba → ¬Plano. ❌ "Não é possível concluir" = errado, a lógica permite conclusão certa. ❌ "A verba não foi liberada" = verdade mas é só o primeiro passo; a conclusão completa é mais forte.'
      },
      {
        q: '"Nenhum líder eficaz ignora o impacto emocional." Qual situação viola essa premissa?',
        a: '✅ João é líder e ignora o impacto emocional — contraexemplo direto à regra universal. ❌ Pedro (colaborador que ignora) = não é líder, fora do escopo. ❌ André (líder que reconhece mas não age) = reconhece o impacto, não ignora — não viola a premissa.'
      },
      {
        q: 'Cadeia: Marta presente→Pedro presente→Tiago avisado→Laura recusou ir. Dado: Laura estava presente e Marta ausente. O que é verdadeiro?',
        a: '✅ Tiago não foi avisado. Raciocínio: Laura presente contradiz "Tiago avisado→Laura ausente", logo ¬Tiago avisado. Por consequência, ¬Pedro presente. ❌ "Pedro estava presente" = modus tollens prova o contrário. ❌ "Marta mentiu" = sem base lógica alguma no problema.'
      },
      {
        q: 'Gestor→Xadrez→Formação em lógica. Alguns com formação em lógica não são gestores. O que é correto afirmar?',
        a: '✅ "Quem não joga xadrez não é gestor." — contrapositiva direta de Gestor→Xadrez, logicamente equivalente. ❌ "Todos com lógica são gestores" = a premissa 3 contradiz diretamente. ❌ "Existem jogadores de xadrez que não são gestores" = não pode ser derivado com certeza.'
      }
    ],
    code: `// Regras fundamentais de lógica proposicional

// 1. MODUS PONENS (afirmação da antecedente)
P → Q
P
∴ Q

// 2. MODUS TOLLENS (negação da consequente)
P → Q
¬Q
∴ ¬P

// 3. CONTRAPOSITIVA (sempre equivalente)
P → Q   ≡   ¬Q → ¬P
// Exemplo: "Todo gestor joga xadrez"
// ≡ "Quem não joga xadrez não é gestor"

// 4. ENFRAQUECIMENTO DE ARGUMENTO
// Para enfraquecer "Se P então Q":
// → Apresentar caso em que P ocorre mas Q não (contraexemplo)

// 5. CADEIA LÓGICA COM MODUS TOLLENS
P → Q → R → S
¬S dado
∴ ¬R (modus tollens)
∴ ¬Q (modus tollens)
∴ ¬P (modus tollens)
// Sempre trabalhe de trás para frente com ¬

// ARMADILHAS COMUNS:
// Recíproca: P→Q NÃO implica Q→P
// Inversa:   P→Q NÃO implica ¬P→¬Q
// Contrapositiva: P→Q SIM implica ¬Q→¬P ✅`
  },

  {
    id: 102,
    emoji: '📊',
    title: 'Lógica — Análise de Texto e Inferência',
    level: 'Corporativo',
    color: '#818cf8',
    summary: 'Inferências válidas, falácia de causa falsa, correlação vs causalidade e desvirtuar texto.',
    definition: 'Questões de análise de texto testam se você distingue o que o texto diz do que você quer que ele diga. As armadilhas: absolutizar o que é probabilístico ("pode" vira "sempre"), inverter relação causal (correlação vira causa), e confundir "não é o único fator" com "é irrelevante". A chave: inferência válida = pode ser derivada sem forçar; inferência inválida = extrapola ou contradiz o texto.',
    problem: 'Post hoc ergo propter hoc ("depois disso, logo por causa disso") é a falácia mais comum: dois eventos simultâneos viram causa-efeito. Outra armadilha: "pode sinalizar" vira "sempre significa" — a quantificação universal mata inferências probabilísticas.',
    solution: 'Para identificar a falácia de causa falsa: procure onde o texto diz correlação e a alternativa diz causalidade. Para inferência inválida: procure onde o texto usa linguagem probabilística ("pode", "tende", "em média") e a alternativa usa linguagem absoluta ("sempre", "garante", "determina").',
    tip: 'Fique atento aos advérbios: "pode" ≠ "sempre". "Em média" ≠ "em todos os casos". "Tende a" ≠ "garante". Qualquer alternativa que transforma linguagem probabilística em absoluta está errada.',
    questions: [
      {
        q: 'Texto: "Produtividade não é medida pelo número de horas, mas pela atenção plena em tarefas de maior impacto." Qual frase desvirtua o texto?',
        a: '✅ "Trabalhar muitas horas pode aumentar a produtividade." — reintroduz as horas como fator determinante, exatamente o que o texto nega. O "pode" é a armadilha que soa moderado mas ainda coloca horas como variável de aumento. ❌ As demais são paráfrases fiéis da ideia central.'
      },
      {
        q: 'Texto: "Ausência de conflito pode sinalizar ausência de diversidade cognitiva." Qual inferência NÃO pode ser feita?',
        a: '✅ "Ausência de conflito é sempre um bom sinal de alinhamento." — viola duas coisas: (1) o texto usa "pode" (probabilístico), não "sempre" (absoluto); (2) o texto trata ausência de conflito como possível sinal negativo, não positivo. ❌ As demais são corolários válidos do texto.'
      },
      {
        q: 'Texto: "Cultura de inovação é medida pela velocidade de descartar ideias ruins, não pela quantidade gerada." Qual é a inferência mais válida?',
        a: '✅ "O sucesso está na filtragem, não na quantidade." — paráfrase precisa da essência do texto. ❌ "Evitar ideias ruins desde o início" = o texto fala em descartar rapidamente, não em evitar gerar. ❌ "Quantidade é irrelevante" = o texto diz que não é a medida, não que é irrelevante — generalização excessiva.'
      },
      {
        q: 'Texto: entregas subiram e percepção de produtividade caiu; causa provável: fatores subjetivos. Qual afirmação é falácia de causa falsa?',
        a: '✅ "A percepção de produtividade caiu porque o volume de entregas aumentou." — pega dois eventos correlacionados e cria causalidade direta e invertida. O texto diz que a causa é outra (fatores subjetivos). É o clássico post hoc: A e B aconteceram juntos, logo A causou B. ❌ As demais são inferências válidas do texto.'
      },
      {
        q: 'Texto: empresas com programas de desenvolvimento têm em média maior retenção, mas existência do programa não garante resultado. Qual interpreta corretamente?',
        a: '✅ "O uso efetivo do programa pode estar associado à retenção." — respeita a linguagem probabilística ("pode") e captura o ponto central: não é o programa em si, é o uso efetivo. ❌ "Ter um programa é suficiente para garantir retenção" = o texto nega explicitamente. ❌ "Empresas sem programa retêm menos" = generalização absoluta não suportada.'
      }
    ],
    code: `// Checklist para análise de texto em provas

// 1. MAPEIE A LINGUAGEM DO TEXTO
  "pode"        → probabilístico, não absoluto
  "tende a"     → tendência, não garantia
  "em média"    → média, não todos os casos
  "sugere"      → hipótese, não conclusão

// 2. ELIMINE ALTERNATIVAS QUE ABSOLUTIZAM
  Texto: "pode sinalizar X"
  ❌ "sempre significa X"
  ❌ "garante X"
  ❌ "é X" (sem qualificador)

// 3. IDENTIFIQUE FALÁCIA DE CAUSA FALSA
  Texto: A e B ocorreram juntos (correlação)
  ❌ "A causou B" → posta hoc ergo propter hoc
  ❌ "B causou A" → também falso
  ✅ "A pode estar associado a B" → inferência válida

// 4. CONFIRA A DIREÇÃO DA CAUSALIDADE
  Se o texto diz "causa provável = C"
  ❌ qualquer alternativa que substitua C por outra causa
  ❌ qualquer alternativa que diga que A (mero evento) causou B

// 5. TESTE CADA ALTERNATIVA
  "O texto diz isso explicitamente?"
  "É corolário direto e necessário?"
  "Extrapola ou contradiz algum elemento?"
  Se sim a 1 ou 2 → válida. Se sim a 3 → inválida.`
  },

  {
    id: 103,
    emoji: '🔢',
    title: 'Raciocínio Quantitativo — Proporcionalidade e Equações',
    level: 'Corporativo',
    color: '#818cf8',
    summary: 'Crescimento composto, proporção inversa, sistema de equações, taxa combinada e geometria.',
    definition: 'Questões quantitativas em processos seletivos cobrem: equações simultâneas (pontuação com acertos e erros), crescimento composto (faturamento com % ao ano), proporção inversa (distribuição de bônus inversamente proporcional a erros), taxa combinada (times trabalhando em paralelo), e geometria aplicada (área de figuras combinadas). A pegadinha mais frequente no crescimento composto é errar o expoente por confundir "no 4º ano" com "após 4 anos".',
    problem: 'Erros típicos: no crescimento composto, usar expoente 4 em vez de 3 (o ano 1 já é a base). Na proporção inversa, usar os valores diretamente em vez de invertê-los como pesos. Na taxa combinada, tentar calcular ritmo conjunto em vez de somar entregas independentes.',
    solution: 'Crescimento composto: valor × (1 + taxa)^n onde n = número de períodos de crescimento (não o ano final). Proporção inversa: quem tem mais erros recebe menos — os pesos são os valores trocados. Taxa combinada em paralelo: basta somar as entregas individuais no período.',
    tip: 'No crescimento composto, se "valor no 4º ano" com crescimento anual: n=3 (cresceu no ano 2, 3 e 4). O primeiro valor já é o ano 1. Essa é a armadilha mais frequente.',
    questions: [
      {
        q: 'Times A (1 projeto/4 dias), B (1/6 dias), C (1/8 dias). Trabalhando em paralelo, quantos projetos completam em 24 dias?',
        a: '✅ 13 projetos. A: 24÷4=6, B: 24÷6=4, C: 24÷8=3. Total: 6+4+3=13. Como trabalham em paralelo, basta somar as entregas independentes — sem cálculo de ritmo conjunto.'
      },
      {
        q: 'Prova com 8 questões: +5 pontos por acerto, -3 por erro. João fez 16 pontos. Quantas errou?',
        a: '✅ 3 erros. Sistema: c+e=8 e 5c-3e=16. Substituindo: 5(8-e)-3e=16 → 40-8e=16 → e=3. Verificação: 5×5=25, 3×3=9, 25-9=16 ✅'
      },
      {
        q: 'Faturamento R$1M, crescimento composto de 50% ao ano. Qual o valor no 4º ano?',
        a: '✅ R$3.375.000. Fórmula: 1.000.000 × (1,5)³ = 3.375.000. O expoente é 3 (não 4) porque o ano 1 já é a base — o crescimento ocorre nos anos 2, 3 e 4. Armadilha clássica: usar (1,5)⁴.'
      },
      {
        q: 'Bônus de R$120k distribuído inversamente proporcional aos erros: X=15 erros, Y=9, Z=6. Quanto Z recebe?',
        a: '✅ R$60.000. Proporção inversa: pesos = valores trocados. X=6, Y=9, Z=15. Total: 30. Z=15/30 × 120.000 = R$60.000. Verificação: X=R$24k, Y=R$36k, Z=R$60k → total R$120k ✅'
      },
      {
        q: 'Quadrado com área 36cm². Retângulo com comprimento=3×lado do quadrado e altura=lado. Qual a área total?',
        a: '✅ 144 cm². Lado do quadrado: √36=6cm. Retângulo: 18×6=108cm². Total: 36+108=144cm².'
      }
    ],
    code: `// Fórmulas essenciais para raciocínio quantitativo

// CRESCIMENTO COMPOSTO
valor_final = valor_inicial × (1 + taxa)^n
// onde n = número de PERÍODOS de crescimento
// "No 4º ano" com base no ano 1 → n = 3

// PROPORÇÃO INVERSA
// Quem tem MAIS de X recebe MENOS
// Pesos = valores TROCADOS
// Ex: erros [15, 9, 6] → pesos inversos [6, 9, 15]
// Participação = peso_próprio / soma_pesos

// TAXA COMBINADA EM PARALELO
// Times independentes: SOMAR entregas individuais
// A: 24÷4=6, B: 24÷6=4, C: 24÷8=3 → total=13
// NÃO calcular ritmo conjunto

// SISTEMA 2×2 (acertos e erros)
// c + e = total_questões
// pontos_certo × c - pontos_errado × e = pontuação
// Resolver por substituição

// GEOMETRIA COMBINADA
// Área total = soma das áreas individuais
// Quadrado: lado² | Retângulo: base × altura
// Triângulo: (base × altura) / 2
// Círculo: π × r²

// PEGADINHAS FREQUENTES:
// ❌ Crescimento composto: expoente = ano final (use períodos)
// ❌ Proporção inversa: usar valores diretos como pesos
// ❌ Taxa combinada: calcular ritmo conjunto em vez de somar`
  },
]

const all = [...existing, ...newConcepts]
writeFileSync('./src/data/concepts.json', JSON.stringify(all, null, 2))
console.log('Total:', all.length)
console.log('New:', newConcepts.map(c => `${c.id}: ${c.title} [${c.level}]`).join('\n'))
