---

description: "Task list for 022-npc-traits"
---

# Tasks: Traits, ataques especiais, esquadrões, feats e formas de NPC

**Input**: Design documents from `specs/022-npc-traits/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md, inventory.json

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. Mapa e UI: quickstart.

**Organization**: US1 movimento e sentidos no mapa, US2 Phasing e Auto-Stabilized, US3 ataques especiais, US4 esquadrão
no turno, US5 feats, formas e recurso.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-022`

---

## Phase 1: Foundational (bloqueia todas as histórias)

- [X] T001 [P] `tests/unit/npc-traits.test.mjs`: casos de [contracts/rules-api.md](contracts/rules-api.md); extensões em `tests/unit/defense.test.mjs` (escuridão) e no teste de feats (`npcFeatNames`); confirmar que falham
- [X] T002 `module/rules/npc-traits.mjs` (PURO), `rules/defense.mjs` (`darkness`), `rules/feat.mjs` (`npcFeatNames`); T001 passa
- [X] T003 `module/data/npc-data.mjs`: abilities estendidas (campos com padrão), `forms`, `activeForm`, `formRounds`; derivados `speeds` e flags de trait; forma ativa aplicada com `applyForm`
- [X] T004 `module/config.mjs`: status `incorporeal`, tipos de ability, ação de movimento `phase`; i18n base
- [X] T005 Rodar `npm test` e `npm run lint`

---

## Phase 2: User Story 1 — Movimento e sentidos no mapa (P1) 🎯 MVP

- [X] T006 [US1] `module/documents/token-document.mjs` (`DtdTokenDocument`: ação padrão, visão no escuro, reset em `_onRelatedUpdate`) e `module/canvas/token.mjs` (`DtdToken`: custo de terreno do Crawler); registro em `dtd40k.mjs`
- [X] T007 [US1] `attack-service` e diálogo de ataque: opção escuridão; aviso de alcance com `distance3d`/`outOfRange` no diálogo e no cartão
- [X] T008 [US1] `condition-service`: hook de status (stunned, unconscious, prone) + `flyingFall` → `templates/chat/flight-fall.hbs`; botão abre a queda da 018 e zera a elevação
- [X] T009 [US1] Ficha do NPC: velocidades walk/fly/swim no cabeçalho

---

## Phase 3: User Story 2 — Phasing e Auto-Stabilized (P2)

- [X] T010 [US2] Ação "Incorpóreo" (meia ação) no turno para NPC com Phasing; status alterna; Stealth +2 raises sugerido
- [X] T011 [US2] `damage-service`: `incorporealBlocks` → zero com aviso; o Mestre força
- [X] T012 [US2] Auto-Stabilized: `braced` no ataque; `as: "half"` em `fullAutoBurst`/`suppressingFire` no `turn-service`

---

## Phase 4: User Story 3 — Ataques especiais (P2)

- [X] T013 [US3] `module/documents/ability-service.mjs`: `useAbility` (usos, ação, template/alvos), `resistAbility`, `applyAbility` (socket), `triggerAuras`, `onHitEffects`; `templates/chat/ability-card.hbs`; CHAT_ACTIONS
- [X] T014 [US3] Gatilhos no `turn-service`: `charge`/`allOutAttack` → Frightful Presence (teste de medo da 012); `turnStart` → calor do Fire Elemental
- [X] T015 [US3] `attack-service`/dano: `onHit` (`extraCritical`) da arma
- [X] T016 [US3] Packs: Mind Blast (área), Frightful Presence ×3 (aura), Gauss Weapon ×2 (onHit nas armas), calor do Elemental Fire (aura da variante), Possession (spell); Dragon Breath como arma (perfil do Flamer) nos dois NPCs; `packs.test.mjs`

---

## Phase 5: User Story 4 — Esquadrão no turno (P2)

- [X] T017 [US4] `minion-service`: `minionAction` (mover TR/2×TR, correr, atacar uma vez por turno, meia ação) com o `turnState` da 008; ficha do esquadrão com as ações; cartão de ataque com Dodge/Parry

---

## Phase 6: User Story 5 — Feats, formas e recurso (P3)

- [ ] T018 [US5] `hasFeat` por nome lendo `npc.feats`; checagens existentes por nome passam a usá-lo
- [ ] T019 [US5] `module/documents/form-service.mjs`: `switchForm`, `tickForm`, `chooseVariant`; armas com `flags.dtd40k.form`
- [ ] T020 [US5] Packs: formas dos dois Zoanoids (valores entre colchetes relidos do livro; Claw/Bite da forma) e as quatro variantes do Elemental; `packs.test.mjs`
- [ ] T021 [US5] `npc-service`: gastar/recuperar recurso com chat
- [ ] T022 [US5] Aba Antagonista: editores (Edição) de traits, abilities por tipo, feats e formas; botões (Jogo) de usar ability, trocar forma, escolher variante, recurso

---

## Phase 7: Polish

- [ ] T023 [P] i18n (en, pt-BR), estilos (design system 021), `docs/pendencias.md`, `README.md`
- [ ] T024 `npm test`, `npm run lint`, checagem de chaves i18n, `npm run build:packs`
- [ ] T025 Validar o quickstart no Foundry e registrar em `quickstart.md`

## Dependencies

- T001 → T002 → T003/T004 → US1 (T006–T009) → US2 (T010–T012) → US3 (T013–T016) → US4 (T017) → US5 (T018–T022) → Polish
- US4 só depende da Phase 1; pode ir antes de US3.
