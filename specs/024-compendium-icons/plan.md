# Implementation Plan: Ícones próprios dos compêndios (Scriptorium Machina)

**Branch**: `024-compendium-icons` | **Date**: 2026-10-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/024-compendium-icons/spec.md`

## Summary

Um pipeline de desenvolvimento gera e aplica os ícones:
- Glifos do game-icons.net baixados uma vez e versionados.
- Uma tabela de categorias (cor, glifo padrão, regras) e uma curadoria nome → glifo.
- Um gerador offline monta cada SVG na placa Cogitador e reescreve `img` (e o token dos atores) nos JSON de `src/packs`.
- Um teste garante que nada fica com ícone do Foundry.

No sistema:
- Ícones padrão por tipo via `getDefaultArtwork`.
- Os serviços que criam itens com ícones fixos passam a usar o mapa.
- Um menu do Mestre atualiza os documentos do mundo que vieram de um compêndio e ainda usam o ícone antigo.
- O zip da release passa a levar `assets` e `CREDITS.md`.

## Technical Context

**Language/Version**: JavaScript ESM (Node 24 nos scripts; ES2022 no sistema) com JSDoc; SVG

**Primary Dependencies**: Foundry VTT v13 (`getDefaultArtwork`, `game.settings.registerMenu`, ApplicationV2, DialogV2,
índices de compêndio, `_stats.compendiumSource`); repositório `game-icons/icons` (CC BY 3.0) só no `icons:fetch`;
Vitest, ESLint, Foundry CLI (build dos packs)

**Storage**: arquivos versionados — `src/icons/` (glifos, categorias, curadoria), `assets/icons/` (gerados),
`CREDITS.md`; campos `img` e `prototypeToken.texture.src` nos JSON de `src/packs`

**Testing**: Vitest — `scripts/lib/icons.mjs` (composição, categorias, glifos, slugs, colisões), `module/rules/icons.mjs`
(plano de atualização) e varredura de `src/packs` (FR-011); roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: `build:icons` em menos de 30 s para ~1.600 documentos; menu de atualização com um índice por
compêndio

**Constraints**:
- o sistema continua rodando sem etapa de build: os SVGs gerados são versionados;
- `build:icons` sem rede e idempotente;
- só cores de `tokens.css`;
- zip da release ≤ 2,4 MB.

**Scale/Scope**:
- 1.249 documentos de pack, 328 itens embutidos em 73 atores e 25 tabelas;
- ~25 categorias, com ~1.000 SVGs distintos estimados;
- 3 scripts, 1 lib pura, 1 regra pura;
- ajustes em `DtdItem`/`DtdActor` e em 6 serviços;
- 1 menu, i18n, workflow de release, README, `CREDITS.md`, pendências.

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Não muda regras; o glifo de cada item segue o que o livro descreve | ✅ |
| II. Nativo v13 | `getDefaultArtwork`, `registerMenu`, ApplicationV2/DialogV2, `compendiumSource` | ✅ |
| III. Pura e testada | `scripts/lib/icons.mjs` e `module/rules/icons.mjs` sem Foundry, com testes | ✅ |
| IV. Automação pragmática | Atualização do mundo só pelo Mestre, com confirmação e contagens; imagens personalizadas preservadas | ✅ |
| V. Conteúdo como dados | Curadoria e categorias em JSON versionado; packs continuam compilados de `src/packs` | ✅ |
| VI. Incremental | Entrega independente; nenhuma ficha muda de layout | ✅ |
| Restrições | ESM + JSDoc, i18n pt-BR/en, nomes de arquivo em inglês, sem build obrigatório para rodar | ✅ |

**Re-check pós-design**: todos se mantêm. A licença CC BY 3.0 exige crédito, coberto por `CREDITS.md` e README (FR-008).

## Project Structure

### Documentation (this feature)

```text
specs/024-compendium-icons/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── icon-pipeline.md
│   └── foundry-api.md
├── checklists/requirements.md
└── tasks.md            # /speckit-tasks
```

### Source Code (repository root)

```text
src/icons/
├── categories.json           # categorias: cor, glifo padrão, regras, defaultFor
├── curation.json             # <pack>/<tipo>/<nome> → <autor>/<glifo>
├── glyph-index.json          # nomes dos glifos do repositório (para sugerir)
└── glyphs/<autor>/<nome>.svg # só os glifos usados
assets/icons/<categoria>/<slug>.svg, assets/icons/defaults/<tipo>.svg   # gerados, versionados
scripts/
├── lib/icons.mjs             # puro: categoryFor, glyphFor, slugify, composeIcon, glyphPaths, assignPaths
├── suggest-glyphs.mjs        # apoio à curadoria
├── fetch-glyphs.mjs          # baixa glifos (rede)
└── build-icons.mjs           # gera SVGs, reescreve src/packs, gera CREDITS.md
module/
├── rules/icons.mjs           # planIconUpdates (puro)
├── apps/update-icons.mjs     # menu do Mestre
├── config.mjs                # DTD.ICONS
└── documents/{item,actor}.mjs, alignment-, martial-, squadron-, weapon-craft-, vehicle-, builder-service.mjs
tests/unit/icons.test.mjs
CREDITS.md, README.md, docs/pendencias.md, .github/workflows/release.yml, package.json, lang/{en,pt-BR}.json
```

**Structure Decision**: o pipeline fica em `scripts/` (ferramentas, como `build-packs`). A lógica testável fica em
`scripts/lib` e `module/rules`. A integração com o Foundry fica em `module/documents` e `module/apps`.

## Complexity Tracking

Sem violações da constituição.
