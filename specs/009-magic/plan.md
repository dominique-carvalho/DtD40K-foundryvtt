# Implementation Plan: Magia (DtD 7.7a)

**Branch**: `009-magic` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/009-magic/spec.md`

## Summary

Tipo de Item `spell` e compêndio `spells` (126 magias em 9 pastas); tabelas Psychic Phenomena e Perils of the Warp no
pack `combat-tables`. Escolas como valores no personagem compradas com o XP da 006 (novos tipos `school` e `combo`,
listas de Magic Schools da classe, teto Level) e vagas de magia por ponto. Focus Power com regras puras (força,
Push, Phenomena, keywords, combos, dano, TN), cartão de magia com dano para o Aplicar da 008 (Aura), resistência,
efeitos simples como Active Effects com duração, Phenomena/Perils rolados e aplicados, sustentadas cobradas no turno,
Spell Combos e Implement.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc

**Primary Dependencies**: Foundry VTT v13 (TypeDataModel, ActiveEffect, RollTable, Combat, DialogV2); Vitest, ESLint,
`@foundryvtt/foundryvtt-cli`

**Storage**: Item `spell` embutido; `system.magic` no ator; pack `packs/spells` de `src/packs/spells`; tabelas em
`src/packs/combat-tables`

**Testing**: Vitest (`rules/magic.mjs`, `rules/xp.mjs` estendido, config, packs); roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: conjurar e ver o cartão em < 1 s

**Constraints**: regras puras sem Foundry; texto próprio; reuso do XP (006), dano/condições/turno (008)

**Scale/Scope**: 1 tipo de item, 126 + 2 tabelas, 1 módulo puro novo e 1 estendido, 1 serviço, 1 aba nova na ficha; ~25 arquivos

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Páginas da 7.7a (pp. 224–259, 16, 514, 426, 436); ambiguidades (caster level, Push, TNs) como premissas | ✅ |
| II. Nativo v13 | Items, RollTables, Active Effects com duração, turno do Combat | ✅ |
| III. Pura e testada | `magic.mjs` e `xp.mjs` com os casos do contrato; packs testados | ✅ |
| IV. Automação pragmática | Recusas com override; efeitos desligáveis; efeitos complexos como texto | ✅ |
| V. Conteúdo como dados | JSON em `src/packs`; texto próprio; stat blocks conferidos no PDF | ✅ |
| VI. Incremental | Fase 1 (magia); Sword Schools e Gun Kata fora | ✅ |
| Restrições | ESM + JSDoc, CSS puro, i18n pt-BR/en | ✅ |

**Re-check pós-design**: mantém todos; toca 006 (XP: tipos `school` e `combo`), 008 (tabelas no pack, `_onStartTurn`
com sustentadas) de forma aditiva.

## Project Structure

```text
specs/009-magic/ (plan, research, data-model, quickstart, contracts/, checklists/, tasks)
system.json · dtd40k.mjs
src/packs/spells/                          # 9 pastas + 126 JSON
src/packs/combat-tables/                   # + psychic-phenomena.json, perils-of-the-warp.json, pasta Warp
scripts/assign-pack-ids.mjs                # layout spells; combat-tables com pasta warp
module/config.mjs                          # MAGIC_SCHOOLS, SPELL_KEYWORDS, SPELL_ACTIONS, SPELL_DURATIONS, XP_COSTS.school/combo
module/rules/magic.mjs                     # NOVO, PURO
module/rules/xp.mjs                        # school, combo
module/data/spell-data.mjs                 # NOVO
module/data/character-data.mjs             # magic.schools, combos, sustained, modifiers.magic
module/documents/magic-service.mjs         # NOVO: learn, cast, combos, sustained, phenomena
module/documents/xp-service.mjs, item.mjs, combat.mjs   # school/combo; drop de spell; sustentadas no turno
module/apps/spell-sheet.mjs, magic-context.mjs, cast-dialog.mjs   # NOVOS
module/apps/character-sheet.mjs            # aba magic, drop, ações; botões de escola no modo Evolução
templates/item/spell-sheet.hbs, templates/actor/parts/magic.hbs, templates/dialog/cast-dialog.hbs, templates/chat/spell-card.hbs
styles/dtd40k.css · lang/*.json
tests/unit/magic.test.mjs, xp.test.mjs, config.test.mjs, packs.test.mjs
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| Magias como Items (R1) | Arrastar do compêndio para aprender; ficha e automação por item | Lista no ator não teria compêndio nem ficha |
| XP reaproveitado (R2) | Histórico, desfazer e listas da classe já existem | Sistema paralelo duplicaria regras |
| Tabelas no `combat-tables` (R5) | Mesmo gerador e automação dos críticos | Pack novo só para duas tabelas |
