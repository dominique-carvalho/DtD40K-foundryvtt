---

description: "Task list for 015-weapon-crafting"
---

# Tasks: Criação de armas (DtD 7.7a)

**Input**: Design documents from `specs/015-weapon-crafting/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 montador, US2 condicionais no ataque, US3 jogadores, aprovação e fabricação.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-015`
- Inventário do PDF: `C:/Users/DOMINI~1/AppData/Local/Temp/claude/C--Users-Dominique-Documents-Personal-Projects-DtD40K-foundryvtt/36c74d17-8efd-4ec5-b9db-14e4ed8b18d2/scratchpad/ch-weapon-creation-inventory.json`

---

## Phase 1: Foundational

- [X] T001 [P] Em `tests/unit/weapon-creation.test.mjs`: os casos de [contracts/rules-api.md](contracts/rules-api.md) para `availability`, `compatibleMods`, `modLimit`, `buildWeapon`, `reloadStep`, `unstableDamage`; contagens das tabelas (5, 8 + 10, 46 + 22, 12); mapa tipo → grupo/proficiências conferido contra `src/packs/equipment`
- [X] T002 Script do scratchpad `gen-weapon-creation.mjs`: inventário → constantes de `module/rules/weapon-creation.mjs` (notas em texto próprio, 6-gramas = 0); escrever as funções do contrato; fazer T001 passar
- [X] T003 [P] Em `tests/unit/weapon.test.mjs`: `attackPool` com Red-Dot/Motion Predict e `damagePool` com Breacher/Nonlethal
- [X] T004 Estender `module/rules/weapon.mjs` (`mods` no attackPool/damagePool) e `module/data/weapon-data.mjs` (`system.custom`); fazer T003 passar
- [X] T005 Rodar `npm test` e `npx eslint .`

---

## Phase 2: User Story 1 — Montador (P1)

- [X] T006 [US1] `module/documents/weapon-craft-service.mjs`: `createCustomWeapon`, `updateCustomWeapon`
- [X] T007 [US1] `module/apps/weapon-builder.mjs` + `templates/apps/weapon-builder.hbs` (prévia ao vivo, mods desabilitados com motivo, avisos, notas); botão no diretório de itens (Mestre) em `dtd40k.mjs`
- [X] T008 [US1] Ficha de arma: notas da montagem e botão Montador (reabrir) em `module/apps/equipment-sheet.mjs` e `templates/item/equipment-sheet.hbs`
- [X] T009 [P] [US1] i18n e estilos
- [ ] T010 [US1] Validar quickstart 1–5 e 11 e registrar

---

## Phase 3: User Story 2 — Condicionais no ataque (P2)

- [X] T011 [US2] `module/documents/attack-service.mjs`: mods da arma no `attackPool`/`damagePool`, Unstable (d10 e dano ajustado), Orgone Array (nota quando um dado explode), notas no cartão; `templates/chat/attack-card.hbs` e `damage-card.hbs`
- [X] T012 [P] [US2] i18n
- [ ] T013 [US2] Validar quickstart 6–8 e registrar

---

## Phase 4: User Story 3 — Jogadores, aprovação e fabricação (P3)

- [X] T014 [US3] Botão do montador na aba Equipamento (dono); arma do jogador `pending`
- [X] T015 [US3] `acquisition-service.wealthTest` exportado (usado por `acquire`); `approveWeapon`, `gatherMaterials`, `craftWeapon`; recusa de equipar/atacar com `pending`/`crafting` em `equipment-service` e `attack-service`
- [X] T016 [US3] Ficha de arma: estado, Aprovar (Mestre: pronta / para fabricar), Materiais e Fabricar
- [X] T017 [P] [US3] i18n e estilos
- [ ] T018 [US3] Validar quickstart 9–10 e registrar

---

## Phase 5: Polish

- [ ] T019 [P] Atualizar `docs/pendencias.md` (criação de armas feita; lacunas em texto) e o `README.md`
- [ ] T020 `npm run lint` e `npm test`
- [ ] T021 `graphify update .`

## Dependencies

- Foundational → US1 → US2 → US3 → Polish.
- [P] = arquivos diferentes, sem dependência pendente.
