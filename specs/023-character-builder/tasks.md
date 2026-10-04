---

description: "Task list for 023-character-builder"
---

# Tasks: Montador de personagem para jogadores

**Input**: Design documents from `specs/023-character-builder/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md, inventory.json

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI e criação: quickstart.

**Organization**: US1 núcleo e conclusão, US2 traços, US3 XP, US4 equipamento, US5 permissão e rascunho.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-023`

---

## Phase 1: Foundational (bloqueia todas as histórias)

- [X] T001 [P] `tests/unit/builder.test.mjs`: casos de [contracts/rules-api.md](contracts/rules-api.md) (Jane, p. 18); confirmar que falham
- [X] T002 `module/rules/builder.mjs` (PURO): passos, validações, saldo de XP, prévia, plano; T001 passa
- [X] T003 Serviços com opções (R2): `applyRace { choice }`, `applyExaltation { selection, replace }`, `startClass { silent }`, `addFeat`/`priceFeat { selection, silent }`, `addExaltedAsset`/`priceExaltedAsset { silent }`, `raiseBackground { silent }`, `advance { silent }`; comportamento padrão inalterado
- [X] T004 Rodar `npm test` e `npm run lint`

---

## Phase 2: User Story 1 — Núcleo e conclusão (P1) 🎯 MVP

- [ ] T005 [US1] `module/apps/character-builder.mjs`: janela (PARTS steps/step/summary/footer), navegação, bloqueio com motivo, Liberar (Mestre), carga dos índices dos compêndios
- [ ] T006 [US1] Templates dos passos Conceito, Raça (escolhas), Exaltação (escolhas), Características, Perícias, Especialidades, Classe, Revisão; resumo lateral com a prévia
- [ ] T007 [US1] `module/documents/builder-service.mjs`: `createActor` (direto), `applyPlan`, `finish` (abre a ficha; falha deixa em criação)
- [ ] T008 [US1] `dtd40k.mjs`: botão "Novo personagem" na aba de atores (`renderActorDirectory`)
- [ ] T009 [P] [US1] `styles/builder.css` (design system 021) e i18n base (en, pt-BR)

---

## Phase 3: User Story 5 — Permissão e rascunho (P2)

- [ ] T010 [US5] Rascunho na flag do usuário: salvar a cada passo e ao fechar; Continuar/Recomeçar ao abrir; apagar ao concluir
- [ ] T011 [US5] `CONFIG.queries["dtd40k.createCharacter"]` (Mestre ativo cria com o jogador dono) e uso em `createActor` sem `ACTOR_CREATE`; aviso sem Mestre

---

## Phase 4: User Story 2 — Traços (P2)

- [ ] T012 [US2] Passos Backgrounds (7 grátis, excedente em XP), Alinhamento (divindade, Devotion 6), Assets e Hindrances (limite 2), Exalted Asset (da exaltação/raça, um fora Paragon); etapas do plano

---

## Phase 5: User Story 3 — XP inicial (P2)

- [ ] T013 [US3] Passo XP: saldo, compras (características, perícias, feats da classe, escolas, Power Stat) com custo e listas da classe; etapas do plano com `advance`/`addFeat` em modo silencioso (log de XP)

---

## Phase 6: User Story 4 — Equipamento (P3)

- [ ] T014 [US4] Passo Equipamento: vagas por raridade exata, sem artefatos, quantidade 1; vagas vazias só avisam; etapa do plano com `addEquipment { starting: true }` e picks de Inheritance

---

## Phase 7: Polish

- [ ] T015 [P] i18n completo, `docs/pendencias.md`, `README.md`
- [ ] T016 `npm test`, `npm run lint`, checagem de chaves i18n, `npm run build:packs`
- [ ] T017 Validar o quickstart no Foundry (Jane) e registrar em `quickstart.md`

## Dependencies

- T001 → T002 → T003 → US1 (T005–T009) → US5 (T010–T011) → US2 (T012) → US3 (T013) → US4 (T014) → Polish
