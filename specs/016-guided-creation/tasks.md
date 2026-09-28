---

description: "Task list for 016-guided-creation"
---

# Tasks: Criação guiada (DtD 7.7a)

**Input**: Design documents from `specs/016-guided-creation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 contadores, US2 XP/especialidades/limites, US3 checklist e encerramento.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-016`
- Inventário: `C:/Users/DOMINI~1/AppData/Local/Temp/claude/C--Users-Dominique-Documents-Personal-Projects-DtD40K-foundryvtt/36c74d17-8efd-4ec5-b9db-14e4ed8b18d2/scratchpad/ch-creation-inventory.json`

---

## Phase 1: Foundational

- [ ] T001 [P] Em `tests/unit/creation.test.mjs`: casos de [contracts/rules-api.md](contracts/rules-api.md) para `xpDots`, `creationSpend`, `assignPriorities`, `checkDots`, `ratingCaps`, `canReach`; fixture do exemplo Traya (research R10): características Physical 6, Mental 4, Social 2; perícias Physical 8, Social 6, Mental 4 (Brawl 3 guardado + 1 por XP no log)
- [ ] T002 Em `module/config.mjs`: `CREATION` (`characteristic: { base: 1, budgets: [6, 4, 2], stepMax: 4, groups }`, `skill: { base: 0, budgets: [8, 6, 4], stepMax: 3 }`), `RATING_MAX = 5`, `RATING_EXCEPTION_MAX = 6`, `RATING_EXCEPTIONS` (Daemonhost rank 2 características; Paragon rank 2 ambos; Atlantean rank 1 perícias limite 3; Mark of Slaanesh perícias limite 6); manter `MAX_RATING` só como alias do máximo de exceção se ainda for usado
- [ ] T003 `module/rules/creation.mjs` (PURO): `xpDots`, `creationSpend`, `assignPriorities` (ordenação por gasto, research R3), `checkDots`, `ratingCaps`, `canReach`; fazer T001 passar
- [ ] T004 [P] Em `tests/unit/race.test.mjs`: `capValue(value, max)` com o máximo passado (5 e 6); em `tests/unit/class.test.mjs`: `checkClassEntry` com `creation: true` e classe de nível 2 → erro `creationLevel`
- [ ] T005 `module/rules/race.mjs` (`capValue` sem padrão fixo 6) e `module/rules/class.mjs` (`creation`, erro `creationLevel`); `module/data/character-data.mjs`: `ratingCaps` derivado das exceções (exaltação pelo nome e Power Stat, feats pelo nome) e `#capRatings` com `max(ratingCaps.<kind>.max, valor guardado)` (research R4); fazer T004 passar
- [ ] T006 Rodar `npm test` e `npx eslint .`

---

## Phase 2: User Story 1 — Contadores (P1)

- [ ] T007 [US1] `module/documents/creation-service.mjs`: `creationSummary(actor)` (grupos, gastos, orçamentos) e `setCreationDots(actor, path, value)` (`checkDots` + `canReach`, recusa `DTD.Creation.Error.<reason>` com confirmação do Mestre, padrão de `xp-service.refuse`)
- [ ] T008 [US1] `module/apps/creation-context.mjs` + `templates/actor/parts/creation.hbs`: painel com os contadores por grupo (gasto/orçamento, prioridade) só com `system.creation.active` e para dono ou Mestre; registrar a parte em `module/apps/character-sheet.mjs` e trocar `#onSetDots` por `setCreationDots`
- [ ] T009 [P] [US1] i18n (`DTD.Creation.*` dos contadores e erros `stepMax`, `budget`) e estilos do painel em `lang/*.json` e `styles/dtd40k.css`
- [ ] T010 [US1] Validar quickstart 1–4 e registrar

---

## Phase 3: User Story 2 — XP, especialidades e limites (P2)

- [ ] T011 [P] [US2] Em `tests/unit/creation.test.mjs`: `specialtyCheck` (Brawl 4 sem especialidade → missing; especialidade em nota 3 → excess; Education 2 cobre duas Lores; Expanded Knowledge +1 nas Mentais exceto Perception; Atlantean 3 compartilhadas), `creationXp` (Traya 800 / 750 / 50) e `languagesHint` (Int 1 → 2, Int 4 → 4)
- [ ] T012 [US2] `module/rules/creation.mjs`: `specialtyCheck`, `creationXp`, `languagesHint`; fazer T011 passar
- [ ] T013 [US2] `module/documents/xp-service.mjs`: `advance` usa `canReach` com `actor.system.ratingCaps` (avisos `atMax`, `sixLimit`) em vez de `MAX_RATING`
- [ ] T014 [US2] `module/documents/feat-service.mjs`: terceira Hindrance → recusa `hindranceLimit`; asset/hindrance com a criação encerrada → recusa `creationOnly` (Mestre libera; substitui o aviso de `rules/feat.mjs`); `module/documents/asset-service.mjs`: Exalted Asset fora da criação → recusa (Paragon isento); `module/documents/class-service.mjs`: passar `creation`
- [ ] T015 [US2] Painel: XP da criação (total, gasto, saldo, prêmios) e especialidades pendentes/excedentes em `module/apps/creation-context.mjs` e `templates/actor/parts/creation.hbs`
- [ ] T016 [P] [US2] i18n (XP, especialidades, erros `atMax`, `sixLimit`, `hindranceLimit`, `creationOnly`, `creationLevel`)
- [ ] T017 [US2] Validar quickstart 5–9 e 12 e registrar

---

## Phase 4: User Story 3 — Checklist e encerramento (P3)

- [ ] T018 [P] [US3] Em `tests/unit/creation.test.mjs`: `creationChecklist` (Traya completo: todas `done`; só raça: raça `done`, demais `pending`; sobra de pontos: `warning`)
- [ ] T019 [US3] `module/rules/creation.mjs`: `creationChecklist` (etapas de research R9); fazer T018 passar
- [ ] T020 [US3] `creation-service.endCreation(actor)` (Mestre; `DialogV2.confirm` com as pendências) ligado à ação `endCreation` de `module/apps/character-sheet.mjs`; checklist e botão no painel; remover o botão de `templates/actor/parts/equipment.hbs`
- [ ] T021 [P] [US3] i18n (etapas, estados, lembrete de idiomas, confirmação) e estilos
- [ ] T022 [US3] Validar quickstart 10, 11 e 13 e registrar

---

## Phase 5: Polish

- [ ] T023 [P] Atualizar `docs/pendencias.md` (pontos iniciais da criação feitos; o que ficou como texto) e o `README.md`
- [ ] T024 `npm run lint` e `npm test`
- [ ] T025 `graphify update .`

## Dependencies

- Foundational → US1 → US2 → US3 → Polish.
- [P] = arquivos diferentes, sem dependência pendente.
