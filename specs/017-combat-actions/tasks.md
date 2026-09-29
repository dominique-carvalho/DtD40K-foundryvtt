---

description: "Task list for 017-combat-actions"
---

# Tasks: Ações de combate (DtD 7.7a)

**Input**: Design documents from `specs/017-combat-actions/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 Suppressing Fire e Pinning, US2 testes opostos e Grapple, US3 Overwatch, Delay e Tactical Advance.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-017`
- Inventário: `C:/Users/DOMINI~1/AppData/Local/Temp/claude/C--Users-Dominique-Documents-Personal-Projects-DtD40K-foundryvtt/36c74d17-8efd-4ec5-b9db-14e4ed8b18d2/scratchpad/ch-combat-actions-inventory.json`

---

## Phase 1: Foundational

- [ ] T001 [P] Em `tests/unit/maneuvers.test.mjs`: casos de [contracts/rules-api.md](contracts/rules-api.md) para `opposedResult`, `inCone`, `suppressionHits`, `pinningTn`, `pinningImmune`, `pushDistance`, `slipFreeTn`, `restriction`
- [ ] T002 `module/rules/maneuvers.mjs` (PURO); fazer T001 passar
- [ ] T003 `module/config.mjs`: condições `grappling` e `inCover` em `STATUS_EFFECTS`; `COVER_AP = [4, 8, 12, 16, 32]`; `combatFlags` em `module/rules/defense.mjs` com `grappling`
- [ ] T004 `module/rules/combat-actions.mjs`: ações `grappleControl`, `breakFree`, `slipFree`, `takeControl` (completas, p. 427) e automações `zone` (suppressingFire, overwatch), `opposed` (bullRush, knockDown, disarm, feint), `delay`, `grapple` (Brawl desarmado)
- [ ] T005 Rodar `npm test` e `npx eslint .`

---

## Phase 2: User Story 1 — Suppressing Fire e Pinning (P1)

- [ ] T006 [US1] `module/documents/zone-service.mjs`: `placeZone` (cone 45°, alcance da arma, direção ao alvo; recusa sem automático ou pesada sem Brace), `confirmZone`, `tokensInZone`, `rollPinning` (Willpower TN 20; Fearless/Headstrong imunes; falha → `pinned`), `resolveSuppression` (Full Auto Burst, `suppressionHits`, cartão com Aplicar/Dodge por acertado; apaga o template), `activeZoneAt`, `clearZones`
- [ ] T007 [US1] `module/documents/turn-service.mjs`: `useAction` → `placeZone` para Suppressing Fire; `restriction` antes de `takeAction` (Mestre libera); `startOfTurn` resolve as zonas do combatente; `endOfTurn` com cartão de saída do Pinned (`pinningTn` pela `activeZoneAt`)
- [ ] T008 [US1] Condição Em cobertura: diálogo de AP/locais ao ligar e limpeza ao desligar (`Token.flags.dtd40k.cover`) em `module/documents/condition-service.mjs` e o hook em `dtd40k.mjs`
- [ ] T009 [US1] Cartões `templates/chat/zone-card.hbs`, `pinning-card.hbs`, `suppression-card.hbs`; `CHAT_ACTIONS` (`confirmZone`, `rollPinning`, `suppressionDodge`) e `clearZones` no fim do combate em `dtd40k.mjs`
- [ ] T010 [P] [US1] i18n e estilos
- [ ] T011 [US1] Validar quickstart 1–8 e registrar

---

## Phase 3: User Story 2 — Testes opostos e Grapple (P2)

- [ ] T012 [US2] `module/documents/maneuver-service.mjs`: `opposedTest` (cartão `templates/chat/opposed-card.hbs`), `useManeuver` (Bull Rush empurra 2 m + 2 m/raise, Knock Down Prone e queda do atacante com 2 raises contra, Disarm com 2 raises, Feint), ligado ao `useAction` quando há alvo
- [ ] T013 [US2] Grapple: `useAction` ataca com Brawl desarmado e marca o cartão (`attack.grapple`); `startGrapple` (Grappling/Grappled ligados, remove Pinned), `controlGrapple` (opções, Strength oposta, Bear Hug, Crushing Bear, Squat Stability), `escapeGrapple` (Break Free, Slip Free, Take Control; meia ação de volta), `endGrapple` em `module/documents/maneuver-service.mjs`, `attack-service.mjs` e `templates/chat/grapple-card.hbs`
- [ ] T014 [P] [US2] i18n e estilos
- [ ] T015 [US2] Validar quickstart 9–12 e registrar

---

## Phase 4: User Story 3 — Overwatch, Delay e Tactical Advance (P3)

- [ ] T016 [P] [US3] Em `tests/unit/turn.test.mjs`: Delay guardado, usado fora do turno sem mexer no estado do turno, expirado no início do turno
- [ ] T017 [US3] `module/rules/turn.mjs` (Delay) e `module/documents/turn-service.mjs`: Delay no `takeAction`; `startOfTurn` apaga o Delay e o Overwatch expirado; qualquer ação ou reação encerra o Overwatch; fazer T016 passar
- [ ] T018 [US3] Overwatch em `module/documents/zone-service.mjs`: diálogo (ataque, gatilho), `fireOverwatch` (Suppressing Fire → R3; Full Auto Burst → ataque automático no alvo sem gastar ação), `endOverwatch`; `CHAT_ACTIONS.fireOverwatch`
- [ ] T019 [US3] Tactical Advance: cartão lembrando que a cobertura se mantém; ações completas com Mark of Moradin como nota
- [ ] T020 [P] [US3] i18n
- [ ] T021 [US3] Validar quickstart 13–17 e registrar

---

## Phase 5: Polish

- [ ] T022 [P] Atualizar `docs/pendencias.md` (ações feitas; munição, movimento do Pinned e cobertura direcional como pendências) e o `README.md`
- [ ] T023 `npm run lint` e `npm test`
- [ ] T024 `graphify update .`

## Dependencies

- Foundational → US1 → US2 → US3 → Polish (US3 usa a zona da US1).
- [P] = arquivos diferentes, sem dependência pendente.
