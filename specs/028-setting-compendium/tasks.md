---

description: "Task list for 028-setting-compendium"
---

# Tasks: Compêndio de cenário (cap. XVIII)

**Input**: Design documents from `specs/028-setting-compendium/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/setting-pack.md, quickstart.md

**Tests**: incluídos (constituição III). Teste antes do conteúdo, confirmando que falha. Redação: 6-gramas no
scratchpad. UI: quickstart.

**Organization**: US1 esferas, US2 história/cosmologia/Sigil, US3 links. O conteúdo é escrito por um gerador no
scratchpad, que grava `src/packs/setting/`.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-028`

---

## Phase 1: Foundational

- [ ] T001 `tests/unit/setting.test.mjs`: casos de [contracts/setting-pack.md](contracts/setting-pack.md) (pastas, 18 diários, 15 esferas com 4 páginas, ganchos em `secret` com aviso, links válidos e únicos por página, até 2 `<p>`, `_key`); confirmar que falha
- [ ] T002 `tests/unit/icons.test.mjs`: documentos `!journal!` fora da checagem de imagem e categoria
- [ ] T003 `system.json`: pack `setting` (JournalEntry, PLAYER: OBSERVER, ASSISTANT: OWNER)
- [ ] T004 Gerador no scratchpad: ids estáveis, pastas com cores dos tokens, montagem de diários e páginas, ligação da primeira citação de deuses, raças e exaltações (`@UUID`), aviso + `secret` nos ganchos; script de 6-gramas contra as pp. 454–507

---

## Phase 2: User Story 1 — Esferas (P1) 🎯 MVP

- [ ] T005 [US1] Redigir as 15 esferas (Physical Conditions, Inhabitants, Locations, Adventure Seeds; até 2 parágrafos cada), gerar `src/packs/setting/`; 6-gramas = 0; testes de esferas passam

---

## Phase 3: User Story 2 — História, cosmologia e Sigil (P2)

- [ ] T006 [US2] Redigir History of the Wheel (uma página por era, na ordem do capítulo)
- [ ] T007 [US2] Redigir The Great Wheel (Astral Sea, portal network, spelljamming ships, Warp, Umbra)
- [ ] T008 [US2] Redigir Sigil (Overview, The Lady of Pain, Factions com filosofia e líder, Locations); 6-gramas = 0; testes passam

---

## Phase 4: User Story 3 — Links (P3)

- [ ] T009 [US3] Conferir os links gerados (deuses, raças, exaltações; primeira citação; palavra inteira); teste de links passa

---

## Phase 5: Polish

- [ ] T010 `npm test`, `npm run lint`; README (compêndio Setting); `docs/pendencias.md` (cap. XVIII sai da seção 1; integrações Backing/Warp como pendência)
- [ ] T011 `npm run build:packs` no worktree com o Foundry fechado, link para o worktree; validar o quickstart como Mestre e como Player2 e registrar em `quickstart.md`

## Dependencies

- T001 → T002/T003/T004 → US1 (T005) → US2 (T006–T008) → US3 (T009) → Polish
- T002 e T003 [P] entre si (arquivos diferentes)
