<!--
Sync Impact Report
- Version change: 1.1.0 → 1.2.0 (MINOR — muda materialmente a fonte de regras e o escopo das fases)
- Modified principles:
  I. Fidelidade às Regras: a fonte de verdade passa a ser o livro DtD 7.7a ("Ready to Print"),
  sétima revisão que já une o livro base 1.6 e o Book 2; 1.6 e Book 2 viram referência histórica.
  VI. Entrega Incremental por Fases: Fase 1 = núcleo da 7.7a, incluindo as 16 raças do cap. 4
  (Dryad, Kenku, Kobold e Thri-Kreen, antes do Book 2, entram na Fase 1); Fase 2 = demais
  conteúdos oriundos do Book 2; Fase 3 = veículos e naves.
  Origem: decisão do usuário em 2026-09-25, após comparação 1.6 × 7.7a.
- Added sections: nenhuma
- Removed sections: nenhuma
- Artefatos afetados (ajustar em seguida, fora desta emenda):
  specs/001-system-foundation — na 7.7a, Athletics usa Strength (era Constitution) e Acrobatics
  passa a Básica (era Avançada); HP = 2×(Con+Wil) e Arcana Básica confirmados.
  specs/002-race-compendium — 6 poderes raciais mudaram (Dark Eldarin, Dragonborn, Elf, Gnome,
  Ork, Tau), páginas passam para a 7.7a (pp. 30–63) e entram 4 raças (Dryad, Kenku, Kobold,
  Thri-Kreen).
  docs/analise-dtd.md — síntese ainda baseada na 1.6 + Book 2; revisar para a 7.7a.
