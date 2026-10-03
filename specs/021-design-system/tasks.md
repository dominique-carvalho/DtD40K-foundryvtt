---

description: "Task list for 021-design-system"
---

# Tasks: Design system Scriptorium Machina (fichas e chat)

**Input**: Design documents from `specs/021-design-system/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/foundry-api.md, contracts/rules-api.md,
quickstart.md

**Tests**: `design-tokens.test.mjs` antes dos tokens, confirmando que falha. O visual é conferido pelo quickstart.

**Organization**: US1 Cogitador (padrão), US2 Iluminura, US3 chat, US4 resto em tokens.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-design`
- Referência visual: `docs/design/proposta-b-cogitador.html`, `proposta-a-iluminura.html`, `guia.html`

---

## Phase 1: Setup

- [X] T001 [P] `fonts/`: copiar os 8 `.woff2` do @fontsource 5.3.0 e os `OFL-<família>.txt` (R7)
- [X] T002 [P] `.github/workflows/release.yml`: incluir `fonts` no zip

---

## Phase 2: Foundational (bloqueia todas as histórias)

- [X] T003 [P] `tests/unit/design-tokens.test.mjs`: casos de [contracts/rules-api.md](contracts/rules-api.md); confirmar que falha
- [X] T004 `styles/fonts.css` (`@font-face`, `font-display: swap`) e `styles/tokens.css` (Vellum, Cogitator, seletores de tema de R2, aliases antigos); `system.json → styles` na ordem de R1; T003 passa
- [X] T005 `styles/components.css`: gemas sobre `.dot` (`.filled`, `.superhuman`, `.racial`, `.locked`), `.section-title` com filete, selos (`.tag`, `.automation-tag`, `.feat-badge`), botões, campos, painéis, grão do papel
- [X] T006 `styles/dtd40k.css`: trocar hex e `--color-*` diretos por tokens (lista do inventário); tirar as regras de chat que nunca casam (vão para T014)
- [ ] T007 `module/apps/character-sheet.mjs`: `context.rail` (condições, XP, Power Stat, ícones das abas) (R5)
- [ ] T008 Rodar `npm test` e `npm run lint`

---

## Phase 3: User Story 1 — Cogitador como padrão (P1) 🎯 MVP

- [ ] T009 [US1] `module/apps/cogitator-sheet.mjs` (classes, tamanho, PARTS) e registro em `dtd40k.mjs` (`makeDefault`; base fora de `character`)
- [ ] T010 [US1] `templates/actor/cogitator/rail.hbs`: retrato, nome, identificação, tubos, LEDs, Power Stat, selos, XP, chave de modo; campos de Edição e Evolução do cabeçalho atual
- [ ] T011 [US1] `templates/actor/cogitator/tabs.hbs` (teclas com ícone, mesmos `data-*` da navegação) e `main.hbs` (leituras, módulos de características, tabela de perícias com botão de parada; filtros, especialidades, evolução e criação)
- [ ] T012 [US1] `styles/sheet-cogitator.css` (trilho fixo, teclas, módulos rebitados, tabela; variantes claro e escuro)
- [ ] T013 [P] [US1] i18n: `DTD.Sheet.Cogitator`, `DTD.Sheet.Illuminated` e rótulos novos (en, pt-BR)

---

## Phase 4: User Story 3 — Chat (P2)

- [X] T014 [US3] `styles/chat.css`: as 19 raízes `.dtd40k.<card>`; cabeçalho com filete, facetas de d10, total, faixa de resultado, botões, tabelas dos cartões (opposed, chase, pinning, hazard, damage-applied); tema pela barra lateral

---

## Phase 5: User Story 2 — Iluminura (P2)

- [ ] T015 [US2] `module/apps/illuminated-sheet.mjs` e registro em `dtd40k.mjs`
- [ ] T016 [US2] `templates/actor/illuminated/header.hbs` (arco, capitular, linhagem, selos, faixa de recursos, modos), `tabs.hbs` (fitas), `main.hbs` (tríptico, índice)
- [ ] T017 [US2] `styles/sheet-illuminated.css`

---

## Phase 6: User Story 4 — Resto em tokens (P3)

- [ ] T018 [US4] Conferir e ajustar no `dtd40k.css` as fichas de NPC, minion, esquadrão, veículo e nave, as 11 fichas de item, os diálogos com `.dtd40k` e o criador de armas: tokens, fontes e componentes, sem mudança de layout

---

## Phase 7: Polish

- [ ] T019 [P] `docs/design-system.md` (fonte da verdade em `styles/`), `README.md`, `docs/pendencias.md`
- [ ] T020 `npm test`, `npm run lint`, checagem de chaves i18n, `npm run build:packs`
- [ ] T021 Validar o quickstart no Foundry, nos dois temas, e registrar em `quickstart.md`

## Dependencies

- T001–T002 e T003 → T004 → T005 → T006 → T007 → US1 (T009–T013) → US3 (T014) → US2 (T015–T017) → US4 (T018) → Polish
- O chat (T014) só depende dos tokens e componentes; pode ir antes da Iluminura.
