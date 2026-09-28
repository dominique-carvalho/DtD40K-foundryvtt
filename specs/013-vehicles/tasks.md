---

description: "Task list for 013-vehicles"
---

# Tasks: Veículos (DtD 7.7a)

**Input**: Design documents from `specs/013-vehicles/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 compêndios, US2 montador, US3 combate, US4 perseguição, stunts e reparo.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-013`
- Inventário do PDF: `C:/Users/DOMINI~1/AppData/Local/Temp/claude/C--Users-Dominique-Documents-Personal-Projects-DtD40K-foundryvtt/919c0db4-6c1f-440d-b680-d3d8cd90bf2d/scratchpad/ch-vehicles-inventory.json`

---

## Phase 1: Setup

- [X] T001 Em `system.json`: `documentTypes.Item.vehicleComponent`, `documentTypes.Actor.vehicle` e os packs `vehicle-components` (Item, OBSERVER) e `vehicles` (Actor, OBSERVER)
- [X] T002 [P] Em `scripts/assign-pack-ids.mjs`: layouts `vehicle-components` (8 pastas; prefixos `dtdVFd`/`dtdV`) e `vehicles` (Actors com itens embutidos; `dtdWFd`/`dtdW`)

---

## Phase 2: Foundational

- [X] T003 [P] Em `tests/unit/config.test.mjs`: `VEHICLE_CATEGORIES`, `VEHICLE_BUDGETS`, `VEHICLE_COSTS`, `VEHICLE_CREW_ROLES`
- [X] T004 Em `module/config.mjs`: as constantes de T003; fazer T003 passar
- [X] T005 [P] Em `tests/unit/vehicle.test.mjs` e `weapon.test.mjs`: funções do contrato; `damagePool` com `damage.bonus`
- [X] T006 Criar `module/rules/vehicle.mjs` (tabelas Out of Control e crítico em texto próprio) e estender `module/rules/weapon.mjs`; fazer T005 passar
- [X] T007 Criar `module/data/vehicle-component-data.mjs` e `module/data/vehicle-data.mjs` (derivados pela research R2); estender `module/data/weapon-data.mjs` (`damage.bonus`, `vehicle`); registrar em `dtd40k.mjs`
- [X] T008 [P] i18n base: tipos, categorias, orçamentos, papéis da tripulação, rótulos do veículo
- [X] T009 Rodar `npm test` e `npx eslint .`

---

## Phase 3: User Story 1 — Compêndios (P1)

- [X] T010 [P] [US1] Em `tests/unit/packs.test.mjs`: contagens por categoria, Wheeled/Standard Frame/AC/2 com os dados da spec, armas com qualidades válidas, 16 veículos com stats, componentes e armas embutidos
- [X] T011 [US1] Script do scratchpad `gen-vehicles-pack.mjs`: inventário → `src/packs/vehicle-components/*.json` e `src/packs/vehicles/*.json`; `assign-pack-ids`; 6-gramas = 0
- [X] T012 [US1] `module/apps/vehicle-component-sheet.mjs` + template; registrar
- [X] T013 [P] [US1] i18n e estilos
- [X] T014 [US1] `npm test` e `npm run build:packs`

---

## Phase 4: User Story 2 — Montador (P2)

- [ ] T015 [US2] `module/documents/vehicle-service.mjs`: `addComponent` (drop, quantidade), `switchDrive`, `setCrew`/`embark`/`disembark`
- [ ] T016 [US2] `module/apps/vehicle-sheet.mjs` + `templates/actor/vehicle-sheet.hbs` (Resumo com stats, orçamento, VP e slots, avisos; Componentes; Tripulação por drop de atores); registrar
- [ ] T017 [P] [US2] i18n e estilos
- [ ] T018 [US2] Validar quickstart 1–6 e registrar

---

## Phase 5: User Story 3 — Combate (P3)

- [ ] T019 [US3] `attack-service`: `rollAttack(..., { weaponOwner, vehicle })` (sem proficiência, feats e bônus do atirador), `rollDamage` sem Força para armas de veículo e com `damage.bonus`; botão Evasive no cartão quando o alvo é veículo
- [ ] T020 [US3] `vehicle-service`: `move`, `punchIt`, `fire` (Skirmish/Barrage), `evasive`, `controlTest` (Out of Control), `ram`, `juryRig`, `vehicleCritical`, `newScene`; `templates/dialog/vehicle-move.hbs`, `templates/chat/vehicle-*.hbs`
- [ ] T021 [US3] `damage-service.applyTo` para veículo (sem crítico, destruído em 0, ferimentos na cena → crítico); `combat.mjs` (`_onEndTurn`: Momentum 0; `deleteCombat`: nova cena); `CHAT_ACTIONS.vehicleEvasive`
- [ ] T022 [US3] Aba Combate da ficha do veículo: Momentum, SD, alcance, ações, armas por artilheiro, estado (virado, destruído, crítico pendente)
- [ ] T023 [P] [US3] i18n e estilos
- [ ] T024 [US3] Validar quickstart 7–16 e registrar

---

## Phase 6: User Story 4 — Perseguição, stunts, reparo (P4)

- [ ] T025 [US4] `module/documents/chase-service.mjs` + `templates/chat/chase-card.hbs` (`CHAT_ACTIONS.chaseRound`, `chaseObstacle`); botão de perseguição na ficha do veículo e na barra de ferramentas do Mestre
- [ ] T026 [US4] Stunt driving no diálogo de Move/Punch It (Barrel Roll: reação extra do piloto até o próximo turno)
- [ ] T027 [US4] `vehicle-service.repair` + `templates/dialog/vehicle-repair.hbs`
- [ ] T028 [P] [US4] i18n e estilos
- [ ] T029 [US4] Validar quickstart 17–19 e registrar

---

## Phase 7: Polish

- [ ] T030 [P] Atualizar `docs/analise-dtd.md` §17, `docs/pendencias.md` e o `README.md`
- [ ] T031 `npm run lint` e `npm test`
- [ ] T032 `graphify update .`

## Dependencies

- Setup → Foundational → US1 → US2 → US3 → US4 → Polish.
- [P] = arquivos diferentes, sem dependência pendente.
