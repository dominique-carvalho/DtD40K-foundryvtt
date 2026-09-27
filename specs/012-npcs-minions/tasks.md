---

description: "Task list for 012-npcs-minions"
---

# Tasks: NPCs e Minions (DtD 7.7a)

**Input**: Design documents from `specs/012-npcs-minions/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 compêndio e ficha, US2 NPC em combate, US3 Minion Squads.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-012`
- Inventário do PDF: `C:/Users/DOMINI~1/AppData/Local/Temp/claude/C--Users-Dominique-Documents-Personal-Projects-DtD40K-foundryvtt/919c0db4-6c1f-440d-b680-d3d8cd90bf2d/scratchpad/ch-antagonists-inventory.json`

---

## Phase 1: Setup

- [X] T001 Em `system.json`: `documentTypes.Actor.npc` e `.minionSquad` (`htmlFields`) e o pack `antagonists` (Actor, só Mestre/Assistente)
- [X] T002 [P] Em `scripts/assign-pack-ids.mjs`: layout `antagonists` (11 pastas; prefixos `dtdNFd`/`dtdN`; `collection: "actors"`; itens embutidos com `_key` `!actors.items!`)

---

## Phase 2: Foundational

- [X] T003 [P] Em `tests/unit/config.test.mjs`: `NPC_CATEGORIES` (10), `NPC_TRAITS` (20), `MINION`
- [X] T004 Em `module/config.mjs`: as constantes de T003; fazer T003 passar
- [X] T005 [P] Em `tests/unit/npc.test.mjs` e `minions.test.mjs`: funções do contrato
- [X] T006 Criar `module/rules/npc.mjs` (com `TRAIT_TEXT` em texto próprio) e `module/rules/minions.mjs`; fazer T005 passar
- [X] T007 Criar `module/data/npc-data.mjs` (herda `CharacterData`; armadura do bloco e dos traits, Aura, Caster sancionado) e `module/data/minion-squad-data.mjs`; registrar em `dtd40k.mjs`
- [X] T008 [P] i18n base: tipos, categorias, traits (rótulo e dica), Minion
- [X] T009 Rodar `npm test` e `npx eslint .`

---

## Phase 3: User Story 1 — Compêndio e ficha (P1)

- [X] T010 [P] [US1] Em `tests/unit/packs.test.mjs`: 47 `npc` + 4 `minionSquad`, 11 pastas, Regular Troops/Rebels com os dados da spec, armas embutidas com qualidades válidas, traits válidos, perícias válidas, squads da spec
- [X] T011 [US1] Script do scratchpad `gen-antagonists-pack.mjs`: inventário → `src/packs/antagonists/*.json` (overrides dos derivados, armas com `npcDamage`, armadura sem duplicar traits); `assign-pack-ids --pack antagonists`; 6-gramas = 0
- [ ] T012 [US1] `module/apps/npc-sheet.mjs` (herda a ficha do personagem: abas Principal, Combate, Magia, Antagonista), `module/apps/npc-context.mjs`, `templates/actor/npc-header.hbs`, `templates/actor/parts/npc.hbs`; registrar
- [ ] T013 [P] [US1] i18n e estilos
- [ ] T014 [US1] `npm test` e `npm run build:packs`

---

## Phase 4: User Story 2 — NPC em combate (P2)

- [ ] T015 [US2] `attack-service`: NPC proficiente, Força 0 com `npcDamage`, Amorphous no corpo; `raises`/`blast` na flag de dano
- [ ] T016 [US2] Abrir `npc` em `damage-service`, `turn-service`/`combat.mjs` (fim de turno), `social-service` (alvo; Mindless recusado), `magic-service` (aprender e conjurar), `equipment-service`, `dtd40k.mjs` (refresh do combate)
- [ ] T017 [US2] `condition-service.toggleCondition`: imunidades de Undead/Stuff of Nightmares
- [ ] T018 [US2] `module/documents/npc-service.mjs`: `regenerate` (chamado em `DtdCombat#_onStartTurn`), `fearCard` e `fearFromCard` (`CHAT_ACTIONS.npcFear`), `templates/chat/npc-fear.hbs`
- [ ] T019 [P] [US2] i18n e estilos
- [ ] T020 [US2] Validar quickstart 1–13 e registrar

---

## Phase 5: User Story 3 — Minion Squads (P3)

- [ ] T021 [US3] `module/documents/minion-service.mjs`: `attack`, `rollMinionDamage` (`CHAT_ACTIONS.minionDamage`), `removeMinions`, `setAlly`; `templates/chat/minion-attack.hbs`
- [ ] T022 [US3] `damage-service`: dano num `minionSquad` remove as baixas (e o desfazer guarda o número)
- [ ] T023 [US3] `actor.withRollModifiers`: bônus dos minions aliados em testes de perícia
- [ ] T024 [US3] `module/apps/minion-sheet.mjs` + `templates/actor/minion-sheet.hbs` (TR, minions, Damage Ratings, SD/Speed/alcance, atacar, aliado); registrar
- [ ] T025 [P] [US3] i18n e estilos
- [ ] T026 [US3] Validar quickstart 14–18 e registrar

---

## Phase 6: Polish

- [ ] T027 [P] Atualizar `docs/analise-dtd.md` §16 para a 7.7a e o `README.md`
- [ ] T028 `npm run lint` e `npm test`
- [ ] T029 `graphify update .`

## Dependencies

- Setup → Foundational → US1 → US2 → US3 → Polish.
- [P] = arquivos diferentes, sem dependência pendente.
