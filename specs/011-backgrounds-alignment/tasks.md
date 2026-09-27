---

description: "Task list for 011-backgrounds-alignment"
---

# Tasks: Backgrounds e Alinhamento (DtD 7.7a)

**Input**: Design documents from `specs/011-backgrounds-alignment/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 compêndio, US2 Backgrounds, US3 alinhamento e Alignment Check, US4 Degeneration.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-011`
- Inventário do PDF: `C:/Users/DOMINI~1/AppData/Local/Temp/claude/C--Users-Dominique-Documents-Personal-Projects-DtD40K-foundryvtt/919c0db4-6c1f-440d-b680-d3d8cd90bf2d/scratchpad/ch-alignment-inventory.json`

---

## Phase 1: Setup

- [X] T001 Em `system.json`: `documentTypes.Item.deity: { "htmlFields": ["description"] }` e o pack `deities` (Item, OBSERVER para jogadores)
- [X] T002 [P] Em `scripts/assign-pack-ids.mjs`: layout `deities` (3 pastas por panteão; prefixos `dtdDFd`/`dtdD`) e pasta `alignment` no layout `combat-tables`, sem mudar IDs existentes

---

## Phase 2: Foundational

- [X] T003 [P] Em `tests/unit/config.test.mjs`: `PANTHEONS` (3), `BACKGROUNDS` (11; artifact e backing múltiplos), `BACKGROUND_XP`, `INHERITANCE_SLOTS`, `XP_KINDS` com `background`
- [X] T004 Em `module/config.mjs`: as constantes de T003 com fonte; fazer T003 passar
- [X] T005 Criar `module/data/deity-data.mjs` (data-model.md) e registrar em `dtd40k.mjs`
- [X] T006 Em `module/data/character-data.mjs`: `backgrounds`, `alignment`, `modifiers.alignmentCheck`; derivados (pontos de criação, fora de jogo, características bloqueadas)
- [X] T007 [P] i18n base: `TYPES.Item.deity`, panteões, Backgrounds, rótulos de alinhamento
- [X] T008 Rodar `npm test` e `npx eslint .`

---

## Phase 3: User Story 1 — Compêndio (P1)

- [X] T009 [P] [US1] Em `tests/unit/packs.test.mjs`: 21 deuses, 3 pastas, 7 por panteão, Slaanesh com os dados da spec, 3 mandamentos, 5 palavras-chave, 5 diretrizes e 2 cultos cada; `combat-tables` com a tabela Degeneration (16 resultados, 1–100, efeitos válidos)
- [X] T010 [US1] Script do scratchpad `gen-deities.mjs`: inventário → `src/packs/deities/*.json`; `assign-pack-ids --pack deities`
- [X] T011 [US1] Gerador da tabela Degeneration no `combat-tables` (pasta Alignment); `assign-pack-ids --pack combat-tables`; checagem de 6-gramas = 0
- [X] T012 [US1] `module/apps/deity-sheet.mjs` + `templates/item/deity-sheet.hbs`; registrar
- [X] T013 [P] [US1] i18n e estilos da ficha do deus
- [X] T014 [US1] `npm test` e `npm run build:packs`

---

## Phase 4: User Story 2 — Backgrounds (P2)

- [X] T015 [P] [US2] Em `tests/unit/backgrounds.test.mjs`, `xp.test.mjs` e `acquisition.test.mjs`: `creationDots`, `backgroundCost`, `canRaise`, `inheritanceFits`; `undoPlan` de `background`; `startingSlots` com extra (contrato)
- [X] T016 [US2] Criar `module/rules/backgrounds.mjs` (com `BACKGROUND_TEXT` em texto próprio); estender `xp.mjs` e `acquisition.mjs`; fazer T015 passar
- [X] T017 [US2] `module/documents/background-service.mjs` (`raiseBackground`, `addInstance`, `setInheritancePicks`, `rollContacts`); `xp-service` desfaz `background`; `equipment-service` com as vagas de Inheritance
- [X] T018 [US2] Seção Backgrounds na aba Traits (`templates/actor/parts/backgrounds.hbs`, contexto): valores com descrição, pontos 7/7, botões de compra na criação, instâncias, Inheritance, Contacts; campos do Mestre no modo Edição
- [X] T019 [P] [US2] i18n e estilos
- [X] T020 [US2] Validar quickstart 3–10 e registrar

---

## Phase 5: User Story 3 — Alinhamento (P3)

- [X] T021 [P] [US3] Em `tests/unit/alignment.test.mjs`: `alignmentCheck`, `afterFailure`, `recover`, `changeAlignment` (contrato)
- [X] T022 [US3] Criar `module/rules/alignment.mjs`; fazer T021 passar
- [X] T023 [US3] `module/documents/alignment-service.mjs`: `setAlignment` (drop e troca), `rollAlignmentCheck` (diálogo `templates/dialog/alignment-check.hbs`, segundo teste, recuperar); drop de `deity` na ficha
- [X] T024 [US3] Seção Alinhamento na aba Traits (`templates/actor/parts/alignment.hbs`): deus, panteão, mandamentos, Devotion, botões, aviso de fora de jogo
- [X] T025 [P] [US3] i18n e estilos
- [X] T026 [US3] Validar quickstart 1–2 e 11–16 e registrar

---

## Phase 6: User Story 4 — Degeneration (P4)

- [X] T027 [P] [US4] Em `tests/unit/alignment.test.mjs` e `xp.test.mjs`: `degenerationRow` (faixas, 62, repetida) e `canAdvance` com `blocked` (contrato)
- [X] T028 [US4] Completar `module/rules/alignment.mjs` e `xp.mjs`; fazer T027 passar
- [X] T029 [US4] `alignment-service`: `applyDegeneration` (tabela, rerrolar repetidas, registro por ponto, efeitos: característica, Night Terrors, derangement, social) e `cureDegeneration`; `xp-service` passa as características bloqueadas
- [X] T030 [US4] Na seção Alinhamento: Degenerations por ponto (nome, efeito, curar pelo Mestre)
- [X] T031 [P] [US4] i18n e estilos
- [X] T032 [US4] Validar quickstart 17–18 e registrar

---

## Phase 7: Polish

- [X] T033 [P] Atualizar `docs/analise-dtd.md` §11 para a 7.7a e o `README.md`
- [X] T034 `npm run lint` e `npm test`
- [X] T035 `graphify update .`

## Dependencies

- Setup → Foundational → US1 → US2 → US3 → US4 → Polish.
- [P] = arquivos diferentes, sem dependência pendente.
