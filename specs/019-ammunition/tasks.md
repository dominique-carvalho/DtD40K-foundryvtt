---

description: "Task list for 019-ammunition"
---

# Tasks: Controle de munição (DtD 7.7a)

**Input**: Design documents from `specs/019-ammunition/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 tiros e pentes, US2 recarga, US3 emperrar e superaquecer.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-019`
- Inventário: `C:/Users/DOMINI~1/AppData/Local/Temp/claude/C--Users-Dominique-Documents-Personal-Projects-DtD40K-foundryvtt/36c74d17-8efd-4ec5-b9db-14e4ed8b18d2/scratchpad/ch-ammo-inventory.json`

---

## Phase 1: Foundational

- [X] T001 [P] Em `tests/unit/ammo.test.mjs`: casos de [contracts/rules-api.md](contracts/rules-api.md) para `tracksAmmo`, `parseReload`, `roundsFor`, `spendRounds`, `reloadStep`
- [X] T002 `module/rules/ammo.mjs` (PURO); fazer T001 passar
- [X] T003 `module/data/weapon-data.mjs`: `system.ammo = { loaded: null (nulo = cheio), spare: 2, progress: 0, jammed: false }` e derivados `ammo.max`, `ammo.current`, `ammo.tracked`, `ammo.reload`
- [X] T004 Rodar `npm test` e `npx eslint .`

---

## Phase 2: User Story 1 — Tiros e pentes (P1)

- [X] T005 [US1] `module/documents/ammo-service.mjs`: `checkAmmo`, `spendAmmo`, `spendLauncherAmmo`
- [X] T006 [US1] `module/documents/attack-service.mjs`: recusa sem tiros (Mestre libera; `preset.noAmmo` pula), gasto depois do teste, `fullAutoHits` com o ROF efetivo, item do lançador, tiros restantes no cartão (`templates/chat/attack-card.hbs`)
- [X] T007 [US1] `module/documents/zone-service.mjs`: Suppressing Fire gasta ao iniciar a zona e guarda `zone.rof`; rajada com `noAmmo` e o ROF da zona
- [X] T008 [US1] Ficha: tiros/pente e reserva editáveis e selos na linha da arma (`module/apps/equipment-context.mjs`, `templates/actor/parts/equipment.hbs`)
- [X] T009 [P] [US1] i18n e estilos
- [ ] T010 [US1] Validar quickstart 1–6 e registrar

---

## Phase 3: User Story 2 — Recarga (P2)

- [X] T011 [US2] `reloadWeapon` e `resetReloadProgress` em `module/documents/ammo-service.mjs`; `useAction("reload")` com a arma (botão da linha ou a primeira equipada com pente) e `takeAction` zerando o progresso nas outras ações em `module/documents/turn-service.mjs`; zerar no fim do combate em `dtd40k.mjs`
- [X] T012 [US2] Botão Recarregar e selo de progresso na linha da arma; ação `reloadWeapon` em `module/apps/character-sheet.mjs`
- [X] T013 [P] [US2] i18n
- [ ] T014 [US2] Validar quickstart 7–9 e registrar

---

## Phase 4: User Story 3 — Emperrar e superaquecer (P3)

- [X] T015 [US3] `afterAttack` (trava; Overheats esvazia) e `clearJam` (destrava e esvazia) em `module/documents/ammo-service.mjs`, ligados ao `rollAttack` e ao Clear Jam do `turn-service`; recusa com arma travada; selo "Travada"
- [X] T016 [P] [US3] i18n
- [ ] T017 [US3] Validar quickstart 10–11 e registrar

---

## Phase 5: Polish

- [ ] T018 [P] Atualizar `docs/pendencias.md` (munição feita; notas) e o `README.md`
- [ ] T019 `npm run lint` e `npm test`
- [ ] T020 `graphify update .` (PowerShell)

## Dependencies

- Foundational → US1 → US2 → US3 → Polish.
- [P] = arquivos diferentes, sem dependência pendente.