- Templates: .specify/templates/* não modificados (leem a constituição em runtime)
- Deferred TODOs: nenhum
-->

# DtD40K-foundryvtt Constitution

Sistema de jogo (game system) para Foundry VTT do RPG *Dungeons the Dragoning* — revisão **7.7a**
("Ready to Print"), que une o livro base 1.6 e o suplemento *Book 2: For a Few Subtitles More*.

## Core Principles

### I. Fidelidade às Regras

- A fonte de verdade das regras é o livro **DtD 7.7a**, sintetizado em `docs/analise-dtd.md`.
  Toda fórmula, tabela ou procedimento implementado MUST citar a seção/página da 7.7a na spec.
  O livro 1.6 e o Book 2 ficam apenas como referência histórica (ex.: para rastrear mudanças).
- Contradições do livro (ver §21 da análise) MUST ser resolvidas por decisão explícita registrada
  na spec ou em `docs/decisoes/`, nunca silenciosamente no código.
- Variantes e house rules MUST ser opções configuráveis (world settings), com o comportamento do
  livro como padrão.

**Racional**: o livro tem contradições internas e tabelas corrompidas na extração; decisões
rastreáveis evitam regras "inventadas" e retrabalho.

### II. Arquitetura Nativa do Foundry (v13+)

- Alvo mínimo e verificado: Foundry VTT **v13** (versão usada pela mesa). Migrar para uma
  geração mais nova MUST ser uma feature própria, com emenda desta regra.
- Dados de Actors/Items MUST usar `TypeDataModel` com schema declarado; derivados MUST ser
  calculados em `prepareDerivedData`, nunca persistidos.
- Interfaces MUST usar ApplicationV2 / HandlebarsApplicationMixin. É proibido jQuery e APIs
  marcadas como deprecated na versão alvo.
- Modificadores persistentes MUST usar Active Effects. Rolagens MUST produzir objetos `Roll` do
  Foundry (com a fonte aleatória do core) para mensagens de chat e Dice So Nice; a semântica
  Roll & Keep (explosão composta, conversão acima de 10 dados, manter os maiores) MUST viver no
  motor de regras puro (princípio III), pois o modificador `x` do Foundry não compõe explosões.

**Racional**: APIs nativas reduzem manutenção a cada nova versão do Foundry e mantêm
compatibilidade com módulos da comunidade.

### III. Lógica de Regras Pura e Testada

- A lógica de regras (roller Roll & Keep, conversão acima de 10 dados, raises/checks, fórmulas
  derivadas, cálculo de dano/Resilience, validador de compra de XP, custos) MUST viver em módulos
  JavaScript puros, sem dependência de globais do Foundry.
- Todo módulo puro MUST ter testes unitários (Vitest) cobrindo os exemplos numéricos do livro
  e os casos-limite; testes MUST passar antes do merge.
- UI e integração com o Foundry são validadas por roteiro de teste manual descrito na spec.

**Racional**: as regras são o núcleo de valor e o ponto mais sujeito a regressão; isolá-las
permite testar sem subir o Foundry.

### IV. Automação Pragmática com Controle do Mestre

- Automatizar o que é determinístico (fórmulas, rolagens, dano, contadores, condições).
- Efeitos narrativos ou de julgamento do Mestre (stunts, efeitos de Phenomena/Perils, combate
  social, backgrounds) MUST ser oferecidos como botões, toggles ou campos manuais, não como
  automação obrigatória.
- Todo valor automatizado MUST poder ser sobrescrito manualmente pelo Mestre.

**Racional**: grande parte de DtD é narrativa; automação excessiva gera bugs e engessa a mesa.

### V. Conteúdo como Dados, Sem Texto Integral

- Compêndios MUST ter fonte versionada em texto (JSON/YAML em `src/packs/`) e ser compilados
  para LevelDB via Foundry CLI; os packs binários não são editados à mão.
- Entradas MUST conter os dados mecânicos completos e uma descrição **resumida com redação
  própria**; é proibido copiar o texto integral do livro.
- Tabelas marcadas como corrompidas na análise MUST ser conferidas manualmente no PDF antes de
  entrar em um compêndio.

**Racional**: respeita os direitos do autor da obra de fã e mantém o conteúdo revisável por diff.

### VI. Entrega Incremental por Fases

- Ordem de entrega: Fase 1 núcleo da 7.7a (inclui as 16 raças do cap. 4, também Dryad, Kenku,
  Kobold e Thri-Kreen, que vinham do Book 2) → Fase 2 demais conteúdos oriundos do Book 2
  (exaltações, classes e escolas extras, Gun Kata etc.) nos moldes existentes → Fase 3 veículos e
  naves (§23 da análise). Uma fase só inicia com a anterior utilizável.
- Cada feature MUST ser entregável e utilizável de forma independente dentro do Foundry.
- Estruturas reutilizáveis MUST ser preferidas a duplicação (ex.: um único `martialSchool`
  para Sword Schools e Gun Kata).
- YAGNI: não implementar sistemas de fases futuras antecipadamente.

**Racional**: o escopo total é grande; entregas pequenas mantêm o sistema jogável desde cedo.

## Restrições Técnicas

- Linguagem: JavaScript ESM com JSDoc; sem etapa de build obrigatória para rodar o sistema.
  Ferramentas de desenvolvimento (Vitest, ESLint, Foundry CLI) via `npm`.
- Estilos: CSS puro (pré-processador opcional apenas se justificado na spec).
- Internacionalização: todo texto de interface MUST usar chaves i18n (`DTD.*`); idiomas
  `pt-BR` e `en` mantidos em paralelo.
- Identificadores de código, chaves de dados e nomes de arquivos em inglês; nomes de regras
  seguem o termo original do livro (ex.: `staticDefense`, `heroPoints`).
- Manifesto `system.json` MUST declarar `compatibility.minimum` e `compatibility.verified`.

## Fluxo de Desenvolvimento

- Features seguem o fluxo Spec Kit: `/speckit-specify` → `/speckit-clarify` (quando houver
  ambiguidade) → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
- Specs, planos e documentação em português; código e comentários em inglês.
- Commits no padrão Conventional Commits; trabalho em branch de feature, nunca direto na `main`.
- Após alterar código, rodar `graphify update .` para manter o grafo de conhecimento atualizado.
- Todo PR MUST: passar nos testes unitários, cumprir o roteiro de teste manual da spec e
  declarar conformidade com esta constituição.

## Governance

- Esta constituição prevalece sobre outras práticas do projeto. Specs e planos que conflitem
  com ela MUST justificar a exceção na seção de complexidade do plano ou ser ajustados.
- Emendas: proposta via `/speckit-constitution`, com Sync Impact Report, aprovação de
  quem mantém o projeto e atualização da versão.
- Versionamento semântico: MAJOR para remoção/redefinição de princípios; MINOR para novo
  princípio ou seção; PATCH para clarificações de redação.
- Revisão de conformidade: verificada no `/speckit-plan` (Constitution Check) e em cada PR.

**Version**: 1.2.0 | **Ratified**: 2026-09-24 | **Last Amended**: 2026-09-25
