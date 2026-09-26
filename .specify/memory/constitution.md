<!--
Sync Impact Report
- Version change: 1.2.0 → 1.2.1 (PATCH — clarifica o escopo da Fase 1 sem mudar a ordem das fases)
- Modified principles:
  VI. Entrega Incremental por Fases: novo item explicita que o núcleo de personagem da Fase 1
  abrange todo o conteúdo de criação da 7.7a — 16 raças (cap. 4), 9 exaltações (cap. 5, inclusive
  Wraith e Dragonblooded, antes do Book 2) e Exalted Assets (cap. 7) — e que a Fase 2 fica com as
  opções que ampliam esse núcleo. Origem: decisão do usuário em 2026-09-25 na feature
  004-exaltation-compendium (Constitution Check do plan.md).
- Artefatos afetados: specs/004-exaltation-compendium/plan.md (item VI do Constitution Check passa
  de "⚠️ justificado" a ✅ — ajustar fora desta emenda).
- Histórico 1.1.0 → 1.2.0 (MINOR — muda materialmente a fonte de regras do princípio I):
- Modified principles:
  I. Fidelidade às Regras: fonte de verdade passa de "1.6 + Book 2 v2.2" para **DtD 7.7a**;
  diferenças registradas em docs/comparativo-7.7a.md; contradições referenciadas ao §11 do
  comparativo. VI. Entrega Incremental: fases redescritas sem referência a 1.6/Book 2 (a 7.7a é
  um livro único). Cabeçalho do documento atualizado. Origem: decisão do usuário em 2026-09-25.
- Histórico 1.0.1 → 1.1.0 (MINOR):
  II. Arquitetura Nativa do Foundry (v13+): alvo deixa de ser "a versão estável mais recente"
  (hoje v14) e passa a ser fixo em v13, versão usada pela mesa (13.351); migração futura exige
  feature própria + emenda. Origem: decisão do usuário em 2026-09-25.
- Histórico 1.0.0 → 1.0.1 (PATCH):
  II. Arquitetura Nativa do Foundry (v13+): a regra de rolagem deixa de exigir a fórmula
  `Xd10x10kY` (incorreta: o `x` do Foundry não compõe explosões) e passa a exigir `Roll` do
  Foundry para chat/Dice So Nice com a semântica Roll & Keep no motor puro.
  Origem: specs/001-system-foundation/research.md R2 e /speckit-analyze (achado C1).
- Added sections: nenhuma
- Removed sections: nenhuma
- Templates: .specify/templates/* não modificados (leem a constituição em runtime)
- Deferred TODOs: nenhum
-->

# DtD40K-foundryvtt Constitution

Sistema de jogo (game system) para Foundry VTT do RPG *Dungeons the Dragoning* — versão **7.7a**
(livro único que reúne o livro base e o *Book 2: For a Few Subtitles More*).

## Core Principles

### I. Fidelidade às Regras

- A fonte de verdade das regras é o livro **DtD 7.7a**. `docs/comparativo-7.7a.md` registra o que
  mudou em relação à análise anterior (`docs/analise-dtd.md`, escrita sobre a 1.6 + Book 2 v2.2);
  quando os dois divergirem, prevalece a 7.7a. Toda fórmula, tabela ou procedimento implementado
  MUST citar a seção/página da 7.7a na spec.
- Contradições do livro (ver §11 do comparativo) MUST ser resolvidas por decisão explícita
  registrada na spec ou em `docs/decisoes/`, nunca silenciosamente no código.
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

- Ordem de entrega: Fase 1 núcleo (personagem, rolagem, combate, magia, escolas marciais) →
  Fase 2 demais opções de personagem nos moldes existentes → Fase 3 veículos e naves. Uma fase
  só inicia com a anterior utilizável.
- O núcleo de personagem da Fase 1 inclui todo o conteúdo de criação de personagem da 7.7a:
  as 16 raças do cap. 4, as 9 exaltações do cap. 5 (inclusive Wraith e Dragonblooded) e os
  Exalted Assets do cap. 7 — ainda que parte venha do antigo *Book 2*. A Fase 2 cobre as opções
  que ampliam esse núcleo sem ser necessárias para criar um Herói (ex.: classes e escolas extras,
  Gun Kata).
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

**Version**: 1.2.1 | **Ratified**: 2026-09-24 | **Last Amended**: 2026-09-25
