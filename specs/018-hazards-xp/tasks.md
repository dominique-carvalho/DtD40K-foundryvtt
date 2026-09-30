---

description: "Task list for 018-hazards-xp"
---

# Tasks: Perigos e XP de encontro (DtD 7.7a)

**Input**: Design documents from `specs/018-hazards-xp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 queda, US2 XP de encontro, US3 sufocamento e marcha forçada.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-018`
- Inventário: `C:/Users/DOMINI~1/AppData/Local/Temp/claude/C--Users-Dominique-Documents-Personal-Projects-DtD40K-foundryvtt/36c74d17-8efd-4ec5-b9db-14e4ed8b18d2/scratchpad/ch-hazards-inventory.json`

---

## Phase 1: Foundational

- [X] T001 [P] Em `tests/unit/hazards.test.mjs`: casos de [contracts/rules-api.md](contracts/rules-api.md) para `fallCategory`, `fallWounds`, `fallReduction`, `breathLimit`, `suffocationStep`, `marchTn`, `marchDistance`, `hazardImmunity`, `encounterXp`
- [X] T002 [P] Em `tests/unit/damage.test.mjs` (ou o teste existente de `resolveDamage`): `direct` e `extraCritical`; em teste de `fatigueCheck`: máximo com Sand
- [X] T003 `module/config.mjs`: `ENCOUNTER_XP` (easy 50, routine 70, ordinary 100, average 130, challenging 170, hard 200, veryHard 250), `SESSION_XP = 500`, `FALL`, fontes de imunidade (research R6)
- [X] T004 `module/rules/hazards.mjs` (PURO); `module/rules/damage.mjs` (`direct`, `extraCritical`); `module/rules/healing.mjs` (`fatigueCheck` com `max`); fazer T001 e T002 passarem
- [X] T005 `module/documents/condition-service.mjs`: `addFatigue` com `system.fatigue.max` e sem Fatigue no Promethean
- [X] T006 Rodar `npm test` e `npx eslint .`

---

## Phase 2: User Story 1 — Queda (P1)

- [X] T007 [US1] `module/documents/hazard-service.mjs`: `applyFall` (um cartão de dano por token com `resolve.direct`, `extraCritical`, `type: "I"`, `tokenUuids`, `flags.dtd40k.fall`; Catfall), `fallAcrobatics` (Acrobatics TN 15 do dono, uma vez, atualiza o total)
- [X] T008 [US1] `openHazardTool` (em `module/documents/hazard-service.mjs`) + `templates/apps/hazard-dialog.hbs`: perigo, categoria e intencional, tokens selecionados com imunes detectados; ferramenta `dtdHazard` nos controles de token (Mestre) e `CHAT_ACTIONS.fallAcrobatics` em `dtd40k.mjs`; botão Acrobatics no cartão de dano quando intencional
- [X] T009 [P] [US1] i18n e estilos
- [ ] T010 [US1] Validar quickstart 1–5 e registrar

---

## Phase 3: User Story 2 — XP de encontro (P2)

- [X] T011 [US2] `openXpDialog` em `module/documents/hazard-service.mjs` + `templates/apps/xp-dialog.hbs`: Encontro (dificuldade) ou Sessão, personagens (combate atual marcados), bônus e motivo; `awardXp` por personagem e linha separada do bônus; ferramenta `dtdXp` em `dtd40k.mjs`
- [X] T012 [P] [US2] i18n
- [ ] T013 [US2] Validar quickstart 6–7 e registrar

---

## Phase 4: User Story 3 — Sufocamento e marcha forçada (P3)

- [X] T014 [US3] `startHazard`, `hazardStep`, `endHazard` em `module/documents/hazard-service.mjs` + `templates/chat/hazard-card.hbs`: sufocamento (modo, fôlego, Con TN 10, Fatigue, Unconscious, −1 HP, Dead) e marcha (TN 10 + 5/hora, Fatigue, distância); imunes; só o Mestre avança; `CHAT_ACTIONS.hazardStep`, `hazardEnd`
- [X] T015 [P] [US3] i18n e estilos
- [ ] T016 [US3] Validar quickstart 8–11 e registrar

---

## Phase 5: Polish

- [ ] T017 [P] Atualizar `docs/pendencias.md` (perigos e XP feitos; o que ficou em texto) e o `README.md`
- [ ] T018 `npm run lint` e `npm test`
- [ ] T019 `graphify update .` (PowerShell)

## Dependencies

- Foundational → US1 → US2 → US3 → Polish (US2 independente dos perigos).
- [P] = arquivos diferentes, sem dependência pendente.
