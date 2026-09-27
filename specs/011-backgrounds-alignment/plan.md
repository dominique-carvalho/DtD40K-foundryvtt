# Implementation Plan: Backgrounds e Alinhamento (DtD 7.7a)

**Branch**: `011-backgrounds-alignment` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/011-backgrounds-alignment/spec.md`

## Summary

Tipo de Item `deity` e compêndio `deities` (21 deuses em 3 pastas); tabela Degeneration no pack `combat-tables`.
Backgrounds como valores no personagem (Artifact e Backing como instâncias nomeadas, Wealth = Wealth da 007,
Inheritance com escolhas por raridade somadas aos itens iniciais), com pontos de criação e XP (tipo `background`) por
regras puras. Alinhamento pelo deus embutido, Alignment Check e Recuperar Devotion puros, Degeneration rolada,
registrada por ponto e com efeitos (característica −1 que trava o XP, Night Terrors, derangement, −2k0 social) que
saem ao curar; troca de alinhamento uma vez.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc

**Primary Dependencies**: Foundry VTT v13 (TypeDataModel, ActiveEffect, RollTable, DialogV2); Vitest, ESLint,
`@foundryvtt/foundryvtt-cli`

**Storage**: `system.backgrounds`, `system.alignment`, `system.modifiers.alignmentCheck` no ator; deus embutido; pack
`packs/deities` de `src/packs/deities`; tabela em `src/packs/combat-tables`

**Testing**: Vitest (`rules/backgrounds.mjs`, `rules/alignment.mjs`, `xp.mjs`, `acquisition.mjs`, config, packs);
roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: um Alignment Check com Degeneration em < 1 s

**Constraints**: regras puras sem Foundry; texto próprio; reuso do XP (006), Wealth e itens iniciais (007),
derangements (008), hindrance (005), tabelas (009)

**Scale/Scope**: 1 tipo de item, 21 + 1 tabela, 2 módulos puros novos e 2 estendidos, 2 serviços, 2 seções na aba
Traits; ~25 arquivos

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Páginas da 7.7a (pp. 280–312, 15–16); lacunas (custo por ponto, d10, faixa 62, Unaligned) como premissas | ✅ |
| II. Nativo v13 | Items/compêndio, RollTable, Active Effects, DialogV2 | ✅ |
| III. Pura e testada | `backgrounds.mjs`, `alignment.mjs` com os casos do contrato; packs testados | ✅ |
| IV. Automação pragmática | Recusas com override; efeitos desligáveis; Degenerations complexas como texto | ✅ |
| V. Conteúdo como dados | JSON em `src/packs`; texto próprio com 6-gramas = 0 | ✅ |
| VI. Incremental | Fase 1 (Backgrounds e Alinhamento); Marks, Chosen e magias de alinhamento fora | ✅ |
| Restrições | ESM + JSDoc, CSS puro, i18n pt-BR/en | ✅ |

**Re-check pós-design**: mantém todos; toca 006 (XP `background`, bloqueio de característica), 007 (vagas extras de
itens iniciais) e 009 (tabela no `combat-tables`) de forma aditiva.

## Project Structure

```text
specs/011-backgrounds-alignment/ (plan, research, data-model, quickstart, contracts/, checklists/, tasks)
system.json · dtd40k.mjs
src/packs/deities/                          # 3 pastas + 21 JSON
src/packs/combat-tables/                    # + degeneration.json, pasta Alignment
scripts/assign-pack-ids.mjs                 # layout deities; pasta alignment no combat-tables
module/config.mjs                           # PANTHEONS, BACKGROUNDS, BACKGROUND_XP, INHERITANCE_SLOTS, XP_KINDS
module/rules/backgrounds.mjs                # NOVO, PURO
module/rules/alignment.mjs                  # NOVO, PURO
module/rules/xp.mjs · acquisition.mjs       # background, blocked; vagas extras
module/data/deity-data.mjs                  # NOVO
module/data/character-data.mjs              # backgrounds, alignment, modifiers.alignmentCheck; derivados
module/documents/background-service.mjs     # NOVO
module/documents/alignment-service.mjs      # NOVO
module/documents/xp-service.mjs, equipment-service.mjs
module/apps/deity-sheet.mjs, traits-context (backgrounds/alinhamento)   # NOVOS
module/apps/character-sheet.mjs             # drop de deity, ações
templates/item/deity-sheet.hbs, templates/actor/parts/backgrounds.hbs, templates/actor/parts/alignment.hbs,
templates/dialog/alignment-check.hbs
styles/dtd40k.css · lang/*.json
tests/unit/backgrounds.test.mjs, alignment.test.mjs, xp.test.mjs, acquisition.test.mjs, config.test.mjs, packs.test.mjs
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| Deus embutido como alinhamento (R1) | Arrastar do compêndio; ficha do deus no personagem, como a raça | Só um nome não mostraria mandamentos |
| Wealth no campo da 007 (R2) | Um só valor para aquisição e Background | Dois campos divergiriam |
| Inheritance por vagas potências de 2 (R3) | Valida a regra recursiva do livro com uma soma | Enumerar combinações explode no nível 5 |
