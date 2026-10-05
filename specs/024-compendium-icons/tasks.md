---

description: "Task list for 024-compendium-icons"
---

# Tasks: Ícones próprios dos compêndios (Scriptorium Machina)

**Input**: Design documents from `specs/024-compendium-icons/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/icon-pipeline.md, contracts/foundry-api.md,
quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. Visual: quickstart.

**Organization**: US1 itens de compêndio, US2 atores, US3 padrões do mundo e atualização.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-024`

---

## Phase 1: Foundational (bloqueia todas as histórias)

- [ ] T001 [P] `tests/unit/icons.test.mjs`: `slugify`, `glyphPaths` (tira o quadrado de fundo), `composeIcon` (placa, cor, tamanho 512, determinístico), `categoryFor` (regras em ordem), `glyphFor` (curadoria → equivalente de compêndio → padrão), `assignPaths` (colisões); confirmar que falham
- [ ] T002 `scripts/lib/icons.mjs` (PURO) conforme [contracts/icon-pipeline.md](contracts/icon-pipeline.md); T001 passa
- [ ] T003 `scripts/fetch-glyphs.mjs` (`--index` grava `src/icons/glyph-index.json` pela árvore de `game-icons/icons`; sem flag baixa os glifos citados que faltam) e scripts `icons:fetch`, `icons:suggest`, `build:icons` em `package.json`
- [ ] T004 `src/icons/categories.json`: as ~25 categorias com cor (research R3), glifo padrão, regras `match` e `defaultFor`; baixar os glifos padrão
- [ ] T005 `scripts/build-icons.mjs`: lê `src/packs`, resolve categoria e glifo (inclusive embutidos), grava `assets/icons/**` e `assets/icons/defaults/**`, reescreve `img`/`prototypeToken.texture.src` só quando muda, gera `CREDITS.md`; falha com a lista se faltar glifo ou categoria
- [ ] T006 Teste de varredura em `tests/unit/icons.test.mjs`: nenhum `img`/token em `src/packs` com `icons/`, todos os arquivos existem, toda chave da curadoria e todo glifo existem, todo documento casa com uma categoria

---

## Phase 2: User Story 1 — Itens de compêndio (P1) 🎯 MVP

- [ ] T007 [US1] `scripts/suggest-glyphs.mjs`: candidatos por palavras do nome e sinônimos por categoria → `src/icons/suggestions.json` (não versionado)
- [ ] T008 [US1] Curadoria em `src/icons/curation.json`, por grupo: armas (equipamento) e armaduras; drogas, cibernéticos, equipamento geral e artefatos; magias; feats, Assets, Hindrances, feats raciais e Exalted Assets; raças, exaltações, classes, divindades e escolas marciais; componentes de veículo e de nave; tabelas. Baixar os glifos (`icons:fetch`)
- [ ] T009 [US1] Rodar `build:icons` e `build:packs`; registrar os itens sem glifo próprio em `specs/024-compendium-icons/pendencias-curadoria.md` (SC-002 ≥ 90%)

---

## Phase 3: User Story 2 — Atores (P2)

- [ ] T010 [US2] Curadoria dos 73 atores (NPCs, Minion Squads, naves, veículos) e dos itens embutidos sem equivalente no compêndio; retrato e token
- [ ] T011 [US2] Rodar `build:icons`/`build:packs`; conferir no teste que os embutidos com equivalente usam o mesmo ícone

---

## Phase 4: User Story 3 — Padrões do mundo e atualização (P3)

- [ ] T012 [P] [US3] Testes de `planIconUpdates` (itens, atores, embutidos, token; preserva imagem personalizada; ignora origem de fora do sistema); confirmar que falham
- [ ] T013 [US3] `module/rules/icons.mjs` (PURO): `planIconUpdates`; T012 passa
- [ ] T014 [US3] `DTD.ICONS` em `module/config.mjs`; `getDefaultArtwork` em `DtdItem` e `DtdActor`; serviços com ícone fixo (alignment, martial, squadron, weapon-craft, vehicle, builder) passam a usar `DTD.ICONS`
- [ ] T015 [US3] `module/apps/update-icons.mjs` + `registerMenu` (Mestre): monta o plano pelos índices dos compêndios, confirma com contagens, aplica em lote; i18n `DTD.Icons.*` (en, pt-BR)

---

## Phase 5: Polish

- [ ] T016 [P] `.github/workflows/release.yml` (zip com `assets` e `CREDITS.md`); README (créditos e manutenção dos ícones); `docs/pendencias.md` (ícones das condições, arte ilustrada)
- [ ] T017 `npm test`, `npm run lint`, checagem de chaves i18n, `build:icons` duas vezes sem diferença (SC-005), zip local com tamanho (SC-006)
- [ ] T018 Validar o quickstart no Foundry e registrar em `quickstart.md`

## Dependencies

- T001 → T002 → T003 → T004 → T005 → T006 → US1 (T007–T009) → US2 (T010–T011) → US3 (T012–T015) → Polish
- T012/T013 não dependem de US1/US2 e podem andar em paralelo com a curadoria

## Implementation Strategy

- MVP: Phase 1 + US1. Os itens dos compêndios já ficam com ícones próprios; os atores mantêm o padrão da categoria até US2.
- A curadoria (T008, T010) é o maior volume. Vai grupo a grupo, com commit por grupo e o teste de varredura verde a cada passo.
