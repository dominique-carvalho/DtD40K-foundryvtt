---

description: "Task list for 025-condition-icons"
---

# Tasks: Ícones das condições e dos efeitos (Scriptorium Machina)

**Input**: Design documents from `specs/025-condition-icons/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/icons.md, quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. Visual: quickstart.

**Organization**: US1 condições, US2 efeitos dos serviços e dos itens; atualização do mundo junto da US2.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-025`

---

## Phase 1: Foundational

- [ ] T001 [P] Testes de `composeSeal` em `tests/unit/icons.test.mjs` (disco, anel na cor, glifo claro, 512 px, determinístico, cor inválida); confirmar que falham
- [ ] T002 `composeSeal` em `scripts/lib/icons.mjs` (research R1); T001 passa

---

## Phase 2: User Story 1 — Condições (P1) 🎯 MVP

- [ ] T003 [US1] `src/icons/conditions.json`: grupos (research R2) e os 30 selos de condição com glifos distintos; os 4 de efeito (`effect:degeneration`, `effect:martialSelf`, `effect:martialTarget`, `effect:barrelRoll`); `npm run icons:fetch`
- [ ] T004 [US1] `scripts/build-icons.mjs`: gera `assets/icons/conditions/*.svg` e `assets/icons/effects/*.svg`, remove os obsoletos, autores no `CREDITS.md`
- [ ] T005 [US1] Testes: `conditions.json` cobre as 30 condições de `STATUS_EFFECTS`, glifos distintos, arquivos existentes; `STATUS_EFFECTS` aponta para os selos; confirmar que falham antes de T006
- [ ] T006 [US1] `module/config.mjs`: `STATUS_EFFECTS` com os selos e `ICONS.effect`; T005 passa

---

## Phase 3: User Story 2 — Efeitos e atualização do mundo (P2)

- [ ] T007 [US2] `build-icons`: o `img` do item em cada efeito dos itens de `src/packs` (e dos embutidos); teste de varredura: nenhum efeito com imagem do Foundry, efeito de item com o `img` do item
- [ ] T008 [US2] alignment-, martial- e vehicle-service: `CONFIG.DTD.ICONS.effect.*` e `flags.dtd40k.effectIcon`
- [ ] T009 [P] [US2] Testes de `planIconUpdates` com efeitos (condição, degeneração, `effectIcon`, efeito de item, imagem personalizada preservada); confirmar que falham
- [ ] T010 [US2] `module/rules/icons.mjs`: `planIconUpdates` com `effect`; T009 passa
- [ ] T011 [US2] `module/apps/update-icons.mjs`: coleta de efeitos (atores, itens dos atores, itens do mundo) e aplicação em lote; i18n da confirmação com efeitos (en, pt-BR)

---

## Phase 4: Polish

- [ ] T012 [P] README (selos e atualização), `docs/pendencias.md` (024/025)
- [ ] T013 `npm test`, `npm run lint`, chaves i18n, `build:icons` duas vezes sem diferença, `build:packs`, zip local ≤ 2,5 MB
- [ ] T014 Validar o quickstart no Foundry e registrar em `quickstart.md`

## Dependencies

- T001 → T002 → T003 → T004 → T005 → T006 → US2 (T007–T011) → Polish
- T009/T010 podem andar em paralelo com T007/T008
