# Implementation Plan: Fundação do Sistema DtD (personagem + Roll & Keep)

**Branch**: `001-system-foundation` | **Date**: 2026-09-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-system-foundation/spec.md`

## Summary

Criar o sistema Foundry `dtd40k` instalável no Foundry v13, com o ator `character` (9 características,
27 perícias com especialidades, derivados calculados com bônus/override), ficha ApplicationV2
editável e testes de perícia/característica Roll & Keep com diálogo e cartão no chat.
A decisão técnica central (research R2): a semântica Roll & Keep — explosão composta, conversão
acima de 10 dados, característica 0, rerrolagem de 1s — vive num **motor puro testado** com
gerador injetável; o Foundry recebe um `Roll` já avaliado só para chat e Dice So Nice, porque o
modificador `x` do Foundry não compõe a explosão no mesmo dado.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc; sem build

**Primary Dependencies**: Foundry VTT v13 (API core: TypeDataModel, ActorSheetV2 +
HandlebarsApplicationMixin, DialogV2, Roll/ChatMessage). Dev: Vitest, ESLint

**Storage**: documentos do Foundry (Actor `system` via TypeDataModel); sem compêndios nesta feature

**Testing**: Vitest (ambiente node) para `module/rules/**` e `module/config.mjs`; roteiro manual
em [quickstart.md](quickstart.md) para UI/integração

**Target Platform**: Foundry VTT v13 (minimum 13, verified 13; testado no 13.351), navegadores suportados pelo Foundry

**Project Type**: game system (pacote Foundry) — projeto único

**Performance Goals**: rolagem + mensagem de chat em < 1 s; ficha abre em < 1 s com 27 perícias

**Constraints**: sem jQuery nem APIs depreciadas do v13; visibilidade via `rollMode` (API do v13);
lógica de regras sem globais do Foundry; interface pt-BR e en

**Scale/Scope**: 1 tipo de ator, ficha híbrida A+C com modos edição/jogo, 9 características, 27 perícias, 6 derivados, 1 diálogo,
1 cartão de chat; ~15 arquivos de código

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade às Regras | Fórmulas citam `docs/analise-dtd.md` e páginas; contradições HP/Arcana decididas na seção Clarifications da spec | ✅ |
| II. Arquitetura Nativa (v13+) | TypeDataModel, derivados em `prepareDerivedData`, ActorSheetV2/DialogV2, sem jQuery, `rollMode` do v13; `Roll` do Foundry para chat/DSN com semântica R&K no motor puro (constituição v1.0.1) | ✅ |
| III. Lógica Pura e Testada | `module/rules/*` sem globais Foundry, gerador injetável, casos obrigatórios em contracts/rules-api.md | ✅ |
| IV. Automação Pragmática | Especialidade e stunt dice marcados manualmente; override/bônus em todo derivado | ✅ |
| V. Conteúdo como Dados | Nenhum compêndio nesta feature; descrições de perícias com redação própria | ✅ (N/A parcial) |
| VI. Entrega Incremental | Feature 1 da Fase 1, usável sozinha; combate/raças/XP fora de escopo | ✅ |
| Restrições técnicas | JS ESM + JSDoc, CSS puro, i18n `DTD.*` pt-BR/en, ids em inglês, `compatibility` no manifesto | ✅ |

**Re-check pós-design (Phase 1)**: data-model, contratos e quickstart mantêm todos os itens;
nenhuma violação nova.

## Project Structure

### Documentation (this feature)

```text
specs/001-system-foundation/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── rules-api.md     # API dos módulos de regras puros
│   └── foundry-api.md   # Manifesto, API do ator, diálogo, mensagem de chat, i18n
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
system.json                     # manifesto
dtd40k.mjs                      # entrada: hooks init/ready, registro de modelos/fichas/config
module/
├── config.mjs                  # PURO: CHARACTERISTICS, SKILLS, grupos, DERIVED_KEYS
├── rules/                      # PURO (Vitest)
│   ├── pool.mjs                # normalizePool, buildSkillPool, buildCharacteristicPool, applyModifiers
│   ├── dice.mjs                # rollAndKeep (motor com rng injetável)
│   ├── results.mjs             # evaluateOutcome (raises/checks)
│   ├── derived.mjs             # computeDerived
│   ├── sheet.mjs               # buildDots, nextDotValue, filterSkills, sanitizeDerivedMods (ficha híbrida)
│   └── test.mjs                # runTest (orquestração)
├── data/
│   └── character-data.mjs      # TypeDataModel do ator character
├── documents/
│   └── actor.mjs               # DtdActor: _preCreate, rollSkill, rollCharacteristic
├── dice/
│   └── roll-service.mjs        # adaptador Foundry: rng = CONFIG.Dice.randomUniform, Roll p/ DSN, ChatMessage
└── apps/
    ├── character-sheet.mjs     # ActorSheetV2 + HandlebarsApplicationMixin
    └── roll-dialog.mjs         # DialogV2
templates/
├── actor/parts/                # header (sticky), characteristics (grade 3×3), skills, footer, specialties
├── dialog/roll-dialog.hbs
└── chat/roll-card.hbs
styles/dtd40k.css
lang/
├── en.json
└── pt-BR.json
tests/unit/
├── pool.test.mjs
├── dice.test.mjs
├── results.test.mjs
├── derived.test.mjs
├── sheet.test.mjs
├── config.test.mjs
└── test.test.mjs
package.json                    # devDependencies: vitest, eslint, @eslint/js, globals
vitest.config.mjs
eslint.config.mjs
```

**Structure Decision**: projeto único no formato de pacote de sistema Foundry, com separação
estrita entre `module/rules/` + `module/config.mjs` (puros, testados) e as camadas que tocam o
Foundry (`data/`, `documents/`, `dice/`, `apps/`). A raiz do repositório é a pasta do sistema,
permitindo link simbólico direto em `Data/systems/dtd40k`.

## Complexity Tracking

Nenhuma violação ativa. A divergência inicial com o princípio II (fórmula `Xd10x10kY`) foi
resolvida pela emenda PATCH da constituição para **v1.0.1** em 2026-09-24 (achado C1 do
`/speckit-analyze`; fundamento em research.md R2).
