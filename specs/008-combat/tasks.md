---

description: "Task list for 008-combat"
---

# Tasks: Combate, condições, social, medo e insanidade (DtD 7.7a)

**Input**: Design documents from `specs/008-combat/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 dano e críticos, US2 turnos e ações, US3 condições e cura, US4 social, medo e insanidade.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-008`
- Inventário do PDF: `C:/Users/DOMINI~1/AppData/Local/Temp/claude/C--Users-Dominique-Documents-Personal-Projects-DtD40K-foundryvtt/919c0db4-6c1f-440d-b680-d3d8cd90bf2d/scratchpad/ch-combat-inventory.json` e `ch-combat-rules.md` (conferir as tabelas com `pdftotext -table` antes de gravar — constituição V)

---

## Phase 1: Setup

- [X] T001 Em `system.json`: pack `{ "name": "combat-tables", "label": "Combat Tables", "path": "packs/combat-tables", "type": "RollTable", "system": "dtd40k", "ownership": { "PLAYER": "OBSERVER", "ASSISTANT": "OWNER" } }`
- [X] T002 [P] Em `scripts/assign-pack-ids.mjs`: layout `combat-tables` (pastas Critical Damage, Fear and Insanity; prefixos `dtdTFd`/`dtdT`; resultados embutidos com `_key` `!tables.results!<tabela>.<resultado>`), sem mudar os IDs dos outros packs

---

## Phase 2: Foundational

- [X] T003 [P] Em `tests/unit/config.test.mjs`: `STATUS_EFFECTS` (ids da data-model, rótulos i18n, `changes` de Dazed, Full Defense e Healing Surge), `DAMAGE_TABLE_TYPES`, `CRITICAL_LOCATIONS`, `FEAR_TN`, `ACTION_TYPES`, `ACTION_SUBTYPES`, `RESOLVE_DRAIN_LIMIT`
- [X] T004 Em `module/config.mjs`: as constantes de T003 com fonte; fazer T003 passar
- [X] T005 Em `module/data/character-data.mjs`: `critical`, `resolve.drainedScene`, `insanity`, `modifiers.combat`; no `prepareDerivedData`: fadiga −1k0 em `modifiers.rolls.all`, `combat.reactionsMax`, `combat.woundState`
- [X] T006 Criar `module/documents/combat.mjs` (`DtdCombat#_sortCombatants`, `DtdCombatant`) e registrar em `dtd40k.mjs` com `CONFIG.statusEffects` e `specialStatusEffects.DEFEATED`
- [X] T007 [P] i18n base: `DTD.Condition.*`, `DTD.Combat.*` (tipos e subtipos de ação), `DTD.Sheet.Tab.combat`
- [X] T008 Rodar `npm test` e `npx eslint .`

---

## Phase 3: User Story 1 — Dano e críticos (P1)

- [X] T009 [P] [US1] `tests/unit/damage.test.mjs` e `critical.test.mjs` (contrato)
- [X] T010 [US1] Criar `module/rules/damage.mjs` e `critical.mjs`; fazer T009 passar
- [X] T011 [US1] Conferir no PDF (`-table`) as 20 tabelas de críticos, a Shock Table e Mental Traumas; script `gen-combat-tables.mjs` no scratchpad → `src/packs/combat-tables/` com texto próprio e `flags.dtd40k.effect`; `assign-pack-ids --pack combat-tables`; checagem de 6-gramas = 0
- [X] T012 [P] [US1] Em `tests/unit/packs.test.mjs`: 22 tabelas, 5 resultados por crítico, linha 5 fatal, Shock e Traumas com os intervalos, flags válidas
- [X] T013 [US1] Criar `module/documents/damage-service.mjs` (`applyDamage`, `undoDamage`, `applyCritical`) com socket para o Mestre; `templates/chat/damage-applied.hbs`; botão Aplicar no `damage-card` da 007; cobertura no token (`flags.dtd40k.cover`)
- [X] T014 [P] [US1] i18n e estilos
- [X] T015 [US1] `npm test` e `npm run build:packs`; validar quickstart 1–10 e registrar

---

## Phase 4: User Story 2 — Turnos e ações (P2)

- [X] T016 [P] [US2] `tests/unit/turn.test.mjs`, `defense.test.mjs`, `combat-actions.test.mjs` (contrato)
- [X] T017 [US2] Criar `module/rules/turn.mjs`, `defense.mjs`, `combat-actions.mjs` (38 ações, texto próprio); fazer T016 passar
- [X] T018 [US2] Criar `module/documents/turn-service.mjs` (`useAction`, `rollDefense`, `endOfTurn`); hook `updateCombat` (nova rodada, expirar efeitos, fim de turno); Hero Point na iniciativa
- [X] T019 [US2] Em `attack-service.mjs` e `attack-dialog.hbs`: situações (Combat Advantage automática, ganging up, alvo correndo, atirar em corpo a corpo, terreno, Called Shot), Multiple Attacks, botões Dodge/Parry no cartão (`templates/chat/defense.hbs`)
- [X] T020 [US2] Aba `combat` (`templates/actor/parts/combat.hbs`, `module/apps/combat-actions-context.mjs`): menu de ações por tipo com o gasto do turno; em `character-sheet.mjs`: aba e ações
- [X] T021 [P] [US2] i18n e estilos
- [X] T022 [US2] Validar quickstart 11–20 e registrar

---

## Phase 5: User Story 3 — Condições, fadiga, morte e cura (P3)

- [X] T023 [P] [US3] `tests/unit/healing.test.mjs` (contrato)
- [X] T024 [US3] Criar `module/rules/healing.mjs`; fazer T023 passar
- [X] T025 [US3] Criar `module/documents/condition-service.mjs` (`toggleCondition`, `burnHeroPoint`, `rest`); fadiga acima da Con no `updateActor`; Stunned/Helpless nas regras de turno e de ataque; `templates/dialog/rest-dialog.hbs`
- [X] T026 [US3] Na aba `combat`: condições ativas, Critical Damage, estado do ferimento, fadiga, Descanso (Mestre)
- [X] T027 [P] [US3] i18n e estilos
- [X] T028 [US3] Validar quickstart 21–27 e registrar

---

## Phase 6: User Story 4 — Social, medo e insanidade (P4)

- [X] T029 [P] [US4] `tests/unit/social.test.mjs` e `mental.test.mjs` (contrato)
- [X] T030 [US4] Criar `module/rules/social.mjs` e `mental.mjs`; fazer T029 passar
- [X] T031 [US4] Criar `module/documents/social-service.mjs` e `mental-service.mjs`, `templates/chat/{social-attack,fear}.hbs`; "Nova cena" zera `resolve.drainedScene`; limiares de Insanity no `updateActor`
- [X] T032 [US4] Na aba `combat`: Resolve drenado/Jaded, Insanity e derangements, botões Social Attack e Fear Test
- [X] T033 [P] [US4] i18n e estilos
- [X] T034 [US4] Validar quickstart 28–33 e registrar

---

## Phase 7: Polish

- [X] T035 [P] Atualizar `docs/analise-dtd.md` §13–§15 para a 7.7a e o `README.md`
- [X] T036 `npm run lint` e `npm test`
- [X] T037 `graphify update .`

## Dependencies

- Setup → Foundational → US1 → US2 → US3 → US4 → Polish. US3 usa as condições dos críticos (US1) e o turno (US2); US4 usa
  reações (US2) e condições (US3).
- [P] = arquivos diferentes, sem dependência pendente.
