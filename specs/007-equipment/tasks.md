---

description: "Task list for 007-equipment"
---

# Tasks: Equipamento, aquisição e artefatos (DtD 7.7a)

**Input**: Design documents from `specs/007-equipment/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 compêndio, US2 inventário e armadura, US3 ataque e dano, US4 aquisição, US5 drogas,
cibernéticos e artefatos.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-007`
- Inventário do PDF: `C:/Users/DOMINI~1/AppData/Local/Temp/claude/C--Users-Dominique-Documents-Personal-Projects-DtD40K-foundryvtt/919c0db4-6c1f-440d-b680-d3d8cd90bf2d/scratchpad/ch-equipment-inventory.json` e `ch-equipment-rules.md` (conferir no livro antes de gravar — constituição V)

---

## Phase 1: Setup

- [ ] T001 Em `system.json`: `documentTypes.Item.{weapon, armor, gear}: { "htmlFields": ["description"] }` e o pack `{ "name": "equipment", "label": "Equipment", "path": "packs/equipment", "type": "Item", "system": "dtd40k", "ownership": { "PLAYER": "OBSERVER", "ASSISTANT": "OWNER" } }`
- [ ] T002 [P] Em `scripts/assign-pack-ids.mjs`: layout `equipment` (pastas Weapons com subpastas por grupo, Armor, Gear, Cybernetics, Drugs, Artifacts com Materials, Wonders, Hearthstones; prefixos `dtdEFd`/`dtdE`), sem mudar os IDs de `feats` e `classes` (`git diff` vazio neles)

---

## Phase 2: Foundational

- [ ] T003 [P] Em `tests/unit/config.test.mjs`: `RARITIES` (12 degraus, TNs 0,2,5,…,50, na ordem), `CRAFTSMANSHIP`, `WEAPON_TYPES`, `WEAPON_PROFICIENCIES` (= opções do feat Weapon Proficiency), `DAMAGE_TYPES`, `WEAPON_QUALITIES` (36), `ARMOR_TYPES`, `ARMOR_PIECES`, `HIT_LOCATIONS`, `GEAR_CATEGORIES`, `MATERIALS` (5), `ADDICTIVITY`, `ADDICTION_LEVELS`, `STARTING_SLOTS`, `WEALTH_STRAIN`; todos em `DTD`, rótulos i18n
- [ ] T004 Em `module/config.mjs`: as constantes de T003 conforme data-model.md com fonte (páginas); fazer T003 passar
- [ ] T005 Criar `module/data/equipment-fields.mjs` (campos comuns) e `weapon-data.mjs`, `armor-data.mjs`, `gear-data.mjs` conforme data-model.md
- [ ] T006 Em `module/data/character-data.mjs`: `wealth`, `creation`, `addictions`, `modifiers.armor`, `modifiers.rolls` (data-model.md)
- [ ] T007 Criar `module/documents/active-effect.mjs` (`DtdActiveEffect#isSuppressed`, contrato foundry-api) e registrar em `dtd40k.mjs` com os três data models
- [ ] T008 [P] i18n base: `TYPES.Item.{weapon,armor,gear}`, `DTD.Rarity.*`, `DTD.Craftsmanship.*`, `DTD.WeaponType.*`, `DTD.Quality.*` (nome e descrição resumida própria), `DTD.ArmorType.*`, `DTD.Location.*`, `DTD.GearCategory.*`, `DTD.Material.*`, `DTD.Addictivity.*`
- [ ] T009 Rodar `npm test` e `npx eslint .`

---

## Phase 3: User Story 1 — Compêndio (P1)

- [ ] T010 [P] [US1] Em `tests/unit/packs.test.mjs`: bloco equipment — 170 itens; 73 armas (28/17/28 e contagem por grupo da spec), 10 armaduras, 18 gear, 16 cibernéticos (5 mechadendrites), 16 drogas, 37 artefatos (5/16/16); Autopistol, Club, Brass Knuckles, Carapace, Power Armor, Medkit, Slaught com os campos da spec; qualidades com chaves válidas; proficiências ⊂ `WEAPON_PROFICIENCIES`; descrições não vazias
- [ ] T011 [US1] Conferir no PDF as raridades desalinhadas (armas de fogo, gear, cibernéticos, drogas) e os perfis duvidosos da `openQuestions` do inventário; corrigir o inventário
- [ ] T012 [US1] Script do scratchpad `gen-equipment.mjs`: inventário → `src/packs/equipment/*.json` (campos do data-model, qualidades com valor, efeitos simples dos itens da research R10–R12) + pastas; rodar `assign-pack-ids --pack equipment`
- [ ] T013 [US1] Descrições em redação própria (inglês) para os 170 itens; checagem de 6-gramas contra o livro = 0 ocorrências
- [ ] T014 [US1] Fichas `module/apps/equipment-sheet.mjs` (`WeaponSheet`, `ArmorSheet`, `GearSheet`) e `templates/item/{weapon,armor,gear}-sheet.hbs`, com tooltip das qualidades e aviso de compêndio bloqueado; registrar
- [ ] T015 [P] [US1] i18n e estilos das fichas de item
- [ ] T016 [US1] `npm test` (T010 passa) e `npm run build:packs`

---

## Phase 4: User Story 2 — Inventário e armadura (P2)

