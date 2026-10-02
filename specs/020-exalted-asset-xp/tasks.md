---

description: "Task list for 020-exalted-asset-xp"
---

# Tasks: Custo de XP dos Exalted Assets (DtD 7.7a)

**Input**: Design documents from `specs/020-exalted-asset-xp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 compra com XP, US2 Paragon, US3 desfazer.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-020`

---

## Phase 1: Foundational

- [X] T001 [P] Em `tests/unit/xp.test.mjs`: casos de [contracts/rules-api.md](contracts/rules-api.md) para `exaltedAssetPrice` e `undoPlan` com `kind: "exaltedAsset"`
- [X] T002 `module/rules/xp.mjs` (PURO): `exaltedAssetPrice`; `undoPlan` aceita `exaltedAsset`; fazer T001 passar
- [X] T003 Rodar `npm test` e `npm run lint`

---

## Phase 2: User Story 1 — Compra com XP (P1)

- [X] T004 [US1] `module/documents/xp-service.mjs`: `priceExaltedAsset(actor, asset, { granted })` com confirmação (`DTD.XP.BuyConfirm`), recusa sem XP e liberação do Mestre sem custo
- [X] T005 [US1] `module/documents/asset-service.mjs`: `addExaltedAsset` chama `priceExaltedAsset` depois das checagens; cria o asset só se `ok`; `recordEntry({ kind: "exaltedAsset", … })` quando `cost > 0`
- [X] T006 [P] [US1] i18n (en, pt-BR) para o texto da liberação sem XP, se faltar chave

---

## Phase 3: User Story 2 — Paragon (P2)

- [X] T007 [US2] Conferir que a Perfection (`exaltation-service`, `granted: true`) não cobra nem registra, e que as Paragon Assets fora da criação passam pela cobrança

---

## Phase 4: User Story 3 — Desfazer (P3)

- [X] T008 [US3] `module/documents/xp-service.mjs` `undoXp`: `exaltedAsset` sem aviso "RefundOnly"; `clampHeroPoints` depois de apagar o asset

---

## Phase 5: Polish

- [X] T009 [P] `docs/pendencias.md` (tirar o item da seção 2; linha da 020 na seção 3, se houver texto) e `README.md`
- [X] T010 `npm test`, `npm run lint`, checagem de chaves i18n
- [X] T011 Validar o quickstart no Foundry e registrar em `quickstart.md`

## Dependencies

- T001 → T002 → T004 → T005 → T007, T008; T009/T010 depois; T011 por último.
