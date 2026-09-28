---

description: "Task list for 014-ships"
---

# Tasks: Naves (DtD 7.7a)

**Input**: Design documents from `specs/014-ships/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 compêndios, US2 montador, US3 combate, US4 Warp, caças, bombardeio, hangar e reparo.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-014`
- Inventário do PDF: `C:/Users/DOMINI~1/AppData/Local/Temp/claude/C--Users-Dominique-Documents-Personal-Projects-DtD40K-foundryvtt/36c74d17-8efd-4ec5-b9db-14e4ed8b18d2/scratchpad/ch-ships-inventory.json`

---

## Phase 1: Setup

- [X] T001 Em `system.json`: `documentTypes.Item.shipComponent`, `documentTypes.Actor.ship` e `squadron`, packs `ship-components` (Item, OBSERVER) e `ships` (Actor, OBSERVER)
- [X] T002 [P] Em `scripts/assign-pack-ids.mjs`: layouts `ship-components` (pastas por categoria e tipo de console; prefixos próprios) e `ships` (Actors com itens embutidos)

---

## Phase 2: Foundational

- [X] T003 [P] Em `tests/unit/config.test.mjs`: `SHIP_CATEGORIES`, `SHIP_BUDGETS`, `HULL_CLASSES`, `CONSOLE_TYPES`, `SHIP_DEPARTMENTS`, `OFFICER_POSTS`, `SHIELD_TYPES`, `SHIP_WEAPON_TYPES`, `CUSTOMIZATION`
- [X] T004 Em `module/config.mjs`: as constantes de T003; fazer T003 passar
- [X] T005 [P] Em `tests/unit/ship.test.mjs`: os casos de [contracts/rules-api.md](contracts/rules-api.md) (BP, SD, iniciativa, customização, consoles, stats, slots, perfil de arma, pool, Crew, escudo, Multiphasic, Crit Chart, ramming, boarding, caças, Warp, bombardeio, reparos)
- [X] T006 Criar `module/rules/ship.mjs` com as funções e as tabelas `SHIP_ACTIONS`, `SHIP_CRIT`, `RAM_DAMAGE`, `WARP_VOYAGE`, `WARP_ENCOUNTERS`, `WARP_PERILOUS`, `BOMBARD_TORPEDOES` (texto próprio); fazer T005 passar
- [X] T007 Criar `module/data/ship-component-data.mjs`, `module/data/ship-data.mjs` (derivados da research R2) e `module/data/squadron-data.mjs`; registrar em `dtd40k.mjs`; token de nave vinculado por padrão em `DtdActor._preCreate`
- [X] T008 [P] i18n base: tipos, categorias, classes de casco, tipos de console, departamentos, postos, escudos, tipos de arma
- [X] T009 Rodar `npm test` e `npx eslint .`

---

## Phase 3: User Story 1 — Compêndios (P1)

- [X] T010 [P] [US1] Em `tests/unit/packs.test.mjs`: contagens por categoria (14 cascos, 4 bases, 12 oficiais, 34 consoles por tipo, 20 escudos, 5 padrões, 7 tipos, tubo, 7 torpedos), Steamboat/Lance/Photon com os números da spec, 6 naves de NPC com componentes embutidos e o Military Cruiser conferido
- [X] T011 [US1] Script do scratchpad `gen-ships-pack.mjs`: inventário → `src/packs/ship-components/*.json` e `src/packs/ships/*.json` (Heavy Plasma Lance derivada; `printed.cost`); `assign-pack-ids`; 6-gramas = 0; ícones conferidos
- [X] T012 [US1] `module/apps/ship-component-sheet.mjs` + template; registrar
- [X] T013 [P] [US1] i18n e estilos
- [X] T014 [US1] `npm test` e `npm run build:packs` (Foundry fechado); conferir `.ldb` em todos os packs

---

## Phase 4: User Story 2 — Montador (P2)

- [X] T015 [US2] `module/documents/ship-service.mjs`: `addComponent` (casco/escudo trocam; quantidade; arma com diálogo de tipo e montagem; avisos), `assignOfficer`/`clearOfficer`, `setUpgrade`/`setNonUniversal`
- [X] T016 [US2] `module/apps/ship-sheet.mjs` + `templates/actor/ship/*.hbs` (Resumo com stats, BP, slots e avisos; Componentes por categoria com armas e torpedos; Oficiais com drop de atores e dados mantidos; customização quando o casco é base); registrar
- [X] T017 [P] [US2] i18n e estilos
- [X] T018 [US2] Validar quickstart 1–6 e registrar

---

## Phase 5: User Story 3 — Combate (P3)

- [X] T019 [US3] `module/documents/combat.mjs`: iniciativa de `ship` e `squadron`; `shipTurn` no Combatant; hooks de início de turno, fim de turno e rodada; `deleteCombat` → `newScene`
- [X] T020 [US3] `module/documents/ship-combat-service.mjs`: `shipAction` (turno, bloqueios, Crew, pool, efeitos das ações de Command/Manoeuver/Tactical/Engineering/Arcana), `module/apps/ship-action-dialog.mjs`, `templates/dialog/ship-*.hbs`
- [X] T021 [US3] Ataques: `fire` (Fire Everything, Snipe, Target Subsystem), `rollShipDamage`, `applyShipDamage` (escudo, Disruption, Multiphasic, Hull temporário, Hull, Crit Chart, destruição, Desfazer), `evasive`, `rollCrit`; `templates/chat/ship-*.hbs`; `CHAT_ACTIONS`
- [X] T022 [US3] `ram` e boarding por cartão (`startBoarding`, `boardingRound`)
- [X] T023 [US3] Aba Combate da ficha: Crew da rodada, escudo, Hull, SD, ações por departamento com o estado do turno, armas e torpedos, críticos e componentes desligados
- [X] T024 [P] [US3] i18n e estilos
- [X] T025 [US3] Validar quickstart 7–16 e registrar

---

## Phase 6: User Story 4 — Warp, caças, bombardeio, hangar e reparo (P4)

- [X] T026 [US4] `module/documents/warp-service.mjs` + `templates/chat/warp-card.hbs`: requisitos, passos 1–3, encontros e encontros perigosos; `bombard`
- [X] T027 [US4] `module/documents/squadron-service.mjs` + `module/apps/squadron-sheet.mjs`: deploy, ataque, dano de acerto (1 caça), docking
- [X] T028 [US4] Hangar (`addToHangar`/`removeFromHangar`, drop de veículo), `fieldRepair`, `portService`; aba Viagem da ficha
- [X] T029 [P] [US4] i18n e estilos
- [X] T030 [US4] Validar quickstart 17–21 e registrar

---

## Phase 7: Polish

- [X] T031 [P] Atualizar `docs/analise-dtd.md` §18, `docs/pendencias.md` (Naves feitas; Crew Quality e demais lacunas) e o `README.md`
- [X] T032 `npm run lint` e `npm test`
- [X] T033 `graphify update .`

## Dependencies

- Setup → Foundational → US1 → US2 → US3 → US4 → Polish.
- [P] = arquivos diferentes, sem dependência pendente.
- Mudanças em `system.json` e nos packs exigem relançar o mundo; compilar packs só com o Foundry fechado.
