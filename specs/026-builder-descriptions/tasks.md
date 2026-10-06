---

description: "Task list for 026-builder-descriptions"
---

# Tasks: Descrições no montador de personagem

**Input**: Design documents from `specs/026-builder-descriptions/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/descriptions.md, quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 traços, US2 raça/exaltação/classe/divindade, US3 backgrounds e equipamento.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-026`

---

## Phase 1: Foundational

- [ ] T001 [P] `tests/unit/descriptions.test.mjs`: casos de [contracts/descriptions.md](contracts/descriptions.md) com dados reais de `src/packs` (Tiefling, Human, Werewolf, Enemy, Appearance, Outsider, Mercenary, Monk, Autopistol, Flak, Stimm); confirmar que falham
- [ ] T002 `module/rules/descriptions.mjs` (PURO): `plainText`, `shortLine`, `firstParagraph`, `raceFacts`, `exaltationFacts`, `featFacts`, `classFacts`, `itemNumbers`; T001 passa
- [ ] T003 [P] `styles/builder.css`: `.builder-desc`, `.builder-facts`, `.builder-detail` (tokens da 021); i18n dos rótulos `DTD.Builder.Fact.*` (en, pt-BR)

---

## Phase 2: User Story 1 — Traços (P1) 🎯 MVP

- [ ] T004 [US1] Passo Assets e Hindrances: linha (`desc`) e fatos (XP, requisitos) em `#stepView` e `step.hbs`
- [ ] T005 [US1] Passo Exalted Asset: painel da opção selecionada (efeito, custo)
- [ ] T006 [US1] Passo XP: `data-desc` nas opções de feat, linha do feat escolhido atualizada no `_onRender` sem re-renderizar; linha nas entradas compradas

---

## Phase 3: User Story 2 — Raça, exaltação, classe, divindade (P2)

- [ ] T007 [US2] Passos Raça e Exaltação: painel com `raceFacts`/`exaltationFacts` traduzidos e o primeiro parágrafo
- [ ] T008 [US2] Passo Classe: linha com o papel e `classFacts` (nível, perícias, feats), ao lado do motivo de bloqueio
- [ ] T009 [US2] Passo Alinhamento: painel da divindade (resumo, panteão)

---

## Phase 4: User Story 3 — Backgrounds e equipamento (P3)

- [ ] T010 [US3] i18n `DTD.Background.<11>.hint` (redação própria, pp. 280–283; en e pt-BR) e linha em cada background
- [ ] T011 [US3] Passo Equipamento: linha do item escolhido em cada vaga (`itemNumbers` + efeito) e `data-desc` nas opções

---

## Phase 5: Polish

- [ ] T012 `npm test`, `npm run lint`, chaves i18n; README (montador com descrições)
- [ ] T013 Validar o quickstart no Foundry e registrar em `quickstart.md`

## Dependencies

- T001 → T002 → T003 → US1 (T004–T006) → US2 (T007–T009) → US3 (T010–T011) → Polish
