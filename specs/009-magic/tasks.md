---

description: "Task list for 009-magic"
---

# Tasks: Magia (DtD 7.7a)

**Input**: Design documents from `specs/009-magic/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 compêndio, US2 escolas e aprendizado, US3 conjurar, US4 sustentadas, combos e implements.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-009`
- Inventário do PDF: `C:/Users/DOMINI~1/AppData/Local/Temp/claude/C--Users-Dominique-Documents-Personal-Projects-DtD40K-foundryvtt/919c0db4-6c1f-440d-b680-d3d8cd90bf2d/scratchpad/ch-magic-inventory.json` e `ch-magic-rules.md`

---

## Phase 1: Setup

- [X] T001 Em `system.json`: `documentTypes.Item.spell: { "htmlFields": ["description"] }` e o pack `spells` (Item, OBSERVER para jogadores)
- [X] T002 [P] Em `scripts/assign-pack-ids.mjs`: layout `spells` (9 pastas por escola; prefixos `dtdSFd`/`dtdS`) e pasta `warp` no layout `combat-tables`, sem mudar IDs existentes

---

## Phase 2: Foundational

- [X] T003 [P] Em `tests/unit/config.test.mjs`: `MAGIC_SCHOOLS` (9, característica de cada), `SPELL_KEYWORDS` (13), `SPELL_ACTIONS`, `SPELL_DURATIONS`, `CAST_STRENGTHS`, `MAX_PUSH`, `XP_COSTS.newSchool/school/combo`, `XP_KINDS` com `school` e `combo`
- [X] T004 Em `module/config.mjs`: as constantes de T003 com fonte; fazer T003 passar
- [X] T005 Criar `module/data/spell-data.mjs` (data-model.md) e registrar em `dtd40k.mjs`
- [X] T006 Em `module/data/character-data.mjs`: `magic.schools`, `magic.combos`, `magic.sustained`, `modifiers.magic`; derivado `magic` (caster level, Sanctioned = feat Tested, Implement equipado, vagas)
- [X] T007 [P] i18n base: `TYPES.Item.spell`, `DTD.Magic.School.*`, `DTD.Magic.Keyword.*` (rótulo e dica própria), ações, durações, forças
- [X] T008 Rodar `npm test` e `npx eslint .`

---

## Phase 3: User Story 1 — Compêndio (P1)

- [X] T009 [P] [US1] Em `tests/unit/packs.test.mjs`: 126 magias, 9 pastas, 14 por escola 3/3/3/3/2, Magic Missile e Armoring Aura com os campos da spec, keywords válidas; `combat-tables` com 24 tabelas (Phenomena 26 resultados, Perils 18)
- [X] T010 [US1] Script do scratchpad `gen-spells.mjs`: inventário → `src/packs/spells/*.json` (TN, ação, keywords, duração, dano com escala por Level, resistência, automação simples); `assign-pack-ids --pack spells`
- [X] T011 [US1] Gerador das tabelas Phenomena e Perils no `combat-tables` (conferir no PDF com `-table`); checagem de 6-gramas = 0
- [X] T012 [US1] `module/apps/spell-sheet.mjs` + `templates/item/spell-sheet.hbs` (keywords com dica); registrar
- [X] T013 [P] [US1] i18n e estilos da ficha de magia
- [X] T014 [US1] `npm test` e `npm run build:packs`

---

## Phase 4: User Story 2 — Escolas e aprendizado (P2)

- [X] T015 [P] [US2] Em `tests/unit/xp.test.mjs` e `magic.test.mjs`: custos e `canAdvance` de `school` (lista da classe, Free Study, teto Level), `combo`, `undoPlan`; `spellSlots` e `canLearn` (contrato)
- [X] T016 [US2] Estender `module/rules/xp.mjs`; criar `module/rules/magic.mjs` com vagas; fazer T015 passar
- [X] T017 [US2] `xp-service`: `advance(actor, "school", key)` e desfazer; `magic-service.learnSpell` (drop de `spell` na ficha)
- [X] T018 [US2] Aba `magic` (`templates/actor/parts/magic.hbs`, `module/apps/magic-context.mjs`): escolas com valor, vagas e `+custo` no modo Evolução; magias por escola
- [X] T019 [P] [US2] i18n e estilos
- [ ] T020 [US2] Validar quickstart 3–6 e registrar

---

## Phase 5: User Story 3 — Conjurar (P3)

- [X] T021 [P] [US3] Em `tests/unit/magic.test.mjs`: `castPool`, `maxPush`, `phenomenaModifier`, `spellTn`, `spellDamage`, `perRaiseChange`, `keywordCheck`, `tableRow` (contrato)
- [X] T022 [US3] Completar `module/rules/magic.mjs`; fazer T021 passar
- [X] T023 [US3] `module/apps/cast-dialog.mjs` + `templates/dialog/cast-dialog.hbs` (força, push, TN, modificadores, reroll do Implement)
- [X] T024 [US3] `magic-service.castSpell`, `resistSpell`, `rollPhenomena`; `templates/chat/spell-card.hbs`; dano via cartão de dano com `magic`; efeitos com duração; turno da 008; botões no hook do chat
- [X] T025 [P] [US3] i18n e estilos
- [ ] T026 [US3] Validar quickstart 7–14 e registrar

---

## Phase 6: User Story 4 — Sustentadas, combos, implements (P4)

- [X] T027 [P] [US4] Em `tests/unit/magic.test.mjs`: `comboTest`, custo do combo
- [X] T028 [US4] `magic-service`: sustentadas (`endSustained`, `sustainTurn` no `DtdCombat#_onStartTurn`), `learnCombo` (XP), conjurar combo; Implement Focus no diálogo
- [X] T029 [US4] Na aba `magic`: sustentadas (encerrar), combos (aprender, conjurar), estado (caster level, Sanctioned, Implement)
- [X] T030 [P] [US4] i18n e estilos
- [ ] T031 [US4] Validar quickstart 15–17 e registrar

---

## Phase 7: Polish

- [ ] T032 [P] Atualizar `docs/analise-dtd.md` §9 para a 7.7a e o `README.md`
- [X] T033 `npm run lint` e `npm test`
- [ ] T034 `graphify update .`

## Dependencies

- Setup → Foundational → US1 → US2 → US3 → US4 → Polish.
- [P] = arquivos diferentes, sem dependência pendente.
