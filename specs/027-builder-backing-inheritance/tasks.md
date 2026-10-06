---

description: "Task list for 027-builder-backing-inheritance"
---

# Tasks: Backing e Inheritance no montador de personagem

**Input**: Design documents from `specs/027-builder-backing-inheritance/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/builder.md, quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 Backing, US2 Inheritance (ambas P1; US1 primeiro por ser menor).

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-027`

---

## Phase 1: Foundational

- [X] T001 [P] `tests/unit/builder.test.mjs` e `tests/unit/backgrounds.test.mjs`: casos de [contracts/builder.md](contracts/builder.md) (Backing na conta, `unnamedBacking`, `inheritanceItems` com notas 0–2, artefato, igualdade com `inheritanceFits`, `buildPlan` só com itens herdados, `inheritanceUsed`); confirmar que falham
- [X] T002 `module/rules/backgrounds.mjs`: extrair `inheritanceUsed(picks)` de `inheritanceFits` (mesmo comportamento)
- [X] T003 `module/documents/builder-service.mjs`: `blankDraft` com `backings: []` e `inheritance: []`
- [X] T004 [P] i18n (en, pt-BR): `DTD.Builder.Backings`, `AddBacking`, `Inheritance`, `InheritanceUse`, `AddInheritance`, `Reason.inheritanceOver`, `Reason.artifact` (se faltar), `Warning.unnamedBacking`

---

## Phase 2: User Story 1 — Backing (P1) 🎯 MVP

- [X] T005 [US1] `module/rules/builder.mjs`: `validateBackgrounds` com `backings` (pontos na conta, aviso `unnamedBacking`); testes do T001 de Backing passam
- [X] T006 [US1] `character-builder.mjs`: `#state`/`#validate` passam `draft.backings`; `#stepView("backgrounds")` com a lista e o texto `DTD.Background.backing.hint`; ações `addBacking`/`removeBacking`; `#onField` para `backings.<i>.name|value`
- [X] T007 [US1] `step.hbs`: seção Backing abaixo de Artifact (mesmo HTML da lista de Artifacts)
- [X] T008 [US1] `applyPlan` (passo `backgrounds`): cada Backing com nome → `addInstance("backing")` + `raiseBackground` até os pontos

---

## Phase 3: User Story 2 — Inheritance (P1)

- [X] T009 [US2] `module/rules/builder.mjs`: `inheritanceItems({ level, items })` e `buildPlan` com `inheritance`; testes do T001 passam
- [X] T010 [US2] `character-builder.mjs`: `#validate("equipment")` junta `inheritanceItems`; `#stepView("equipment")` com a seção (texto, uso, linhas com seletor agrupado por raridade, raridade e linha de descrição); ações `addInheritance`/`removeInheritance`; `#onField` para `inheritance.<i>`
- [X] T011 [US2] `step.hbs` e `styles/builder.css`: seção Inheritance abaixo das vagas (`<optgroup>` por raridade)
- [X] T012 [US2] `applyPlan` (passo `equipment`): `inheritancePicks` → vagas iniciais → itens herdados (`starting: true`, com recurso a `starting: false`)

---

## Phase 4: Polish

- [X] T013 `npm test`, `npm run lint`, chaves i18n; README (montador com Backing e Inheritance); `docs/pendencias.md` (023: Backings e picks de Inheritance saem do texto; 026: Backing sem campo sai)
- [ ] T014 `npm run build:packs` no worktree com o Foundry fechado, link para o worktree; validar o quickstart no Foundry e registrar em `quickstart.md`

## Dependencies

- T001 → T002/T003/T004 → US1 (T005 → T006 → T007 → T008) → US2 (T009 → T010 → T011 → T012) → Polish
- T004 [P] com T002/T003 (arquivos diferentes)