- [ ] T017 [P] [US2] `tests/unit/equipment.test.mjs`: casos de `armorProfile`, `artifactRating`, `mechadendriteCheck` (contrato)
- [ ] T018 [P] [US2] Em `tests/unit/derived.test.mjs`: `armorPenalty` e `maxDex` (contrato)
- [ ] T019 [US2] Criar `module/rules/equipment.mjs`; estender `computeDerived`; fazer T017/T018 passarem
- [ ] T020 [US2] Em `character-data.mjs` `prepareDerivedData`: `system.armor` = `armorProfile` das armaduras vestidas (proficiências dos feats Armor Proficiency; Squat Armor Proficiency), `modifiers.armorPenalty`/`maxDex` antes de `computeDerived`
- [ ] T021 [US2] Criar `module/documents/equipment-service.mjs` (`addEquipment`, `toggleEquipped`, `removeEquipment`, `setQuantity`)
- [ ] T022 [US2] Criar `module/apps/equipment-context.mjs` e `templates/actor/parts/equipment.hbs` (aba `equipment`: armadura por localização com origem, grupos do inventário, equipar, quantidade)
- [ ] T023 [US2] Em `character-sheet.mjs`: aba `equipment`, drop de `weapon|armor|gear` → `addEquipment`, ações
- [ ] T024 [P] [US2] i18n e estilos da aba
- [ ] T025 [US2] Validar quickstart 4–11 e registrar

---

## Phase 5: User Story 3 — Ataque e dano (P3)

- [ ] T026 [P] [US3] `tests/unit/weapon.test.mjs`: casos de `attackSkill`, `isProficient`, `attackPool`, `damagePool`, `fullAutoHits`, `isJammed`, `hitLocation`, `effectiveQualities` (contrato)
- [ ] T027 [P] [US3] Em `tests/unit/dice.test.mjs` e `pool.test.mjs`: `rerollBelow` e `applyRollModifiers`
- [ ] T028 [US3] Criar `module/rules/weapon.mjs`; estender `dice.mjs` (`rerollBelow`, especialidade via `rerollBelow: 2`) e `pool.mjs`; fazer T026/T027 passarem
- [ ] T029 [US3] Em `module/documents/actor.mjs`: rolagens de perícia e característica somam `modifiers.rolls` (e `noExplode`)
- [ ] T030 [US3] Criar `module/apps/attack-dialog.mjs` + `templates/dialog/attack-dialog.hbs` (opções da arma + campos da 001; TN padrão = Static Defense do alvo marcado)
- [ ] T031 [US3] Criar `module/documents/attack-service.mjs` (`rollAttack`, `rollDamage`), `templates/chat/{attack-card,damage-card}.hbs` e o hook `renderChatMessageHTML` do botão de dano
- [ ] T032 [US3] Na aba equipment: paradas de ataque e dano por arma equipada, botões, ataque desarmado padrão; modo Jogo mostra as armas equipadas
- [ ] T033 [P] [US3] i18n e estilos do diálogo e dos cartões
- [ ] T034 [US3] Validar quickstart 12–22 e registrar

---

## Phase 6: User Story 4 — Aquisição e equipamento inicial (P4)

- [ ] T035 [P] [US4] `tests/unit/acquisition.test.mjs`: `acquisitionTn`, `strainRoll`, `startingSlots`, `startingSlotFor`, `effectiveWealth` (contrato)
- [ ] T036 [US4] Criar `module/rules/acquisition.mjs`; fazer T035 passar
- [ ] T037 [US4] Criar `module/documents/acquisition-service.mjs` (`acquire`, `spendLiquid`, `endStrain`), `templates/dialog/acquire-dialog.hbs`, `templates/chat/acquire-card.hbs` e o botão de Liquid Wealth no hook
- [ ] T038 [US4] `addEquipment` com `creation.active`: pergunta "item inicial?", confere vagas (override do Mestre); ficha mostra Wealth, Liquid, Strain (encerrar do Mestre), vagas iniciais e botão Adquirir no inventário e na ficha do item
- [ ] T039 [P] [US4] i18n e estilos
- [ ] T040 [US4] Validar quickstart 23–29 e registrar

---

## Phase 7: User Story 5 — Drogas, cibernéticos e artefatos (P5)

- [ ] T041 [US5] `equipment-service`: `useDose`, `endDose` (teste de Willpower, vício), `socketHearthstone`/`unsocket`, `setMaterial`; mechadendrites em `toggleEquipped`
- [ ] T042 [US5] Em `character-data.mjs`: penalidades de vício (maior nível) em `modifiers.rolls`; material nas paradas (`weapon.mjs`) e no AP (`equipment.mjs`), rating de artefato na ficha
- [ ] T043 [US5] Concessões de hearthstone encaixada (Gem of the Calm Heart → Common Sense) pelo sistema da 005
- [ ] T044 [US5] Ficha: drogas (doses, usar, em efeito, encerrar), vícios (Mestre edita), artefatos e hearthstones (encaixe), material na ficha do item
- [ ] T045 [P] [US5] i18n e estilos
- [ ] T046 [US5] Validar quickstart 30–37 e registrar

---

## Phase 8: Polish

- [ ] T047 [P] Atualizar `docs/analise-dtd.md` §12 para a 7.7a e o `README.md` (recursos e compêndios)
- [ ] T048 `npm run lint` e `npm test`
- [ ] T049 `graphify update .`

## Dependencies

- Setup → Foundational → US1 → US2 → US3 → US4 → US5 → Polish. US4 e US5 dependem do inventário (US2); US3 da aba (US2).
- [P] = arquivos diferentes, sem dependência pendente.
