# Implementation Plan: Backing e Inheritance no montador de personagem

**Branch**: `027-builder-backing-inheritance` | **Date**: 2026-10-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/027-builder-backing-inheritance/spec.md`

## Summary

O assistente da 023 ganha as duas partes dos Backgrounds que ficaram para a ficha:
- **Backing**: lista de organizações (nome e pontos) no passo Backgrounds, no mesmo molde da lista de Artifacts; os
  pontos entram na conta de `validateBackgrounds`; ao concluir, cada uma vira um Backing por `addInstance` e
  `raiseBackground`, os mesmos serviços da ficha.
- **Inheritance**: lista de itens do compêndio no passo Equipamento; uma regra pura nova conta os itens por raridade e
  usa `inheritanceFits` (011) para avisar quando passam da nota; ao concluir, a contagem vai para
  `system.backgrounds.inheritancePicks` e os itens entram como escolhas iniciais, que a ficha já aceita a mais pela
  Inheritance (`startingSlots`, 011).

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc; Handlebars; CSS (tokens da 021)

**Primary Dependencies**:
- assistente da 023/026 (`character-builder.mjs`, `step.hbs`, `builder.css`, `builder-service.mjs`);
- regras da 011 (`rules/backgrounds.mjs`: `inheritanceFits`, `INHERITANCE_SLOTS`) e da 007 (`rules/acquisition.mjs`);
- serviços da ficha (`addInstance`, `raiseBackground`, `addEquipment`);
- Vitest, ESLint.

**Storage**: rascunho do assistente (flag do usuário): campos novos `backings: [{name, value}]` e
`inheritance: [{uuid}]`, com padrão vazio (a versão do rascunho continua 1).

**Testing**: Vitest (`builder.test.mjs`: Backing na conta dos Backgrounds, contagem e aviso da Inheritance, plano);
roteiro em [quickstart.md](quickstart.md).

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: sem atraso perceptível (contas pequenas sobre documentos já em memória)

**Constraints**:
- sem campo novo na ficha (usa `backings` e `inheritancePicks` da 011);
- o XP mostrado no montador igual ao registrado na ficha;
- rascunhos antigos válidos;
- textos fixos em pt-BR e en.

**Scale/Scope**:
- 1 regra pura nova e uma extensão de `validateBackgrounds` e `buildPlan`;
- 2 passos do assistente (Backgrounds, Equipamento) e 2 passos do plano de conclusão;
- ~8 chaves i18n.

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Custo do Backing pela regra dos Backgrounds (pp. 15–16); Inheritance pela tabela da p. 282, já implementada na 011 | ✅ |
| II. Nativo v13 | ApplicationV2 existente; serviços da ficha; sem APIs novas | ✅ |
| III. Pura e testada | Contagem da Inheritance e conta do Backing em `rules/`, com testes | ✅ |
| IV. Automação pragmática | Aviso que bloqueia o passo com liberação do Mestre, como nos demais | ✅ |
| V. Conteúdo como dados | Itens do compêndio de equipamento; nenhum dado novo | ✅ |
| VI. Incremental | Fecha dois itens da seção 3 das pendências (023) | ✅ |
| Restrições | i18n pt-BR/en, design system 021 | ✅ |

**Re-check pós-design**: todos se mantêm.

## Project Structure

### Documentation (this feature)

```text
specs/027-builder-backing-inheritance/
├── plan.md, research.md, data-model.md, quickstart.md
├── contracts/builder.md
├── checklists/requirements.md
└── tasks.md            # /speckit-tasks
```

### Source Code (repository root)

```text
module/rules/builder.mjs               # validateBackgrounds com backings; inheritanceItems; buildPlan
module/documents/builder-service.mjs   # blankDraft; applyPlan (backings, picks, itens herdados)
module/apps/character-builder.mjs      # #validate e #stepView dos dois passos; ações add/remove
templates/apps/builder/step.hbs        # seções Backing e Inheritance
styles/builder.css                     # ajustes das listas
lang/{en,pt-BR}.json                   # rótulos e avisos
tests/unit/builder.test.mjs            # casos novos
docs/pendencias.md                     # 023: Backings e picks de Inheritance saem do texto
```

**Structure Decision**: projeto único; mudanças restritas ao assistente e às suas regras puras.

## Complexity Tracking

Nenhuma violação.
