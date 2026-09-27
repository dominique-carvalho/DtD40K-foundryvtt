---

description: "Task list for 010-sword-schools"
---

# Tasks: Sword Schools e Gun Kata (DtD 7.7a)

**Input**: Design documents from `specs/010-sword-schools/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 compêndio, US2 escolas no personagem, US3 montador, US4 uso em combate.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-010`
- Inventário do PDF: `C:/Users/DOMINI~1/AppData/Local/Temp/claude/C--Users-Dominique-Documents-Personal-Projects-DtD40K-foundryvtt/919c0db4-6c1f-440d-b680-d3d8cd90bf2d/scratchpad/ch-martial-inventory.json`

---

## Phase 1: Setup

- [X] T001 Em `system.json`: `documentTypes.Item.martialSchool: { "htmlFields": ["description"] }` e o pack `martial-schools` (Item, OBSERVER para jogadores)
- [X] T002 [P] Em `scripts/assign-pack-ids.mjs`: layout `martial-schools` (pastas Sword Schools e Gun Kata; prefixos `dtdMFd`/`dtdM`), sem mudar IDs existentes

---

## Phase 2: Foundational

- [X] T003 [P] Em `tests/unit/config.test.mjs`: `MARTIAL_SCHOOLS` (15; 9 `sword`, 6 `gunKata`; perícia de cada), `MARTIAL_ENTRY_TYPES`, `MARTIAL_XP.perStylePoint` = 50, `XP_KINDS` com `martial` e `specialAttack`
- [X] T004 Em `module/config.mjs`: as constantes de T003 com fonte; fazer T003 passar
- [X] T005 Criar `module/data/martial-school-data.mjs` (data-model.md, entradas com `automation`) e registrar em `dtd40k.mjs`
- [X] T006 Em `module/data/character-data.mjs`: `martial.schools` (15), `martial.attacks`; derivados `adeptLevel` e `gunslingerLevel`
- [X] T007 [P] i18n base: `TYPES.Item.martialSchool`, `DTD.Martial.School.*`, tipos de entrada, universais (rótulo e efeito próprio), níveis de maestria
- [X] T008 Rodar `npm test` e `npx eslint .`

---

## Phase 3: User Story 1 — Compêndio (P1)

- [X] T009 [P] [US1] Em `tests/unit/packs.test.mjs`: 15 escolas, 2 pastas, 9 entradas cobrindo os níveis 1–5, Desert Wind e Clay Pigeon com os campos da spec, `unlocksAction` válido em `COMBAT_ACTIONS`, qualidades válidas em `WEAPON_QUALITIES`, grupos de arma existentes na 007
- [X] T010 [US1] Script do scratchpad `gen-martial-pack.mjs`: inventário → `src/packs/martial-schools/*.json` (ids de entrada estáveis, automação da research R3–R5); `assign-pack-ids --pack martial-schools`; checagem de 6-gramas = 0
- [X] T011 [US1] `module/apps/martial-school-sheet.mjs` + `templates/item/martial-school-sheet.hbs` (entradas por nível com custo e marcação de repetível); registrar
- [X] T012 [P] [US1] i18n e estilos da ficha da escola
- [X] T013 [US1] `npm test` e `npm run build:packs`

---

## Phase 4: User Story 2 — Escolas no personagem (P2)

- [X] T014 [P] [US2] Em `tests/unit/xp.test.mjs` e `martial.test.mjs`: `advanceCost("martial")`, `canAdvance` de `martial` (listas `swordSchools`/`gunKata`, Free Study, `atCap`), `undoPlan`; `adeptLevels` (contrato)
- [X] T015 [US2] Estender `module/rules/xp.mjs`; criar `module/rules/martial.mjs` com universais e `adeptLevels`; fazer T014 passar
- [X] T016 [US2] `module/documents/martial-service.mjs`: `schoolData` (cache do pack) e `syncPassives`; `xp-service`: `advance(actor, "martial", key)` e desfazer chamando `syncPassives`
- [X] T017 [US2] Aba `martial` (`templates/actor/parts/martial.hbs`, `module/apps/martial-context.mjs`, `character-sheet.mjs`): Martial Adept/Gunslinger Level, escolas com valor, `+custo` no modo Evolução, níveis liberados, passivas, universais
- [X] T018 [P] [US2] i18n e estilos
- [ ] T019 [US2] Validar quickstart 1–8 e registrar

---

## Phase 5: User Story 3 — Montador (P3)

- [X] T020 [P] [US3] Em `tests/unit/martial.test.mjs`: `options`, `points`, `budget` (exemplos pp. 261 e 273), `attackCost` (contrato)
- [X] T021 [US3] Completar `module/rules/martial.mjs`; fazer T020 passar
- [X] T022 [US3] `module/apps/martial-builder.mjs` + `templates/dialog/martial-builder.hbs` (tipo, nome, ação-base, vantagens com quantidade/escolha, restrições, orçamento ao vivo)
- [X] T023 [US3] `martial-service.saveAttack` / `deleteAttack` (histórico `specialAttack`, edição com `history`); desfazer do `xp-service` para `specialAttack` restaura a definição anterior ou apaga o ataque
- [X] T024 [US3] Na aba `martial`: lista de ataques (Usar, Editar, Apagar; inválido quando falta nível)
- [X] T025 [P] [US3] i18n e estilos
- [ ] T026 [US3] Validar quickstart 9–12 e registrar

---

## Phase 6: User Story 4 — Uso em combate (P4)

- [X] T027 [P] [US4] Em `tests/unit/martial.test.mjs` e `damage.test.mjs`: `usageCheck`, `attackModifiers` (contrato); `resolveDamage` com `ignoreArmor`, `resilienceMod`, `resilienceMultiplier`, `noCritical`
- [X] T028 [US4] Completar `module/rules/martial.mjs` e estender `module/rules/damage.mjs`; fazer T027 passar
- [X] T029 [US4] `attack-service`: `rollAttack(..., { special })` (parada, flag, cartão com vantagens em texto, aviso de Blast/Flame, `onMiss`) e `rollDamage` (dano, Pen, Força, `explodeOn`, por raise, qualidades, `resolve` na flag); `damage-service.applyTo` passa `resolve`
- [X] T030 [US4] `turn-service.useAction(..., { special })` e `multipleAttacks` (vantagens no primeiro ataque)
- [X] T031 [US4] `martial-service.useAttack` (restrições com override, ação-base, preparo, teste de perícia, efeitos no atacante, estado), `applyAttackEffects` (botão no cartão, socket da 008), `newScene`; hook `deleteCombat`; `CHAT_ACTIONS.martialEffects`
- [X] T032 [P] [US4] i18n e estilos
- [ ] T033 [US4] Validar quickstart 13–21 e registrar

---

## Phase 7: Polish

- [X] T034 [P] Atualizar `docs/analise-dtd.md` §10 para a 7.7a e o `README.md`
- [X] T035 `npm run lint` e `npm test`
- [ ] T036 `graphify update .`

## Dependencies

- Setup → Foundational → US1 → US2 → US3 → US4 → Polish.
- [P] = arquivos diferentes, sem dependência pendente.
